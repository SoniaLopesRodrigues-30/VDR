// ComponenteImpressao.jsx
import React from 'react';

export const ComponenteImpressao = React.forwardRef(({ orcamento }, ref) => {
  if (!orcamento) return null;

  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>ORÇAMENTO</h1>
          <p style={{ margin: '5px 0 0 0' }}>Número: #{orcamento.id}</p>
          <p style={{ margin: '3px 0 0 0' }}>Validade: {orcamento.validade ? new Date(orcamento.validade).toLocaleDateString('pt-BR') : 'Não informada'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0 }}>{orcamento.clientes?.nome || 'Cliente não identificado'}</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Status: <strong>{orcamento.status}</strong></p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Produto / Mão de Obra</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', width: '80px' }}>Qtd</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', width: '120px' }}>Val. Unitário</th>
            <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right', width: '120px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orcamento.orcamento_itens?.map((item, index) => {
            const qtd = Number(item.quantidade || 0);
            const valor = Number(item.valor_unitario || 0);
            return (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.produto_id || 'Não especificado'}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>{qtd}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>R$ {valor.toFixed(2)}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>R$ {(qtd * valor).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
        Valor Total: R$ {Number(orcamento.valor_total || 0).toFixed(2)}
      </div>

      <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', paddingTop: '40px' }}>
        <div style={{ borderTop: '1px solid #999', width: '200px', textAlign: 'center', fontSize: '12px' }}>
          Assinatura do Cliente
        </div>
        <div style={{ borderTop: '1px solid #999', width: '200px', textAlign: 'center', fontSize: '12px' }}>
          Responsável da Empresa
        </div>
      </div>
    </div>
  );
});

ComponenteImpressao.displayName = 'ComponenteImpressao';
