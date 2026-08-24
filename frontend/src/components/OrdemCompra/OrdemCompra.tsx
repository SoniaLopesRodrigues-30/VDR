// OrdemCompra.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Settings, Search } from 'lucide-react';
import * as S from './OrdemCompra.styles';

// Mapeamento dos subcomponentes seguindo o padrão da OS
import { FormularioOC } from './FormularioOC';
import { ListaOC } from './ListaOC';

export interface ItemOC {
  insumo_id: string;
  quantidade: number;
  valor_unitario: number;
}

export interface Clientes {
  id: string;
  nome: string;
}

export default function OrdemCompra() {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOC[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [fornecedorId, setFornecedorId] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null);

  // Estados locais para digitação de itens na Grid
  const [insumoId, setInsumoId] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);

  // Estados para a busca dinâmica via banco de dados com Debounce
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [listaFornecedores, setListaFornecedores] = useState<Clientes[]>([]);
  const [buscandoBanco, setBuscandoBanco] = useState(false);

  const carregarDadosDoBanco = async () => {
    try {
      setBusca('');
      setCarregando(true);
      
      // Busca clientes ativos para a seleção do formulário (usados como fornecedores)
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setFornecedores(dadosClientes);
      
      // Busca todas as ordens de compra e seus respectivos relacionamentos
      const { data: dadosOC } = await supabase.from('ordens_compra').select('*, clientes(*), ordens_compra_itens(*)');
      if (dadosOC) setOrdens(dadosOC);
    } catch (err) {
      console.error('Erro de conexão com o banco:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDadosDoBanco(); }, []);

  // Debounce para pesquisar fornecedores/clientes no banco de dados do Supabase
  useEffect(() => {
    if (termoPesquisa.trim().length < 2) {
      setListaFornecedores([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setBuscandoBanco(true);
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome')
          .ilike('nome', `%${termoPesquisa}%`)
          .limit(10);

        if (error) throw error;
        if (data) setListaFornecedores(data as Clientes[]);
      } catch (err) {
        console.error('Erro ao consultar a tabela clientes:', err);
      } finally {
        setBuscandoBanco(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [termoPesquisa]);

  const incluirItemNaGrid = () => {
    if (!insumoId || qtd <= 0 || valUnit <= 0) {
      alert('Preencha todos os campos do insumo (Identificação, Qtd e Valor).');
      return;
    }
    setItens([...itens, { insumo_id: insumoId, quantidade: qtd, valor_unitario: valUnit }]);
    setInsumoId(''); setQtd(1); setValUnit(0);
  };

  const handleSalvarOC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorId || !dataVencimento || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um insumo na grid.');
      return;
    }

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOC = idEditando || `OC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (idEditando) {
        await supabase.from('ordens_compra').update({ fornecedor_id: Number(fornecedorId), data_vencimento: dataVencimento, valor_total: valorTotal }).eq('id', idEditando);
        await supabase.from('ordens_compra_itens').delete().eq('oc_id', idEditando);
      } else {
        await supabase.from('ordens_compra').insert([{ id: codigoOC, fornecedor_id: Number(fornecedorId), data_vencimento: dataVencimento, status: 'Aprovada', valor_total: valorTotal }]);
      }

      const payloadItens = itens.map(item => ({
        oc_id: codigoOC, insumo_id: item.insumo_id, quantidade: item.quantidade, valor_unitario: item.valor_unitario
      }));
      await supabase.from('ordens_compra_itens').insert(payloadItens);
      
      alert('Ordem de Compra processada e gravada com sucesso!');
      
      setFornecedorId('');
      setTermoPesquisa('');
      setDataVencimento('');
      setItens([]);
      setIdEditando(null);
      await carregarDadosDoBanco();
    } catch (error) {
      alert('Erro ao processar salvamento da OC no Supabase.');
    }
  };

  const ativarEdicaoOC = (oc: any) => {
    setIdEditando(oc.id);
    setFornecedorId(oc.fornecedor_id.toString());
    setTermoPesquisa(oc.clientes?.nome || '');
    
    if (oc.data_vencimento) {
      setDataVencimento(oc.data_vencimento.split('T')[0]);
    } else {
      setDataVencimento('');
    }

    if (oc.ordens_compra_itens) {
      const itensFormatados = oc.ordens_compra_itens.map((item: any) => ({
        insumo_id: item.insumo_id,
        quantidade: Number(item.quantidade),
        valor_unitario: Number(item.valor_unitario)
      }));
      setItens(itensFormatados);
    } else {
      setItens([]);
    }
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);
  const ordensFiltradas = ordens.filter(oc => {
    const termo = busca.toLowerCase().trim();
    return !termo || oc.id.toLowerCase().includes(termo) || oc.clientes?.nome?.toLowerCase().includes(termo);
  });

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}><Settings size={26} /> PCP — Emitir Ordem de Compra</h2>

      <FormularioOC 
        {...{
          fornecedores, fornecedorId, setFornecedorId, dataVencimento, setDataVencimento, 
          itens, setItens, idEditando, setIdEditando, insumoId, setInsumoId, qtd, setQtd, 
          valUnit, setValUnit, incluirItemNaGrid, handleSalvarOC, totalGeralCalculado,
          termoPesquisa, setTermoPesquisa, listaFornecedores, buscandoBanco
        }} 
      />

      <div style={S.buscaContainerStyle}>
        <input type="text" placeholder="Buscar ordens de compra..." value={busca} onChange={e => setBusca(e.target.value)} style={S.inputBuscaStyle} />
        <Search size={18} style={S.iconeBuscaStyle} />
      </div>

      <ListaOC 
        {...{carregando, ordensFiltradas, setIdEditando, setFornecedorId, setDataVencimento, setItens, ativarEdicaoOC}} 
      />
    </div>
  );
}
