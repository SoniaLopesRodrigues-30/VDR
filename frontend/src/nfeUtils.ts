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
 * Desenha um código de barras linear simplificado (Padrão aproximado CODE128) usando vetores nativos do jsPDF
 */
const desenharCodigoBarras = (doc: jsPDF, x: number, y: number, larguraTotal: number, altura: number, chave: string) => {
  const numBarras = 120;
  const espessuraBarra = larguraTotal / numBarras;
  doc.setFillColor(0, 0, 0);
  
  // Semente previsível baseada na chave de acesso para gerar barras pseudo-reais variantemente estáveis
  let semente = parseInt(chave.substring(0, 8)) || 12345678;
  for (let i = 0; i < numBarras; i++) {
    semente = (semente * 9301 + 49297) % 233280;
    const deveDesenhar = (semente / 233280) > 0.4;
    if (deveDesenhar && (x + (i * espessuraBarra) < x + larguraTotal - espessuraBarra)) {
      doc.rect(x + (i * espessuraBarra), y, espessuraBarra * 0.9, altura, 'F');
    }
  }
};

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
  
  // Geração de Chave de Acesso estrita de 44 dígitos para evitar Rejeição de Validação de Schema
  const cUF = '43'; // RS
  const anoMes = dataEmi.substring(2, 4) + dataEmi.substring(5, 7);
  const cnpjEmit = '086341670000116';
  const mod = '55';
  const seriePadrao = (nota.serie || '1').padStart(3, '0');
  const nNF = limpar(nota.numero).padStart(9, '0');
  const tpEmis = '1';
  const cNF = '10000014'; // Código numérico aleatório/fixo da nota
  const cDV = '4'; // Dígito verificador fictício homologação
  const chaveAcessoCompleta = `${cUF}${anoMes}${cnpjEmit}${mod}${seriePadrao}${nNF}${tpEmis}${cNF}${cDV}`;

  const xmlItens = nota.itens.map((item, i) => `
    <det nItem="${i + 1}">
      <prod>
        <cProd>${item.id}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${item.descricao}</xProd>
        <NCM>${limpar(item.ncm).padStart(8, '0')}</NCM>
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
      <imposto>
        <ICMS><ICMS40><orig>0</orig><CST>41</CST></ICMS40></ICMS>
        <PIS><PISNT><CST>07</CST></PISNT></PIS>
        <COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS>
      </imposto>
    </det>`).join('');

  const natOp = dest?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda de Mercadoria para Fora do Estado';

  const xmlCompleto = `<?xml version="1.0" encoding="utf-8"?>
  <NFe xmlns="http://portalfiscal.inf.br">
    <infNFe versao="4.00" Id="NFe${chaveAcessoCompleta}">
      <ide>
        <cUF>${cUF}</cUF><natOp>${natOp}</natOp><mod>${mod}</mod><serie>${nota.serie || '1'}</serie>
        <nNF>${limpar(nota.numero)}</nNF><dhEmi>${dataEmi}T${nota.horaSaida || '00:00'}:00-03:00</dhEmi>
        <tpNF>${(nota.tipoOperacao || '1').charAt(0)}</tpNF><idDest>${(nota.destinoOperacao || '1').charAt(0)}</idDest>
        <cMunFG>4305108</cMunFG><tpImp>1</tpImp><tpEmis>${tpEmis}</tpEmis><cNF>${cNF}</cNF><finNFe>${(nota.finalidadeEmissao || '1').charAt(0)}</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>1.0</verProc>
      </ide>
      <emit>
        <CNPJ>086341670000116</CNPJ><xNome>VDR INDÚSTRIA LTDA</xNome>
        <enderEmit>
          <xlgr>Rua Dr.José Caetano Melo Filho</xlgr><nro>860</nro><xBairro>Nossa Senhora de Fátima</xBairro>
          <cMun>4305108</cMun><xMun>Caxias do Sul</xMun><UF>RS</UF><CEP>95043200</CEP><cPais>1058</cPais><xPais>Brasil</xPais>
        </enderEmit>
        <IE>0291111111</IE><CRT>1</CRT>
      </emit>
      <dest>
        ${docLimpo.length === 11 ? `<CPF>${docLimpo}</CPF>` : `<CNPJ>${docLimpo}</CNPJ>`}
        <xNome>${nota.cliente}</xNome>
        <enderDest>
          <xlgr>${dest?.logradouro || ''}</xlgr><nro>${dest?.numero || ''}</nro><xBairro>${dest?.bairro || ''}</xBairro>
          <cMun>${dest?.codigoMunicipio || '4305108'}</cMun><xMun>${dest?.municipio || ''}</xMun><UF>${dest?.uf || ''}</UF>
          <CEP>${limpar(dest?.cep)}</CEP><cPais>1058</cPais><xPais>Brasil</xPais>
        </enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      ${xmlItens}
      <total>
        <ICMSTot>
          <vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${(nota.valorBruto || 0).toFixed(2)}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vOutro>0.00</vOutro>
          <vNF>${(nota.valorLiquido || 0).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>9</modFrete>
      </transp>
      <infAdic><infCpl>${nota.informacoesComplementares || ''}</infCpl></infAdic>
    </infNFe>
  </NFe>`.replace(/>\s+</g, '><').trim();

  downloadXml(xmlCompleto, nota.numero);
};
/**
 * Função para gerar e abrir o PDF do DANFE no padrão oficial SEFAZ-RS
 */
/**
 * Função para gerar e abrir o PDF do DANFE no padrão oficial SEFAZ-RS
 */
export const imprimirPdfNfe = (nota: NotaFiscal) => {
  if (!nota.itens?.length) return alert('Não é possível gerar o PDF de uma nota sem itens.');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { colors } = DANFE_THEME;
  
  const renderText = (txt: string, x: number, y: number, size: number, style: 'bold' | 'normal' = 'normal', opts = {}) => {
    doc.setFont('times', style);
    doc.setFontSize(size);
    doc.text(txt, x, y, opts);
  };

  // --- REGRA MOC SEÇÃO 3.8: POSICIONAMENTO DO CANHOTO GERAL (EM MM) ---
  const CANHOTO_X = 2.5;
  const CANHOTO_Y = 4.2;
  const CANHOTO_W = 161;
  const CANHOTO_H = 17;

  // --- REGRA MOC SEÇÃO 3.8: IDENTIFICAÇÃO DO CANHOTO LATERAL (EM MM) ---
  const IDENT_X = 163.5;
  const IDENT_Y = 4.2;
  const IDENT_W = 45;
  const IDENT_H = 17;

  // Desenha os retângulos principais (Borda externa do canhoto e Bloco de ID lateral)
  doc.setLineWidth(0.3);
  doc.rect(CANHOTO_X, CANHOTO_Y, CANHOTO_W, CANHOTO_H);
  doc.rect(IDENT_X, IDENT_Y, IDENT_W, IDENT_H);

  // Texto superior do Canhoto de Recebimento
  renderText('RECEBEMOS DE VDR INDÚSTRIA LTDA OS PRODUTOS / SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO', CANHOTO_X + 2, CANHOTO_Y + 5, 5.5, 'bold');

  // --- NOVAS SUB-DIVISÕES INTERNAS DO CANHOTO (VALORES EM MM) ---
  
  // 1. DATA DE RECEBIMENTO (Esq: 2.5mm | Sup: 12.7mm | Larg: 41.0mm | Alt: 8.5mm)
  const DATA_X = 2.5;
  const DATA_Y = 12.7;
  const DATA_W = 41.0;
  const DATA_H = 8.5;
  doc.rect(DATA_X, DATA_Y, DATA_W, DATA_H);
  renderText('DATA DE RECEBIMENTO', DATA_X + 2, DATA_Y + 5, 5, 'bold');

  // 2. IDENTIFICAÇÃO DE ASSINATURA (Esq: 43.5mm | Sup: 12.7mm | Larg: 121.0mm | Alt: 8.5mm)
  const ASSIN_X = 43.5;
  const ASSIN_Y = 12.7;
  const ASSIN_W = 121.0;
  const ASSIN_H = 8.5;
  doc.rect(ASSIN_X, ASSIN_Y, ASSIN_W, ASSIN_H);
  renderText('IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR', ASSIN_X + 2, ASSIN_Y + 5, 5, 'bold');
  
  // Textos internos da caixa de Identificação Lateral
  renderText('NF-e', IDENT_X + (IDENT_W / 2), IDENT_Y + 5, 10, 'bold', { align: 'center' });
  renderText(`Nº: ${nota.numero || ''}`, IDENT_X + (IDENT_W / 2), IDENT_Y + 10, 10, 'bold', { align: 'center' });
  renderText(`SÉRIE: ${nota.serie || '1'}`, IDENT_X + (IDENT_W / 2), IDENT_Y + 15, 10, 'bold', { align: 'center' });

  // Linhas pontilhadas de picote abaixo do canhoto ajustadas para a nova base (12.7mm + 8.5mm = 21.2mm)
  doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(2.5, 22.5, 205, 22.5);
  doc.setLineDashPattern([], 0);

// --- DESLOCAMENTO DO CORPO DO DANFE ---
  const MARGEM_X = 2.5; // Ajustado para 2.5mm para casar com a margem esquerda informada (0,25 cm)
  const INICIO_Y = 25.4; // Ajustado para 25.4mm conforme a margem superior informada (2,54 cm)
  const EMIT_X = 2.5;
  const EMIT_Y = 25.4;
  const EMIT_W = 100.0;
  const EMIT_H = 39.2;
  // 2. QUADRO DA DESCRIÇÃO "DANFE..." (Esq: 102.5mm | Sup: 25.4mm | Larg: 25.4mm | Alt: 39.2mm)
  const DANFE_BOX_X = 102.5;
  const DANFE_BOX_Y = 25.4;
  const DANFE_BOX_W = 25.4;
  const DANFE_BOX_H = 39.2;
   // Desenha os quadros ajustados
  doc.setLineWidth(0.3);
  doc.rect(EMIT_X, EMIT_Y, EMIT_W, EMIT_H);
  doc.rect(DANFE_BOX_X, DANFE_BOX_Y, DANFE_BOX_W, DANFE_BOX_H);
  
  const BORDAS_CONFERIDAS = [
    [EMIT_X, EMIT_Y, 200, 265],             // Borda Geral da folha
    [EMIT_X + 125.4, EMIT_Y, 74.6, 30],     // Bloco da Chave de Acesso / Numeração lateral
    [EMIT_X, EMIT_Y + 39.2, 125.4, 12],     // Natureza da Operação (ajustado para colar no novo Y do Emitente)
    [EMIT_X, EMIT_Y + 51.2, 200, 24],       // Destinatário
    [EMIT_X, EMIT_Y + 75.2, 200, 16],       // Cálculo de Impostos
    [EMIT_X, EMIT_Y + 91.2, 200, 14]        // Transportador
  ];

  doc.setLineWidth(0.3);
  BORDAS_CONFERIDAS.forEach(([x, y, w, h]) => doc.rect(x, y, w, h));

  doc.rect(MARGEM_X + 80, INICIO_Y, 43, 30); 
  doc.rect(MARGEM_X + 123, INICIO_Y, 77, 30); 

  BORDAS_CONFERIDAS.forEach(([x, y, w, h]) => doc.rect(x, y, w, h));

  // --- TARJA DE HOMOLOGAÇÃO ADAPTADA AO TOPO ---
  doc.setFillColor(254, 226, 226); 
  doc.rect(EMIT_X, EMIT_Y - 1, 200, 3.5, 'F');
  doc.setTextColor(220, 38, 38); 
  renderText('AMBIENTE DE HOMOLOGAÇÃO - SEM VALOR FISCAL', 102.5, EMIT_Y + 1.5, 7.5, 'bold', { align: 'center' });
  doc.setTextColor(...colors.textDark); 

  // --- RENDEREZAÇÃO DE TEXTO: EMITENTE ---
  renderText('VDR INDÚSTRIA LTDA', EMIT_X + 3, EMIT_Y + 8, 12, 'bold');
  const dadosEmitente = 
    'Rua Dr.José Caetano Melo Filho, 860\n' +
    'Bairro Nossa Senhora de Fátima\n' +
    'CEP: 95043-200 - Caxias do Sul - RS\n' +
    'Fone: (54) 984221137\n' +
    'vdrind@yahoo.com.br\n' +
    'CNPJ: 08.634.167/0001-16\n' +
    'IE: 029/1111111';
  renderText(dadosEmitente, EMIT_X + 3, EMIT_Y + 14, 7.5, 'bold');
     
  renderText(`SÉRIE: ${nota.serie || '1'}`, MARGEM_X + 82, INICIO_Y + 10, 10, 'bold');
  renderText('FOLHA: 1 / 1', MARGEM_X + 82, INICIO_Y + 14, 10, 'bold');

  
    // =========================================================================
  // --- BLOCO 1: CHAVE DE ACESSO E SEU CÓDIGO DE BARRAS ---
  // =========================================================================

  // 1. QUADRO CÓDIGO DE BARRAS DA CHAVE (Esq: 127.9mm | Sup: 25.4mm | Larg: 80.0mm | Alt: 14.8mm)
  const BOX_BARRA_X = 127.9;
  const BOX_BARRA_Y = 25.4;
  const BOX_BARRA_W = 80.0;
  const BOX_BARRA_H = 14.8;
  
  doc.setLineWidth(0.3);
  doc.rect(BOX_BARRA_X, BOX_BARRA_Y, BOX_BARRA_W, BOX_BARRA_H);

  // Geração da string da Chave de Acesso (44 caracteres numéricos)
  const dataEmiRaw = (nota.dataEmissao || '').includes('/') ? nota.dataEmissao!.split('/').reverse().join('-') : (nota.dataEmissao || '');
  const anoMesChave = dataEmiRaw.substring(2, 4) + dataEmiRaw.substring(5, 7);
  const chaveAcesso44 = `43${anoMesChave || '26'}08634167000011655${(nota.serie || '1').padStart(3, '0')}${limpar(nota.numero).padStart(9, '0')}1100000144`;

  // 2. CÓDIGO DE BARRAS DA CHAVE (Esq: 86.2mm | Sup: 27.8mm | Larg: 115.0mm | Alt: 10.0mm)
  const BARRA_CHAVE_X = 86.2;
  const BARRA_CHAVE_Y = 27.8;
  const BARRA_CHAVE_W = 115.0;
  const BARRA_CHAVE_H = 10.0;
  
  desenharCodigoBarras(doc, BARRA_CHAVE_X, BARRA_CHAVE_Y, BARRA_CHAVE_W, BARRA_CHAVE_H, chaveAcesso44);

  // 3. TEXTO / TAG DA CHAVE DE ACESSO (Esq: 81.2mm | Sup: 40.2mm | Larg: 127.0mm | Alt: 8.5mm)
  const TAG_CHAVE_X = 81.2;
  const TAG_CHAVE_Y = 40.2;
  const TAG_CHAVE_W = 127.0;
  const TAG_CHAVE_H = 8.5;
  
  doc.rect(TAG_CHAVE_X, TAG_CHAVE_Y, TAG_CHAVE_W, TAG_CHAVE_H);
  // Centraliza o texto da chave formatado com espaços dentro do seu próprio quadro
  const chaveFormatada = chaveAcesso44.replace(/(.{4})/g, '$1 ').trim();
  renderText(chaveFormatada, TAG_CHAVE_X + (TAG_CHAVE_W / 2), TAG_CHAVE_Y + 5.5, 7.5, 'bold', { align: 'center' });


  // =========================================================================
  // --- BLOCO 2: DADOS DO PROTOCOLO E CÓDIGO DE BARRAS ADICIONAL ---
  // =========================================================================

  // 4. QUADRO CÓDIGO DE BARRAS DOS DADOS (Esq: 127.9mm | Sup: 49.8mm | Larg: 80.0mm | Alt: 14.8mm)
  const BOX_DADOS_X = 127.9;
  const BOX_DADOS_Y = 49.8;
  const BOX_DADOS_W = 80.0;
  const BOX_DADOS_H = 14.8;
  
  doc.rect(BOX_DADOS_X, BOX_DADOS_Y, BOX_DADOS_W, BOX_DADOS_H);

  // Geração fictícia estável da string de dados exigida (Tamanho 60 caracteres)
  const tagDados60 = `143260000123456${chaveAcesso44.substring(0, 44)}`.substring(0, 60);

  // 5. CÓDIGO DE BARRAS DOS DADOS (Esq: 2.5mm | Sup: 64.6mm | Larg: 78.7mm | Alt: 10.0mm)
  const BARRA_DADOS_X = 2.5;
  const BARRA_DADOS_Y = 64.6;
  const BARRA_DADOS_W = 78.7;
  const BARRA_DADOS_H = 10.0;
  
  desenharCodigoBarras(doc, BARRA_DADOS_X, BARRA_DADOS_Y, BARRA_DADOS_W, BARRA_DADOS_H, tagDados60);


  // Exibição numérica da Chave de Acesso formatada em blocos de 4 dígitos logo acima ou abaixo do quadro
  renderText('CHAVE DE ACESSO PARA CONSULTA DE AUTENTICIDADE NO PORTAL DA SEFAZ-RS', BOX_BARRA_X, BOX_BARRA_Y - 1.5, 5.5, 'bold');
  renderText(chaveAcessoValida.replace(/(.{4})/g, '$1 '), BOX_BARRA_X, BOX_BARRA_Y + BOX_BARRA_H + 3, 7.1, 'bold');



  // --- IDENTIFICAÇÃO DO DOCUMENTO ---
  const X_CENTRO_DANFE = MARGEM_X + 101.5; 
  renderText('DANFE', X_CENTRO_DANFE, INICIO_Y + 6, 12, 'bold', { align: 'center' });
  renderText('DOCUMENTO AUXILIAR\nDA NOTA FISCAL ELETRÔNICA', X_CENTRO_DANFE, INICIO_Y + 11, 8, 'normal', { align: 'center' });
  
  const tpOperacao = (nota.tipoOperacao || '1').charAt(0);
  doc.rect(X_CENTRO_DANFE - 3, DANFE_BOX_Y + 28, 6, 5); 
  renderText(tpOperacao, X_CENTRO_DANFE, DANFE_BOX_Y + 32, 9, 'bold', { align: 'center' }); 
  renderText(tpOperacao === '0' ? '0-ENTRADA' : '1-SAÍDA', X_CENTRO_DANFE, DANFE_BOX_Y + 37, 5.5, 'normal', { align: 'center' }); 

  // --- BLOCO LATERAL DE NUMERAÇÃO / SÉRIE (Ajustado para o novo Y) ---
  renderText(`Nº: ${nota.numero || ''}`, EMIT_X + 127, EMIT_Y + 6, 10, 'bold');
  renderText(`SÉRIE: ${nota.serie || '1'}`, EMIT_X + 127, EMIT_Y + 11, 10, 'bold');
  renderText('FOLHA: 1 / 1', EMIT_X + 127, EMIT_Y + 16, 10, 'bold');

  // --- NATUREZA DA OPERAÇÃO / PROTOCOLO ---
  renderText('NATUREZA DA OPERAÇÃO', MARGEM_X + 2, INICIO_Y + 34, 6, 'bold');
  renderText('PROTOCOLO DE AUTORIZAÇÃO DE USO (SEFAZ-RS)', 130, INICIO_Y + 34, 6, 'bold');
  
  const natText = nota.enderecoDestinatario?.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda para Outro Estado';
  renderText(natText, MARGEM_X + 2, INICIO_Y + 39, 10, 'bold');
  renderText(`143260000123456 - ${nota.dataEmissao || ''} ${nota.horaSaida || '14:00'}:00`, 130, INICIO_Y + 39, 10, 'bold');

  // --- DESTINATÁRIO ---
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

  // --- CÁLCULO DO IMPOSTO ---
  renderText('CÁLCULO DO IMPOSTO', MARGEM_X + 2, INICIO_Y + 70, 6, 'bold');
  const headersImposto = ['BASE DE CÁLCULO ICMS', 'VALOR DO ICMS', 'BASE DE CÁLCULO ICMS ST', 'VALOR DO ICMS ST', 'VALOR TOTAL DA NOTA'];
  headersImposto.forEach((h, idx) => renderText(h, (MARGEM_X + 2) + idx * 40, INICIO_Y + 74, 6, 'bold'));
  const valsImposto = ['R$ 0,00', 'R$ 0,00', 'R$ 0,00', 'R$ 0,00', `R$ ${(nota.valorLiquido || 0).toFixed(2)}`];
  valsImposto.forEach((v, idx) => renderText(v, (MARGEM_X + 2) + idx * 40, INICIO_Y + 79, 10, 'bold'));

  // --- TRANSPORTADOR ---
  renderText('TRANSPORTADOR / VOLUMES TRANSPORTADOS', MARGEM_X + 2, INICIO_Y + 86, 6, 'bold');
  renderText(`RAZÃO SOCIAL: ${nota.transporte?.transportadorNome || 'O MESMO'}`, MARGEM_X + 2, INICIO_Y + 91, 10, 'bold');
  
  const freteTxt = typeof nota.transporte?.modalidadeFrete === 'string' ? nota.transporte.modalidadeFrete : '9 - SEM FRETE';
  renderText(`FRETE POR CONTA: ${freteTxt}`, 115, INICIO_Y + 91, 10, 'bold');
  renderText(`PLACA VEÍCULO: ${nota.transporte?.placaVeiculo || 'NÃO INFORMADA'}`, 165, INICIO_Y + 91, 10, 'bold');

  // --- TABELA DE PRODUTOS ---
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

  // --- DADOS ADICIONAIS ---
  const finalY = (doc as any).lastAutoTable?.finalY || 205;
  if (finalY < 255) {
    doc.setLineWidth(0.3);
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
