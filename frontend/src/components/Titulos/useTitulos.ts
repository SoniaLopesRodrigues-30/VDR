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
  clientes?: { nome: string };
}

export function useTitulos() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [titulos, setTitulos] = useState<Titulo[]>([]);

  const carregarTitulos = useCallback(async () => {
    try {
      setCarregando(true);
      // Busca os títulos trazendo o nome legível do cliente associado
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

  // Função disparada ao clicar em "Liquidar/Baixar Boleto"
  const handleBaixarTitulo = async (titulo: Titulo) => {
    if (!confirm(`Confirmar o recebimento da parcela ${titulo.parcela} da NF-e ${titulo.nfe_id} no valor de R$ ${Number(titulo.valor_parcela).toFixed(2)}?`)) return;

    try {
      // 1. Atualiza o status do título para Pago
      await supabase
        .from('titulos_receber')
        .update({ status: 'Pago' })
        .eq('id', titulo.id);

      // 2. Integra instantaneamente com o seu fluxo de caixa existente
      await supabase.from('fluxo_caixa').insert([{
        descricao: `Recebimento NF-e ${titulo.nfe_id} - Parc. ${titulo.parcela}`,
        valor: titulo.valor_parcela,
        tipo: 'Entrada',
        data: new Date().toISOString()
      }]);

      alert('Título liquidado e lançado no Fluxo de Caixa!');
      await carregarTitulos();
    } catch (error) {
      alert('Erro ao processar a baixa do título.');
    }
  };

  const titulosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return titulos;
    return titulos.filter(t => 
      t.nfe_id.toLowerCase().includes(termo) || 
      t.clientes?.nome?.toLowerCase().includes(termo)
    );
  }, [titulos, busca]);

  return { busca, setBusca, carregando, titulosFiltradas: titulosFiltrados, handleBaixarTitulo, carregarTitulos };
}
