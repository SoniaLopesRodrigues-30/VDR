import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export function TabelaCaixa({
  carregando,
  transacoesFiltradas,
  prepararEdicao,
  excluir,
  fmt,
  pad // objeto de estilo passado por prop
}) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={pad}>Data</th>
            <th style={pad}>Descrição</th>
            <th style={pad}>Cliente/Fornecedor</th>
            <th style={pad}>Conta Contábil</th>
            <th style={pad}>Forma Pgto</th>
            <th style={pad}>Tipo</th>
            <th style={pad}>Valor</th>
            <th style={{ ...pad, textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</td></tr>
          ) : transacoesFiltradas.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum lançamento encontrado para este mês.</td></tr>
          ) : (
            transacoesFiltradas.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={pad}>{t.data}</td>
                <td style={pad}>{t.descricao}</td>
                <td style={pad}>{t.cliente_fornecedor}</td>
                <td style={{ ...pad, color: '#475569', fontSize: '13px' }}>{t.conta_contabil}</td>
                <td style={{ ...pad, color: '#475569', fontSize: '13px' }}>{t.forma_pagamento}</td>
                <td style={pad}>
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b' }}>
                    {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td style={{ ...pad, color: t.tipo === 'receita' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{fmt(t.valor)}</td>
                <td style={{ ...pad, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => prepararEdicao(t)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => excluir(t.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
