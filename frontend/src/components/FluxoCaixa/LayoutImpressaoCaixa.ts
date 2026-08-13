export function gerarHtmlCaixa(dados: { transacoes: any[], receitas: number, despesas: number, saldoAnterior?: number, saldoAtual?: number, periodo: string }, urlLogo: string): string {
  // Garantimos que se saldoAnterior ou saldoAtual não existirem, eles assumam o valor 0
  const { transacoes = [], receitas = 0, despesas = 0, saldoAnterior = 0, saldoAtual = 0, periodo } = dados;
  const saldoMes = receitas - despesas;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Fluxo de Caixa - ${periodo}</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; line-height: 1.5; font-size: 13px; }
        
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; }
        .logo-container { max-width: 240px; max-height: 80px; display: flex; align-items: center; }
        .logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        
        .header-titulos { text-align: right; }
        .header h1 { margin: 0; color: #1e3a8a; font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .header p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; }
        
        .resumo-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 25px; }
        .card { border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background-color: #f8fafc; }
        .card p { margin: 0 0 4px 0; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
        .card h3 { margin: 0; font-size: 16px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        th { background-color: #1e3a8a; color: white; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        
        .tag { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
        .tag-receita { background-color: #d1fae5; color: #065f46; }
        .tag-despesa { background-color: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          ${urlLogo 
            ? `<img src="${urlLogo}" alt="Logo Empresa" />` 
            : `<div style="font-weight: bold; font-size: 20px; color: #64748b;">SUA LOGO</div>`
          }
        </div>
        <div class="header-titulos">
          <h1>FLUXO DE CAIXA</h1>
          <p><strong>Referência:</strong> Mês ${periodo} | Emitido em: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div class="resumo-cards">
        <div class="card"><p>Saldo Anterior</p><h3 style="color: ${saldoAnterior >= 0 ? '#3b82f6' : '#ef4444'};">${fmt(saldoAnterior)}</h3></div>
        <div class="card"><p>Receitas do Mês</p><h3 style="color: #10b981;">${fmt(receitas)}</h3></div>
        <div class="card"><p>Despesas do Mês</p><h3 style="color: #ef4444;">${fmt(despesas)}</h3></div>
        <div class="card"><p>Resultado do Mês</p><h3 style="color: ${saldoMes >= 0 ? '#3b82f6' : '#ef4444'};">${fmt(saldoMes)}</h3></div>
        <div class="card" style="background-color: #f0fdf4; border: 1px solid #bbf7d0;"><p>Saldo Atual Geral</p><h3 style="color: #15803d; font-weight: bold;">${fmt(saldoAtual)}</h3></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Cliente / Fornecedor</th>
            <th>Conta Contábil</th>
            <th>Forma Pgto</th>
            <th>Tipo</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${transacoes.map((t: any) => `
            <tr>
              <td style="white-space: nowrap;">${t.data}</td>
              <td>${t.descricao}</td>
              <td>${t.cliente_fornecedor || 'Não informado'}</td>
              <td style="color: #475569; font-size: 12px;">${t.conta_contabil}</td>
              <td style="color: #475569; font-size: 12px;">${t.forma_pagamento}</td>
              <td>
                <span class="tag ${t.tipo === 'receita' ? 'tag-receita' : 'tag-despesa'}">
                  ${t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td style="text-align: right; font-weight: bold; color: ${t.tipo === 'receita' ? '#10b981' : '#ef4444'};">
                ${fmt(t.valor)}
              </td>
            </tr>
          `).join('') || '<tr><td colspan="7" style="text-align:center; padding: 20px;">Nenhum lançamento localizado neste mês.</td></tr>'}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          setTimeout(() => { window.print(); }, 300);
        };
      </script>
    </body>
    </html>
  `;
}
