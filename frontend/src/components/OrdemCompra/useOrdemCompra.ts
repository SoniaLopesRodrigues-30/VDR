import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface ItemOC {
  id?: string;
  insumo_id: string;
  quantidade: number;
  valor_unitario: number;
}

export interface OrdemCompra {
  id: string;
  fornecedor_id: number; // Mapeado a partir da tabela 'clientes'
  data_vencimento: string;
  status: 'Pendente' | 'Aprovada' | 'Recusada';
  valor_total: number;
  ordens_compra_itens?: ItemOC[];
  clientes?: { nome: string }; // Tabela unificada usada como fornecedor
}

export function useOrdemCompra() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [ordens, setOrdens] = useState<OrdemCompra[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOC[]>([]);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [statusAlerta, setStatusAlerta] = useState<{ tipo: 'sucesso' | 'erro'; titulo: string } | null>(null);
  const [loadingAcao, setLoadingAcao] = useState(false);
  
  const [form, setForm] = useState({ 
    fornecedorId: '', 
    dataVencimento: '', 
    status: 'Pendente' as const 
  });

  // Carrega os dados seguindo o padrão exato da Ordem de Serviço
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      
      // Carrega os fornecedores ativos (vindos da tabela unificada 'clientes')
      const { data: dadosFornecedores } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('status', 'Ativo');
        
      if (dadosFornecedores) setFornecedores(dadosFornecedores);

      // Carrega as ordens de compra emitidas e seus itens correspondentes
      const { data: dadosOC, error } = await supabase
        .from('ordens_compra')
        .select('*, clientes(nome), ordens_compra_itens(*)');
        
      if (error) throw error;
      setOrdens((dadosOC as OrdemCompra[]) || []);
    } catch (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Função para salvar a Ordem de Compra simulando o fluxo de caixa futuro
  const handleSalvarOC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fornecedorId || !form.dataVencimento || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um insumo.');
      return;
    }

    setLoadingAcao(true);
    setStatusAlerta(null);

    const valorTotalGeral = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOC = idEditando || `OC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // --- ANÁLISE DE SAÚDE DE CAIXA FUTURA (Padrão PCP) ---
      // Soma todas as entradas e saídas existentes no caixa para verificar a viabilidade da compra
      const { data: transacoes } = await supabase.from('fluxo_caixa').select('valor, tipo');
      const saldoAtual = transacoes?.reduce((acc, t) => t.tipo === 'Entrada' ? acc + t.valor : acc - t.valor, 0) || 0;

      if (saldoAtual < valorTotalGeral) {
        setStatusAlerta({
          tipo: 'erro',
          titulo: `Saldo futuro insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}. Valor da compra: R$ ${valorTotalGeral.toFixed(2)}.`
        });
        setLoadingAcao(false);
        return; // Aborta a geração caso o caixa não sustente a compra
      }

      // --- INSERÇÃO / ATUALIZAÇÃO DA ORDEM DE COMPRA MESTRE ---
      if (idEditando) {
        await supabase.from('ordens_compra')
          .update({ 
            fornecedor_id: Number(form.fornecedorId), 
            data_vencimento: form.dataVencimento, 
            status: 'Aprovada', 
            valor_total: valorTotalGeral 
          })
          .eq('id', idEditando);
          
        await supabase.from('ordens_compra_itens').delete().eq('oc_id', idEditando);
      } else {
        await supabase.from('ordens_compra')
          .insert([{ 
            id: codigoOC, 
            fornecedor_id: Number(form.fornecedorId), 
            data_vencimento: form.dataVencimento, 
            status: 'Aprovada', 
            valor_total: valorTotalGeral 
          }]);
      }

      // --- INSERÇÃO DOS DETALHES (INSUMOS SOLICITADOS) ---
      const payloadItens = itens.map(item => ({
        oc_id: codigoOC,
        insumo_id: item.insumo_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario
      }));

      await supabase.from('ordens_compra_itens').insert(payloadItens);

      // --- LANÇAMENTO AUTOMÁTICO DE SAÍDA NO FLUXO DE CAIXA ---
      await supabase.from('fluxo_caixa').insert([{
        descricao: `Pagamento ref. ${codigoOC}`,
        valor: valorTotalGeral,
        tipo: 'Saída',
        data: new Date(form.dataVencimento).toISOString() // Lança na data do vencimento programado
      }]);
      
      setStatusAlerta({ tipo: 'sucesso', titulo: `Ordem de Compra ${codigoOC} emitida e provisionada no caixa!` });
      
      // Limpeza do formulário idêntico à OS
      setForm({ fornecedorId: '', dataVencimento: '', status: 'Pendente' });
      setItens([]);
      setIdEditando(null);
      await carregarDados();
    } catch (error) {
      alert('Erro ao salvar os dados da Ordem de Compra no Supabase.');
    } finally {
      setLoadingAcao(false);
    }
  };

  const iniciarEdicao = (oc: OrdemCompra) => {
    setIdEditando(oc.id);
    setForm({ 
      fornecedorId: String(oc.fornecedor_id), 
      dataVencimento: oc.data_vencimento, 
      status: oc.status 
    });
    setItens(oc.ordens_compra_itens || []);
  };

  const ordensFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return ordens;
    return ordens.filter(oc => 
      oc.id.toLowerCase().includes(termo) || 
      oc.clientes?.nome?.toLowerCase().includes(termo)
    );
  }, [ordens, busca]);

  return {
    busca, setBusca, carregando, fornecedores, itens, setItens, form, setForm, idEditando, setIdEditando,
    statusAlerta, loadingAcao, ordensFiltradas, handleSalvarOC, iniciarEdicao
  };
}
