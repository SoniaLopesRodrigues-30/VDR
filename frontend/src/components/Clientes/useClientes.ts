import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient'; 

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
  inscricao_estadual?: string | null;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  endereco: Endereco;
} 

interface FormCliente {
  nome: string;
  tipo: 'Física' | 'Jurídica';
  documento: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
} 

// Encontre este bloco no seu useClientes.ts e mude a propriedade tipo:
const estadoInicialForm: FormCliente = {
  nome: '', 
  tipo: 'Jurídica', // MUDADO: De 'Física' para 'Jurídica'
  documento: '', 
  inscricaoEstadual: '',
  email: '', 
  telefone: '', 
  status: 'Ativo', 
  cep: '',
  logradouro: '', 
  numero: '', 
  bairro: '', 
  cidade: '', 
  uf: ''
}; 


export function useClientes() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormCliente>(estadoInicialForm); 

  // CORRIGIDO: Tipagem do parâmetro 'valor' adicionada
  const handleChangeForm = (campo: keyof FormCliente, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }; 

  const carregarClientesDoBanco = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true }); 

      if (error) throw error;

      if (data) {
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

  useEffect(() => {
    carregarClientesDoBanco();
  }, [carregarClientesDoBanco]); 

  const fecharModal = useCallback(() => {
    setForm(estadoInicialForm);
    setIdEditando(null);
    setModalAberto(false);
  }, []); 

  const iniciarEdicao = (cliente: Cliente) => {
    setIdEditando(cliente.id);
    setForm({
      nome: cliente.nome,
      tipo: cliente.tipo,
      documento: cliente.documento,
      inscricaoEstadual: cliente.inscricao_estadual || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      status: cliente.status,
      cep: cliente.endereco.cep || '',
      logradouro: cliente.endereco.logradouro || '',
      numero: cliente.endereco.numero || '',
      bairro: cliente.endereco.bairro || '',
      cidade: cliente.endereco.cidade || '',
      uf: cliente.endereco.uf || ''
    });
    setModalAberto(true);
  }; 

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CORRIGIDO: Removido form.email da checagem de campos obrigatórios
    if (!form.nome || !form.documento) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    } 

    const payload = {
      nome: form.nome,
      tipo: form.tipo,
      documento: form.documento,
      inscricao_estadual: form.tipo === 'Jurídica' ? form.inscricaoEstadual : null,
      email: form.email || null, // Salva e-mail vazio como NULL no banco
      telefone: form.telefone || null,
      status: form.status,
      cep: form.cep || null,
      logradouro: form.logradouro || null,
      numero: form.numero || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      uf: form.uf || null
    };

    try {
      if (idEditando) {
        const { error } = await supabase
          .from('clientes')
          .update(payload)
          .eq('id', idEditando);
        if (error) throw error;
        alert('Cliente updated com sucesso!');
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([payload]);
        if (error) {
          if (error.code === '23505') {
            alert('Este documento (CPF/CNPJ) já está cadastrado no sistema.');
            return;
          }
          throw error;
        }
        alert('Cliente gravado com sucesso!');
      }

      fecharModal();
      await carregarClientesDoBanco();
    } catch (error: any) {
      console.error('Erro ao salvar no banco:', error.message || error);
      alert(`Erro: ${error.message || 'Falha na comunicação com o banco.'}`);
    }
  }; 

  const handleDeletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente definitivamente?')) return; 

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') {
          alert('Não é possível excluir este cliente porque ele possui registros vinculados.');
          return;
        }
        throw error;
      }

      setClientes(prev => prev.filter(c => c.id !== id));
      alert('Cliente removido com sucesso.');
    } catch (error: any) {
      console.error('Erro ao deletar cliente:', error.message || error);
      alert('Erro ao processar a exclusão.');
    }
  }; 

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return clientes; 

    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(termo) ||
      (cliente.email && cliente.email.toLowerCase().includes(termo)) || // CORRIGIDO: Evita quebras caso email seja nulo
      cliente.documento.includes(termo) ||
      cliente.endereco.cidade.toLowerCase().includes(termo)
    );
  }, [clientes, busca]); 

  return {
    busca, setBusca,
    modalAberto, setModalAberto,
    carregando,
    form, handleChangeForm,
    idEditando, iniciarEdicao,
    clientesFiltrados,
    handleSalvarCliente,
    handleDeletar,
    fecharModal
  };
}
