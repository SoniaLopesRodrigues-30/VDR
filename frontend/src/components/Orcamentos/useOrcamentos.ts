import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';

// Mantém as mesmas interfaces auto-suficientes que você definiu
interface ItemOrcamento {
  id?: number; // Opcional, pois o banco gerará o ID sequencial automaticamente
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

interface Orcamento {
  id: number;
  numero: string;
  clienteNome: string;
  clienteId: number;
  validade: string;
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
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

  // --- ESTADOS DE CRIAÇÃO DINÂMICA DE UM NOVO ITEM ---
  const [descricaoItem, setDescricaoItem] = useState<string>('');
  const [qtdItem, setQtdItem] = useState<number>(1);
  const [valorItem, setValorItem] = useState<number>(0);

  // --- ESTADOS QUE AGORA SÃO ALIMENTADOS PELO SUPABASE ---
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<{ id: number; nome: string }[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

  // --- 1. CARREGAR DADOS DO POSTGRESQL (SUPABASE) ---
  const carregarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);

      // A. Busca Orçamentos fazendo JOIN com a tabela de clientes
      const { data: dataOrcamentos, error: errOrc } = await supabase
        .from('orcamentos')
        .select(`
          id, valor_total, status, validade,
          clientes ( id, nome )
        `)
        .order('criado_em', { ascending: false });

      if (errOrc) throw errOrc;

      if (dataOrcamentos) {
        setOrcamentos(
          dataOrcamentos.map((o: any) => ({
            id: o.id,
            numero: `ORC-${String(o.id).padStart(3, '0')}`, // Usa o ID real do banco formatado
            clienteId: o.clientes?.id || 0,
            clienteNome: o.clientes?.nome || 'Cliente Desconhecido',
            validade: o.validade,
            valorTotal: Number(o.valor_total),
            // Mapeia o status do banco para bater com sua tipagem restrita ('Em Análise' vira 'Pendente')
            status: o.status === 'Em Análise' ? 'Pendente' : o.status
          }))
        );
      }

      // B. Busca a lista de Clientes reais para preencher o Select do Modal
      const { data: dataClientes, error: errCli } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');

      if (errCli) throw errCli;
      if (dataClientes) setClientesDisponiveis(dataClientes);

    } catch (error) {
      console.error('Erro ao sincronizar com o Supabase:', error);
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


  // --- FUNÇÕES DE MANIPULAÇÃO LÓGICA ---

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

  const fecharModal = () => {
    setClienteId('');
    setValidade('');
    setDescricaoItem('');
    setQtdItem(1);
    setValorItem(0);
    setItens([]);
    setStatus('Pendente');
    setModalAberto(false);
  };

  // --- 2. SALVAR DEFINITIVAMENTE NO POSTGRESQL (SUPABASE) ---
  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clienteId === '') {
      alert('Por favor, selecione um cliente.');
      return;
    }

    if (!validade) {
      alert('Por favor, selecione uma data de validade.');
      return;
    }

    if (itens.length === 0) {
      alert('Adicione pelo menos um item para salvar o orçamento.');
      return;
    }

    try {
      // Converte o status local para o texto esperado pelo banco
      const statusBanco = status === 'Pendente' ? 'Em Análise' : status;

      // Passo A: Insere o registro na tabela pai 'orcamentos'
      const { data: novoOrcamento, error: errorOrcamento } = await supabase
        .from('orcamentos')
        .insert([{
          cliente_id: Number(clienteId),
          validade: validade,
          status: statusBanco,
          valor_total: valorTotalGeral
        }])
        .select()
        .single();

      if (errorOrcamento) throw errorOrcamento;

      // Passo B: Insere os itens na tabela filha 'itens_orcamento' vinculando ao ID criado
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
      await carregarDadosDoBanco(); // Atualiza a tela de listagem puxando o dado novo
      alert('Orçamento gravado no banco de dados com sucesso!');

    } catch (error) {
      console.error('Erro ao persistir orçamento:', error);
      alert('Não foi possível salvar o orçamento no banco de dados.');
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
    descricaoItem,
    setDescricaoItem,
    qtdItem,
    setQtdItem,
    valorItem,
    setValorItem,
    itens,
    setItens,
    valorTotalGeral,
    status,
    setStatus,
    handleAdicionarItem,
    fecharModal,
    handleSalvarOrcamento,
    carregando // Exposto caso queira usar um loading spinner na tabela
  };
}
