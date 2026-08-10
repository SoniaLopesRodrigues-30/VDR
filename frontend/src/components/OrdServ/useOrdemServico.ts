// useOrdemServico.ts
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient'; 

export interface ItemTabela {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

export interface OrdemServico {
  id: number;
  numero: string;
  clienteId: number;
  clienteNome: string;
  dataAbertura: string;
  equipamento: string;
  defeito: string;
  laudoTecnico: string;
  servicos: ItemTabela[];
  pecas: ItemTabela[];
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
  const [equipamento, setEquipamento] = useState<string>('');
  const [defeito, setDefeito] = useState<string>('');
  const [laudoTecnico, setLaudoTecnico] = useState<string>('');
  const [status, setStatus] = useState<StatusOS>('Aberta');

  // Estados dos Inputs de Inserção Temporal (Serviços)
  const [descServico, setDescServico] = useState<string>('');
  const [qtdServico, setQtdServico] = useState<number>(1);
  const [valorServico, setValorServico] = useState<number>(0);
  const [servicos, setServicos] = useState<ItemTabela[]>([]);

  // Estados dos Inputs de Inserção Temporal (Peças)
  const [descPeca, setDescPeca] = useState<string>('');
  const [qtdPeca, setQtdPeca] = useState<number>(1);
  const [valorPeca, setValorPeca] = useState<number>(0);
  const [pecas, setPecas] = useState<ItemTabela[]>([]);

  // Dados Dinâmicos vindos do Supabase
  const [clientesDisponiveis, setClientesDisponiveis] = useState<ClienteDisponivel[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);

  // Carregar lista de clientes do banco
  async function carregarClientes() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome', { ascending: true });

      if (error) throw error;
      if (data) setClientesDisponiveis(data as ClienteDisponivel[]);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  }

  // Carregar Ordens de Serviço do banco
  async function carregarOrdens() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        const dadosFormatados: OrdemServico[] = data.map(item => ({
          id: item.id,
          numero: item.numero,
          clienteId: item.cliente_id,
          clienteNome: item.cliente_name,
          dataAbertura: item.data_abertura,
          equipamento: item.equipamento,
          defeito: item.defeito,
          laudoTecnico: item.laudo_tecnico,
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

  // Cálculos Combinados Dinâmicos
  const valorTotalServicos = useMemo(() => servicos.reduce((acc, item) => acc + (item.total || 0), 0), [servicos]);
  const valorTotalPecas = useMemo(() => pecas.reduce((acc, item) => acc + (item.total || 0), 0), [pecas]);
  const valorTotalOS = useMemo(() => valorTotalServicos + valorTotalPecas, [valorTotalServicos, valorTotalPecas]);

  // Filtro de Busca Reativo
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
    const novoServico: ItemTabela = {
      id: Date.now() + Math.random(),
      descricao: descServico.trim(),
      quantidade: Number(qtdServico) || 1,
      valorUnitario: Number(valorServico) || 0,
      total: (Number(qtdServico) || 1) * (Number(valorServico) || 0)
    };
    setServicos(prev => [...prev, novoServico]);
    setDescServico('');
    setQtdServico(1);
    setValorServico(0);
  };

  const handleAdicionarPeca = () => {
    if (!descPeca.trim()) return;
    const novaPeca: ItemTabela = {
      id: Date.now() + Math.random(),
      descricao: descPeca.trim(),
      quantidade: Number(qtdPeca) || 1,
      valorUnitario: Number(valorPeca) || 0,
      total: (Number(qtdPeca) || 1) * (Number(valorPeca) || 0)
    };
    setPecas(prev => [...prev, novaPeca]);
    setDescPeca('');
    setQtdPeca(1);
    setValorPeca(0);
  };

  const abrirNovoModal = () => {
    setNumeroOS(`OS-2026-${String(ordensServico.length + 1).padStart(3, '0')}`);
    setDataAbertura(new Date().toISOString().split('T')[0]);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setClienteId('');
    setEquipamento('');
    setDefeito('');
    setLaudoTecnico('');
    setServicos([]);
    setPecas([]);
    setStatus('Aberta');
    setModalAberto(false);
  };

  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clienteId === '') {
      alert('Por favor, selecione o cliente.');
      return;
    }

    const clienteObj = clientesDisponiveis.find(c => c.id === clienteId);

    try {
      const { error } = await supabase
        .from('ordens_servico')
        .insert([{
          numero: numeroOS,
          cliente_id: clienteId,
          cliente_name: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
          data_abertura: dataAbertura,
          equipamento: equipamento,
          defeito: defeito,
          laudo_tecnico: laudoTecnico,
          servicos: servicos, 
          pecas: pecas,       
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
    clientesDisponiveis, dataAbertura, setDataAbertura, equipamento, setEquipamento, defeito, setDefeito,
    laudoTecnico, setLaudoTecnico, status, setStatus, descServico, setDescServico, qtdServico, setQtdServico,
    valorServico, setValorServico, servicos, setServicos, descPeca, setDescPeca, qtdPeca, setQtdPeca,
    valorPeca, setValorPeca, pecas, setPecas, valorTotalOS, handleAdicionarServico, handleAdicionarPeca,
    abrirNovoModal, fecharModal, handleSalvarOS, loading
  };
}
