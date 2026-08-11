// src/components/Produtos/Produtos.tsx
import React from 'react';
import { Package, Plus, X, Trash2, Pencil, Layers } from 'lucide-react';
import { useProdutos } from './useProdutos';

export default function Produtos() {
  const { produtos, carregando, mostrarForm, setMostrarForm, form, setForm, salvar, excluir, idEditando, prepararEdicao, cancelarAcao } = useProdutos();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalItens = produtos.length;
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={24} color="#3b82f6" />
          <h2 style={{ margin: 0 }}>Cadastro de Produtos</h2>
        </div>
        <button onClick={() => mostrarForm ? cancelarAcao() : setMostrarForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: mostrarForm ? '#64748b' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          {mostrarForm ? <X size={16} /> : <Plus size={16} />} {mostrarForm ? 'Fechar' : 'Novo Produto'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardEstilo}><p style={labelCard}>Total de Itens Cadastrados</p><h3 style={{ color: '#3b82f6', margin: 0 }}>{totalItens}</h3><Layers color="#3b82f6" /></div>
        <div style={cardEstilo}><p style={labelCard}>Capital Invertido em Estoque</p><h3 style={{ color: '#10b981', margin: 0 }}>{fmt(valorTotalEstoque)}</h3><Package color="#10b981" /></div>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#334155' }}>
            {idEditando ? '✏️ Editando Dados do Produto' : '✨ Cadastrar Novo Produto'}
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nome comercial do produto" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={{ ...inp, flex: 2 }} />
            <input type="number" placeholder="Qtd. Inicial Estoque" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} style={{ ...inp, flex: 1 }} />
            <input type="number" step="0.01" placeholder="Preço de Venda (R$)" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} style={{ ...inp, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              {idEditando ? 'Atualizar Produto' : 'Salvar no Banco'}
            </button>
            <button type="button" onClick={cancelarAcao} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={pad}>ID do Item</th>
              <th style={pad}>Nome Comercial</th>
              <th style={pad}>Qtd. em Estoque</th>
              <th style={pad}>Preço Unitário</th>
              <th style={pad}>Subtotal Estimado</th>
              <th style={{ ...pad, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Acessando inventário no Supabase...</td></tr>
            ) : produtos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum item em estoque no momento.</td></tr>
            ) : (
              produtos.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...pad, color: '#64748b', fontSize: '12px' }}>#{p.id}</td>
                  <td style={{ ...pad, fontWeight: '500' }}>{p.nome}</td>
                  <td style={{ ...pad, color: p.estoque <= 3 ? '#ef4444' : '#334155', fontWeight: p.estoque <= 3 ? 'bold' : 'normal' }}>
                    {p.estoque} {p.estoque <= 3 && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#ef4444', marginLeft: '5px' }}>(Baixo)</span>}
                  </td>
                  <td style={pad}>{fmt(p.preco)}</td>
                  <td style={{ ...pad, fontWeight: 'bold' }}>{fmt(p.preco * p.estoque)}</td>
                  
                  {/* BOTÕES DE AÇÃO CONFIGURADOS AQUI */}
                  <td style={{ ...pad, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => prepararEdicao(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }} title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => excluir(p.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Excluir">
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
const labelCard: React.CSSProperties = { fontSize: '13px', color: '#64748b', margin: '0 0 5px 0', fontWeight: 500 };
const inp: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none' };
const pad: React.CSSProperties = { padding: '12px 16px' };
