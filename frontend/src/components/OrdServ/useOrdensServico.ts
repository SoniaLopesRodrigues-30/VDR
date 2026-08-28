// src/components/OrdensServico/useOrdensServico.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { gerarHtmlOS } from './LayoutImpressaoOS';

interface ItemOS {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  data_item: string;
}

export function useOrdensServico() {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [validade, setValidade] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null);

  const [especificacao, setEspecificacao] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);
  const [dataItem, setDataItem] = useState('');

  const carregarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);
      const [resClientes, resOS] = await Promise.all([
        supabase.from('clientes').select('id, nome').eq('status', 'Ativo'),
        supabase.from('ordens_servico').select('*, clientes(*), ordens_servico_itens(*)')
      ]);

      if (resClientes.data) setClientes(resClientes.data);
      if (resOS.data) setOrdens(resOS.data);
    } catch (err) {
      console.error('Erro de conexão com o banco:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { 
    carregarDadosDoBanco(); 
  }, [carregarDadosDoBanco]);

  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os campos do item (Especificação, Qtd, Valor e Data).');
      return;
    }
    setItens([...itens, { produto_id: especificacao, quantidade: qtd, valor_unitario: valUnit, data_item: dataItem }]);
    setEspecificacao(''); setQtd(1); setValUnit(0); setDataItem('');
  };

  const limparFormulario = () => {
    setClienteId(''); setValidade(''); setItens([]); setIdEditando(null);
    setEspecificacao(''); setQtd(1); setValUnit(0); setDataItem('');
  };

  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um item.');
      return;
    }
    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOS = idEditando || `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (idEditando) {
        const { error: errorOS } = await supabase.from('ordens_servico').update({ cliente_id: Number(clienteId), validade, valor_total: valorTotal }).eq('id', idEditando);
        if (errorOS) throw errorOS;
        const { error: errorDel } = await supabase.from('ordens_servico_itens').delete().eq('os_id', idEditando);
        if (errorDel) throw errorDel;
      } else {
        const { error: errorIns } = await supabase.from('ordens_servico').insert([{ id: codigoOS, cliente_id: Number(clienteId), validade, status: 'Em Execução', valor_total: valorTotal }]);
        if (errorIns) throw errorIns;
      }

      const payloadItens = itens.map(item => ({
        os_id: codigoOS, produto_id: item.produto_id, quantidade: item.quantidade, valor_unitario: item.valor_unitario, data_item: item.data_item
      }));

      const { error: errorItens } = await supabase.from('ordens_servico_itens').insert(payloadItens);
      if (errorItens) throw errorItens;

      alert('Ordem de serviço gravada com sucesso!');
      limparFormulario();
      await carregarDadosDoBanco();
    } catch (error) {
      alert('Erro ao processar salvamento no Supabase.');
    }
  };

  const ativarEdicaoOS = (os: any) => {
    if (os.status === 'Finalizada') {
      alert('Ordens de Serviço já finalizadas não podem ser alteradas.');
      return;
    }
    setIdEditando(os.id);
    setClienteId(os.cliente_id.toString());
    setValidade(os.validade ? os.validade.split('T')[0] : '');

    if (os.ordens_servico_itens) {
      setItens(os.ordens_servico_itens.map((item: any) => ({
        produto_id: item.produto_id,
        quantidade: Number(item.quantidade),
        valor_unitario: Number(item.valor_unitario),
        data_item: item.data_item ? item.data_item.split('T')[0] : ''
      })));
    } else {
      setItens([]);
    }
  };

  const handleFinalizarOS = async (os: any) => {
    if (os.status === 'Finalizada') return alert('Esta O.S. já está encerrada.');
    if (!confirm(`Finalizar a ${os.id}? O valor total irá automaticamente para o caixa.`)) return;
    
    const dataLimpa = new Date().toISOString().substring(0, 10);
    try {
      const { error: errorOS } = await supabase.from('ordens_servico').update({ status: 'Finalizada' }).eq('id', os.id);
      if (errorOS) throw errorOS;

      const { error: errorCaixa } = await supabase.from('fluxo_caixa').insert([{
        descricao: `Faturamento OS ref. ${os.id}`, valor: os.valor_total, tipo: 'Entrada', data: dataLimpa, conta_contabil: 'Prestação de Serviços', forma_pagamento: 'Pix'
      }]);
      if (errorCaixa) throw errorCaixa;

      alert('OS Finalizada e integrada ao caixa!');
      await carregarDadosDoBanco();
    } catch (err) { 
      alert('Erro ao processar faturamento no caixa.'); 
    }
  };

  const handleBaixaParcialOS = async (os: any) => {
    try {
      const { data: pagamentos, error } = await supabase.from('fluxo_caixa').select('valor').eq('os_id', os.id);
      if (error) throw error;

      const totalJaPago = (pagamentos || []).reduce((acc, p) => acc + Number(p.valor || 0), 0);
      const saldoDevedor = Number(os.valor_total) - totalJaPago;

      const inputValor = prompt(`Saldo Total: R$ ${Number(os.valor_total).toFixed(2)}\nSaldo Restante: R$ ${saldoDevedor.toFixed(2)}\n\nDigite o valor da baixa (R$):`, saldoDevedor.toFixed(2));
      if (!inputValor) return;

      const valorBaixa = Number(inputValor.replace(',', '.'));
      if (isNaN(valorBaixa) || valorBaixa <= 0 || valorBaixa > Number(saldoDevedor.toFixed(2))) {
        return alert('Valor informado inválido ou acima do saldo restante.');
      }

      const { error: erroCaixa } = await supabase.from('fluxo_caixa').insert([{
        descricao: `Baixa Parcial ref. ${os.id}`, valor: valorBaixa, tipo: 'Entrada', data: new Date().toISOString().substring(0, 10), conta_contabil: 'Prestação de Serviços', forma_pagamento: 'Pix', os_id: os.id
      }]);
      if (erroCaixa) throw erroCaixa;

      if (Number((totalJaPago + valorBaixa).toFixed(2)) >= Number(os.valor_total)) {
        await supabase.from('ordens_servico').update({ status: 'Finalizada' }).eq('id', os.id);
        alert(`O.S. ${os.id} quitada e encerrada.`);
      } else {
        alert(`Baixa parcial de R$ ${valorBaixa.toFixed(2)} registrada!`);
      }
      await carregarDadosDoBanco();
    } catch (err) {
      alert('Erro ao processar baixa parcial.');
    }
  };

  const lidarComImpressaoOS = (os: any) => {
    if (!os) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) { doc.open(); doc.write(gerarHtmlOS(os, "/logo.png")); doc.close(); }
    setTimeout(() => { document.body.removeChild(iframe); }, 2000);
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);
  
  const ordensFiltradas = ordens.filter(os => {
    const termo = busca.toLowerCase().trim();
    return !termo || String(os.id).toLowerCase().includes(termo) || os.clientes?.nome?.toLowerCase().includes(termo);
  });

  return {
    carregando, busca, setBusca, clientes, clienteId, setClienteId, validade, setValidade, itens, setItens, idEditando,
    especificacao, setEspecificacao, qtd, setQtd, valUnit, setValUnit, dataItem, setDataItem,
    incluirItemNaGrid, handleSalvarOS, ativarEdicaoOS, handleFinalizarOS, handleBaixaParcialOS, lidarComImpressaoOS,
    totalGeralCalculado, ordensFiltradas, cancelarEdicao: limparFormulario
  };
}
