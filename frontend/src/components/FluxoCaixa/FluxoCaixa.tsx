// src/components/FluxoCaixa/FluxoCaixa.tsx
import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, X, Trash2, Pencil } from 'lucide-react';
import { useFluxoCaixa } from './useFluxoCaixa';

const CATEGORIAS = ['Venda de Produtos', 'Prestação de Serviços', 'Salários e Encargos', 'Aluguel e Infraestrutura', 'Fornecedores', 'Marketing e Vendas', 'Software e Ferramentas', 'Impostos e Taxas', 'Outros'];
const FORMAS = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Transferência'];

export default function FluxoCaixa() {
  const { transacoes, carregando, mostrarForm, setMostrarForm, form, setForm, receitas, despesas, salvar, excluir, idEditando, prepararEdicao, cancelarAcao } = useFluxoCaixa();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Fluxo de Caixa</h2>
        <button onClick={() => mostrarForm ? cancelarAcao() : setMostrarForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: mostrarForm ? '#64748b' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {mostrarForm ? <X size={16} /> : <Plus size={16} />} {mostrarForm ? 'Fechar' : 'Novo Lançamento'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardEstilo}><p style={labelCard}>Receitas</p><h3 style={{ color: '#10b981', margin: 0 }}>{fmt(receitas)}</h3><ArrowUpCircle color="#10b981" /></div>
        <div style={cardEstilo}><p style={labelCard}>Despesas</p><h3 style={{ color: '#ef4444', margin: 0 }}>{fmt(despesas)}</h3><ArrowDownCircle color="#ef4444" /></div>
        <div style={cardEstilo}><p style={labelCard}>Saldo</p><h3 style={{ color: receitas - despesas >= 0 ? '#3b82f6' : '#ef4444', margin: 0 }}>{fmt(receitas - despesas)}</h3><Wallet color={receitas - despesas >= 0 ? '#3b82f6' : '#ef4444'} /></div>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>
            {idEditando ? '✏️ Editando Lançamento' : '✨ Novo Lançamento'}
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} style={{ ...inp, flex: 2 }} />
            <input type="text" placeholder="Cliente / Fornecedor" value={form.cliente_fornecedor} onChange={e => setForm({ ...form, cliente_fornecedor: e.target.value })} style={{ ...inp, flex: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} style={inp} />
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={inp} />
            <select value={form.conta_contabil} onChange={e => setForm({ ...form, conta_contabil: e.target.value })} style={inp}>{CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <select value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })} style={inp}>{FORMAS.map(f => <option key={f} value={f}>{f}</option>)}</select>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as 'receita' | 'despesa' })} style={inp}><option value="receita">Receita</option><option value="despesa">Despesa</option></select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              {idEditando ? 'Atualizar Dados' : 'Salvar Lançamento'}
            </button>
            {idEditando && (
              <button type="button" onClick={cancelarAcao} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={pad}>Data</th><th style={pad}>Descrição</th><th style={pad}>Cliente/Fornecedor</th><th style={pad}>Conta Contábil</th><th style={pad}>Forma Pgto</th><th style={pad}>Tipo</th><th style={pad}>Valor</th><th style={{ ...pad, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</td></tr>
            ) : transacoes.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum lançamento encontrado.</td></tr>
            ) : (
              transacoes.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={pad}>{t.data}</td><td style={pad}>{t.descricao}</td><td style={pad}>{t.cliente_fornecedor}</td><td style={{ ...pad, color: '#475569', fontSize: '13px' }}>{t.conta_contabil}</td><td style={{ ...pad, color: '#475569', fontSize: '13px' }}>{t.forma_pagamento}</td>
                  <td style={pad}><span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b' }}>{t.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
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
    </div>
  );
}

const cardEstilo: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const labelCard: React.CSSProperties = { fontSize: '14px', color: '#64748b', margin: '0 0 5px 0' };
const inp: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' };
const pad: React.CSSProperties = { padding: '12px 16px' };
