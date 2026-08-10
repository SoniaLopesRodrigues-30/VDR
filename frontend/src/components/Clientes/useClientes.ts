import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient'; // Importação do cliente

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
  inscricao_estadual?: string | null; // Adicionado à tipagem do front
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  endereco: Endereco;
}

export function useClientes() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true); // Adicionado estado de loading

  // Estados do Formulário (Dados Básicos)
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Física' | 'Jurídica'>('Física');
  const [documento, setDocumento] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(''); // Novo Estado Adicionado
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
  
  // Estado real vindo do banco de dados
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // 1. CARREGAR CLIENTES DO POSTGRESQL (SUPABASE)
  const carregarClientesDoBanco = useCallback(async () => {
    try {
      setCarregando(true);
      const urlLimpa = (supabase as any).supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
      (supabase as any).rest.url = `${urlLimpa}/rest/v1`;

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;

      if (data) {
        // Mapeia os dados planos do banco para a estrutura aninhada com o objeto .endereco do seu front
        const formatados: Cliente[] = data.map((c: any) => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo,
          documento: c.documento || '',
          inscricao_estadual: c.inscricao_estadual || '',
          email: c.email || '',
          telefone: c.telefone || '',
          status: c.status,
          endereco: {
            cep: c.cep || '',
            logradouro: c.logradouro || '',
            numero: c.numero || '',
            bairro: c.bairro || '',
            cidade: c.cidade || '',
            uf: c.uf || ''
          }
        }));
        setClientes(formatados);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes no Supabase:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Dispara a busca ao carregar o componente
  useEffect(() => {
    carregarClientesDoBanco();
  }, [carregarClientesDoBanco]);

  const fecharModal = () => {
    setNome('');
    setTipo('Física');
    setDocumento('');
    setInscricaoEstadual(''); // Limpa o novo campo ao fechar
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

  // 2. SALVAR NOVO CLIENTE NO POSTGRESQL
  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !documento) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    try {
      // Como o Postgres é relacional e plano, enviamos os campos na raiz do objeto
      const { error } = await supabase
        .from('clientes')
        .insert([{
          nome,
          tipo,
          documento,
          inscricao_estadual: tipo === 'Jurídica' ? inscricaoEstadual : null, // Só salva se for jurídica
          email,
          telefone,
          status,
          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          uf
        }]);

      if (error) {
        if (error.code === '23505') {
          alert('Este documento (CPF/CNPJ) já está cadastrado no sistema.');
          return;
        }
        throw error; // Se for erro de permissão (401 RLS), vai cair no catch abaixo
      }

      fecharModal();
      await carregarClientesDoBanco(); // Atualiza a lista trazendo o cliente novo da nuvem
      alert('Cliente gravado com sucesso!');
    } catch (error: any) {
      // Destrincha o erro para o console mostrar o texto real e não apenas "Object"
      console.error('Erro ao salvar no banco:', error.message || error, error.details || '');
      alert(`Não foi possível gravar o cliente no banco de dados. Motivo: ${error.message || 'Erro de autenticação/RLS 401'}`);
    }
  };

  // 3. EXCLUIR CLIENTE DO BANCO DE DADOS
  const handleDeletar = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente definitivamente?')) {
      try {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', id);

        if (error) {
          if (error.code === '23503') { // Código do Postgres para violação de chave estrangeira
            alert('Não é possível excluir este cliente porque ele possui orçamentos ou OS vinculadas a ele.');
            return;
          }
          throw error;
        }

        // Se deletou com sucesso no banco, remove do estado visual
        setClientes(prev => prev.filter(c => c.id !== id));
        alert('Cliente removido com sucesso.');
      } catch (error: any) {
        console.error('Erro ao deletar cliente:', error.message || error);
        alert('Erro ao processar a exclusão.');
      }
    }
  };

  // 4. FILTRAGEM REATIVA
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.documento.includes(busca) ||
    cliente.endereco.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  return {
    busca, setBusca,
    modalAberto, setModalAberto,
    carregando,
    nome, setNome,
    tipo, setTipo,
    documento, setDocumento,
    inscricaoEstadual, setInscricaoEstadual, // Exportado para uso no formulário front-end
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
