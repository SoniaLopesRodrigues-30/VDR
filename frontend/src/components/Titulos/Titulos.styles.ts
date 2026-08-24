// src/components/Titulos/Titulos.styles.ts
import React from 'react';

export const containerStyle: React.CSSProperties = {
  padding: '24px',
  color: '#334155',
  fontFamily: 'sans-serif',
  backgroundColor: '#ffffff'
};

export const tituloStyle: React.CSSProperties = {
  fontSize: '24px',
  marginBottom: '20px',
  color: '#0284c7',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 'bold'
};

export const formStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '1px solid #e2e8f0'
};

export const gridFormStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '20px'
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569'
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '4px',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  outline: 'none'
};

export const selectContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%'
};

export const dropdownSugestoesStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  marginTop: '4px',
  maxHeight: '150px',
  overflowY: 'auto',
  zIndex: 100,
  padding: 0,
  margin: 0,
  listStyle: 'none',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

export const itemSugestaoStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '14px',
  color: '#1f2937',
  cursor: 'pointer',
  borderBottom: '1px solid #f3f4f6'
};

export const itemSugestaoHoverStyle: React.CSSProperties = {
  backgroundColor: '#f1f5f9'
};

export const botaoSalvarStyle: React.CSSProperties = {
  backgroundColor: '#0284c7',
  color: '#ffffff',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export const buscaContainerStyle: React.CSSProperties = {
  position: 'relative',
  marginBottom: '16px'
};

export const tabelaContainerStyle: React.CSSProperties = {
  overflowX: 'auto',
  marginBottom: '20px'
};

export const tabelaStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#ffffff'
};

export const thStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '2px solid #cbd5e1',
  textAlign: 'left',
  color: '#475569',
  backgroundColor: '#f8fafc'
};

export const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #e2e8f0',
  color: '#334155'
};

export const badgeStyle = (status: string): React.CSSProperties => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: status === 'Pago' ? '#dcfce7' : '#fef3c7',
  color: status === 'Pago' ? '#15803d' : '#b45309'
});

export const botaoAcaoStyle: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '12px'
};
