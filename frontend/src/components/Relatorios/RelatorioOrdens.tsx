import React from 'react';

interface OrdemServico {
  id: number | string;
  cliente: string;
  descricao?: string;
  equipamento?: string;
  status: string;
}

interface Props {
  dados: OrdemServico[];
}

export default function RelatorioOrdens({ dados }: Props) {
  const total = dados.length;
  const concluidas = dados.filter(os => os.status?.toLowerCase() === 'concluída' || os.status?.toLowerCase() === 'finalizada').length;

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={card}><p style={lbl}>Total de OS</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{total}</h2></div>
        <div style={card}><p style={lbl}>Ordens Concluídas</p><h2 style={{ margin: 0, color: '#10b981' }}>{concluidas}</h2></div>
      </div>

      {/* TABELA */}
      <h3 style={tTtl}>Painel Analítico de OS</h3>
      <div style={tblBox}>
        <table style={tbl}>
          <thead>
            <tr style={thB}>
              <th style={pd}>Nº OS</th>
              <th style={pd}>Cliente</th>
              <th style={pd}>Equipamento/Serviço</th>
              <th style={pd}>Status</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(os => (
              <tr key={os.id} style={trB}>
                <td style={pd}>#{os.id}</td>
                <td style={pd}>{os.cliente}</td>
                <td style={pd}>{os.descricao || os.equipamento}</td>
                <td style={pd}>{os.status}</td>
              </tr>
            ))}
            {dados.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma ordem de serviço encontrada.</td></tr>
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
