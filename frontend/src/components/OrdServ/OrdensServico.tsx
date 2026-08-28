// src/components/OrdensServico/OrdensServico.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Wrench, Search } from 'lucide-react';
import * as S from './OrdensServico.styles';

// Importação dos subcomponentes novos e do layout
import { FormularioOS } from './FormularioOS';
import { ListaOS } from './ListaOS';
import { gerarHtmlOS } from './LayoutImpressaoOS';

interface ItemOS {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  data_item: string;
}

export default function OrdensServico() {
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

  const carregarDadosDoBanco = async () => {
    try {
      setCarregando(true);
      
      // Busca clientes ativos para a seleção do formulário
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setClientes(dadosClientes);
      
      // Busca ordens com os relacionamentos necessários
      const { data: dadosOS } = await supabase.from('ordens_servico').select('*, clientes(*), ordens_servico_itens(*)');
      if (dadosOS) setOrdens(dadosOS);
    } catch (err) {
      console.error('Erro de conexão com o banco:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { 
    carregarDadosDoBanco(); 
  }, []);

  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os campos do item (Especificação, Qtd, Valor e Data).');
      return;
    }
    setItens([...itens, { produto_id: especificacao, quantidade: qtd, valor_unitario: valUnit, data_item: dataItem }]);
    setEspecificacao(''); 
    setQtd(1); 
    setValUnit(0); 
    setDataItem('');
  };

  const limparFormulario = () => {
    setClienteId(''); 
    setValidade(''); 
    setItens([]); 
    setIdEditando(null);
    setEspecificacao('');
    setQtd(1);
    setValUnit(0);
    setDataItem('');
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
        os_id: codigoOS, 
        produto_id: item.produto_id, 
        quantidade: item.quantidade, 
        valor_unitario: item.valor_unitario, 
        data_item: item.data_item
      }));

      const { error: errorItens } = await supabase.from('ordens_servico_itens').insert(payloadItens);
      if (errorItens) throw errorItens;

      alert('Ordem de serviço gravada com sucesso!');
      limparFormulario();
      await carregarDadosDoBanco();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar salvamento no Supabase.');
    }
  };

  // Ativa o modo de edição injetando os itens na Grid
  const ativarEdicaoOS = (os: any) => {
    if (os.status === 'Finalizada') {
      alert('Ordens de Serviço já finalizadas não podem ser alteradas.');
      return;
    }
    setIdEditando(os.id);
    setClienteId(os.cliente_id.toString());
    
    if (os.validade) {
      setValidade(os.validade.split('T')[0]);
    } else {
      setValidade('');
    }

    if (os.ordens_servico_itens) {
      const itensFormatados = os.ordens_servico_itens.map((item: any) => ({
        produto_id: item.produto_id,
        quantidade: Number(item.quantidade),
        valor_unitario: Number(item.valor_unitario),
        data_item: item.data_item ? item.data_item.split('T')[0] : ''
      }));
      setItens(itensFormatados);
    } else {
      setItens([]);
    }
  };

  const handleFinalizarOS = async (os: any) => {
    if (os.status === 'Finalizada') {
      alert('Esta Ordem de Serviço já se encontra encerrada.');
      return;
    }
    if (!confirm(`Finalizar a ${os.id}? O valor total irá automaticamente para o fluxo de caixa como receita.`)) return;
    
    // CORREÇÃO: Data formatada de forma limpa (YYYY-MM-DD) para respeitar os relatórios
    const dataLimpa = new Date().toISOString().substring(0, 10);

    try {
      const { error: errorOS } = await supabase.from('ordens_servico').update({ status: 'Finalizada' }).eq('id', os.id);
      if (errorOS) throw errorOS;

      const { error: errorCaixa } = await supabase.from('fluxo_caixa').insert([{
        descricao: `Faturamento OS ref. ${os.id}`, 
        valor: os.valor_total, 
        tipo: 'Entrada', 
        data: dataLimpa,
        conta_contabil: 'Prestação de Serviços',
        forma_pagamento: 'Pix'
      }]);
      if (errorCaixa) throw errorCaixa;

      alert('OS Finalizada e integrada ao caixa!');
      await carregarDadosDoBanco();
    } catch (err) { 
      alert('Erro ao processar faturamento no caixa.'); 
    }
  };

  const lidarComImpressaoOS = (os: any) => {
    if (!os) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(gerarHtmlOS(os, "/logo.png"));
      doc.close();
    }

    setTimeout(() => { 
      document.body.removeChild(iframe); 
    }, 2000);
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);
  
  const ordensFiltradas = ordens.filter(os => {
    const termo = busca.toLowerCase().trim();
    return !termo || String(os.id).toLowerCase().includes(termo) || os.clientes?.nome?.toLowerCase().includes(termo);
  });

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}><Wrench size={26} /> Ordens de Serviço (OS)</h2>

      <FormularioOS 
        clientes={clientes}
        clienteId={clienteId}
        setClienteId={setClienteId}
        validade={validade}
        setValidade={setValidade}
        itens={itens}
        setItens={setItens}
        idEditando={idEditando}
        cancelarEdicao={limparFormulario} // Ajuste: Adicionado callback de cancelamento
        especificacao={especificacao}
        setEspecificacao={setEspecificacao}
        qtd={qtd}
        setQtd={setQtd}
        valUnit={valUnit}
        setValUnit={setValUnit}
        dataItem={dataItem}
        setDataItem={setDataItem}
        incluirItemNaGrid={incluirItemNaGrid}
        handleSalvarOS={handleSalvarOS}
        totalGeralCalculado={totalGeralCalculado}
      />

      <div style={S.buscaContainerStyle}>
        <input type="text" placeholder="Buscar ordens de serviço..." value={busca} onChange={e => setBusca(e.target.value)} style={S.inputBuscaStyle} />
        <Search size={18} style={S.iconeBuscaStyle} />
      </div>

      <ListaOS 
        carregando={carregando}
        ordensFiltradas={ordensFiltradas}
        onEditarOS={ativarEdicaoOS} // AJUSTE: Passando a função estruturada que monta a grid
        handleFinalizarOS={handleFinalizarOS}
        lidarComImpressaoOS={lidarComImpressaoOS}
      />
    </div>
  );
}
