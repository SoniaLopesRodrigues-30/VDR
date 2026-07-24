// src/nfeUtils.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { NotaFiscal } from './useNfeForm';

/**
 * Faz o download do XML injetando o cabeçalho binário BOM (Previne erro de decodificação no Browser)
 */
export const downloadXml = (xmlString: string, numeroNota: string) => {
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const xmlBlob = new Blob([BOM, xmlString], { type: 'application/xml;charset=utf-8' });
  const xmlUrl = window.URL.createObjectURL(xmlBlob);
  const xmlLink = document.createElement('a');
  xmlLink.href = xmlUrl;
  xmlLink.download = `NFe_${numeroNota || 'Nota'}.xml`;
  document.body.appendChild(xmlLink);
  xmlLink.click();
  document.body.removeChild(xmlLink);
  window.URL.revokeObjectURL(xmlUrl);
};

/**
 * Função para gerar e baixar o XML estruturado da NF-e padrão SEFAZ
 */
export const baixarXmlNfe = (nota: NotaFiscal) => {
  if (!nota.itens || nota.itens.length === 0) {
    alert('Não é possível gerar o XML de uma nota sem itens.');
    return;
  }

  const docLimpo = (nota.documento || '').replace(/\D/g, '');
  const cepLimpo = (nota.enderecoDestinatario?.cep || '').replace(/\D/g, '');
  
  let dataEmissaoFormatada = nota.dataEmissao || '';
  if (dataEmissaoFormatada.includes('/')) {
    dataEmissaoFormatada = dataEmissaoFormatada.split('/').reverse().join('-');
  }

  const xmlItens = nota.itens.map((item, index) => {
    return `<det nItem="${index + 1}">` +
      '<prod>' +
        `<cProd>${item.id}</cProd>` +
        '<cEAN>SEM GTIN</cEAN>' +
        `<xProd>${item.descricao}</xProd>` +
        `<NCM>${(item.ncm || '').replace(/\D/g, '')}</NCM>` +
        `<CFOP>${nota.enderecoDestinatario?.uf === 'RS' ? '5102' : '6102'}</CFOP>` +
        `<uCom>${item.unidade}</uCom>` +
        `<qCom>${(item.quantidade || 0).toFixed(4)}</qCom>` +
        `<vUnCom>${(item.valorUnitario || 0).toFixed(10)}</vUnCom>` +
        `<vProd>${(item.valorTotalItem || 0).toFixed(2)}</vProd>` +
        '<cEANTrib>SEM GTIN</cEANTrib> ' +
        `<uTrib>${item.unidade}</uTrib>` +
        `<qTrib>${(item.quantidade || 0).toFixed(4)}</qTrib>` +
        `<vUnTrib>${(item.valorUnitario || 0).toFixed(10)}</vUnTrib>` +
        '<indTot>1</indTot>' +
      '</prod>' +
    '</det>';
  }).join('');

  let xmlCompleto = '<?xml version="1.0" encoding="utf-8"?>';
  xmlCompleto += '<NFe xmlns="http://portalfiscal.inf.br">';
  xmlCompleto += `<infNFe versao="4.00" Id="NFe${nota.id}">`;
  xmlCompleto += '<ide>';
  xmlCompleto += '<cUF>43</cUF>';
  xmlCompleto += `<natOp>${nota.enderecoDestinatario?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda de Mercadoria para Fora do Estado'}</natOp>`;
  xmlCompleto += '<mod>55</mod>';
  xmlCompleto += `<serie>${nota.serie}</serie>`;
  xmlCompleto += `<nNF>${(nota.numero || '').replace(/\D/g, '')}</nNF>`;
  xmlCompleto += `<dhEmi>${dataEmissaoFormatada}T${nota.horaSaida || '00:00'}:00-03:00</dhEmi>`;
  xmlCompleto += `<tpNF>${(nota.tipoOperacao || '1').charAt(0)}</tpNF>`;
  xmlCompleto += `<idDest>${(nota.destinoOperacao || '1').charAt(0)}</idDest>`;
  xmlCompleto += `<cMunFG>${nota.enderecoDestinatario?.codigoMunicipio || ''}</cMunFG>`;
  xmlCompleto += '<tpImp>1</tpImp>';
  xmlCompleto += '<tpEmis>1</tpEmis>';
  xmlCompleto += `<finNFe>${(nota.finalidadeEmissao || '1').charAt(0)}</finNFe>`;
  xmlCompleto += '</ide>';
  xmlCompleto += '<dest>';
  xmlCompleto += docLimpo.length === 11 ? `<CPF>${docLimpo}</CPF>` : `<CNPJ>${docLimpo}</CNPJ>`;
  xmlCompleto += `<xNome>${nota.cliente}</xNome>`;
  xmlCompleto += '<enderDest>';
  xmlCompleto += `<xlgr>${nota.enderecoDestinatario?.logradouro || ''}</xlgr>`;
  xmlCompleto += `<nro>${nota.enderecoDestinatario?.numero || ''}</nro>`;
  xmlCompleto += `<xBairro>${nota.enderecoDestinatario?.bairro || ''}</xBairro>`;
  xmlCompleto += `<cMun>${nota.enderecoDestinatario?.codigoMunicipio || ''}</cMun>`;
  xmlCompleto += `<xMun>${nota.enderecoDestinatario?.municipio || ''}</xMun>`;
  xmlCompleto += `<UF>${nota.enderecoDestinatario?.uf || ''}</UF>`;
  xmlCompleto += `<CEP>${cepLimpo}</CEP>`;
  xmlCompleto += '<cPais>1058</cPais>';
  xmlCompleto += '<xPais>Brasil</xPais>';
  xmlCompleto += '</enderDest>';
  xmlCompleto += '<indIEDest>9</indIEDest>';
  xmlCompleto += '</dest>';
  xmlCompleto += xmlItens;
  xmlCompleto += '<total>';
  xmlCompleto += '<ICMSTot>';
  xmlCompleto += '<vBC>0.00</vBC>';
  xmlCompleto += '<vICMS>0.00</vICMS>';
  xmlCompleto += '<vICMSDeson>0.00</vICMSDeson>';
  xmlCompleto += '<vFCP>0.00</vFCP>';
  xmlCompleto += '<vBCST>0.00</vBCST>';
  xmlCompleto += '<vST>0.00</vST>';
  xmlCompleto += '<vFCPST>0.00</vFCPST>';
  xmlCompleto += '<vFCPSTRet>0.00</vFCPSTRet>';
  xmlCompleto += `<vProd>${(nota.valorBruto || 0).toFixed(2)}</vProd>`;
  xmlCompleto += '<vFrete>0.00</vFrete>';
  xmlCompleto += '<vSeg>0.00</vSeg>';
  xmlCompleto += '<vDesc>0.00</vDesc>';
  xmlCompleto += '<vII>0.00</vII>';
  xmlCompleto += '<vIPI>0.00</vIPI>';
  xmlCompleto += '<vIPIDevol>0.00</vIPIDevol>';
  xmlCompleto += '<vPIS>0.00</vPIS>';
  xmlCompleto += '<vCOFINS>0.00</vCOFINS>';
  xmlCompleto += '<vOutro>0.00</vOutro>';
  xmlCompleto += `<vNF>${(nota.valorLiquido || 0).toFixed(2)}</vNF>`;
  xmlCompleto += '</ICMSTot>';
  xmlCompleto += '</total>';
  xmlCompleto += '<infAdic>';
  xmlCompleto += `<infCpl>${nota.informacoesComplementares || ''}</infCpl>`;
  xmlCompleto += '</infAdic>';
  xmlCompleto += '</infNFe>';
  xmlCompleto += '</NFe>';

  const numeroFormatado = (nota.numero || '').replace(/\D/g, '');
  downloadXml(xmlCompleto, numeroFormatado);
};

/**
 * Função para gerar e abrir o PDF do DANFE Simplificado baseado nos dados da Nota
 */
/**
 * Função para gerar e abrir o PDF do DANFE no padrão oficial SEFAZ-RS
 */
/**
 * Função refinada para gerar e abrir o PDF do DANFE no padrão oficial SEFAZ-RS
 */
export const imprimirPdfNfe = (nota: NotaFiscal) => {
  if (!nota.itens || nota.itens.length === 0) {
    alert('Não é possível gerar o PDF de uma nota sem itens.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- BORDA EXTERNA GERAL ---
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277); 

  // --- CABEÇALHO EM BLOCOS AJUSTADOS (Sem frestas) ---
  doc.rect(10, 10, 75, 30);  // Emitente
  doc.rect(85, 10, 35, 30);  // Danfe Identificação
  doc.rect(120, 10, 80, 30); // Chave de Acesso / Código Barras

  // --- EMITENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('VDR INDÚSTRIA LTDA', 12, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Rua Dr.José Caetano Melo Filho, 860 - Bairro Nossa Senhora de Fátima', 12, 20);
  doc.text('CEP: 95043-200 - Caxias do Sul - RS', 12, 24);
  doc.text('Fone: (54) 984221137 | vdrind@yahoo.com.br', 12, 28);
  doc.text('CNPJ: 08.634.167/0001-16  |  IE: 029/1111111', 12, 32);

  // --- IDENTIFICAÇÃO DO DANFE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DANFE', 102, 16, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('DOCUMENTO AUXILIAR', 102, 21, { align: 'center' });
  doc.text('DA NOTA FISCAL ELETRÔNICA', 102, 24, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Nº: ${nota.numero}`, 88, 31);
  doc.text(`SÉRIE: ${nota.serie}`, 88, 35);

  // --- CHAVE DE ACESSO ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('CHAVE DE ACESSO PARA CONSULTA DE AUTENTICIDADE NO PORTAL DA SEFAZ-RS', 122, 14);
  
  const chaveSimulada = `4326070000000000010055001${nota.numero.replace(/\D/g, '').padStart(9, '0')}1000000014`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(chaveSimulada.replace(/(.{4})/g, '$1 '), 122, 18); 

  // Linhas do falso código de barras perfeitamente centralizado
  doc.setLineWidth(0.2);
  doc.setFillColor('#e2e8f0');
  doc.rect(122, 21, 76, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor('#475569');
  doc.text('|||| ||| ||||| || |||||| |||| ||||| ||||| |||| ||||| |||| ||| |||||', 126, 26);
  doc.setTextColor('#000000');

  // --- NATUREZA DA OPERAÇÃO / PROTOCOLO ---
  doc.rect(10, 40, 110, 12);
  doc.rect(120, 40, 80, 12);
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('NATUREZA DA OPERAÇÃO', 12, 44);
  doc.text('PROTOCOLO DE AUTORIZAÇÃO DE USO (SEFAZ-RS)', 122, 44);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(nota.enderecoDestinatario?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda para Outro Estado', 12, 49);
  doc.text(`143260000123456 - ${nota.dataEmissao} ${nota.horaSaida || '14:00'}:00`, 122, 49);

  // --- DESTINATÁRIO ---
  doc.rect(10, 52, 190, 24);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATÁRIO / REMETENTE', 12, 56);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NOME / RAZÃO SOCIAL: ${nota.cliente}`, 12, 61);
  doc.text(`CNPJ / CPF: ${nota.documento}`, 135, 61);
  
  const end = nota.enderecoDestinatario;
  doc.text(`ENDEREÇO: ${end?.logradouro || ''}, ${end?.numero || ''}`, 12, 67);
  doc.text(`BAIRRO: ${end?.bairro || ''}`, 110, 67);
  doc.text(`CEP: ${end?.cep || ''}`, 165, 67);
  
  doc.text(`MUNICÍPIO: ${end?.municipio || ''}`, 12, 73);
  doc.text(`UF: ${end?.uf || ''}`, 110, 73);
  doc.text(`DATA EMISSÃO: ${nota.dataEmissao}`, 165, 73);

  // --- CÁLCULO DO IMPOSTO ---
  doc.rect(10, 76, 190, 16);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('CÁLCULO DO IMPOSTO', 12, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('BASE DE CÁLC. ICMS', 12, 84);
  doc.text('VALOR DO ICMS', 50, 84);
  doc.text('B. CÁLC. ICMS ST', 90, 84);
  doc.text('VALOR DO ICMS ST', 130, 84);
  doc.text('VALOR TOTAL DA NOTA', 165, 84);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('R$ 0,00', 12, 89);
  doc.text('R$ 0,00', 50, 89);
  doc.text('R$ 0,00', 90, 89);
  doc.text('R$ 0,00', 130, 89);
  doc.text(`R$ ${(nota.valorLiquido || 0).toFixed(2)}`, 165, 89);

  // --- TRANSPORTADOR ---
  doc.rect(10, 92, 190, 14);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSPORTADOR / VOLUMES TRANSPORTADOS', 12, 96);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`RAZÃO SOCIAL: ${nota.transporte?.transportadorNome || 'O MESMO'}`, 12, 101);
  doc.text(`FRETE POR CONTA: ${nota.transporte?.modalidadeFrete?.split(' - ')[0] || '9'}`, 110, 101);
  doc.text(`PLACA: ${nota.transporte?.placaVeiculo || 'NÃO INFORMADA'}`, 165, 101);

  // --- TABELA DE PRODUTOS ---
  const tableRows = nota.itens.map((item) => [
    item.id,
    item.descricao,
    item.ncm,
    '5102',
    item.unidade,
    item.quantidade.toFixed(2),
    `R$ ${item.valorUnitario.toFixed(2)}`,
    `R$ ${item.valorTotalItem.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 108,
    margin: { left: 10, right: 10 },
    head: [['Cód.', 'Descrição do Produto', 'NCM', 'CFOP', 'UN', 'Qtd', 'V. Unit', 'V. Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: '#f8fafc', 
      textColor: '#000000', 
      fontStyle: 'bold', 
      lineWidth: 0.1, 
      lineColor: '#000000',
      fontSize: 7.5
    },
    styles: { fontSize: 7.5, font: 'helvetica', textColor: '#000000' },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 18 },
      3: { cellWidth: 14 },
      4: { cellWidth: 10 },
      5: { cellWidth: 15, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' }
    }
  });

  // --- DADOS ADICIONAIS ---
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  
  if (finalY < 250) {
    doc.rect(10, finalY + 4, 190, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text('DADOS ADICIONAIS', 12, finalY + 8);
    doc.setFontSize(7);
    doc.text('INFORMAÇÕES COMPLEMENTARES:', 12, finalY + 13);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const textoComplementar = nota.informacoesComplementares || '';
    const linhasTexto = doc.splitTextToSize(textoComplementar, 185);
    doc.text(linhasTexto, 12, finalY + 17);
    
    // Tarja de homologação
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor('#64748b');
    doc.text('NFE SEM VALOR FISCAL - AMBIENTE DE HOMOLOGAÇÃO SEFAZ-RS', 105, 275, { align: 'center' });
  }

  // Conversão e abertura segura
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};


export const downloadPdfBase64 = (base64String: string, numeroNota: string) => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
  const pdfUrl = window.URL.createObjectURL(pdfBlob);
  const pdfLink = document.createElement('a');
  pdfLink.href = pdfUrl;
  pdfLink.download = `DANFE_${numeroNota}.pdf`;
  document.body.appendChild(pdfLink);
  pdfLink.click();
  document.body.removeChild(pdfLink);
  window.URL.revokeObjectURL(pdfUrl);
};
