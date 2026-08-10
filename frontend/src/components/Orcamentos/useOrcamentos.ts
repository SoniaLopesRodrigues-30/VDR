import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface ItemOrcamento {
  id?: number;
  descricao: string;
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

export function useOrcamentos() {
  // --- ESTADOS DO CONTROLADOR DO MODAL, CARREGAMENTO E BUSCA ---
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(true);

  // --- ESTADOS DOS CAMPOS DO FORMULÁRIO DE ORÇAMENTO ---
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [validade, setValidade] = useState<string>('');
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Cancelado'>('Pendente');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');

  // --- ESTADOS DE CRIAÇÃO DINÂMICA DE UM NOVO ITEM ---
  const [descricaoItem, setDescricaoItem] = useState<string>('');
  const [qtdItem, setQtdItem] = useState<number>(1);
  const [valorItem, setValorItem] = useState<number>(0);

  // --- ESTADOS DE LISTAGENS E ARMAZENAMENTO ---
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<{ id: number; nome: string }[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // --- 1. CARREGAR DADOS DO POSTGRESQL (SUPABASE) ---
  const carregarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);

      // Busca Orçamentos fazendo JOIN com a tabela de clientes incluindo as novas colunas
      const { data: dataOrcamentos, error: errOrc } = await supabase
        .from('orcamentos')
        .select(`
          id, valor_total, status, validade, condicao_pagamento, previsao_entrega, observacao,
          clientes ( id, nome )
        `);

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
        
        // Ordena do mais recente para o mais antigo pelo ID
        formatados.sort((a, b) => b.id - a.id);
        setOrcamentos(formatados);
      }

      // Busca a lista de Clientes para preencher o Select do Modal
      const { data: dataClientes, error: errCli } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (errCli) throw errCli;
      if (dataClientes) setClientesDisponiveis(dataClientes);

    } catch (error: any) {
      console.error('Erro ao sincronizar com o Supabase:', error.message || error);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Executa a busca assim que a tela abre
  useEffect(() => {
    carregarDadosDoBanco();
  }, [carregarDadosDoBanco]);

  // --- CÁLCULO DINÂMICO DO TOTAL GERAL ---
  const valorTotalGeral = useMemo(() => {
    if (!Array.isArray(itens)) return 0;
    return itens.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [itens]);

  // --- FILTRAGEM DINÂMICA DA TABELA PRINCIPAL ---
  const orcamentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return orcamentos;
    return orcamentos.filter(o => 
      o.numero.toLowerCase().includes(termo) || 
      o.clienteNome.toLowerCase().includes(termo)
    );
  }, [busca, orcamentos]);

  // --- FUNÇÕES DE MANIPULAÇÃO LÓGICA DE ITENS ---
  const handleAdicionarItem = () => {
    if (!descricaoItem.trim()) return;
    const quantidade = Number(qtdItem) || 1;
    const valorUnitario = Number(valorItem) || 0;

    const novoItem: ItemOrcamento = {
      descricao: descricaoItem.trim(),
      quantidade,
      valorUnitario,
      total: quantidade * valorUnitario
    };

    setItens(prevItens => [...prevItens, novoItem]);
    setDescricaoItem('');
    setQtdItem(1);
    setValorItem(0);
  };

  // --- LIMPAR CAMPOS E FECHAR MODAL ---
  const fecharModal = () => {
    setClienteId('');
    setValidade('');
    setDescricaoItem('');
    setQtdItem(1);
    setValorItem(0);
    setItens([]);
    setStatus('Pendente');
    setCondicaoPagamento('');
    setPrevisaoEntrega('');
    setObservacao('');
    setModalAberto(false);
  };

  // --- 2. SALVAR DEFINITIVAMENTE NO POSTGRESQL (SUPABASE) ---
  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clienteId === '') { alert('Por favor, selecione um cliente.'); return; }
    if (!validade) { alert('Por favor, selecione uma data de validade.'); return; }
    if (itens.length === 0) { alert('Adicione pelo menos um item para salvar o orçamento.'); return; }

    try {
      const statusBanco = status === 'Pendente' ? 'Em Análise' : status;

      // Passo A: Insere o registro na tabela pai 'orcamentos' com os novos campos
      const { data: novoOrcamento, error: errorOrcamento } = await supabase
        .from('orcamentos')
        .insert([{
          cliente_id: Number(clienteId),
          validade: validade,
          status: statusBanco,
          valor_total: valorTotalGeral,
          condicao_pagamento: condicaoPagamento,
          previsao_entrega: previsaoEntrega,
          observacao: observacao
        }])
        .select()
        .single();

      if (errorOrcamento) throw errorOrcamento;

      // Passo B: Insere os itens vinculando-os na tabela filha 'itens_orcamento'
      if (novoOrcamento) {
        const itensFormatadosParaOBanco = itens.map(item => ({
          orcamento_id: novoOrcamento.id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario
        }));

        const { error: errorItens } = await supabase
          .from('itens_orcamento')
          .insert(itensFormatadosParaOBanco);

        if (errorItens) throw errorItens;
      }

      fecharModal();
      await carregarDadosDoBanco(); // Recarrega a tabela principal com os novos dados
      alert('Orçamento gravado no banco de dados com sucesso!');

    } catch (error: any) {
      console.error('Erro ao persistir orçamento:', error);
      alert(`Erro ao salvar no banco: ${error.message || 'Verifique a estrutura das tabelas.'}`);
    }
  };

  return {
    modalAberto,
    setModalAberto,
    busca,
    setBusca,
    orcamentosFiltrados,
    clienteId,
    setClienteId,
    clientesDisponiveis,
    validade,
    setValidade,
    status,
    setStatus,
    condicaoPagamento,
    setCondicaoPagamento,
    previsaoEntrega,
    setPrevisaoEntrega,
    observacao,
    setObservacao,
    descricaoItem,
    setDescricaoItem,
    qtdItem,
    setQtdItem,
    valorItem,
    setValorItem,
    itens,
    setItens,
    valorTotalGeral,
    onAdicionarItem: handleAdicionarItem, // Mapeamento correto para evitar erros no Modal
    fecharModal,
    handleSalvarOrcamento,
    carregando
  };
}
