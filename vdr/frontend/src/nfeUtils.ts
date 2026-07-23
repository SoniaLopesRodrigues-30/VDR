// nfeUtils.ts
// IMPORTAÇÃO CORRETA: Utiliza o modificador 'type' para evitar erros em tempo de execução no Vite
import type { NotaFiscal } from './useNfeForm';

/**
 * Função placeholder para baixar o XML da NF-e integrado ao seu back-end
 */
export const baixarXmlNfe = (nota: NotaFiscal) => {
  // CORREÇÃO: Utiliza a variável para eliminar o sublinhado vermelho de erro do TypeScript
  console.log(`Preparando download do XML para a nota: ${nota.numero}`);
};

/**
 * Função placeholder para imprimir o PDF do DANFE integrado ao seu back-end
 */
export const imprimirPdfNfe = (nota: NotaFiscal) => {
  // CORREÇÃO: Utiliza a variável para eliminar o sublinhado vermelho de erro do TypeScript
  console.log(`Preparando impressão do PDF para a nota: ${nota.numero}`);
};

/**
 * Faz o download de uma string XML gerando um link temporário no DOM
 */
export const downloadXml = (xmlString: string, numeroNota: string) => {
  const xmlBlob = new Blob([xmlString], { type: 'application/xml' });
  const xmlUrl = window.URL.createObjectURL(xmlBlob);
  const xmlLink = document.createElement('a');
  xmlLink.href = xmlUrl;
  xmlLink.download = `NFe_${numeroNota}.xml`;
  document.body.appendChild(xmlLink);
  xmlLink.click();
  document.body.removeChild(xmlLink);
  window.URL.revokeObjectURL(xmlUrl);
};

/**
 * Converte uma string Base64 em arquivo PDF e força o download
 */
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
