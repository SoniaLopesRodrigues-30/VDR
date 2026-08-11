import React from 'react';

interface Produto {
  id: number | string;
  nome: string;
  descricao?: string;
  estoque: number;
  preco: number;
}

interface Props {
  dados: Produto[];
  fmt: (v: number) => string;
}

export default function RelatorioProdutos({ dados, fmt }: Props) {
  const totalItens = dados.length;
  const valorEstoque = dados.reduce((acc, p) => acc + ((p.preco || 0) * (p.estoque || 0)), 0);

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={card}><p style={lbl}>Itens Cadastrados</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{totalItens}</h2></div>
        <div style={card}><p style={lbl}>Valor Total em Estoque</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmt(valorEstoque)}</h2></div>
      </div>

      {/* TABELA */}
      <h3 style={tTtl}>Inventário de Produtos</h3>
      <div style={tblBox}>
        <table style={tbl}>
          <thead>
            <tr style={thB}>
              <th style={pd}>Nome</th>
              <th style={pd}>Estoque</th>
              <th style={pd}>Preço Un.</th>
              <th style={pd}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(p => (
              <tr key={p.id} style={trB}>
                <td style={pd}>{p.nome || p.descricao}</td>
                <td style={pd}>{p.estoque || 0}</td>
                <td style={pd}>{fmt(p.preco || 0)}</td>
                <td style={{ ...pd, fontWeight: 'bold' }}>{fmt((p.preco || 0) * (p.estoque || 0))}</td>
              </tr>
            ))}
            {dados.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto em estoque.</td></tr>
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
