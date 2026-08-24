// src/components/FluxoCaixa/useFluxoCaixa.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Transacao {
  id: string;
  descricao: string;
  cliente_fornecedor: string;
  valor: number;
  data: string;
  conta_contabil: string;
  forma_pagamento: string;
  tipo: 'receita' | 'despesa';
  status: 'realizado' | 'pendente'; // ✅ Define se é caixa real ou previsão futura
}

export function useFluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [mostrarForm, setMostrarForm] = useState<boolean>(false);
  const [idEditando, setIdEditando] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    descricao: '',
    cliente_fornecedor: '',
    valor: '',
    data: new Date().toISOString().substring(0, 10),
    conta_contabil: 'Venda de Produtos',
    forma_pagamento: 'Pix',
    tipo: 'receita'
  });

  // Busca e unifica dados do Caixa Real + Títulos Pendentes/Atrasados
  const carregarTransacoes = async () => {
    try {
      setCarregando(true);
      
      // Chamada paralela eficiente no Supabase
      const [resCaixa, resTitulos] = await Promise.all([
        supabase.from('fluxo_caixa').select('*'),
        // ✅ Buscamos apenas os títulos que ainda NÃO afetaram o caixa real
        supabase.from('titulos_receber').select('*, clientes(nome)').in('status', ['Pendente', 'Atrasado'])
      ]);

      if (resCaixa.error) throw resCaixa.error;
      if (resTitulos.error) throw resTitulos.error;

      // 1. Mapeia lançamentos REAIS do caixa (Dinheiro em conta)
      const reais: Transacao[] = (resCaixa.data || []).map(t => {
        // Padroniza os tipos textuais mistos ('Entrada'/'Saída' da baixa vs 'receita'/'despesa' do form manual)
        const tipoNormalizado = (t.tipo?.toLowerCase() === 'entrada' || t.tipo?.toLowerCase() === 'receita') 
          ? 'receita' 
          : 'despesa';

        return {
          ...t,
          tipo: tipoNormalizado,
          status: 'realizado'
        };
      });

      // 2. Mapeia lançamentos PREVISTOS (Contas a Pagar/Receber não liquidadas)
      const previstos: Transacao[] = (resTitulos.data || []).map(t => ({
        id: `prev-${t.id}`, // ✅ Prefixo crucial para evitar colisões de ID nas chaves do React
        descricao: `[Previsão] NFe ${t.nfe_id} - Parcela ${t.parcela}`,
        cliente_fornecedor: t.clientes?.nome || 'Não Informado',
        valor: Number(t.valor_parcela || 0),
        data: t.data_vencimento, // A data do fluxo futuro é a data de vencimento da conta
        conta_contabil: t.tipo === 'Pagar' ? 'Custos / Despesas' : 'Receita de Vendas',
        forma_pagamento: 'Aguardando Baixa',
        tipo: t.tipo === 'Pagar' ? 'despesa' : 'receita', // Converte para o padrão de leitura da sua tela
        status: 'pendente'
      }));

      // 3. Junta as duas fontes de dados em uma única linha do tempo financeira
      const tudoUnificado = [...reais, ...previstos].sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );

      setTransacoes(tudoUnificado);
    } catch (err) {
      console.error('Erro ao buscar e cruzar fluxo de caixa unificado:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.data) {
      alert('Por favor, preencha os campos obrigatórios (Descrição, Valor e Data).');
      return;
    }

    try {
      const dataFormatada = form.data.includes('/') 
        ? form.data.split('/').reverse().join('-') 
        : form.data;
        
      const payload = {
        descricao: form.descricao,
        cliente_fornecedor: form.cliente_fornecedor || null,
        valor: Number(form.valor),
        data: dataFormatada,
        conta_contabil: form.conta_contabil || null,
        forma_pagamento: form.forma_pagamento || null,
        tipo: form.tipo.toLowerCase().trim()
      };

      if (idEditando) {
        if (idEditando.startsWith('prev-')) {
          alert('Ações de escrita em títulos previstos devem ser feitas na tela de Contas a Pagar/Receber.');
          return;
        }

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

  const excluir = async (id: string) => {
    if (id.startsWith('prev-')) {
      alert('Este registro provém do Contas a Pagar/Receber. Gerencie a exclusão na tela de origem.');
      return;
    }

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

  const prepararEdicao = (t: Transacao) => {
    if (t.id.startsWith('prev-')) {
      alert('Títulos previstos não podem ser editados por aqui. Utilize a tela de Contas a Pagar/Receber.');
      return;
    }

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
