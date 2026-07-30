import { useState, useMemo } from 'react';

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

export function useOrdemServico() {
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');

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

  // Base Simulada para listagens globais
  const [clientesDisponiveis] = useState<{ id: number; nome: string }[]>([
    { id: 1, nome: 'Oficina Mecânica Express' },
    { id: 2, nome: 'Clínica Dr. Marcos' },
    { id: 3, nome: 'Condomínio Residencial Central' },
  ]);

  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([
    {
      id: 1,
      numero: 'OS-2026-001',
      clienteId: 1,
      clienteNome: 'Oficina Mecânica Express',
      dataAbertura: '2026-07-28',
      equipamento: 'Ar Condicionado Split 12000 BTUs',
      defeito: 'Não está resfriando e apresenta ruídos',
      laudoTecnico: 'Realizada a troca do compressor queimado e carga de gás R-410a.',
      servicos: [{ id: 11, descricao: 'Mão de obra instalação compressor', quantidade: 1, valorUnitario: 250, total: 250 }],
      pecas: [{ id: 22, descricao: 'Compressor Rotativo', quantidade: 1, valorUnitario: 480, total: 480 }],
      valorTotal: 730,
      status: 'Concluída'
    }
  ]);

  // Cálculos Combinados Dinâmicos (Evita travamentos de tela branca)
  const valorTotalServicos = useMemo(() => servicos.reduce((acc, item) => acc + (item.total || 0), 0), [servicos]);
  const valorTotalPecas = useMemo(() => pecas.reduce((acc, item) => acc + (item.total || 0), 0), [pecas]);
  const valorTotalOS = useMemo(() => valorTotalServicos + valorTotalPecas, [valorTotalServicos, valorTotalPecas]);

  const ordensFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ordensServico;
    return ordensServico.filter(os => 
      os.numero.toLowerCase().includes(termo) || 
      os.clienteNome.toLowerCase().includes(termo) ||
      os.equipamento.toLowerCase().includes(termo)
    );
  }, [busca, ordensServico]);

  // Inserção Dedicada de Serviços
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

  // Inserção Dedicada de Peças
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
    setNumeroOS(`OS-2026-00${ordensServico.length + 1}`);
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

  const handleSalvarOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (clienteId === '') {
      alert('Por favor, selecione o cliente.');
      return;
    }

    const clienteObj = clientesDisponiveis.find(c => c.id === clienteId);

    const novaOS: OrdemServico = {
      id: Date.now(),
      numero: numeroOS,
      clienteId,
      clienteNome: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
      dataAbertura,
      equipamento,
      defeito,
      laudoTecnico,
      servicos,
      pecas,
      valorTotal: valorTotalOS,
      status
    };

    setOrdensServico(prev => [novaOS, ...prev]);
    fecharModal();
    alert('Ordem de Serviço gravada com sucesso!');
  };

  return {
    modalAberto,
    setModalAberto,
    busca,
    setBusca,
    ordensFiltradas,
    numeroOS,
    clienteId,
    setClienteId,
    clientesDisponiveis,
    dataAbertura,
    setDataAbertura,
    equipamento,
    setEquipamento,
    defeito,
    setDefeito,
    laudoTecnico,
    setLaudoTecnico,
    status,
    setStatus,
    // Form de Serviços
    descServico, setDescServico, qtdServico, setQtdServico, valorServico, setValorServico, servicos, setServicos,
    // Form de Peças
    descPeca, setDescPeca, qtdPeca, setQtdPeca, valorPeca, setValorPeca, pecas, setPecas,
    valorTotalOS,
    handleAdicionarServico,
    handleAdicionarPeca,
    abrirNovoModal,
    fecharModal,
    handleSalvarOS
  };
}
