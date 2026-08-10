// useOrdemServico.ts
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient'; 

export interface ItemTabela {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  // Novos campos adicionados:
  tipoUnidade: string; // Ex: UN, KG, PC
  ncm: string;         // Código Fiscal
  dataItem: string;    // Data específica de inserção do item
}

export type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
export type TipoOS = 'mao_de_obra' | 'produtos' | 'ambos';

export interface OrdemServico {
  id: number;
  numero: string;
  clienteId: number;
  clienteNome: string;
  dataAbertura: string;
  previsaoEntrega: string;
  condicaoPagamento: string;
  tipoOs: TipoOS;
  equipamento: string;
  servicos: any[]; // Mantido o padrão anterior para serviços
  pecas: ItemTabela[]; // Lista de produtos com a nova estrutura detalhada
  valorTotal: number;
  status: StatusOS;
}

export interface ClienteDisponivel {
  id: number;
  nome: string;
}

export function useOrdemServico() {
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Estados dos Campos Fixos da OS
  const [numeroOS, setNumeroOS] = useState<string>('');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [dataAbertura, setDataAbertura] = useState<string>('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState<string>('');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>('');
  const [tipoOs, setTipoOs] = useState<TipoOS>('ambos');
  const [equipamento, setEquipamento] = useState<string>('');
  const [status, setStatus] = useState<StatusOS>('Aberta');

  // Estados dos Inputs de Inserção Temporal (Serviços)
  const [descServico, setDescServico] = useState<string>('');
  const [qtdServico, setQtdServico] = useState<number>(1);
  const [valorServico, setValorServico] = useState<number>(0);
  const [servicos, setServicos] = useState<any[]>([]);

  // NOVOS Estados dos Inputs de Inserção Temporal (Produtos/Peças detalhados)
  const [descPeca, setDescPeca] = useState<string>('');
  const [qtdPeca, setQtdPeca] = useState<number>(1);
  const [valorPeca, setValorPeca] = useState<number>(0);
  const [tipoUnidade, setTipoUnidade] = useState<string>('UN');
  const [ncmPeca, setNcmPeca] = useState<string>('');
  const [dataItemPeca, setDataItemPeca] = useState<string>('');
  const [pecas, setPecas] = useState<ItemTabela[]>([]);

  const [clientesDisponiveis, setClientesDisponiveis] = useState<ClienteDisponivel[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);

  async function carregarClientes() {
    try {
      const { data, error } = await supabase.from('clientes').select('id, nome').order('nome', { ascending: true });
      if (error) throw error;
      if (data) setClientesDisponiveis(data as ClienteDisponivel[]);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  }

  async function carregarOrdens() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('ordens_servico').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (data) {
        const dadosFormatados: OrdemServico[] = data.map(item => ({
          id: item.id,
          numero: item.numero,
          clienteId: item.cliente_id,
          clienteNome: item.cliente_name,
          dataAbertura: item.data_abertura,
          previsaoEntrega: item.previsao_entrega || '',
          condicaoPagamento: item.condicao_pagamento || '',
          tipoOs: (item.tipo_os || 'ambos') as TipoOS,
          equipamento: item.equipamento,
          servicos: Array.isArray(item.servicos) ? item.servicos : [],
          pecas: Array.isArray(item.pecas) ? item.pecas : [],
          valorTotal: Number(item.valor_total || 0),
          status: item.status as StatusOS
        }));
        setOrdensServico(dadosFormatados);
      }
    } catch (error) {
      console.error('Erro ao carregar OS:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarOrdens();
    carregarClientes();
  }, []);

  const valorTotalServicos = useMemo(() => {
    if (tipoOs === 'produtos') return 0;
    return servicos.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [servicos, tipoOs]);

  const valorTotalPecas = useMemo(() => {
    if (tipoOs === 'mao_de_obra') return 0;
    return pecas.reduce((acc, item) => acc + (item.total || 0), 0);
  }, [pecas, tipoOs]);

  const valorTotalOS = useMemo(() => valorTotalServicos + valorTotalPecas, [valorTotalServicos, valorTotalPecas]);

  const ordensFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ordensServico;
    return ordensServico.filter(os => 
      os.numero?.toLowerCase().includes(termo) || 
      os.clienteNome?.toLowerCase().includes(termo) ||
      os.equipamento?.toLowerCase().includes(termo)
    );
  }, [busca, ordensServico]);

  const handleAdicionarServico = () => {
    if (!descServico.trim()) return;
    setServicos(prev => [...prev, {
      id: Date.now() + Math.random(),
      descricao: descServico.trim(),
      quantidade: Number(qtdServico) || 1,
      valorUnitario: Number(valorServico) || 0,
      total: (Number(qtdServico) || 1) * (Number(valorServico) || 0)
    }]);
    setDescServico(''); setQtdServico(1); setValorServico(0);
  };

  // INSERÇÃO MODIFICADA: Adiciona as novas propriedades fiscais do produto
  const handleAdicionarPeca = () => {
    if (!descPeca.trim()) return;
    const novaPeca: ItemTabela = {
      id: Date.now() + Math.random(),
      descricao: descPeca.trim(),
      quantidade: Number(qtdPeca) || 1,
      valorUnitario: Number(valorPeca) || 0,
      total: (Number(qtdPeca) || 1) * (Number(valorPeca) || 0),
      tipoUnidade: tipoUnidade || 'UN',
      ncm: ncmPeca.trim() || '00000000',
      dataItem: dataItemPeca || new Date().toISOString().split('T')[0]
    };
    
    setPecas(prev => [...prev, novaPeca]);
    setDescPeca(''); 
    setQtdPeca(1); 
    setValorPeca(0);
    setTipoUnidade('UN');
    setNcmPeca('');
    setDataItemPeca(new Date().toISOString().split('T')[0]);
  };

  const abrirNovoModal = () => {
    setNumeroOS(`OS-${new Date().getFullYear()}-${String(ordensServico.length + 1).padStart(3, '0')}`);
    const hoje = new Date().toISOString().split('T')[0];
    setDataAbertura(hoje);
    setDataItemPeca(hoje);
    setPrevisaoEntrega('');
    setCondicaoPagamento('');
    setTipoOs('ambos');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setClienteId(''); setEquipamento('');
    setServicos([]); setPecas([]); setStatus('Aberta'); setModalAberto(false);
  };

  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clienteId === '') return alert('Por favor, selecione o cliente.');

    const clienteObj = clientesDisponiveis.find(c => c.id === clienteId);

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .insert([{
          numero: numeroOS,
          cliente_id: clienteId,
          cliente_name: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
          data_abertura: dataAbertura,
          previsao_entrega: previsaoEntrega || null,
          condicao_pagamento: condicaoPagamento,
          tipo_os: tipoOs,
          equipamento: equipamento,
          servicos: tipoOs !== 'produtos' ? servicos : [],
          pecas: tipoOs !== 'mao_de_obra' ? pecas : [], // Envia a lista estruturada com os novos campos em formato JSONB
          valor_total: valorTotalOS,
          status: status
        }]);

      if (error) throw error;
      fecharModal();
      alert('Ordem de Serviço gravada com sucesso!');
      carregarOrdens(); 
    } catch (error) {
      console.error('Erro ao salvar OS:', error);
      alert('Houve um erro técnico ao salvar na nuvem.');
    }
  };

  return {
    modalAberto, setModalAberto, busca, setBusca, ordensFiltradas, numeroOS, clienteId, setClienteId,
    clientesDisponiveis, dataAbertura, setDataAbertura, previsaoEntrega, setPrevisaoEntrega,
    condicaoPagamento, setCondicaoPagamento, tipoOs, setTipoOs, equipamento, setEquipamento, 
    status, setStatus, descServico, setDescServico, qtdServico, setQtdServico, valorServico, 
    setValorServico, servicos, setServicos, descPeca, setDescPeca, qtdPeca, setQtdPeca, valorPeca, 
    setValorPeca, pecas, setPecas, valorTotalOS, handleAdicionarServico, handleAdicionarPeca, 
    abrirNovoModal, fecharModal, handleSalvarOS, loading,
    // Exportando os novos estados dos inputs de produtos para a view
    tipoUnidade, setTipoUnidade, ncmPeca, setNcmPeca, dataItemPeca, setDataItemPeca
  };
}
