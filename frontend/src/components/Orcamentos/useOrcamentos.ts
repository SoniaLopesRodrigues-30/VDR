import { useState } from 'react';

export interface ItemOrcamento {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

export interface Orcamento {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataCriacao: string;
  validade: string;
  itens: ItemOrcamento[];
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
}

export function useOrcamentos() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const [clienteId, setClienteId] = useState<number>(0);
  const [validade, setValidade] = useState('');
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Cancelado'>('Pendente');

  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [descricaoItem, setDescricaoItem] = useState('');
  const [qtdItem, setQtdItem] = useState<number>(1);
  const [valorItem, setValorItem] = useState<number>(0);

  const [clientesDisponiveis] = useState([
    { id: 1, nome: 'Ana Silva' },
    { id: 2, nome: 'Tech Soluções Ltda' }
  ]);

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([
    {
      id: 101,
      clienteId: 1,
      clienteNome: 'Ana Silva',
      dataCriacao: '28/07/2026',
      validade: '2026-08-15',
      itens: [{ id: 1, descricao: 'Consultoria Web React', quantidade: 1, valorUnitario: 1500, total: 1500 }],
      valorTotal: 1500,
      status: 'Pendente'
    }
  ]);

  const valorTotalGeral = itens.reduce((soma, item) => soma + (item.total || 0), 0);

  const handleAdicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricaoItem || qtdItem <= 0 || valorItem <= 0) return;
    setItens([...itens, { id: Date.now(), descricao: descricaoItem, quantidade: Number(qtdItem), valorUnitario: Number(valorItem), total: Number(qtdItem) * Number(valorItem) }]);
    setDescricaoItem(''); setQtdItem(1); setValorItem(0);
  };

  const fecharModal = () => {
    setClienteId(0); setValidade(''); setStatus('Pendente'); setItens([]);
    setDescricaoItem(''); setQtdItem(1); setValorItem(0); setModalAberto(false);
  };

  const handleSalvarOrcamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || itens.length === 0) return;
    const cli = clientesDisponiveis.find(c => c.id === Number(clienteId));
    setOrcamentos([{ id: Date.now(), clienteId: Number(clienteId), clienteNome: cli ? cli.nome : 'Desconhecido', dataCriacao: new Date().toLocaleDateString('pt-BR'), validade, itens, valorTotal: valorTotalGeral, status }, ...orcamentos]);
    fecharModal();
  };

  return {
    busca, setBusca, modalAberto, setModalAberto, clienteId, setClienteId, validade, setValidade, status, setStatus,
    itens, setItens, descricaoItem, setDescricaoItem, qtdItem, setQtdItem, valorItem, setValorItem,
    clientesDisponiveis, valorTotalGeral, handleAdicionarItem, fecharModal, handleSalvarOrcamento,
    orcamentosFiltrados: orcamentos.filter(o => o.clienteNome.toLowerCase().includes(busca.toLowerCase()) || o.id.toString().includes(busca))
  };
}
