import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, X, Trash2 } from 'lucide-react';
// Importação do seu cliente Supabase existente
import { supabase } from '../../services/supabaseClient';

interface Transacao {
  id: number | string;
  data: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
}

export default function FluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    tipo: 'receita' as 'receita' | 'despesa',
    data: new Date().toISOString().split('T')[0]
  });

  // 1. BUSCAR LANÇAMENTOS DO SUPABASE (Sincronizado com useCallback igual ao seu padrão)
  const carregarTransacoes = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('created_at', { ascending: false }); // Traz os mais recentes primeiro

      if (error) throw error;
      if (data) setTransacoes(data as Transacao[]);
    } catch (erro) {
      console.error(erro);
      alert('Erro ao carregar dados do Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarTransacoes();
  }, [carregarTransacoes]);

  // Cálculos matemáticos dos Cards
  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldo = receitas - despesas;
  const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 2. INSERIR LANÇAMENTO NO SUPABASE
  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || parseFloat(form.valor) <= 0) {
      return alert('Preencha os campos corretamente.');
    }

    try {
      const { error } = await supabase
        .from('transacoes')
        .insert([
          {
            // Se sua coluna do Supabase for do tipo DATE puro, envie apenas 'form.data' (YYYY-MM-DD)
            // Se for texto formatado, mantemos a inversão abaixo:
            data: form.data.split('-').reverse().join('/'), 
            descricao: form.descricao,
            tipo: form.tipo,
            valor: parseFloat(form.valor)
          }
        ]);

      if (error) throw error;

      // Limpa formulário e atualiza a listagem
      setForm({ descricao: '', valor: '', tipo: 'receita', data: new Date().toISOString().split('T')[0] });
      setMostrarForm(false);
      carregarTransacoes();
    } catch (erro) {
      console.error(erro);
      alert('Erro ao salvar no banco de dados do Supabase.');
    }
  };

  // 3. EXCLUIR REGISTRO DO SUPABASE
  const excluir = async (id: number | string) => {
    if (!window.confirm('Deseja excluir permanentemente este lançamento?')) return;

    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Filtra o estado localmente para sumir da tela instantaneamente
      setTransacoes(prev => prev.filter(x => x.id !== id));
    } catch (erro) {
      console.error(erro);
      alert('Erro ao excluir o registro.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Fluxo de Caixa</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {mostrarForm ? <X size={16} /> : <Plus size={16} />} {mostrarForm ? 'Fechar' : 'Novo Lançamento'}
        </button>
      </div>

      {/* CARDS INDICADORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardEstilo}><p style={labelCard}>Receitas</p><h3 style={{ color: '#10b981', margin: 0 }}>{fmtMoeda(receitas)}</h3><ArrowUpCircle color="#10b981" /></div>
        <div style={cardEstilo}><p style={labelCard}>Despesas</p><h3 style={{ color: '#ef4444', margin: 0 }}>{fmtMoeda(despesas)}</h3><ArrowDownCircle color="#ef4444" /></div>
        <div style={cardEstilo}><p style={labelCard}>Saldo</p><h3 style={{ color: saldo >= 0 ? '#3b82f6' : '#ef4444', margin: 0 }}>{fmtMoeda(saldo)}</h3><Wallet color={saldo >= 0 ? '#3b82f6' : '#ef4444'} /></div>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      {mostrarForm && (
        <form onSubmit={salvar} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <input type="text" placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} style={inputEstilo} />
          <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
            <input type="number" step="0.01" placeholder="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} style={inputEstilo} />
            <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={inputEstilo} />
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as 'receita' | 'despesa' })} style={inputEstilo}>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Salvar no Supabase</button>
        </form>
      )}

      {/* TABELA DE DADOS */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={thTdEstilo}>Data</th><th style={thTdEstilo}>Descrição</th><th style={thTdEstilo}>Tipo</th><th style={thTdEstilo}>Valor</th><th style={{ ...thTdEstilo, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Carregando do banco de dados...</td></tr>
            ) : transacoes.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum lançamento encontrado.</td></tr>
            ) : (
              transacoes.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={thTdEstilo}>{t.data}</td>
                  <td style={thTdEstilo}>{t.descricao}</td>
                  <td style={thTdEstilo}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '12px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b' }}>
                      {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td style={{ ...thTdEstilo, color: t.tipo === 'receita' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{fmtMoeda(t.valor)}</td>
                  <td style={{ ...thTdEstilo, textAlign: 'center' }}>
                    <button onClick={() => excluir(t.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
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
const inputEstilo: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' };
const thTdEstilo: React.CSSProperties = { padding: '12px 16px' };
