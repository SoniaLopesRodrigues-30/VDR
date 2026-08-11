// src/components/Produtos/useProdutos.ts
import { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Produto {
  id: number | string;
  nome: string;
  estoque: number;
  preco: number;
}

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idEditando, setIdEditando] = useState<number | string | null>(null);

  const estadoInicial = { nome: '', estoque: '', preco: '' };
  const [form, setForm] = useState(estadoInicial);

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      if (data) setProdutos(data as Produto[]);
    } catch {
      alert('Erro ao carregar produtos do Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarProdutos(); }, [carregarProdutos]);

  // CARREGA OS DADOS DO PRODUTO DE VOLTA NO FORMULÁRIO
  const prepararEdicao = (p: Produto) => {
    setIdEditando(p.id);
    setForm({
      nome: p.nome,
      estoque: p.estoque.toString(),
      preco: p.preco.toString()
    });
    setMostrarForm(true);
  };

  const cancelarAcao = () => {
    setForm(estadoInicial);
    setIdEditando(null);
    setMostrarForm(false);
  };

  // SALVA OU ATUALIZA O PRODUTO CONFORME O MODO
  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.estoque || !form.preco) return alert('Preencha todos os campos.');

    const payload = {
      nome: form.nome,
      estoque: parseFloat(form.estoque),
      preco: parseFloat(form.preco)
    };

    try {
      if (idEditando) {
        // MODO EDIÇÃO: Executa o update usando o ID do produto
        const { error } = await supabase.from('produtos').update(payload).eq('id', idEditando);
        if (error) throw error;
      } else {
        // MODO INSERÇÃO: Adiciona um novo registro
        const { error } = await supabase.from('produtos').insert([payload]);
        if (error) throw error;
      }
      cancelarAcao();
      carregarProdutos();
    } catch {
      alert('Erro ao salvar produto.');
    }
  };

  // EXCLUI O REGISTRO DO PRODUTO NO SUPABASE
  const excluir = async (id: number | string) => {
    if (!window.confirm('Deseja excluir este produto permanentemente?')) return;
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;
      setProdutos(prev => prev.filter(x => x.id !== id));
    } catch {
      alert('Erro ao excluir produto.');
    }
  };

  return { produtos, carregando, mostrarForm, setMostrarForm, form, setForm, salvar, excluir, idEditando, prepararEdicao, cancelarAcao };
}
