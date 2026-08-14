export function gerarHtmlOrcamento(orcamento: any, urlLogo: string, empresa: any = {}): string {
  const itens = orcamento.orcamentos_itens || orcamento.itens || [];
  
  let dataValidade = 'Não informada';
  if (orcamento.validade) {
    const dataObj = new Date(orcamento.validade);
    if (!isNaN(dataObj.getTime())) {
      if (orcamento.validade.length === 10) {
        dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
      }
      dataValidade = dataObj.toLocaleDateString('pt-BR');
    }
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const dadosEmpresa = {
    nome_fantasia: "Vdr Indústria Metalúrgica Ltda",
    cnpj: "08.634.167/0001-16",
    endereco: "Rua Dr.José Caetano Melo Filho",
    numero: "860",
    bairro: "Nsrª de Fátima",
    cidade: "Caxias do Sul",
    uf: "RS",
    telefone: "(54) 98422-1137",
    email: "vdrind@yahoo.com.br",
    ...empresa
  };

  const cliente = orcamento.clientes || {};

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Orçamento #${orcamento.id}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 0; padding: 0; line-height: 1.5; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 25px; }
    .coluna-esquerda { display: flex; flex-direction: column; gap: 12px; max-width: 48%; }
    .logo-container { max-width: 240px; max-height: 80px; display: flex; align-items: center; }
    .logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .info-empresa h3, .info-cliente h3 { margin: 0 0 4px 0; font-size: 14px; color: #1e293b; }
    .info-empresa p, .info-cliente p { margin: 2px 0; color: #64748b; font-size: 11px; line-height: 1.3; }
    .coluna-direita { text-align: right; max-width: 48%; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .titulo-orcamento h1 { margin: 0 0 2px 0; color: #16a34a; font-size: 24px; font-weight: bold; text-transform: uppercase; }
    .titulo-orcamento p { margin: 0; color: #64748b; font-size: 14px; }
    .dados-documento { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background-color: #f8fafc; padding: 12px 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
    .dados-documento p { margin: 2px 0; }
    .dados-documento strong { color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background-color: #16a34a; color: white; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    th:nth-child(2), td:nth-child(2) { text-align: center; width: 60px; }
    th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { text-align: right; width: 120px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    .total-container { display: flex; justify-content: flex-end; margin-top: 20px; page-break-inside: avoid; }
    .total-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 25px; border-radius: 6px; text-align: right; }
    .total-box span { font-size: 13px; color: #166534; display: block; }
    .total-box strong { font-size: 22px; color: #15803d; }
    .assinaturas { margin-top: 60px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .linha-assinatura { width: 42%; border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; font-size: 11px; color: #64748b; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="coluna-esquerda">
      <div class="logo-container">
        ${urlLogo ? `<img src="${urlLogo}" alt="Logo Empresa" />` : `<div style="font-weight: bold; font-size: 20px; color: #64748b;">SUA LOGO</div>`}
      </div>
      <div class="info-empresa">
        <h3>${dadosEmpresa.nome_fantasia}</h3>
        ${dadosEmpresa.cnpj ? `<p>CNPJ: ${dadosEmpresa.cnpj}</p>` : ''}
        ${dadosEmpresa.endereco ? `<p>${dadosEmpresa.endereco}${dadosEmpresa.numero ? `, ${dadosEmpresa.numero}` : ''}${dadosEmpresa.bairro ? ` - ${dadosEmpresa.bairro}` : ''}</p>` : ''}
        ${dadosEmpresa.cidade ? `<p>${dadosEmpresa.cidade} / ${dadosEmpresa.uf || ''}</p>` : ''}
        ${dadosEmpresa.telefone ? `<p>Telefone: ${dadosEmpresa.telefone}</p>` : ''}
        ${dadosEmpresa.email ? `<p>E-mail: ${dadosEmpresa.email}</p>` : ''}
      </div>
    </div>
    
    <div class="coluna-direita">
      <div class="titulo-orcamento">
        <h1>ORÇAMENTO</h1>
        <p>Nº ORÇAM.: <strong>${orcamento.id || 'N/A'}</strong></p>
      </div>
      <div class="info-cliente">
        <h3>Cliente</h3>
        <p><strong>Nome:</strong> ${cliente.nome || 'Não informado'}</p>
        ${orcamento.cliente_id ? `<p><strong>ID do Cliente:</strong> #${orcamento.cliente_id}</p>` : ''}
        ${cliente.cpf_cnpj ? `<p><strong>CPF/CNPJ:</strong> ${cliente.cpf_cnpj}</p>` : ''}
        ${cliente.telefone ? `<p><strong>Telefone:</strong> ${cliente.telefone}</p>` : ''}
        ${cliente.email ? `<p><strong>E-mail:</strong> ${cliente.email}</p>` : ''}
      </div>
    </div>
  </div>

  <div class="dados-documento">
    <div>
      <p><strong>Status Atual:</strong> ${orcamento.status || 'Pendente'}</p>
    </div>
    <div style="text-align: right;">
      <p><strong>Validade do Orçamento:</strong> ${dataValidade}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descrição do Serviço / Produto</th>
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
            <td>${item.descricao || item.produto_id || 'Não especificado'}</td>
            <td>${qtd}</td>
            <td>${formatarMoeda(valor)}</td>
            <td>${formatarMoeda(qtd * valor)}</td>
          </tr>
        `;
      }).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhum item lançado neste orçamento.</td></tr>'}
    </tbody>
  </table>

  <div class="total-container">
    <div class="total-box">
      <span>VALOR TOTAL DO ORÇAMENTO</span>
      <strong>${formatarMoeda(Number(orcamento.valor_total || 0))}</strong>
    </div>
  </div>

  <div class="assinaturas">
    <div class="linha-assinatura">Validade/Aceite do Cliente</div>
    <div class="linha-assinatura">Responsável Vdr Metalúrgica</div>
  </div>

  <script>
    window.onload = function() { setTimeout(() => { window.print(); }, 300); };
  </script>
</body>
</html>
  `;
}
