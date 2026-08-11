import React from 'react';

// Container principal da página de fluxo de caixa
export const fluxoCaixaContainer: React.CSSProperties = {
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

// Container do topo que alinha o título e o botão de lançar lado a lado
export const headerContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
};

// Botão principal "Novo Lançamento / Fechar"
export const botaoLancar: React.CSSProperties = {
  color: '#0f172a',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background-color 0.2s',
};

// Container do formulário em Grid (alinha os campos lado a lado de forma responsiva)
export const formContainer: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  alignItems: 'end', // Alinha o botão "Confirmar" na base junto com os inputs
};

// Organização vertical do Label + Input
export const grupoInput: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

// Texto dos Labels
export const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
};

// Estilização comum para Inputs, Selects e campos de Data
export const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  color: '#334155',
  outline: 'none',
  fontFamily: 'sans-serif',
};

// Botão "Confirmar" interno do formulário
export const botaoSalvar: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#fff',
  border: 'none',
  padding: '11px',
  borderRadius: '6px',
  fontWeight: '600',
  cursor: 'pointer',
  height: '40px', // Força a mesma altura dos inputs do lado
};

// Grid dos cards de saldo (Receitas, Despesas e Saldo)
export const cardsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '16px',
};

// Base dos cards brancos
export const cardBaseStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
};

// Container externo que envelopa a tabela
export const tabelaContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

// Cabeçalho cinza escrito "Extrato Recente"
export const tabelaHeaderStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderBottom: '1px solid #e2e8f0',
  fontWeight: '600',
  color: '#334155',
};

// Elemento table padrão
export const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

// Células do cabeçalho da tabela (th)
export const thStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '14px',
  color: '#475569',
  fontWeight: '600',
};

// Células do corpo da tabela (td)
export const tdStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontSize: '14px',
  color: '#64748b',
};

// Adicione ao final do src/components/FluxoCaixa/FluxoCaixa.styles.ts
export const botaoDeletar: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
};
