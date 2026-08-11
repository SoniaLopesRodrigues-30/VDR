// gerarImpressao.ts

export const gerarImpressaoOS = (
  os: any, 
  obterEstiloStatus: (status: string) => { bg: string; text: string },
  logoUrl?: string // Parâmetro opcional para a imagem do logotipo
) => {
  const janelaImpressao = window.open('', '_blank', 'width=800,height=600');
  if (!janelaImpressao) return alert('Por favor, permita pop-ups para imprimir.');

  const coresStatus = obterEstiloStatus(os.status);

  const dataFormatada = os.dataAbertura 
    ? new Date(os.dataAbertura + 'T12:00:00').toLocaleDateString('pt-BR') 
    : '--';

  const servicosHtml = os.servicos?.length > 0 
    ? os.servicos.map((s: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${s.descricao}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${s.quantidade}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${Number(s.valorUnitario || 0).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${Number(s.total || 0).toFixed(2)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="padding: 8px; text-align: center; color: #64748b;">Nenhum serviço registrado.</td></tr>';

  const pecasHtml = os.pecas?.length > 0 
    ? os.pecas.map((p: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${p.descricao}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${p.quantidade} ${p.tipoUnidade || 'UN'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${Number(p.valorUnitario || 0).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${Number(p.total || 0).toFixed(2)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="padding: 8px; text-align: center; color: #64748b;">Nenhuma peça registrada.</td></tr>';

  // Renderiza a tag da imagem apenas se a URL do logo existir
  const logoHtml = logoUrl 
    ? `<img src="${logoUrl}" alt="Logo Empresa" style="max-height: 60px; max-width: 200px; object-fit: contain; margin-bottom: 10px;" />`
    : '';

  janelaImpressao.document.write(`
    <html>
      <head>
        <title>Impressão OS - ${os.numero}</title>
        <style>
          body { font-family: sans-serif; color: #0f172a; padding: 20px; line-height: 1.5; font-size: 14px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          .card-info { border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; background: #f8fafc; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .total-box { text-align: right; margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 6px; font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${logoHtml}
            <h1 style="margin: 0; font-size: 22px;">ORDEM DE SERVIÇO</h1>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #1e3a8a;">${os.numero}</h2>
            <span style="display: inline-block; font-size: 11px; padding: 3px 8px; border-radius: 12px; font-weight: bold; background: ${coresStatus.bg}; color: ${coresStatus.text}; text-transform: uppercase;">${os.status}</span>
          </div>
        </div>
        <div class="info-grid">
          <div class="card-info">
            <strong>Dados do Cliente</strong>
            <p style="margin: 5px 0 0 0;"><strong>Nome:</strong> ${os.clienteNome}</p>
            <p style="margin: 5px 0 0 0;"><strong>Condição:</strong> ${os.condicaoPagamento || '--'}</p>
          </div>
          <div class="card-info">
            <strong>Detalhes da OS</strong>
            <p style="margin: 5px 0 0 0;"><strong>Objeto:</strong> ${os.equipamento}</p>
            <p style="margin: 5px 0 0 0;"><strong>Abertura:</strong> ${dataFormatada}</p>
          </div>
        </div>
        ${os.tipoOs !== 'produtos' ? `<h3>Serviços</h3><table><thead><tr><th>Descrição</th><th style="text-align: center;">Qtd</th><th style="text-align: right;">Unitário</th><th style="text-align: right;">Total</th></tr></thead><tbody>${servicosHtml}</tbody></table>` : ''}
        ${os.tipoOs !== 'mao_de_obra' ? `<h3>Peças</h3><table><thead><tr><th>Descrição</th><th style="text-align: center;">Qtd</th><th style="text-align: right;">Unitário</th><th style="text-align: right;">Total</th></tr></thead><tbody>${pecasHtml}</tbody></table>` : ''}
        <div class="total-box">VALOR TOTAL: R$ ${Number(os.valorTotal || 0).toFixed(2)}</div>
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="border-top: 1px solid #cbd5e1; width: 45%; text-align: center; padding-top: 5px; font-size: 12px; margin-top: 40px;">Técnico</div>
          <div style="border-top: 1px solid #cbd5e1; width: 45%; text-align: center; padding-top: 5px; font-size: 12px; margin-top: 40px;">Cliente</div>
        </div>
        <script>
          // O timeout garante que o navegador carregue o logotipo da URL antes de abrir a janela de impressão
          window.onload = function() { 
            setTimeout(() => { window.print(); }, 300); 
          };
        </script>
      </body>
    </html>
  `);
  janelaImpressao.document.close();
};
