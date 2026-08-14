import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FileText, Search } from 'lucide-react';
import * as S from './Orcamentos.styles';

// Importação dos subcomponentes novos
import { FormularioOrcamento } from './FormularioOrcamento';
import { ListaOrcamentos } from './ListaOrcamentos';
import { gerarHtmlOrcamento } from './LayoutImpressao';

interface ItemOrcamento {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  data_item: string;
}

export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
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
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setClientes(dadosClientes);      
      
      // ✅ CORREÇÃO: Alterado de clientes(nome) para clientes(*) e garantido a tabela correta orcamento_itens(*)
      const { data: dadosOrcamentos } = await supabase.from('orcamentos').select('*, clientes(*), orcamento_itens(*)');
      if (dadosOrcamentos) setOrcamentos(dadosOrcamentos);
    } catch (err) {
      console.error('Erro de conexão:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDadosDoBanco(); }, []);

  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os campos do item.');
      return;
    }
    setItens([...itens, { produto_id: especificacao, quantidade: qtd, valor_unitario: valUnit, data_item: dataItem }]);
    setEspecificacao(''); setQtd(1); setValUnit(0); setDataItem('');
  };

  const handleSalvarOrcamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um item.');
      return;
    }
    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOrcamento = idEditando || `ORC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (idEditando) {
        await supabase.from('orcamentos').update({ cliente_id: Number(clienteId), validade, valor_total: valorTotal }).eq('id', idEditando);
        await supabase.from('orcamento_itens').delete().eq('orcamento_id', idEditando);
      } else {
        await supabase.from('orcamentos').insert([{ id: codigoOrcamento, cliente_id: Number(clienteId), validade, status: 'Pendente', valor_total: valorTotal }]);
      }
      const payloadItens = itens.map(item => ({
        orcamento_id: codigoOrcamento, produto_id: item.produto_id, quantidade: item.quantidade, valor_unitario: item.valor_unitario, data_item: item.data_item
      }));
      await supabase.from('orcamento_itens').insert(payloadItens);
      alert('Orçamento gravado com sucesso!');
      
      // ✅ CORREÇÃO: Limpa todos os estados após o salvamento, inclusive redefinindo idEditando para nulo
      setClienteId(''); 
      setValidade(''); 
      setItens([]); 
      setIdEditando(null);
      await carregarDadosDoBanco();
    } catch (error) {
      alert('Erro ao salvar orçamento.');
    }
  };

  const converterEmOS = async (orc: any) => {
    if (!confirm(`Deseja aprovar e converter em OS?`)) return;
    const codigoOS = `OS-${orc.id.replace('ORC-', '')}`;
    try {
      await supabase.from('orcamentos').update({ status: 'Aprovado' }).eq('id', orc.id);
      await supabase.from('ordens_servico').insert([{ id: codigoOS, cliente_id: orc.cliente_id, validade: orc.validade, status: 'Em Execução', valor_total: orc.valor_total }]);
      
      // ✅ CORREÇÃO: Mapeia o nome correto da chave orcamento_itens
      if (orc.orcamento_itens && orc.orcamento_itens.length > 0) {
        const payloadItensOS = orc.orcamento_itens.map((item: any) => ({ 
          os_id: codigoOS, 
          produto_id: item.produto_id, 
          quantidade: item.quantidade, 
          valor_unitario: item.valor_unitario, 
          data_item: item.data_item 
        }));
        await supabase.from('ordens_servico_itens').insert(payloadItensOS);
      }
      alert(`Sucesso! Criada a ${codigoOS}`);
      await carregarDadosDoBanco();
    } catch (err) { alert('Erro ao converter em OS.'); }
  };

  const lidarComImpressao = (orc: any) => {
    if (!orc) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(gerarHtmlOrcamento(orc, "/logo.png"));
      doc.close();
    }

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);
  const orcamentosFiltrados = orcamentos.filter(orc => {
    const termo = busca.toLowerCase().trim();
    return !termo || orc.id.toLowerCase().includes(termo) || orc.clientes?.nome?.toLowerCase().includes(termo);
  });

  // ✅ NOVA FUNÇÃO LOCAL: Garante que os itens entrem na grid de forma segura e tratada ao editar
  const ativarEdicaoOrcamento = (orc: any) => {
    setIdEditando(orc.id);
    setClienteId(String(orc.cliente_id));
    
    if (orc.validade) {
      setValidade(orc.validade.split('T')[0]);
    } else {
      setValidade('');
    }

    if (orc.orcamento_itens) {
      const itensFormatados = orc.orcamento_itens.map((item: any) => ({
        produto_id: item.produto_id || '',
        quantidade: Number(item.quantidade || 0),
        valor_unitario: Number(item.valor_unitario || 0),
        data_item: item.data_item ? item.data_item.split('T')[0] : ''
      }));
      setItens(itensFormatados);
    } else {
      setItens([]);
    }
  };

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}><FileText size={26} /> Cadastro de Orçamentos</h2>

      <FormularioOrcamento 
        {...{clientes, clienteId, setClienteId, validade, setValidade, itens, setItens, idEditando, setIdEditando, especificacao, setEspecificacao, qtd, setQtd, valUnit, setValUnit, dataItem, setDataItem, incluirItemNaGrid, handleSalvarOrcamento, totalGeralCalculado}} 
      />

      <div style={S.buscaContainerStyle}>
        <input type="text" placeholder="Buscar orçamentos..." value={busca} onChange={e => setBusca(e.target.value)} style={S.inputBuscaStyle} />
        <Search size={18} style={S.iconeBuscaStyle} />
      </div>

      <ListaOrcamentos 
        {...{carregando, orcamentosFiltrados, setIdEditando: ativarEdicaoOrcamento, setClienteId, setValidade, setItens, lidarComImpressao, converterEmOS}} 
      />
    </div>
  );
}
