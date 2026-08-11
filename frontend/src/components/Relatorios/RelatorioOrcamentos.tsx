import React from 'react';

interface Orcamento {
  id: number | string;
  cliente: string;
  data?: string;
  created_at?: string;
  status: string;
  valor: number;
}

interface Props {
  dados: Orcamento[];
  fmt: (v: number) => string;
}

export default function RelatorioOrcamentos({ dados, fmt }: Props) {
  const total = dados.length;
  const aprovados = dados
    .filter(o => o.status?.toLowerCase() === 'aprovado' || o.status?.toLowerCase() === 'fechado')
    .reduce((acc, o) => acc + (o.valor || 0), 0);

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={card}><p style={lbl}>Qtd. de Orçamentos</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{total}</h2></div>
        <div style={card}><p style={lbl}>Volume de Vendas Convertidas</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmt(aprovados)}</h2></div>
      </div>

      {/* TABELA */}
      <h3 style={tTtl}>Histórico de Orçamentos</h3>
      <div style={tblBox}>
        <table style={tbl}>
          <thead>
            <tr style={thB}>
              <th style={pd}>Cliente</th>
              <th style={pd}>Data</th>
              <th style={pd}>Status</th>
              <th style={pd}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(o => (
              <tr key={o.id} style={trB}>
                <td style={pd}>{o.cliente || 'Não Informado'}</td>
                <td style={pd}>{o.data || o.created_at?.substring(0, 10)}</td>
                <td style={pd}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: '#e2e8f0', color: '#475569' }}>
                    {o.status || 'Pendente'}
                  </span>
                </td>
                <td style={{ ...pd, fontWeight: 'bold' }}>{fmt(o.valor || 0)}</td>
              </tr>
            ))}
            {dados.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum orçamento registrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const gridEstilo: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' };
const card: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const lbl: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 };
const tTtl: React.CSSProperties = { fontSize: '1.1rem', marginBottom: '15px' };
const tblBox: React.CSSProperties = { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };
const thB: React.CSSProperties = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const trB: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const pd: React.CSSProperties = { padding: '12px 16px' };
