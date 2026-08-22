// src/components/OrdemCompra/useOrdemCompra.ts
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface ItemOrdem {
  insumo_id: string;
  quantidade: number;
  valor_unitario: number;
}

export function useOrdemCompra() {
  const [fornecedorId, setFornecedorId] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [itens, setItens] = useState<ItemOrdem[]>([{ insumo_id: '', quantidade: 0, valor_unitario: 0 }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ tipo: 'erro' | 'sucesso'; titulo: string; detalhe?: string } | null>(null);

  // Cálculo dinâmico do valor total da Ordem de Compra
  const valorTotalGeral = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);

  const adicionarItem = () => {
    setItens([...itens, { insumo_id: '', quantidade: 0, valor_unitario: 0 }]);
  };

  const atualizarItem = (index: number, campo: keyof ItemOrdem, valor: string | number) => {
    const novosItens = [...itens];
    novosItens[index] = {
      ...novosItens[index],
      [campo]: valor
    };
    setItens(novosItens);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const enviarOrdemCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (!fornecedorId || !dataVencimento || valorTotalGeral <= 0) {
      setStatus({ tipo: 'erro', titulo: 'Formulário inválido', detalhe: 'Verifique se todos os campos estão preenchidos.' });
      setLoading(false);
      return;
    }

    try {
      // 1. CHAMA A RPC DO SUPABASE PARA PREVER O SALDO NA DATA DO VENCIMENTO
      const { data: saldoProjetado, error: rpcError } = await supabase
        .rpc('calcular_saldo_projetado', { data_alvo: dataVencimento });

      if (rpcError) throw rpcError;

      const saldoFuturo = Number(saldoProjetado || 0);

      // 2. TRAVA DO CHEQUE ESPECIAL (9%): Bloqueia se o saldo projetado for menor que o custo da compra
      if (saldoFuturo - valorTotalGeral < 0) {
        setStatus({
          tipo: 'erro',
          titulo: '🛑 COMPRA REJEITADA AUTOMATICAMENTE',
          detalhe: `O saldo projetado para ${dataVencimento.split('-').reverse().join('/')} é de R$ ${saldoFuturo.toFixed(2)}. Esta compra de R$ ${valorTotalGeral.toFixed(2)} empurrará a metalúrgica para o cheque especial (juros de 9% ao mês).`
        });
        setLoading(false);
        return;
      }

      // 3. SE PASSAR NA TRAVA, SALVA O CABEÇALHO DA ORDEM DE COMPRA
      const { data: novaOC, error: ocError } = await supabase
        .from('ordens_compra')
        .insert([{ 
          fornecedor_id: fornecedorId, 
          data_vencimento_financeiro: dataVencimento, 
          valor_total: valorTotalGeral, 
          status: 'APROVADO' 
        }])
        .select()
        .single();

      if (ocError) throw ocError;

      // 4. SALVA OS ITENS VINCULADOS À ORDEM DE COMPRA CRIADA
      const itensFormatados = itens.map(item => ({
        ordem_compra_id: novaOC.id,
        insumo_id: item.insumo_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario
      }));

      const { error: itensError } = await supabase
        .from('itens_ordem_compra')
        .insert(itensFormatados);

      if (itensError) throw itensError;

      // Retorno de Sucesso para a Tela (A trigger já criou o lançamento no caixa)
      setStatus({
        tipo: 'sucesso',
        titulo: '🎉 Ordem de Compra Emitida!',
        detalhe: `R$ ${valorTotalGeral.toFixed(2)} agendados automaticamente como despesa em seu fluxo de caixa.`
      });

      // Limpa os campos após o sucesso
      setFornecedorId('');
      setDataVencimento('');
      setItens([{ insumo_id: '', quantidade: 0, valor_unitario: 0 }]);

    } catch (err: any) {
      console.error(err);
      setStatus({ 
        tipo: 'erro', 
        titulo: 'Erro ao processar no banco de dados', 
        detalhe: err.message || 'Verifique sua conexão ou a estrutura das tabelas.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fornecedorId, setFornecedorId,
    dataVencimento, setDataVencimento,
    itens, adicionarItem, atualizarItem, removerItem,
    valorTotalGeral,
    loading,
    status,
    enviarOrdemCompra
  };
}
