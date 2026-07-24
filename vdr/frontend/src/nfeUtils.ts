// nfeUtils.ts
import type { NotaFiscal } from './useNfeForm';

/**
 * Função para gerar e baixar o XML estruturado da NF-e padrão SEFAZ
 */
export const baixarXmlNfe = (nota: NotaFiscal) => {
  if (!nota.itens || nota.itens.length === 0) {
    alert('Não é possível gerar o XML de uma nota sem itens.');
    return;
  }

  const docLimpo = nota.documento.replace(/\D/g, '');
  const cepLimpo = nota.enderecoDestinatario.cep.replace(/\D/g, '');
  
  let dataEmissaoFormatada = nota.dataEmissao;
  if (nota.dataEmissao.includes('/')) {
    dataEmissaoFormatada = nota.dataEmissao.split('/').reverse().join('-');
  }

  // Geração linear dos itens sem quebras de linha acidentais
  const xmlItens = nota.itens.map((item, index) => {
    return `<det nItem="${index + 1}">` +
      '<prod>' +
        `<cProd>${item.id}</cProd>` +
        '<cEAN>SEM GTIN</cEAN>' +
        `<xProd>${item.descricao}</xProd>` +
        `<NCM>${item.ncm.replace(/\D/g, '')}</NCM>` +
        `<CFOP>${nota.enderecoDestinatario.uf === 'RS' ? '5102' : '6102'}</CFOP>` +
        `<uCom>${item.unidade}</uCom>` +
        `<qCom>${item.quantidade.toFixed(4)}</qCom>` +
        `<vUnCom>${item.valorUnitario.toFixed(10)}</vUnCom>` +
        `<vProd>${item.valorTotalItem.toFixed(2)}</vProd>` +
        '<cEANTrib>SEM GTIN</cEANTrib> ' +
        `<uTrib>${item.unidade}</uTrib>` +
        `<qTrib>${item.quantidade.toFixed(4)}</qTrib>` +
        `<vUnTrib>${item.valorUnitario.toFixed(10)}</vUnTrib>` +
        '<indTot>1</indTot>' +
      '</prod>' +
    '</det>';
  }).join('');

  // CORREÇÃO CIRÚRGICA: encoding em letras minúsculas conforme exigido pelos parsers rígidos
  let xmlCompleto = '<?xml version="1.0" encoding="utf-8"?>';
  xmlCompleto += '<NFe xmlns="http://portalfiscal.inf.br">';
  xmlCompleto += `<infNFe versao="4.00" Id="NFe${nota.id}">`;
  xmlCompleto += '<ide>';
  xmlCompleto += '<cUF>43</cUF>';
  xmlCompleto += `<natOp>${nota.enderecoDestinatario.municipio === 'Caxias do Sul' ? 'Venda de Mercadoria' : 'Venda de Mercadoria para Fora do Estado'}</natOp>`;
  xmlCompleto += '<mod>55</mod>';
  xmlCompleto += `<serie>${nota.serie}</serie>`;
  xmlCompleto += `<nNF>${nota.numero.replace(/\D/g, '')}</nNF>`;
  xmlCompleto += `<dhEmi>${dataEmissaoFormatada}T${nota.horaSaida}:00-03:00</dhEmi>`;
  xmlCompleto += `<tpNF>${nota.tipoOperacao.charAt(0)}</tpNF>`;
  xmlCompleto += `<idDest>${nota.destinoOperacao.charAt(0)}</idDest>`;
  xmlCompleto += `<cMunFG>${nota.enderecoDestinatario.codigoMunicipio}</cMunFG>`;
  xmlCompleto += '<tpImp>1</tpImp>';
  xmlCompleto += '<tpEmis>1</tpEmis>';
  xmlCompleto += `<finNFe>${nota.finalidadeEmissao.charAt(0)}</finNFe>`;
  xmlCompleto += '</ide>';
  xmlCompleto += '<dest>';
  xmlCompleto += docLimpo.length === 11 ? `<CPF>${docLimpo}</CPF>` : `<CNPJ>${docLimpo}</CNPJ>`;
  xmlCompleto += `<xNome>${nota.cliente}</xNome>`;
  xmlCompleto += '<enderDest>';
  xmlCompleto += `<xlgr>${nota.enderecoDestinatario.logradouro}</xlgr>`;
  xmlCompleto += `<nro>${nota.enderecoDestinatario.numero}</nro>`;
  xmlCompleto += `<xBairro>${nota.enderecoDestinatario.bairro}</xBairro>`;
  xmlCompleto += `<cMun>${nota.enderecoDestinatario.codigoMunicipio}</cMun>`;
  xmlCompleto += `<xMun>${nota.enderecoDestinatario.municipio}</xMun>`;
  xmlCompleto += `<UF>${nota.enderecoDestinatario.uf}</UF>`;
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
  xmlCompleto += `<vProd>${nota.valorBruto.toFixed(2)}</vProd>`;
  xmlCompleto += '<vFrete>0.00</vFrete>';
  xmlCompleto += '<vSeg>0.00</vSeg>';
  xmlCompleto += '<vDesc>0.00</vDesc>';
  xmlCompleto += '<vII>0.00</vII>';
  xmlCompleto += '<vIPI>0.00</vIPI>';
  xmlCompleto += '<vIPIDevol>0.00</vIPIDevol>';
  xmlCompleto += '<vPIS>0.00</vPIS>';
  xmlCompleto += '<vCOFINS>0.00</vCOFINS>';
  xmlCompleto += '<vOutro>0.00</vOutro>';
  xmlCompleto += `<vNF>${nota.valorLiquido.toFixed(2)}</vNF>`;
  xmlCompleto += '</ICMSTot>';
  xmlCompleto += '</total>';
  xmlCompleto += '<infAdic>';
  xmlCompleto += `<infCpl>${nota.informacoesComplementares}</infCpl>`;
  xmlCompleto += '</infAdic>';
  xmlCompleto += '</infNFe>';
  xmlCompleto += '</NFe>';

  const numeroFormatado = nota.numero.replace(/\D/g, '');
  downloadXml(xmlCompleto, numeroFormatado);
};

export const imprimirPdfNfe = (nota: NotaFiscal) => {
  console.log('Integrar com API para gerar DANFE da nota:', nota.numero);
};

/**
 * Faz o download do XML injetando o cabeçalho binário BOM (Previne erro de decodificação no Browser)
 */
export const downloadXml = (xmlString: string, numeroNota: string) => {
  // SOLUÇÃO REAL: Criação do marcador binário de UTF-8 (BOM)
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  
  // O construtor do Blob recebe o marcador binário ANTES da string do XML
  const xmlBlob = new Blob([BOM, xmlString], { type: 'application/xml;charset=utf-8' });
  
  const xmlUrl = window.URL.createObjectURL(xmlBlob);
  const xmlLink = document.createElement('a');
  xmlLink.href = xmlUrl;
  xmlLink.download = `NFe_${numeroNota}.xml`;
  document.body.appendChild(xmlLink);
  xmlLink.click();
  document.body.removeChild(xmlLink);
  window.URL.revokeObjectURL(xmlUrl);
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
