// src/components/FluxoCaixa/useFluxoCaixa.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

interface Transacao {
  id: string;
  descricao: string;
  cliente_fornecedor: string;
  valor: number;
  data: string;
  conta_contabil: string;
  forma_pagamento: string;
  tipo: 'receita' | 'despesa';
}

export function useFluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [mostrarForm, setMostrarForm] = useState<boolean>(false);
  const [idEditando, setIdEditando] = useState<string | null>(null);

  // Estado do formulário inicializado com valores padrão seguros
  const [form, setForm] = useState<any>({
    descricao: '',
    cliente_fornecedor: '',
    valor: '',
    data: new Date().toISOString().substring(0, 10),
    conta_contabil: 'Venda de Produtos',
    forma_pagamento: 'Pix',
    tipo: 'receita'
  });

  // Carrega todos os registros do banco de dados do Supabase
  const carregarTransacoes = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('fluxo_caixa')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      if (data) setTransacoes(data);
    } catch (err) {
      console.error('Erro ao buscar fluxo de caixa:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  // Totais brutos calculados do banco (usados como fallback no sistema)
  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  // Insere ou atualiza o lançamento financeiro
  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.data) {
      alert('Por favor, preencha os campos obrigatórios (Descrição, Valor e Data).');
      return;
    }

    try {
       const dataFormatada = form.data.includes('/') 
        ? form.data.split('/').reverse().join('-') // Converte DD/MM/AAAA para AAAA-MM-DD
        : form.data;
      const payload = {
        descricao: form.descricao,
        cliente_fornecedor: form.cliente_fornecedor || null, // Evita strings vazias
        valor: Number(form.valor),
        data: dataFormatada,
        conta_contabil: form.conta_contabil || null,
        forma_pagamento: form.forma_pagamento || null,
        // Força o texto para minúsculas e remove acentos/espaços bobos
        tipo: form.tipo.toLowerCase().trim()
      };

      if (idEditando) {
        const { error } = await supabase
          .from('fluxo_caixa')
          .update(payload)
          .eq('id', idEditando);
        if (error) throw error;
        alert('Lançamento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('fluxo_caixa')
          .insert([payload]);
        if (error) throw error;
        alert('Lançamento registrado com sucesso!');
      }

      cancelarAcao();
      await carregarTransacoes();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar o lançamento no banco de dados.');
    }
  };

  // Remove um registro permanente do Supabase
  const excluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir em definitivo este lançamento do caixa?')) return;
    try {
      const { error } = await supabase
        .from('fluxo_caixa')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      alert('Lançamento removido!');
      await carregarTransacoes();
    } catch (err) {
      alert('Erro ao tentar excluir registro.');
    }
  };

  // Prepara os estados locais para o modo de edição de dados
  const prepararEdicao = (t: Transacao) => {
    setIdEditando(t.id);
    setForm({
      descricao: t.descricao,
      cliente_fornecedor: t.cliente_fornecedor || '',
      valor: String(t.valor),
      data: t.data,
      conta_contabil: t.conta_contabil,
      forma_pagamento: t.forma_pagamento,
      tipo: t.tipo
    });
    setMostrarForm(true);
  };

  // Limpa o formulário e fecha a gaveta de inserção
  const cancelarAcao = () => {
    setIdEditando(null);
    setForm({
      descricao: '',
      cliente_fornecedor: '',
      valor: '',
      data: new Date().toISOString().substring(0, 10),
      conta_contabil: 'Venda de Produtos',
      forma_pagamento: 'Pix',
      tipo: 'receita'
    });
    setMostrarForm(false);
  };

  return {
    transacoes,
    carregando,
    mostrarForm,
    setMostrarForm,
    form,
    setForm,
    receitas,
    despesas,
    salvar,
    excluir,
    idEditando,
    prepararEdicao,
    cancelarAcao
  };
}
