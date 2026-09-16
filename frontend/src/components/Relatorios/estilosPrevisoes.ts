// src/components/Relatorios/estilosPrevisoes.ts
import React from 'react';

export const estilos: Record<string, React.CSSProperties> = {
  gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600, color: '#64748b' },
  cardValor: { fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginTop: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' },
  painelFiltros: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 15px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  grupoFiltro: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' },
  select: { padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#334155', outline: 'none', fontWeight: '500' },
  containerTabela: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px' },
  th: { padding: '10px 8px', fontWeight: 600 },
  td: { padding: '10px 8px', color: '#334155' }
};
