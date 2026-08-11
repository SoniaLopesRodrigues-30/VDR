import { useState, FormEvent } from 'react';

export interface Transacao {
  id: number;
  data: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
}

export function useFluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, data: '10/08/2026', descricao: 'Venda de Produto - NF #102', tipo: 'receita', valor: 1500.00 },
    { id: 2, data: '10/08/2026', descricao: 'Pagamento Fornecedor de Componentes', tipo: 'despesa', valor: 450.00 },
    { id: 3, data: '11/08/2026', descricao: 'Ordem de Serviço #4029 - Concluída', tipo: 'receita', valor: 380.00 },
    { id: 4, data: '11/08/2026', descricao: 'Assinatura Software de Servidor', tipo: 'despesa', valor: 120.00 },
  ]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    tipo: 'receita' as 'receita' | 'despesa',
    data: new Date().toISOString().split('T')[0] // Corrigido aqui com o [0]
  });

  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoTotal = receitas - despesas;

  const formatarMoeda = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const adicionarLancamento = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.descricao || !formData.valor || parseFloat(formData.valor) <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const novaTransacao: Transacao = {
      id: Date.now(),
      data: formData.data.split('-').reverse().join('/'),
      descricao: formData.descricao,
      tipo: formData.tipo,
      valor: parseFloat(formData.valor),
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setFormData({
      ...formData,
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0]
    });
    setMostrarForm(false);
  };

  const excluirLancamento = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      setTransacoes(transacoes.filter(t => t.id !== id));
    }
  };

  return {
    transacoes,
    mostrarForm,
    setMostrarForm,
    formData,
    setFormData,
    receitas,
    despesas,
    saldoTotal,
    formatarMoeda,
    adicionarLancamento,
    excluirLancamento
  };
}
