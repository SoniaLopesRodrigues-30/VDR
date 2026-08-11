// DocumentoImpressao.tsx
import React from 'react';

interface ItemOrcamento {
  id?: number;
  descricao: string;
  un: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

interface Props {
  clienteNome: string;
  validade: string;
  itens: ItemOrcamento[];
  valorTotalGeral: number;
  status: string;
  condicaoPagamento?: string;
  previsaoEntrega?: string;
  observacao?: string;
  idEditando: number | null;
  logoUrl?: string; // Propriedade que receberá a imagem local importada
}

export function DocumentoImpressao({
  clienteNome, validade, itens = [], valorTotalGeral = 0, status,
  condicaoPagamento = '', previsaoEntrega = '', observacao = '', idEditando, logoUrl
}: Props) {

  const handleImprimirNativo = () => {
    const janelaImpressao = window.open('', '_blank');
    if (!janelaImpressao) {
      alert('Por favor, permita pop-ups para abrir a folha de impressão.');
      return;
    }

    const totalFormatado = valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const numeroOrcamento = idEditando ? `ORC-${String(idEditando).padStart(3, '0')}` : 'NOVO';

    // Gera o HTML da imagem apenas se a propriedade for enviada
    const logoHtml = logoUrl 
      ? `<img src="${logoUrl}" alt="Logo Empresa" style="max-height: 60px; max-width: 220px; object-fit: contain; margin-bottom: 12px; display: block;" />`
      : '';

    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Orçamento ${numeroOrcamento}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #000;
              margin: 15mm;
              font-size: 12px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header h2 { margin: 0 0 5px 0; color: #1e3a8a; font-size: 20px; }
            .header p { margin: 2px 0; color: #374151; }
            .doc-info { text-align: right; }
            .doc-info h3 { margin: 0 0 5px 0; font-size: 22px; }
            .badge-num { display: inline-block; background: #f1f5f9; padding: 4px 12px; font-weight: bold; border-radius: 4px; border: 1px solid #cbd5e1; margin-bottom: 8px; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; font-size: 13px; text-transform: uppercase; background: #f1f5f9; padding: 6px 10px; margin-bottom: 10px; border-left: 4px solid #1e3a8a; }
            .tabela { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            .tabela th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            .tabela td { border-bottom: 1px solid #e2e8f0; padding: 8px; word-wrap: break-word; }
            .footer-bloco { display: flex; justify-content: space-between; margin-top: 35px; page-break-inside: avoid; }
            .condicoes { flex: 1; padding-right: 40px; }
            .obs-box { margin-top: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 4px; }
            .obs-box p { margin: 4px 0 0 0; white-space: pre-wrap; }
            .total-box { text-align: right; background: #f1f5f9; padding: 15px 20px; border-radius: 6px; border: 1px solid #cbd5e1; min-width: 200px; align-self: flex-start; }
            .total-box span { font-size: 11px; font-weight: bold; color: #4b5563; }
            .total-box h2 { margin: 5px 0 0 0; font-size: 24px; color: #1e3a8a; }
            .assinaturas { display: flex; justify-content: space-around; margin-top: 80px; page-break-inside: avoid; }
            .linha-assinatura { text-align: center; width: 220px; }
            .linha-assinatura .linha { border-bottom: 1px solid #000; margin-bottom: 5px; }
            @page { size: portrait A4; margin: 15mm; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              ${logoHtml}
              <h2>Sua Empresa Ltda</h2>
              <p>CNPJ: 00.000.000/0001-00</p>
              <p>E-mail: contato@suaempresa.com.br | Telefone: (11) 99999-9999</p>
              <p>Endereço: Av. Central, 123 - Centro, São Paulo - SP</p>
            </div>
            <div class="doc-info">
              <h3>ORÇAMENTO</h3>
              <div class="badge-num">${numeroOrcamento}</div>
              <p><strong>Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Validade:</strong> ${validade ? new Date(validade + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <p><strong>Nome / Razão Social:</strong> ${clienteNome || 'Não informado'}</p>
            <p><strong>Status da Proposta:</strong> ${status}</p>
          </div>

          <div class="section">
            <div class="section-title">Itens do Orçamento</div>
            <table class="tabela">
              <thead>
                <tr>
                  <th align="left">Descrição</th>
                  <th align="center" style="width: 50px;">UN</th>
                  <th align="center" style="width: 80px;">NCM</th>
                  <th align="center" style="width: 50px;">Qtd</th>
                  <th align="right" style="width: 100px;">Unitário</th>
                  <th align="right" style="width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itens.map(item => `
                  <tr>
                    <td>${item.descricao}</td>
                    <td align="center">${item.un || 'UN'}</td>
                    <td align="center">${item.ncm || '-'}</td>
                    <td align="center">${item.quantidade}</td>
                    <td align="right">${item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td align="right" style="font-weight: 600;">${item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer-bloco">
            <div class="condicoes">
              ${condicaoPagamento ? `<p><strong>Condição de Pagamento:</strong> ${condicaoPagamento}</p>` : ''}
              ${previsaoEntrega ? `<p><strong>Previsão de Entrega:</strong> ${previsaoEntrega}</p>` : ''}
              ${observacao ? `
                <div class="obs-box">
                  <strong>Observações Gerais:</strong>
                  <p>${observacao}</p>
                </div>
              ` : ''}
            </div>
            <div class="total-box">
              <span>VALOR TOTAL GERAL</span>
              <h2>${totalFormatado}</h2>
            </div>
          </div>

          <div class="assinaturas">
            <div class="linha-assinatura">
              <div class="linha"></div>
              <p>Responsável p/ Empresa</p>
            </div>
            <div class="linha-assinatura">
              <div class="linha"></div>
              <p>Aceite do Cliente (Assinatura / Data)</p>
            </div>
          </div>
        </body>
      </html>
    `);

    janelaImpressao.document.close();
    janelaImpressao.focus();
    
    // Pequeno atraso para o motor do navegador ler e embutir a imagem local antes do print
    setTimeout(() => {
      janelaImpressao.print();
      janelaImpressao.close();
    }, 500);
  };

  return (
    <button 
      type="button" 
      onClick={handleImprimirNativo} 
      className="btn-imprimir"
      disabled={itens.length === 0}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '8px 16px', 
        cursor: itens.length === 0 ? 'not-allowed' : 'pointer',
        opacity: itens.length === 0 ? 0.5 : 1
      }}
    >
      <svg xmlns="http://w3.org" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer">
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"/>
        <rect x="6" y="14" width="12" height="8" rx="1"/>
      </svg>
      Imprimir PDF
    </button>
  );
}
