import { useState } from 'react';

// Movido as interfaces para compartilhamento e tipagem na lógica
export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Cliente {
  id: number;
  nome: string;
  tipo: 'Física' | 'Jurídica';
  documento: string; 
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  endereco: Endereco;
}

export function useClientes() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário (Dados Básicos)
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Física' | 'Jurídica'>('Física');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  
  // Estados do Formulário (Endereço)
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  
  // Lista inicial
  const [clientes, setClientes] = useState<Cliente[]>([
    { 
      id: 1, 
      nome: 'Ana Silva', 
      tipo: 'Física', 
      documento: '123.456.789-00', 
      email: 'ana.silva@email.com', 
      telefone: '(11) 99999-1111', 
      status: 'Ativo',
      endereco: { cep: '01001-000', logradouro: 'Praça da Sé', numero: '100', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP' }
    },
    { 
      id: 2, 
      nome: 'Tech Soluções Ltda', 
      tipo: 'Jurídica', 
      documento: '12.345.678/0001-99', 
      email: 'contato@techsolucoes.com', 
      telefone: '(21) 3333-2222', 
      status: 'Ativo',
      endereco: { cep: '20040-002', logradouro: 'Avenida Rio Branco', numero: '500', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ' }
    },
  ]);

  const fecharModal = () => {
    setNome('');
    setTipo('Física');
    setDocumento('');
    setEmail('');
    setTelefone('');
    setStatus('Ativo');
    setCep('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setCidade('');
    setUf('');
    setModalAberto(false);
  };

  const handleSalvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !documento) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    const novoCliente: Cliente = {
      id: Date.now(),
      nome,
      tipo,
      documento,
      email,
      telefone,
      status,
      endereco: { cep, logradouro, numero, bairro, city: cidade, uf } as any // mantendo compatibilidade com sua estrutura
    };
    // Correção sutil: repassando cidade corretamente à interface estruturada externa
    novoCliente.endereco.cidade = cidade;

    setClientes([novoCliente, ...clientes]);
    fecharModal();
  };

  const handleDeletar = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.documento.includes(busca) ||
    cliente.endereco.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  return {
    busca, setBusca,
    modalAberto, setModalAberto,
    nome, setNome,
    tipo, setTipo,
    documento, setDocumento,
    email, setEmail,
    telefone, setTelefone,
    status, setStatus,
    cep, setCep,
    logradouro, setLogradouro,
    numero, setNumero,
    bairro, setBairro,
    cidade, setCidade,
    uf, setUf,
    clientesFiltrados,
    handleSalvarCliente,
    handleDeletar,
    fecharModal
  };
}
