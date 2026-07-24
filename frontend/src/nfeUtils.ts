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

  // --- BORDA EXTERNA DA NOTA (Padrão de Formulário Fiscal) ---
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 190, 277); // Caixa externa delimitadora

  // --- RECTÂNGULOS DO CABEÇALHO ---
  doc.rect(10, 10, 80, 30);  // Bloco 1: Dados do Emitente
  doc.rect(90, 10, 35, 30);  // Bloco 2: Tipo/Série/Número
  doc.rect(125, 10, 75, 30); // Bloco 3: Chave de Acesso e Código de Barras

  // --- BLOCO 1: DADOS DO EMITENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SUA EMPRESA LTDA', 12, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Rua das Indústrias, 456 - Bairro Cinquentenário', 12, 21);
  doc.text('CEP: 95010-000 - Caxias do Sul - RS', 12, 25);
  doc.text('Fone: (54) 3221-0000 | email: contato@empresa.com.br', 12, 29);
  doc.text('CNPJ: 00.000.000/0001-00  |  IE: 029/1111111', 12, 33);

  // --- BLOCO 2: IDENTIFICAÇÃO DO DANFE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DANFE', 107, 17, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('DOCUMENTO AUXILIAR', 107, 22, { align: 'center' });
  doc.text('DA NOTA FISCAL ELETRÔNICA', 107, 25, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Nº: ${nota.numero}`, 93, 31);
  doc.text(`SÉRIE: ${nota.serie}`, 93, 35);

  // --- BLOCO 3: CHAVE DE ACESSO E PROTOCOLO ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('CHAVE DE ACESSO PARA CONSULTA DE AUTENTICIDADE NO PORTAL DA SEFAZ-RS', 127, 14);
  
  // Simulação de Chave de Acesso de RS (Código Inicial 43)
  const chaveSimulada = `4326070000000000010055001${nota.numero.replace(/\D/g, '').padStart(9, '0')}1000000014`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(chaveSimulada.replace(/(.{4})/g, '$1 '), 127, 19); // Coloca espaços a cada 4 dígitos

  // Caixa simulada para o Código de Barras Fiscal
  doc.setLineWidth(0.2);
  doc.setFillColor('#e2e8f0');
  doc.rect(127, 22, 71, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor('#64748b');
  doc.text('|||| ||| ||||| || |||||| |||| ||||| ||||| |||| |||||', 133, 26);
  doc.setTextColor('#000000');

  // Linha e bloco inferior de Protocolo
  doc.line(10, 40, 200, 40);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('NATUREZA DA OPERAÇÃO', 12, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(nota.enderecoDestinatario?.municipio === 'Caxias do Sul' ? 'Venda dentro do Estado' : 'Venda para fora do Estado', 12, 49);
  
  doc.setFont('helvetica', 'bold');
  doc.text('PROTOCOLO DE AUTORIZAÇÃO DE USO (SEFAZ-RS)', 120, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`143260000123456 - ${nota.dataEmissao} ${nota.horaSaida || '14:00'}:00`, 120, 49);

  // --- QUADRO DO DESTINATÁRIO ---
  doc.line(10, 52, 200, 52);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATÁRIO / REMETENTE', 12, 57);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NOME / RAZÃO SOCIAL: ${nota.cliente}`, 12, 63);
  doc.text(`CNPJ / CPF: ${nota.documento}`, 140, 63);
  
  const end = nota.enderecoDestinatario;
  doc.text(`ENDEREÇO: ${end?.logradouro || ''}, ${end?.numero || ''}`, 12, 68);
  doc.text(`BAIRRO: ${end?.bairro || ''}`, 110, 68);
  doc.text(`CEP: ${end?.cep || ''}`, 165, 68);
  
  doc.text(`MUNICÍPIO: ${end?.municipio || ''}`, 12, 73);
  doc.text(`UF: ${end?.uf || ''}`, 110, 73);
  doc.text(`DATA EMISSÃO: ${nota.dataEmissao}`, 165, 73);

  // --- QUADRO DE IMPOSTOS / TOTAIS ---
  doc.line(10, 76, 200, 76);
  doc.setFont('helvetica', 'bold');
  doc.text('CÁLCULO DO IMPOSTO', 12, 81);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('BASE DE CÁLC. ICMS', 12, 86);
  doc.text('VALOR DO ICMS', 50, 86);
  doc.text('B. CÁLC. ICMS ST', 90, 86);
  doc.text('VALOR DO ICMS ST', 130, 86);
  doc.text('VALOR TOTAL DA NOTA', 165, 86);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('R$ 0,00', 12, 91);
  doc.text('R$ 0,00', 50, 91);
  doc.text('R$ 0,00', 90, 91);
  doc.text('R$ 0,00', 130, 91);
  doc.text(`R$ ${(nota.valorLiquido || 0).toFixed(2)}`, 165, 91);

  // --- DADOS DE TRANSPORTE ---
  doc.line(10, 94, 200, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('TRANSPORTADOR / VOLUMES TRANSPORTADOS', 12, 99);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`RAZÃO SOCIAL: ${nota.transporte?.transportadorNome || 'O MESMO'}`, 12, 104);
  doc.text(`FRETE POR CONTA: ${nota.transporte?.modalidadeFrete?.split(' - ')[0] || '9'}`, 120, 104);
  doc.text(`PLACA: ${nota.transporte?.placaVeiculo || 'NÃO INFORMADA'}`, 165, 104);

  // --- TABELA DE PRODUTOS ---
  const tableRows = nota.itens.map((item) => [
    item.id,
    item.descricao,
    item.ncm,
    '5102', // CFOP Simulado RS
    item.unidade,
    item.quantidade.toFixed(2),
    `R$ ${item.valorUnitario.toFixed(2)}`,
    `R$ ${item.valorTotalItem.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 108,
    head: [['Cód.', 'Descrição do Produto', 'NCM', 'CFOP', 'UN', 'Qtd', 'V. Unit', 'V. Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: '#f1f5f9', textColor: '#000000', fontStyle: 'bold', lineWidth: 0.1, lineColor: '#000000' },
    styles: { fontSize: 8, font: 'helvetica', textColor: '#000000' },
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

  // --- DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES ---
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  
  if (finalY < 250) {
    doc.line(10, finalY + 5, 200, finalY + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DADOS ADICIONAIS', 12, finalY + 10);
    doc.text('INFORMAÇÕES COMPLEMENTARES', 12, finalY + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const textoComplementar = nota.informacoesComplementares || '';
    const linhasTexto = doc.splitTextToSize(textoComplementar, 180);
    doc.text(linhasTexto, 12, finalY + 20);
    
    // Tarja de Homologação exigida pela SEFAZ
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#94a3b8');
    doc.text('NFE SEM VALOR FISCAL - AMBIENTE DE HOMOLOGAÇÃO SEFAZ-RS', 105, 275, { align: 'center' });
  }

  // Conversão segura em Blob URL
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
