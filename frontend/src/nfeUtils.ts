// src/nfeUtils.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { NotaFiscal } from './useNfeForm';

// --- "CSS" / CONFIGURAÇÕES VISUAIS DO DANFE ---
const DANFE_THEME = {
  fontFamily: 'times',
  colors: {
    textDark: [0, 0, 0] as [number, number, number],
    textMuted: [71, 85, 105] as [number, number, number],
    brandMuted: [100, 116, 139] as [number, number, number],
    bgLight: [226, 232, 240] as [number, number, number],
    tableHeaderBg: [248, 250, 252] as [number, number, number],
  },
  fontSize: { title: 10, subtitle: 6.5, body: 7.5, info: 6, micro: 5.5, alert: 9 }
};

// Auxiliar para remover caracteres não numéricos
const limpar = (val?: string) => (val || '').replace(/\D/g, '');

/**
 * Faz o download do XML injetando o cabeçalho binário BOM
 */
export const downloadXml = (xmlString: string, numeroNota: string) => {
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const xmlBlob = new Blob([BOM, xmlString], { type: 'application/xml;charset=utf-8' });
  const xmlUrl = window.URL.createObjectURL(xmlBlob);
  const xmlLink = document.createElement('a');
  xmlLink.href = xmlUrl;
  xmlLink.download = `NFe_${limpar(numeroNota) || 'Nota'}.xml`;
  document.body.appendChild(xmlLink);
  xmlLink.click();
  document.body.removeChild(xmlLink);
  window.URL.revokeObjectURL(xmlUrl);
};

/**
 * Função para gerar e baixar o XML estruturado da NF-e padrão SEFAZ
 */
export const baixarXmlNfe = (nota: NotaFiscal) => {
  if (!nota.itens?.length) return alert('Não é possível gerar o XML de uma nota sem itens.');

  const docLimpo = limpar(nota.documento);
  const dest = nota.enderecoDestinatario;
  const dataEmi = (nota.dataEmissao || '').includes('/') ? nota.dataEmissao!.split('/').reverse().join('-') : (nota.dataEmissao || '');
  const cfop = dest?.uf === 'RS' ? '5102' : '6102';

  const xmlItens = nota.itens.map((item, i) => `
    <det nItem="${i + 1}">
      <prod>
        <cProd>${item.id}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${item.descricao}</xProd>
        <NCM>${limpar(item.ncm)}</NCM>
        <CFOP>${cfop}</CFOP>
        <uCom>${item.unidade}</uCom>
        <qCom>${(item.quantidade || 0).toFixed(4)}</qCom>
        <vUnCom>${(item.valorUnitario || 0).toFixed(10)}</vUnCom>
        <vProd>${(item.valorTotalItem || 0).toFixed(2)}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>${item.unidade}</uTrib>
        <qTrib>${(item.quantidade || 0).toFixed(4)}</qTrib>
        <vUnTrib>${(item.valorUnitario || 0).toFixed(10)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
    </det>`).join('');

  const natOp = dest?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda de Mercadoria para Fora do Estado';

  const xmlCompleto = `<?xml version="1.0" encoding="utf-8"?>
  <NFe xmlns="http://portalfiscal.inf.br">
    <infNFe versao="4.00" Id="NFe${nota.id}">
      <ide>
        <cUF>43</cUF><natOp>${natOp}</natOp><mod>55</mod><serie>${nota.serie || '1'}</serie>
        <nNF>${limpar(nota.numero)}</nNF><dhEmi>${dataEmi}T${nota.horaSaida || '00:00'}:00-03:00</dhEmi>
        <tpNF>${(nota.tipoOperacao || '1').charAt(0)}</tpNF><idDest>${(nota.destinoOperacao || '1').charAt(0)}</idDest>
        <cMunFG>${dest?.codigoMunicipio || ''}</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><finNFe>${(nota.finalidadeEmissao || '1').charAt(0)}</finNFe>
      </ide>
      <dest>
        ${docLimpo.length === 11 ? `<CPF>${docLimpo}</CPF>` : `<CNPJ>${docLimpo}</CNPJ>`}
        <xNome>${nota.cliente}</xNome>
        <enderDest>
          <xlgr>${dest?.logradouro || ''}</xlgr><nro>${dest?.numero || ''}</nro><xBairro>${dest?.bairro || ''}</xBairro>
          <cMun>${dest?.codigoMunicipio || ''}</cMun><xMun>${dest?.municipio || ''}</xMun><UF>${dest?.uf || ''}</UF>
          <CEP>${limpar(dest?.cep)}</CEP><cPais>1058</cPais><xPais>Brasil</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      ${xmlItens}
      <total>
        <ICMSTot>
          <vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${(nota.valorBruto || 0).toFixed(2)}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro>
          <vNF>${(nota.valorLiquido || 0).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <infAdic><infCpl>${nota.informacoesComplementares || ''}</infCpl></infAdic>
    </infNFe>
  </NFe>`.replace(/>\s+</g, '><').trim();

  downloadXml(xmlCompleto, nota.numero);
};
/**
 * Função para gerar e abrir o PDF do DANFE no padrão oficial SEFAZ-RS
 * Adequado rigorosamente às seções 3.7 e 3.8 do MOC (Incluindo Canhoto e Ajustes de Posição da Identificação)
 */
export const imprimirPdfNfe = (nota: NotaFiscal) => {
  if (!nota.itens?.length) return alert('Não é possível gerar o PDF de uma nota sem itens.');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { colors } = DANFE_THEME;
  
  // Função auxiliar de texto com garantia absoluta de aplicação da fonte Times New Roman
  const renderText = (txt: string, x: number, y: number, size: number, style: 'bold' | 'normal' = 'normal', opts = {}) => {
    doc.setFont('times', style);
    doc.setFontSize(size);
    doc.text(txt, x, y, opts);
  };

  // --- REGRA MOC SEÇÃO 3.8: POSICIONAMENTO DO CANHOTO (EM MM) ---
  const CANHOTO_X = 2.5;    // 0,25 cm
  const CANHOTO_Y = 4.2;    // 0,42 cm
  const CANHOTO_W = 161;    // 16,10 cm
  const CANHOTO_H = 17;     // Ajustado para 1,70 cm (17 mm) para nivelar com o bloco de identificação lateral

  // --- REGRA MOC SEÇÃO 3.8: IDENTIFICAÇÃO DO CANHOTO LATERAL (EM MM) ---
  const IDENT_X = 163.5;    // 16,35 cm
  const IDENT_Y = 4.2;     // 0,42 cm
  const IDENT_W = 45;       // 4,50 cm
  const IDENT_H = 17;       // 1,70 cm

  // Desenha o bloco principal do Canhoto de Recebimento
  doc.setLineWidth(0.3);
  doc.rect(CANHOTO_X, CANHOTO_Y, CANHOTO_W, CANHOTO_H);
  
  // Desenha a caixa lateral de Identificação da Nota conforme as exatas coordenadas exigidas
  doc.rect(IDENT_X, IDENT_Y, IDENT_W, IDENT_H);

  // Textos obrigatórios em Caixa Alta e Negrito dentro do Canhoto de Recebimento
  renderText('RECEBEMOS DE VDR INDÚSTRIA LTDA OS PRODUTOS / SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO', CANHOTO_X + 2, CANHOTO_Y + 5, 5.5, 'bold');
  renderText('DATA DE RECEBIMENTO', CANHOTO_X + 2, CANHOTO_Y + 12, 5, 'bold');
  renderText('IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR', CANHOTO_X + 45, CANHOTO_Y + 12, 5, 'bold');
  
  // Textos internos da caixa de Identificação Lateral (Tamanho 10 em negrito conforme MOC 3.7.4)
  renderText('NF-e', IDENT_X + (IDENT_W / 2), IDENT_Y + 5, 10, 'bold', { align: 'center' });
  renderText(`Nº: ${nota.numero || ''}`, IDENT_X + (IDENT_W / 2), IDENT_Y + 10, 10, 'bold', { align: 'center' });
  renderText(`SÉRIE: ${nota.serie || '1'}`, IDENT_X + (IDENT_W / 2), IDENT_Y + 15, 10, 'bold', { align: 'center' });

  // Linhas pontilhadas de picote abaixo do canhoto recalculadas para a nova altura de 17mm
  doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(2.5, CANHOTO_Y + CANHOTO_H + 1.5, 205, CANHOTO_Y + CANHOTO_H + 1.5);
  doc.setLineDashPattern([], 0); // Reseta estilo de linha para sólida

  // --- DESLOCAMENTO DO CORPO DO DANFE (Inicia em Y = 25 para dar o espaço simétrico do picote) ---
  const MARGEM_X = 5;
  const INICIO_Y = 25; 
  
  const BORDAS_CONFERIDAS = [
    [MARGEM_X, INICIO_Y, 200, 267],       // Borda Geral reajustada para manter a proporção com o novo Y
    [MARGEM_X, INICIO_Y, 80, 30],         // Bloco Emitente
    [MARGEM_X, INICIO_Y + 30, 120, 12],   // Natureza da operação (Y = 55)
    [MARGEM_X, INICIO_Y + 42, 200, 24],   // Destinatário / Remetente (Y = 67)
    [MARGEM_X, INICIO_Y + 66, 200, 16],   // Bloco Cálculo Impostos (Y = 91)
    [MARGEM_X, INICIO_Y + 82, 200, 14]    // Bloco Transportador (Y = 107)
  ];

  // Desenha as bordas sólidas do corpo
  doc.setLineWidth(0.3);
  BORDAS_CONFERIDAS.forEach(([x, y, w, h]) => doc.rect(x, y, w, h));

  // Divisórias internas do cabeçalho reajustadas
  doc.rect(MARGEM_X + 80, INICIO_Y, 43, 30); 
  doc.rect(MARGEM_X + 123, INICIO_Y, 77, 30); 

  // --- EXIGÊNCIA FISCAL: TARJA DE HOMOLOGAÇÃO NO TOPO ---
  doc.setFillColor(254, 226, 226); 
  doc.rect(MARGEM_X, INICIO_Y - 1, 200, 3.5, 'F');
  doc.setTextColor(220, 38, 38); 
  renderText('AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL', 105, INICIO_Y + 1.5, 7.5, 'bold', { align: 'center' });
  doc.setTextColor(...colors.textDark); 

  // --- DADOS DO EMITENTE (MOC 3.7.6) ---
  renderText('VDR INDÚSTRIA LTDA', MARGEM_X + 2, INICIO_Y + 6, 12, 'bold');
  const dadosEmitente = 
    'Rua Dr.José Caetano Melo Filho, 860 - Bairro Nossa Senhora de Fátima\n' +
    'CEP: 95043-200 - Caxias do Sul - RS\n' +
    'Fone: (54) 984221137 | vdrind@yahoo.com.br\n' +
    'CNPJ: 08.634.167/0001-16  |  IE: 029/1111111';
  renderText(dadosEmitente, MARGEM_X + 2, INICIO_Y + 11, 8, 'bold');
  
  // --- IDENTIFICAÇÃO DO DOCUMENTO (MOC 3.7.4) ---
  const X_CENTRO_DANFE = MARGEM_X + 101.5; 
  renderText('DANFE', X_CENTRO_DANFE, INICIO_Y + 6, 12, 'bold', { align: 'center' });
  renderText('DOCUMENTO AUXILIAR\nDA NOTA FISCAL ELETRÔNICA', X_CENTRO_DANFE, INICIO_Y + 11, 8, 'normal', { align: 'center' });
  
  const tpOperacao = (nota.tipoOperacao || '1').charAt(0);
  doc.setLineWidth(0.2);
  doc.rect(X_CENTRO_DANFE - 3, INICIO_Y + 16, 6, 5); 
  renderText(tpOperacao, X_CENTRO_DANFE, INICIO_Y + 20, 10, 'bold', { align: 'center' }); 
  renderText(tpOperacao === '0' ? '0 - ENTRADA' : '1 - SAÍDA', X_CENTRO_DANFE, INICIO_Y + 24, 8, 'normal', { align: 'center' }); 
  
  renderText(`Nº: ${nota.numero || ''}`, MARGEM_X + 82, INICIO_Y + 6, 10, 'bold');
  renderText(`SÉRIE: ${nota.serie || '1'}`, MARGEM_X + 82, INICIO_Y + 10, 10, 'bold');
  renderText('FOLHA: 1 / 1', MARGEM_X + 82, INICIO_Y + 14, 10, 'bold');

  // --- CHAVE DE ACESSO (MOC 3.7.5) ---
  renderText('CHAVE DE ACESSO PARA CONSULTA DE AUTENTICIDADE NO PORTAL DA SEFAZ-RS', 130, INICIO_Y + 4, 5.5, 'bold');
  const chave = `4326070000000000010055001${limpar(nota.numero).padStart(9, '0')}1000000014`;
  renderText(chave.replace(/(.{4})/g, '$1 '), 130, INICIO_Y + 8, 7.5, 'bold');
  
  doc.setLineWidth(0.2); 
  doc.setFillColor(...colors.bgLight); 
  doc.rect(130, INICIO_Y + 11, 73, 7, 'F');
  
  doc.setTextColor(...colors.textMuted); 
  renderText('|||| ||| ||||| || |||||| |||| ||||| ||||| |||| ||||| |||| ||| |||||', 134, INICIO_Y + 16, 6.5, 'bold');
  doc.setTextColor(...colors.textDark); 
  // --- NATUREZA DA OPERAÇÃO / PROTOCOLO ---
  renderText('NATUREZA DA OPERAÇÃO', MARGEM_X + 2, INICIO_Y + 34, 6, 'bold');
  renderText('PROTOCOLO DE AUTORIZAÇÃO DE USO (SEFAZ-RS)', 130, INICIO_Y + 34, 6, 'bold');
  
  const natText = nota.enderecoDestinatario?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda para Outro Estado';
  renderText(natText, MARGEM_X + 2, INICIO_Y + 39, 10, 'bold');
  renderText(`143260000123456 - ${nota.dataEmissao || ''} ${nota.horaSaida || '14:00'}:00`, 130, INICIO_Y + 39, 10, 'bold');

  // --- DESTINATÁRIO (MOC 3.7.9) ---
  const end = nota.enderecoDestinatario;
  renderText('DESTINATÁRIO / REMETENTE', MARGEM_X + 2, INICIO_Y + 46, 6, 'bold');
  renderText(`NOME / RAZÃO SOCIAL: ${nota.cliente || ''}`, MARGEM_X + 2, INICIO_Y + 51, 10, 'bold');
  renderText(`CNPJ / CPF: ${nota.documento || ''}`, 135, INICIO_Y + 51, 10, 'bold');
  renderText(`ENDEREÇO: ${end?.logradouro || ''}, ${end?.numero || ''}`, MARGEM_X + 2, INICIO_Y + 57, 10, 'bold');
  renderText(`BAIRRO: ${end?.bairro || ''}`, 115, INICIO_Y + 57, 10, 'bold');
  renderText(`CEP: ${end?.cep || ''}`, 165, INICIO_Y + 57, 10, 'bold');
  renderText(`MUNICÍPIO: ${end?.municipio || ''}`, MARGEM_X + 2, INICIO_Y + 64, 10, 'bold');
  renderText(`UF: ${end?.uf || ''}`, 115, INICIO_Y + 64, 10, 'bold');
  renderText(`DATA EMISSÃO: ${nota.dataEmissao || ''}`, 165, INICIO_Y + 64, 10, 'bold');

  // --- CÁLCULO DO IMPOSTO (MOC 3.7.9) ---
  renderText('CÁLCULO DO IMPOSTO', MARGEM_X + 2, INICIO_Y + 70, 6, 'bold');
  const headersImposto = ['BASE DE CÁLCULO ICMS', 'VALOR DO ICMS', 'BASE DE CÁLCULO ICMS ST', 'VALOR DO ICMS ST', 'VALOR TOTAL DA NOTA'];
  headersImposto.forEach((h, idx) => renderText(h, (MARGEM_X + 2) + idx * 40, INICIO_Y + 74, 6, 'bold'));
  const valsImposto = ['R$ 0,00', 'R$ 0,00', 'R$ 0,00', 'R$ 0,00', `R$ ${(nota.valorLiquido || 0).toFixed(2)}`];
  valsImposto.forEach((v, idx) => renderText(v, (MARGEM_X + 2) + idx * 40, INICIO_Y + 79, 10, 'bold'));

  // --- TRANSPORTADOR (MOC 3.7.9) ---
  renderText('TRANSPORTADOR / VOLUMES TRANSPORTADOS', MARGEM_X + 2, INICIO_Y + 86, 6, 'bold');
  renderText(`RAZÃO SOCIAL: ${nota.transporte?.transportadorNome || 'O MESMO'}`, MARGEM_X + 2, INICIO_Y + 91, 10, 'bold');
  renderText(`FRETE POR CONTA: ${nota.transporte?.modalidadeFrete?.split(' - ') || '9'}`, 115, INICIO_Y + 91, 10, 'bold');
  renderText(`PLACA VEÍCULO: ${nota.transporte?.placaVeiculo || 'NÃO INFORMADA'}`, 165, INICIO_Y + 91, 10, 'bold');

  // --- TABELA DE PRODUTOS (MOC 3.7.7) ---
  const tableRows = nota.itens.map(item => [
    item.id, item.descricao, item.ncm || '', '5102', item.unidade,
    (item.quantidade || 0).toFixed(2), `R$ ${(item.valorUnitario || 0).toFixed(2)}`, `R$ ${(item.valorTotalItem || 0).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: INICIO_Y + 97,
    margin: { left: MARGEM_X, right: MARGEM_X },
    head: [['CÓD.', 'DESCRIÇÃO DO PRODUTO / SERVIÇO', 'NCM', 'CFOP', 'UN', 'QTD.', 'V. UNIT.', 'V. TOTAL']],
    body: tableRows, 
    theme: 'grid',
    headStyles: { 
      font: 'times', 
      fillColor: colors.tableHeaderBg, 
      textColor: colors.textDark, 
      fontStyle: 'bold', 
      lineWidth: 0.1, 
      lineColor: colors.textDark, 
      fontSize: 6 
    },
    styles: { font: 'times', fontSize: 6, textColor: colors.textDark },
    columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 78 }, 2: { cellWidth: 18 }, 3: { cellWidth: 14 }, 4: { cellWidth: 10 }, 5: { cellWidth: 15, halign: 'right' }, 6: { cellWidth: 25, halign: 'right' }, 7: { cellWidth: 25, halign: 'right' } }
  });

  // --- DADOS ADICIONAIS (MOC 3.7.8) ---
  const finalY = (doc as any).lastAutoTable?.finalY || 205;
  if (finalY < 255) {
    doc.rect(MARGEM_X, finalY + 4, 200, 30);
    renderText('DADOS ADICIONAIS', MARGEM_X + 2, finalY + 8, 6, 'bold');
    renderText('INFORMAÇÕES COMPLEMENTARES:', MARGEM_X + 2, finalY + 13, 6, 'bold');
    renderText(doc.splitTextToSize(nota.informacoesComplementares || '', 195), MARGEM_X + 2, finalY + 17, 6);
    
    doc.setTextColor(220, 38, 38);
    renderText('SEM VALOR FISCAL - AMBIENTE DE HOMOLOGAÇÃO', 105, 290, 9, 'bold', { align: 'center' });
    doc.setTextColor(...colors.textDark); 
  }

  window.open(URL.createObjectURL(doc.output('blob')), '_blank');
};

/**
 * Converte uma String Base64 vinda do back-end em PDF e realiza o download automático
 */
export const downloadPdfBase64 = (base64String: string, numeroNota: string) => {
  try {
    const byteCharacters = atob(base64String);
    const byteNumbers = Array.from(byteCharacters, (_, i) => byteCharacters.charCodeAt(i));
    const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    const pdfUrl = window.URL.createObjectURL(pdfBlob);
    const pdfLink = document.createElement('a');
    pdfLink.href = pdfUrl;
    pdfLink.download = `DANFE_${numeroNota || 'Nota'}.pdf`;
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);
    window.URL.revokeObjectURL(pdfUrl);
  } catch (e) {
    console.error('Erro no PDF Base64:', e);
    alert('Falha ao baixar o PDF gerado pelo servidor.');
  }
};
