// src/components/FluxoCaixa/useFluxoCaixa.ts
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Transacao {
  id: number | string; data: string; descricao: string; tipo: 'receita' | 'despesa'; valor: number;
  conta_contabil: string; forma_pagamento: string; cliente_fornecedor: string;
}

export function useFluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idEditando, setIdEditando] = useState<number | string | null>(null);
  
  const estadoInicialForm = {
    descricao: '', valor: '', tipo: 'receita' as 'receita' | 'despesa',
    conta_contabil: 'Venda de Produtos', forma_pagamento: 'Pix', cliente_fornecedor: '', data: new Date().toISOString().split('T')[0]
  };
  const [form, setForm] = useState(estadoInicialForm);

  const carregarTransacoes = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase.from('transacoes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setTransacoes(data as Transacao[]);
    } catch {
      alert('Erro ao carregar dados do Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarTransacoes(); }, [carregarTransacoes]);

  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);

  const prepararEdicao = (t: Transacao) => {
    setIdEditando(t.id);
    setForm({
      descricao: t.descricao,
      valor: t.valor.toString(),
      tipo: t.tipo,
      conta_contabil: t.conta_contabil,
      forma_pagamento: t.forma_pagamento,
      cliente_fornecedor: t.cliente_fornecedor === 'Não informado' ? '' : t.cliente_fornecedor,
      data: t.data.split('/').reverse().join('-') // Converte DD/MM/YYYY de volta para YYYY-MM-DD
    });
    setMostrarForm(true);
  };

  const cancelarAcao = () => {
    setForm(estadoInicialForm);
    setIdEditando(null);
    setMostrarForm(false);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || parseFloat(form.valor) <= 0) return alert('Campos inválidos.');

    const payload = {
      data: form.data.split('-').reverse().join('/'),
      descricao: form.descricao, tipo: form.tipo, valor: parseFloat(form.valor),
      conta_contabil: form.conta_contabil, forma_pagamento: form.forma_pagamento,
      cliente_fornecedor: form.cliente_fornecedor || 'Não informado'
    };

    try {
      if (idEditando) {
        // Modo Edição: Atualiza no banco
        const { error } = await supabase.from('transacoes').update(payload).eq('id', idEditando);
        if (error) throw error;
      } else {
        // Modo Criação: Insere no banco
        const { error } = await supabase.from('transacoes').insert([payload]);
        if (error) throw error;
      }

      cancelarAcao();
      carregarTransacoes();
    } catch {
      alert('Erro ao salvar no Supabase.');
    }
  };

  const excluir = async (id: number | string) => {
    if (!window.confirm('Excluir este lançamento?')) return;
    try {
      const { error } = await supabase.from('transacoes').delete().eq('id', id);
      if (error) throw error;
      setTransacoes(prev => prev.filter(x => x.id !== id));
    } catch {
      alert('Erro ao excluir.');
    }
  };

  return { transacoes, carregando, mostrarForm, setMostrarForm, form, setForm, receitas, despesas, salvar, excluir, idEditando, prepararEdicao, cancelarAcao };
}
