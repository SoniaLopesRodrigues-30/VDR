// nfeUtils.ts
// Arquivo isolado para gerenciamento e geração de documentos fiscais (XML e PDF)

export interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  valorBruto: number;
  valorLiquido: number;
  itens: ItemNota[];  
  quantidadeVolumes?: string; 
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string; 
}

// ==========================================================================
// 1. FUNÇÃO PARA GERAR E BAIXAR O XML FICTÍCIO (Simples Nacional)
// ==========================================================================
export const baixarXmlNfe = (nota: NotaFiscal) => {
  // Mapeia todos os itens da nota para a estrutura XML de detalhes de produtos (<det>)
  const itensXml = nota.itens.map((item, index) => `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${item.id.slice(-5)}</cProd>
          <xProd>${item.descricao}</xProd>
          <NCM>${item.ncm.replace(/\./g, '')}</NCM>
          <uCom>${item.unidade}</uCom>
          <qCom>${item.quantidade}</qCom>
          <vUnCom>${item.valorUnitario.toFixed(2)}</vUnCom>
          <vProd>${item.valorTotalItem.toFixed(2)}</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMSSN102>
              <orig>0</orig>
              <CSOSN>102</CSOSN> <!-- Simples Nacional: Sem permissão de crédito -->
            </ICMSSN102>
          </ICMS>
        </imposto>
      </det>`).join('');

  const xmlTexto = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://portalfiscal.inf.br" versao="4.00">
  <NFe>
    <infNFe versao="4.00" Id="NFe352607${nota.numero.replace(/\./g, '')}0001995500100000412517845736801">
      <ide>
        <cUF>35</cUF>
        <mod>55</mod>
        <serie>${nota.serie}</serie>
        <nNF>${nota.numero.replace(/\./g, '')}</nNF>
        <dhEmi>${nota.dataEmissao}</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>12.345.678/0001-99</CNPJ>
        <xNome>Sua Empresa Optante Simples Ltda</xNome>
        <CRT>1</CRT>
      </emit>
      <dest>
        <CNPJ>${nota.documento.replace(/[^\d]/g, '')}</CNPJ>
        <xNome>${nota.cliente}</xNome>
      </dest>
      ${itensXml}
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vProd>${nota.valorBruto.toFixed(2)}</vProd>
          <vNF>${nota.valorLiquido.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <vol>
          <qVol>${nota.quantidadeVolumes || 0}</qVol>
          <esp>${nota.especieVolumes || 'CX'}</esp>
          <pesoB>${nota.pesoBruto || '0.000'}</pesoB>
          <pesoL>${nota.pesoLiquido || '0.000'}</pesoL>
        </vol>
      </transp>
      <infAdic>
        <infCpl>${nota.informacoesComplementares || ''}</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
</nfeProc>`;

  const blob = new Blob([xmlTexto], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `NF-${nota.numero.replace(/\./g, '')}.xml`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ==========================================================================
// 2. FUNÇÃO PARA RENDERIZAR E IMPRIMIR O DANFE EM PDF
// ==========================================================================
export const imprimirPdfNfe = (nota: NotaFiscal) => {
  const janelaImpressao = window.open('', '_blank');
  if (!janelaImpressao) return;

  janelaImpressao.document.write(`
    <html>
      <head>
        <title>DANFE - NF-e Nº ${nota.numero}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #000; font-size: 12px; }
          .danfe-border { border: 2px solid #000; padding: 10px; margin-bottom: 10px; }
          .row { display: flex; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
          .col { flex: 1; padding: 4px; }
          .title { font-weight: bold; text-transform: uppercase; font-size: 14px; text-align: center; }
          .label { font-size: 10px; color: #333; font-weight: bold; display: block; }
          .value { font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table th, table td { border: 1px solid #000; padding: 6px; text-align: left; }
          table th { background-color: #eaeaea; }
          @media print { .btn-container { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="btn-container" style="text-align:center; margin-bottom: 20px;">
          <button onclick="window.print();window.close();" style="padding: 10px 20px; font-weight:bold; cursor:pointer;">Confirmar Impressão / Salvar PDF</button>
        </div>
        <div class="danfe-border">
          <div class="title">Documento Auxiliar da Nota Fiscal Eletrônica (DANFE)</div>
          <div class="row">
            <div class="col"><span class="label">EMISSOR:</span><span class="value">Sua Empresa Optante Simples Ltda - CNPJ: 12.345.678/0001-99</span></div>
            <div class="col"><span class="label">NÚMERO DA NOTA:</span><span class="value">${nota.numero} (SÉRIE: ${nota.serie})</span></div>
          </div>
          <div class="row">
            <div class="col"><span class="label">DESTINATÁRIO:</span><span class="value">${nota.cliente}</span></div>
            <div class="col"><span class="label">CPF / CNPJ:</span><span class="value">${nota.documento}</span></div>
            <div class="col"><span class="label">DATA EMISSÃO:</span><span class="value">${nota.dataEmissao}</span></div>
          </div>
          <div class="row">
            <div class="col"><span class="label">VOLUMES:</span><span class="value">${nota.quantidadeVolumes || 0} (${nota.especieVolumes || 'CX'})</span></div>
            <div class="col"><span class="label">PESO BRUTO:</span><span class="value">${nota.pesoBruto || '0.000'} kg</span></div>
            <div class="col"><span class="label">PESO LÍQUIDO:</span><span class="value">${nota.pesoLiquido || '0.000'} kg</span></div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Descrição do Produto</th>
                <th>NCM</th>
                <th>UND</th>
                <th>QTD</th>
                <th>V. UNIT</th>
                <th>V. TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${nota.itens.map(item => `
                <tr>
                  <td>${item.descricao}</td>
                  <td>${item.ncm}</td>
                  <td>${item.unidade}</td>
                  <td>${item.quantidade}</td>
                  <td>R$ ${item.valorUnitario.toFixed(2)}</td>
                  <td>R$ ${item.valorTotalItem.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="row" style="margin-top: 15px; border-top: 2px solid #000;">
            <div class="col"><span class="label">VALOR TOTAL DOS PRODUTOS:</span><span class="value">R$ ${nota.valorBruto.toFixed(2)}</span></div>
            <div class="col"><span class="label">VALOR TOTAL DA NOTA (LIQ):</span><span class="value" style="font-weight:bold;">R$ ${nota.valorLiquido.toFixed(2)}</span></div>
          </div>
          
          <div class="danfe-border" style="margin-top:15px; background-color:#fafafa;">
            <span class="label">INFORMAÇÕES COMPLEMENTARES:</span>
            <p class="value" style="margin: 5px 0 0 0;">${nota.informacoesComplementares || 'Sem observações adicionais.'}</p>
          </div>
        </div>
      </body>
    </html>
  `);
  janelaImpressao.document.close();
};
