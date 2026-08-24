// src/components/Titulos/useTitulos.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Titulo {
  id: string;
  nfe_id: string;
  cliente_id: number;
  parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  tipo: 'Receber' | 'Pagar';
  clientes?: { nome: string };
}

export function useTitulos() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [tituloEmEdicao, setTituloEmEdicao] = useState<Titulo | null>(null);

  const carregarTitulos = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('titulos_receber')
        .select('*, clientes(nome)')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      if (data) setTitulos(data as Titulo[]);
    } catch (error) {
      console.error('Erro ao buscar títulos:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarTitulos(); }, [carregarTitulos]);

  // Ativa o modo de edição salvando o título selecionado no estado
  const iniciarEdicao = (titulo: Titulo) => {
    if (titulo.status === 'Pago') {
      alert('Títulos que já foram pagos ou liquidados não podem ser editados.');
      return;
    }
    setTituloEmEdicao(titulo);
  };

  // Limpa o estado de edição
  const cancelarEdicao = () => {
    setTituloEmEdicao(null);
  };

  
  // FUNÇÃO DE ATUALIZAÇÃO (Faltava declarar/retornar esta função no escopo interno)
  const handleAtualizarTitulo = async (id: string, dadosAtualizados: Partial<Titulo>) => {
    try {
      const { error } = await supabase
        .from('titulos_receber')
        .update(dadosAtualizados)
        .eq('id', id);

      if (error) throw error;

      alert('Título atualizado com sucesso!');
      setTituloEmEdicao(null); // Fecha o modo de edição
      await carregarTitulos(); // Recarrega a tabela de registros
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar o título no banco de dados.');
    }
  };

  // Função dinâmica para efetuar o pagamento/recebimento
  const handleBaixarTitulo = async (titulo: Titulo) => {
    const acaoTexto = titulo.tipo === 'Pagar' ? 'pagamento' : 'recebimento';
    if (!confirm(`Confirmar o ${acaoTexto} do título ref. ${titulo.nfe_id} no valor de R$ ${Number(titulo.valor_parcela).toFixed(2)}?`)) return;

    try {
      await supabase.from('titulos_receber').update({ status: 'Pago' }).eq('id', titulo.id);
      
      await supabase.from('fluxo_caixa').insert([{
        descricao: `${titulo.tipo === 'Pagar' ? 'Pagamento' : 'Recebimento'} Ref. ${titulo.nfe_id} - Parc. ${titulo.parcela}`,
        valor: titulo.valor_parcela,
        tipo: titulo.tipo === 'Pagar' ? 'Saída' : 'Entrada',
        data: new Date().toISOString()
      }]);

      alert(`Título liquidado e registrado no Fluxo de Caixa!`);
      await carregarTitulos();
    } catch (error) {
      alert('Erro ao processar a baixa do título.');
    }
  };
   //deletar os lançamentos de títulos
    const handleDeletarTitulo = async (id: string, nfeId: string) => {
    if (!confirm(`Tem certeza absoluta que deseja excluir permanentemente o título ref. ${nfeId}?`)) {
        return;
    }

    try {
        const { error } = await supabase
        .from('titulos_receber')
        .delete()
        .eq('id', id);

        if (error) throw error;

        alert('Título deletado com sucesso do sistema!');
        
        // Se o título deletado era o que estava sendo editado, limpa o formulário
        if (tituloEmEdicao?.id === id) {
        cancelarEdicao();
        }

        await carregarTitulos(); // Recarrega os registros da tabela
    } catch (error) {
        console.error(error);
        alert('Erro ao tentar deletar o título no Supabase.');
    }
    };


  // Lógica de pesquisa local combinada
  const titulosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return titulos;
    return titulos.filter(t => 
      t.nfe_id.toLowerCase().includes(termo) || 
      t.clientes?.nome?.toLowerCase().includes(termo) ||
      t.tipo.toLowerCase().includes(termo)
    );
  }, [titulos, busca]);

  // Retorno contendo exatamente todas as propriedades mapeadas pelo Titulos.tsx
  return { 
    busca, 
    setBusca, 
    carregando, 
    titulosFiltrados, 
    handleBaixarTitulo, 
    handleAtualizarTitulo, 
    carregarTitulos,
    tituloEmEdicao,
    handleDeletarTitulo,
    iniciarEdicao,
    cancelarEdicao 
  };
}
