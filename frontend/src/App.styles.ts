import React from 'react';

// Estilos do Layout Principal e Sidebar
export const layoutStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: 'sans-serif',
  backgroundColor: '#f8fafc',
};

export const sidebarStyle: React.CSSProperties = {
  width: '260px',
  backgroundColor: '#0f172a',
  color: '#fff',
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

export const logoStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  marginBottom: '32px',
  color: '#38bdf8',
  paddingLeft: '8px',
};

export const menuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#cbd5e1',
  textDecoration: 'none',
  padding: '12px',
  borderRadius: '6px',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

export const footerStyle: React.CSSProperties = {
  marginTop: 'auto',
  fontSize: '12px',
  color: '#64748b',
  textAlign: 'center',
  borderTop: '1px solid #334155',
  paddingTop: '12px',
};

export const mainContentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
};

// Estilos específicos do Fluxo de Caixa
export const fluxoCaixaContainer: React.CSSProperties = {
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

export const cardsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

export const cardBaseStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
};

export const tabelaContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

export const tabelaHeaderStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderBottom: '1px solid #e2e8f0',
  fontWeight: '600',
  color: '#334155',
};

export const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

export const thStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '14px',
  color: '#475569',
  fontWeight: '600',
};

export const tdStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontSize: '14px',
  color: '#64748b',
};
