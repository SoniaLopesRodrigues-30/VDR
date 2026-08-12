

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient'; 


export interface ItemOrcamento {
  id?: string;
  produto_id: string; // Pode receber o nome da Mão de Obra ou ID do Produto
  quantidade: number;
  valor_unitario: number;
  data_item: string; // Data específica por produto/serviço
}

export interface Orcamento {
  id: string;
  cliente_id: number;
  validade: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  valor_total: number;
  orcamento_itens?: ItemOrcamento[];
  clientes?: { nome: string };
}

interface FormOrcamento {
  clienteId: string;
  validade: string;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
}

const estadoInicialForm: FormOrcamento = {
  clienteId: '',
  validade: '',
  status: 'Pendente'
};

export function useOrcamentos() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormOrcamento>(estadoInicialForm);

  const carregarClientes = useCallback(async () => {
    const { data } = await supabase.from('clientes').select('*').eq('status', 'Ativo').order('nome', { ascending: true });
    if (data) setClientes(data);
  }, []);

  const carregarOrcamentos = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, clientes(nome), orcamento_itens(*)')
        .order('id', { ascending: false });
      if (error) throw error;
      if (data) setOrcamentos(data as Orcamento[]);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
    carregarOrcamentos();
  }, [carregarClientes, carregarOrcamentos]);

  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione pelo menos um item.');
      return;
    }

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOrcamento = idEditando || `ORC-${Math.floor(1000 + Math.random() * 9000)}`;

    const payloadCabecalho = {
      id: codigoOrcamento,
      cliente_id: Number(form.clienteId),
      validade: form.validade,
      status: form.status,
      valor_total: valorTotal
    };

    try {
      if (idEditando) {
        await supabase.from('orcamentos').update(payloadCabecalho).eq('id', idEditando);
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', idEditando);
      } else {
        await supabase.from('orcamentos').insert([payloadCabecalho]);
      }

      const payloadItens = itens.map(item => ({
        orcamento_id: codigoOrcamento,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        data_item: item.data_item
      }));

      const { error } = await supabase.from('orcamento_itens').insert(payloadItens);
      if (error) throw error;

      alert('Orçamento gravado com sucesso!');
      setForm(estadoInicialForm);
      setItens([]);
      setIdEditando(null);
      await carregarOrcamentos();
    } catch (error) {
      alert('Erro ao salvar orçamento.');
    }
  };

  const converterOrcamentoEmOS = async (orc: Orcamento) => {
    if (!confirm(`Deseja transformar o orçamento ${orc.id} em uma Ordem de Serviço?`)) return;

    try {
      await supabase.from('orcamentos').update({ status: 'Aprovado' }).eq('id', orc.id);

      // Divide o que é peça/produto e o que é mão de obra com base em alguma palavra-chave ou regra simples
      const valorPecas = orc.orcamento_itens?.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0) || 0;

      const novaOS = {
        id: `OS-${orc.id.replace('ORC-', '')}`,
        cliente_id: orc.cliente_id,
        equipamento: 'Definir na execução', // Como removemos do orçamento, vira preenchimento na OS
        defeito: 'Verificar itens do orçamento',
        valor_servico: 0, 
        valor_pecas: valorPecas,
        status: 'Em Análise'
      };

      const { error } = await supabase.from('ordens_servico').insert([novaOS]);
      if (error) throw error;

      alert(`Sucesso! Orçamento convertido na ${novaOS.id}`);
      await carregarOrcamentos();
    } catch (error) {
      alert('Erro ao converter para OS.');
    }
  };

  const iniciarEdicao = (orc: Orcamento) => {
    setIdEditando(orc.id);
    setForm({
      clienteId: String(orc.cliente_id),
      validade: orc.validade,
      status: orc.status
    });
    setItens(orc.orcamento_itens || []);
  };

  const orcamentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return orcamentos;
    return orcamentos.filter(orc => orc.id.toLowerCase().includes(termo) || orc.clientes?.nome.toLowerCase().includes(termo));
  }, [orcamentos, busca]);

  return {
    busca, setBusca, carregando, clientes, itens, setItens,
    form, setForm, idEditando, setIdEditando,
    orcamentosFiltrados, handleSalvarOrcamento, iniciarEdicao, converterOrcamentoEmOS
  };
}

