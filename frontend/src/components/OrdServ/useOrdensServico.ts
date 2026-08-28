// src/components/OrdensServico/useOrdensServico.ts
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
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [form, setForm] = useState({ clienteId: '', validade: '', status: 'Em Execução' as const });

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      
      // Busca as ordens de serviço trazendo os dados do cliente e os itens associados de forma unificada
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
        // CORREÇÃO: Captura e validação de erro na atualização da OS pai
        const { error: erroOS } = await supabase
          .from('ordens_servico')
          .update({ 
            cliente_id: Number(form.clienteId), 
            validade: form.validade, 
            status: form.status, 
            valor_total: valorTotal 
          })
          .eq('id', idEditando);

        if (erroOS) throw erroOS;

        // CORREÇÃO: Captura e validação de erro na limpeza dos itens antigos
        const { error: erroDeleteItens } = await supabase
          .from('ordens_servico_itens')
          .delete()
          .eq('os_id', idEditando);

        if (erroDeleteItens) throw erroDeleteItens;
      } else {
        // CORREÇÃO: Captura e validação de erro na inserção da nova OS pai
        const { error: erroInsertOS } = await supabase
          .from('ordens_servico')
          .insert([{ 
            id: codigoOS, 
            cliente_id: Number(form.clienteId), 
            validade: form.validade, 
            status: form.status, 
            valor_total: valorTotal 
          }]);

        if (erroInsertOS) throw erroInsertOS;
      }

      // Prepara o lote de itens associando ao ID correto da OS
      const payloadItens = itens.map(item => ({
        os_id: codigoOS,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        data_item: item.data_item || new Date().toISOString().substring(0, 10)
      }));

      // CORREÇÃO: Captura e validação de erro ao salvar os itens da OS em lote
      const { error: erroInsertItens } = await supabase
        .from('ordens_servico_itens')
        .insert(payloadItens);

      if (erroInsertItens) throw erroInsertItens;
      
      alert('Ordem de serviço processada com sucesso!');
      cancelarAcao();
      await carregarDados();
    } catch (error) {
      console.error(error);
      alert('Erro operacional no Supabase ao tentar salvar os dados da Ordem de Serviço.');
    }
  };

  const handleFinalizarOS = async (os: OrdemServico) => {
    if (os.status === 'Finalizada') {
      alert('Esta Ordem de Serviço já se encontra encerrada e liquidada.');
      return;
    }

    if (!confirm(`Deseja liquidar a ${os.id} e lançar R$ ${Number(os.valor_total).toFixed(2)} no caixa?`)) return;

    // CORREÇÃO: Formata a data de entrada do caixa de forma limpa (YYYY-MM-DD) para não corromper os relatórios
    const dataLimpa = new Date().toISOString().substring(0, 10);

    try {
      // CORREÇÃO: Validação de erro ao mudar status da OS
      const { error: erroStatus } = await supabase
        .from('ordens_servico')
        .update({ status: 'Finalizada' })
        .eq('id', os.id);

      if (erroStatus) throw erroStatus;

      // CORREÇÃO: Validação de erro ao inserir faturamento no fluxo de caixa
      const { error: erroCaixa } = await supabase
        .from('fluxo_caixa')
        .insert([{
          descricao: `Recebimento ref. ${os.id}`,
          valor: os.valor_total,
          tipo: 'Entrada',
          data: dataLimpa,
          conta_contabil: 'Prestação de Serviços', // Categoria padrão para amarrar com seu gráfico DRE!
          forma_pagamento: 'Pix'
        }]);

      if (erroCaixa) throw erroCaixa;

      alert('Faturamento concluído e registrado no seu Fluxo de Caixa!');
      await carregarDados();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar fluxo de caixa ou atualizar o status da OS.');
    }
  };

  const iniciarEdicao = (os: OrdemServico) => {
    if (os.status === 'Finalizada') {
      alert('Ordens de Serviço finalizadas não podem ser alteradas.');
      return;
    }
    setIdEditando(os.id);
    setForm({ clienteId: String(os.cliente_id), validade: os.validade, status: os.status });
    setItens(os.ordens_servico_itens || []);
  };

  const cancelarAcao = () => {
    setForm({ clienteId: '', validade: '', status: 'Em Execução' });
    setItens([]);
    setIdEditando(null);
  };

  const ordensFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ordens;
    return ordens.filter(os => 
      String(os.id).toLowerCase().includes(termo) || 
      os.clientes?.nome?.toLowerCase().includes(termo)
    );
  }, [ordens, busca]);

  return {
    busca, 
    setBusca, 
    carregando, 
    itens, 
    setItens, 
    form, 
    setForm, 
    idEditando, 
    cancelarAcao,
    ordensFiltrados, 
    handleSalvarOS, 
    iniciarEdicao, 
    handleFinalizarOS
  };
}
