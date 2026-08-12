import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient'; 


export interface ItemOS {
  id?: string;
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  data_item: string;
}

export interface OrdemServico {
  id: string;
  cliente_id: number;
  validade: string;
  status: 'Em Execução' | 'Aguardando Peça' | 'Finalizada';
  valor_total: number;
  ordens_servico_itens?: ItemOS[];
  clientes?: { nome: string };
}

export function useOrdensServico() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ clienteId: '', validade: '', status: 'Em Execução' as const });

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setClientes(dadosClientes);

      const { data: dadosOS, error } = await supabase
        .from('ordens_servico')
        .select('*, clientes(nome), ordens_servico_itens(*)');
        
      if (error) throw error;
      setOrdens((dadosOS as OrdemServico[]) || []);
    } catch (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um item na tabela.');
      return;
    }

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOS = idEditando || `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (idEditando) {
        await supabase.from('ordens_servico').update({ cliente_id: Number(form.clienteId), validade: form.validade, status: form.status, valor_total: valorTotal }).eq('id', idEditando);
        await supabase.from('ordens_servico_itens').delete().eq('os_id', idEditando);
      } else {
        await supabase.from('ordens_servico').insert([{ id: codigoOS, cliente_id: Number(form.clienteId), validade: form.validade, status: form.status, valor_total: valorTotal }]);
      }

      const payloadItens = itens.map(item => ({
        os_id: codigoOS,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        data_item: item.data_item
      }));

      await supabase.from('ordens_servico_itens').insert(payloadItens);
      
      alert('Ordem de serviço processada com sucesso!');
      setForm({ clienteId: '', validade: '', status: 'Em Execução' });
      setItens([]);
      setIdEditando(null);
      await carregarDados();
    } catch (error) {
      alert('Erro ao salvar os dados no Supabase.');
    }
  };

  const handleFinalizarOS = async (os: OrdemServico) => {
    if (!confirm(`Deseja liquidar a ${os.id} e lançar R$ ${Number(os.valor_total).toFixed(2)} no caixa?`)) return;

    try {
      await supabase.from('ordens_servico').update({ status: 'Finalizada' }).eq('id', os.id);
      await supabase.from('fluxo_caixa').insert([{
        descricao: `Recebimento ref. ${os.id}`,
        valor: os.valor_total,
        tipo: 'Entrada',
        data: new Date().toISOString()
      }]);

      alert('Faturamento concluído!');
      await carregarDados();
    } catch (error) {
      alert('Erro ao processar fluxo de caixa.');
    }
  };

  const iniciarEdicao = (os: OrdemServico) => {
    setIdEditando(os.id);
    setForm({ clienteId: String(os.cliente_id), validade: os.validade, status: os.status });
    setItens(os.ordens_servico_itens || []);
  };

  const ordensFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ordens;
    return ordens.filter(os => os.id.toLowerCase().includes(termo) || os.clientes?.nome?.toLowerCase().includes(termo));
  }, [ordens, busca]);

  return {
    busca, setBusca, carregando, clientes, itens, setItens, form, setForm, idEditando, setIdEditando,
    ordensFiltrados, handleSalvarOS, iniciarEdicao, handleFinalizarOS
  };
}
