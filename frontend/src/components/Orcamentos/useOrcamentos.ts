import { useState, useMemo } from 'react';

// Definição das interfaces locais para manter o arquivo auto-suficiente
interface ItemOrcamento {
  id: number;
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
  // --- ESTADOS DO CONTROLADOR DO MODAL E BUSCA ---
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [busca, setBusca] = useState<string>('');

  // --- ESTADOS DOS CAMPOS DO FORMULÁRIO DE ORÇAMENTO ---
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [validade, setValidade] = useState<string>('');
  const [status, setStatus] = useState<'Pendente' | 'Aprovado' | 'Cancelado'>('Pendente');

  // --- ESTADOS DE CRIAÇÃO DINÂMICA DE UM NOVO ITEM ---
  const [descricaoItem, setDescricaoItem] = useState<string>('');
  const [qtdItem, setQtdItem] = useState<number>(1);
  const [valorItem, setValorItem] = useState<number>(0);

  // --- ESTADO DA LISTA DE ITENS GERADOS (Sempre inicializado como array vazio) ---
  const [itens, setItens] = useState<ItemOrcamento[]>([]);

  // --- DADOS SIMULADOS (MOCKADOS) DE CLIENTES E ORÇAMENTOS EXISTENTES ---
  const [clientesDisponiveis] = useState<{ id: number; nome: string }[]>([
    { id: 1, nome: 'Tech Solutions Ltda' },
    { id: 2, nome: 'Comércio de Alimentos Silva' },
    { id: 3, nome: 'Indústria Metalúrgica Sul' },
  ]);

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([
    { id: 101, numero: 'ORC-001', clienteId: 1, clienteNome: 'Tech Solutions Ltda', validade: '2026-08-15', valorTotal: 1550.00, status: 'Aprovado' },
    { id: 102, numero: 'ORC-002', clienteId: 2, clienteNome: 'Comércio de Alimentos Silva', validade: '2026-08-20', valorTotal: 430.50, status: 'Pendente' },
  ]);

  // --- CÁLCULO DINÂMICO DO TOTAL GERAL (Impede variáveis indefinidas e quebras) ---
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

  // --- FUNÇÕES DE MANIPULAÇÃO LOGICA ---

  // Insere um produto validado na tabela interna do orçamento
  const handleAdicionarItem = () => {
    const quantidade = Number(qtdItem) || 1;
    const valorUnitario = Number(valorItem) || 0;

    const novoItem: ItemOrcamento = {
      id: Date.now() + Math.random(), // Evita colisão de IDs na listagem
      descricao: descricaoItem.trim(),
      quantidade,
      valorUnitario,
      total: quantidade * valorUnitario
    };

    setItens(prevItens => [...prevItens, novoItem]);

    // Reseta o estado dos inputs para a próxima inserção
    setDescricaoItem('');
    setQtdItem(1);
    setValorItem(0);
  };

  // Limpa o formulário por completo e fecha a janela do modal
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

  // Consolida a inserção e salva o registro do orçamento definitivo
  const handleSalvarOrcamento = (e: React.FormEvent) => {
    e.preventDefault();

    if (clienteId === '') {
      alert('Por favor, selecione um cliente.');
      return;
    }

    if (itens.length === 0) {
      alert('Adicione pelo menos um item para salvar o orçamento.');
      return;
    }

    const clienteObj = clientesDisponiveis.find(c => c.id === clienteId);
    
    const novoOrcamento: Orcamento = {
      id: Date.now(),
      numero: `ORC-00${orcamentos.length + 1}`,
      clienteId,
      clienteNome: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
      validade,
      valorTotal: valorTotalGeral,
      status
    };

    setOrcamentos(prev => [novoOrcamento, ...prev]);
    fecharModal();
    alert('Orçamento gravado com sucesso!');
  };

  // Retorna os estados expostos mapeados idênticos às necessidades do seu arquivo pai
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
    handleSalvarOrcamento
  };
}
