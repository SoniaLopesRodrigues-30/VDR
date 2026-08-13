export function gerarHtmlOrcamento(orc: any, urlLogo: string): string {
  const itens = orc.orcamento_itens || [];

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Orçamento #${orc.id}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; line-height: 1.5; font-size: 14px; }
        
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 30px; }                
        
       .logo-container { 
        max-width: 240px;  
        max-height: 100px; 
        display: flex; 
        align-items: center; 
        }
        .logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
        
        .header-titulos { text-align: right; }
        .header h1 { margin: 0; color: #0284c7; font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .info-empresa { margin-top: 5px; }
        .info-empresa h3 { margin: 0; font-size: 14px; color: #1e293b; }
        .info-empresa p { margin: 2px 0; color: #64748b; font-size: 11px; }
        
        .dados-documento { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
        .dados-documento p { margin: 4px 0; }
        .dados-documento strong { color: #1e293b; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #0284c7; color: white; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        th:nth-child(2), td:nth-child(2) { text-align: center; width: 60px; }
        th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { text-align: right; width: 110px; }
        td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background-color: #f8fafc; }
        
        .total-container { display: flex; justify-content: flex-end; margin-top: 20px; }
        .total-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px 25px; border-radius: 6px; text-align: right; }
        .total-box span { font-size: 14px; color: #166534; display: block; }
        .total-box strong { font-size: 22px; color: #15803d; }
        
        .assinaturas { margin-top: 70px; display: flex; justify-content: space-between; page-break-inside: avoid; }
        .linha-assinatura { width: 42%; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; font-size: 12px; color: #64748b; }
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
          <h1>ORÇAMENTO</h1>
          <p style="margin: 2px 0 8px 0; color: #64748b; font-size: 13px;">Nº Código: <strong>${orc.id}</strong></p>
          <div class="info-empresa">
            <h3>Nome da Sua Oficina / Empresa</h3>
            <p>Telefone: (54) 99999-9999</p>
            <p>E-mail: comercial@suaoficina.com</p>
            <p>CNPJ: 00.000.000/0001-00</p> <!-- Opcional: Adicionar CNPJ -->
            </div>
        </div>
      </div>

      <div class="dados-documento">
        <div>
          <p><strong>Cliente:</strong> ${orc.clientes?.nome || 'Não informado'}</p>
          <p><strong>ID do Cliente:</strong> #${orc.cliente_id}</p>
        </div>
        <div>
          <p><strong>Data de Validade:</strong> ${orc.validade ? new Date(orc.validade).toLocaleDateString('pt-BR') : 'Não informada'}</p>
          <p><strong>Status Atual:</strong> ${orc.status}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produto / Mão de Obra</th>
            <th>Qtd</th>
            <th>Vl. Unitário</th>
            <th>Vl. Total</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map((item: any) => {
            const qtd = Number(item.quantidade || 0);
            const valor = Number(item.valor_unitario || 0);
            return `
              <tr>
                <td>${item.produto_id || 'Não especificado'}</td>
                <td>${qtd}</td>
                <td>R$ ${valor.toFixed(2)}</td>
                <td>R$ ${(qtd * valor).toFixed(2)}</td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhum item lançado.</td></tr>'}
        </tbody>
      </table>

      <div class="total-container">
        <div class="total-box">
          <span>VALOR TOTAL GERAL</span>
          <strong>R$ ${Number(orc.valor_total || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div class="assinaturas">
        <div class="linha-assinatura">Assinatura do Cliente</div>
        <div class="linha-assinatura">Responsável da Empresa</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;
}
