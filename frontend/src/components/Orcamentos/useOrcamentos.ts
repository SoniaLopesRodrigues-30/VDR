import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface ItemOrcamento {
  id?: number;
  descricao: string;
  un: string;       
  ncm: string;      
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface Orcamento {
  id: number;
  numero: string;
  clienteNome: string;
  clienteId: number;
  validade: string;
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  condicaoPagamento: string;
  previsaoEntrega: string;
  observacao: string;
}

interface FormOrcamento {
  clienteId: number | '';
  validade: string;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  condicaoPagamento: string;
  previsaoEntrega: string;
  observacao: string;
  descricaoItem: string;
  unItem: string;
  ncmItem: string;
  qtdItem: number;
  valorItem: number;
}

const estadoInicialForm: FormOrcamento = {
  clienteId: '', validade: '', status: 'Pendente', condicaoPagamento: '', previsaoEntrega: '', observacao: '',
  descricaoItem: '', unItem: 'UN', ncmItem: '', qtdItem: 1, valorItem: 0
};

export function useOrcamentos() {
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<{ id: number; nome: string }[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // Estado único para o formulário
  const [form, setForm] = useState<FormOrcamento>(estadoInicialForm);

  const handleChangeForm = (campo: keyof FormOrcamento, valor: any) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const carregarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);
      const { data: dataOrcamentos, error: errOrc } = await supabase
        .from('orcamentos')
        .select('id, valor_total, status, validade, condicao_pagamento, previsao_entrega, observacao, clientes ( id, nome )');

      if (errOrc) throw errOrc;

      if (dataOrcamentos) {
        const formatados = dataOrcamentos.map((o: any) => ({
          id: o.id,
          numero: `ORC-${String(o.id).padStart(3, '0')}`,
          clienteId: o.clientes?.id || 0,
          clienteNome: o.clientes?.nome || 'Cliente Desconhecido',
          validade: o.validade || '',
          valorTotal: Number(o.valor_total || 0),
          status: o.status === 'Em Análise' ? 'Pendente' : (o.status || 'Pendente'),
          condicaoPagamento: o.condicao_pagamento || '',
          previsaoEntrega: o.previsao_entrega || '',
          observacao: o.observacao || ''
        }));
        setOrcamentos(formatados.sort((a, b) => b.id - a.id));
      }

      const { data: dataClientes, error: errCli } = await supabase.from('clientes').select('id, nome').order('nome');
      if (dataClientes) setClientesDisponiveis(dataClientes);
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarDadosDoBanco(); }, [carregarDadosDoBanco]);

  const valorTotalGeral = useMemo(() => itens.reduce((acc, item) => acc + (item.total || 0), 0), [itens]);

  const orcamentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return termo ? orcamentos.filter(o => o.numero.toLowerCase().includes(termo) || o.clienteNome.toLowerCase().includes(termo)) : orcamentos;
  }, [busca, orcamentos]);

  const handleAdicionarItem = () => {
    if (!form.descricaoItem.trim()) return;
    const novoItem: ItemOrcamento = {
      descricao: form.descricaoItem.trim(),
      un: form.unItem.trim() || 'UN',
      ncm: form.ncmItem.trim(),
      quantidade: Number(form.qtdItem) || 1,
      valorUnitario: Number(form.valorItem) || 0,
      total: (Number(form.qtdItem) || 1) * (Number(form.valorItem) || 0)
    };
    setItens(prev => [...prev, novoItem]);
    setForm(prev => ({ ...prev, descricaoItem: '', unItem: 'UN', ncmItem: '', qtdItem: 1, valorItem: 0 }));
  };

  const iniciarEdicao = useCallback(async (orcamento: Orcamento) => {
    setIdEditando(orcamento.id);
    setForm({
      clienteId: orcamento.clienteId, validade: orcamento.validade, status: orcamento.status,
      condicaoPagamento: orcamento.condicaoPagamento, previsaoEntrega: orcamento.previsaoEntrega, observacao: orcamento.observacao,
      descricaoItem: '', unItem: 'UN', ncmItem: '', qtdItem: 1, valorItem: 0
    });

    try {
      const { data: dadosItens, error: errItens } = await supabase.from('itens_orcamento').select('*').eq('orcamento_id', orcamento.id);
      if (errItens) throw errItens;
      if (dadosItens) {
        setItens(dadosItens.map((item: any) => ({
          id: item.id, descricao: item.descricao, un: item.un || 'UN', ncm: item.ncm || '',
          quantidade: Number(item.quantidade), valorUnitario: Number(item.valor_unitario),
          total: Number(item.quantidade) * Number(item.valor_unitario)
        })));
      }
      setModalAberto(true);
    } catch (error: any) {
      console.error(error.message);
    }
  }, []);

  const fecharModal = () => {
    setForm(estadoInicialForm);
    setItens([]);
    setIdEditando(null);
    setModalAberto(false);
  };

  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.clienteId === '' || !form.validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione itens.');
      return;
    }

    try {
      const payloadPai = {
        cliente_id: Number(form.clienteId), validade: form.validade,
        status: form.status === 'Pendente' ? 'Em Análise' : form.status,
        valor_total: valorTotalGeral, condicao_pagamento: form.condicaoPagamento,
        previsao_entrega: form.previsaoEntrega, observacao: form.observacao
      };

      let orcamentoId = idEditando;

      if (idEditando) {
        await supabase.from('orcamentos').update(payloadPai).eq('id', idEditando);
        await supabase.from('itens_orcamento').delete().eq('orcamento_id', idEditando);
      } else {
        const { data: novo, error: err } = await supabase.from('orcamentos').insert([payloadPai]).select().single();
        if (err) throw err;
        if (novo) orcamentoId = novo.id;
      }

      if (orcamentoId) {
        const filhos = itens.map(item => ({
          orcamento_id: orcamentoId, descricao: item.descricao, un: item.un,
          ncm: item.ncm, quantidade: item.quantidade, valor_unitario: item.valorUnitario
        }));
        await supabase.from('itens_orcamento').insert(filhos);
      }

      fecharModal();
      await carregarDadosDoBanco();
      alert('Salvo com sucesso!');
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  const handleDeletarOrcamento = useCallback(async (id: number) => {
    if (!confirm('Excluir orçamento definitivamente?')) return;
    try {
      await supabase.from('itens_orcamento').delete().eq('orcamento_id', id);
      await supabase.from('orcamentos').delete().eq('id', id);
      setOrcamentos(prev => prev.filter(o => o.id !== id));
    } catch (error: any) {
      console.error(error.message);
    }
  }, []);

  return {
    modalAberto, setModalAberto, busca, setBusca, orcamentosFiltrados,
    clientesDisponiveis, itens, setItens, valorTotalGeral, form, handleChangeForm,
    onAdicionarItem: handleAdicionarItem, fecharModal, handleSalvarOrcamento, carregando,
    idEditando, iniciarEdicao, handleDeletarOrcamento 
  };
}
