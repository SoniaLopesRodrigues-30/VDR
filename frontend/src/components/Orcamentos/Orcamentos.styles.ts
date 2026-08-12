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
  gridTemplateColumns: '1fr 1fr',
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
  border: '1px solid #cbd5e1'
};

export const gridDigitacaoStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  padding: '16px',
  borderRadius: '6px',
  backgroundColor: '#f1f5f9',
  marginBottom: '20px'
};

export const gridCamposItemStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.5fr',
  gap: '10px'
};

export const inputItemStyle: React.CSSProperties = {
  padding: '10px',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: '4px'
};

export const botaoAdicionarStyle: React.CSSProperties = {
  backgroundColor: '#0284c7',
  color: '#ffffff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
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

export const rodapeFormStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '20px'
};

export const totalVerdeStyle: React.CSSProperties = {
  color: '#16a34a',
  margin: 0,
  fontWeight: 'bold'
};

export const botaoSalvarStyle: React.CSSProperties = {
  backgroundColor: '#16a34a', // Verde padrão de sucesso para o orçamento
  color: '#ffffff',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export const botaoCancelarStyle: React.CSSProperties = {
  marginLeft: '10px',
  backgroundColor: '#ef4444',
  color: '#fff',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export const buscaContainerStyle: React.CSSProperties = {
  position: 'relative',
  marginBottom: '16px'
};

export const inputBuscaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 12px 12px 40px',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: '4px'
};

export const iconeBuscaStyle: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '14px',
  color: '#94a3b8'
};

export const listagemContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

export const cardOrcamentoStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  padding: '16px',
  borderRadius: '6px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid #e2e8f0'
};

export const cardTextoStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  marginTop: '4px'
};

export const botaoAcoesCardStyle: React.CSSProperties = {
  background: '#e2e8f0',
  border: 'none',
  padding: '8px',
  color: '#0284c7',
  cursor: 'pointer',
  borderRadius: '4px'
};

export const botaoAprovarCardStyle: React.CSSProperties = {
  background: '#15803d',
  border: 'none',
  padding: '8px 12px',
  color: '#fff',
  cursor: 'pointer',
  borderRadius: '4px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};
