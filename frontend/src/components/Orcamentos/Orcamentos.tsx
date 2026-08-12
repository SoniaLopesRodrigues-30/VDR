import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { FileText, Plus, Trash2, Edit2, Search, Calendar, FileCheck } from 'lucide-react';

// IMPORTAÇÃO DOS ESTILOS ISOLADOS QUE CRIAMOS NA ETAPA 1
import * as S from './Orcamentos.styles';

interface ItemOrcamento {
  produto_id: string; // Recebe a especificação textual do produto/mão de obra
  quantidade: number;
  valor_unitario: number;
  data_item: string;   // Data individual por item
}

export default function Orcamentos() {
  // ==========================================
  // 1. ESTADOS CENTRALIZADOS E PROTEGIDOS
  // ==========================================
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [clienteId, setClienteId] = useState('');
  const [validade, setValidade] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null);

  // Estados locais para controle da linha de digitação de itens
  const [especificacao, setEspecificacao] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);
  const [dataItem, setDataItem] = useState('');

  // ==========================================
  // 2. CONEXÃO ASSÍNCRONA COM O SUPABASE
  // ==========================================
  const carregarDadosDoBanco = async () => {
    try {
      setCarregando(true);
      // Puxa clientes ativos para popular o seletor
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setClientes(dadosClientes);

      // Puxa orçamentos trazendo os dados do cliente e a lista de itens vinculada
      const { data: dadosOrcamentos } = await supabase.from('orcamentos').select('*, clientes(nome), orcamento_itens(*)');
      if (dadosOrcamentos) setOrcamentos(dadosOrcamentos);
    } catch (err) {
      console.error('Erro de conexão com o Supabase:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  // ==========================================
  // 3. REGRAS DE NEGÓCIO E EVENTOS
  // ==========================================
  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os campos do item (Especificação, Qtd, Valor e Data).');
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
        orcamento_id: codigoOrcamento,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        data_item: item.data_item
      }));

      await supabase.from('orcamento_itens').insert(payloadItens);
      
      alert('Orçamento gravado com sucesso!');
      setClienteId(''); setValidade(''); setItens([]); setIdEditando(null);
      await carregarDadosDoBanco();
    } catch (error) {
      alert('Erro ao processar salvamento do orçamento.');
    }
  };

  // MÓDULO DE CONVERSÃO: Transforma Orçamento Aprovado em OS (Mantendo a estrutura idêntica de itens)
  const converterEmOS = async (orc: any) => {
    if (!confirm(`Deseja aprovar o orçamento ${orc.id} e convertê-lo em uma Ordem de Serviço real?`)) return;
    
    const codigoOS = `OS-${orc.id.replace('ORC-', '')}`;
    
    try {
      // 1. Atualiza o status do orçamento no banco
      await supabase.from('orcamentos').update({ status: 'Aprovado' }).eq('id', orc.id);
      
      // 2. Cria a nova OS com os mesmos cabeçalhos
      await supabase.from('ordens_servico').insert([{
        id: codigoOS,
        cliente_id: orc.cliente_id,
        validade: orc.validade,
        status: 'Em Execução',
        valor_total: orc.valor_total
      }]);

      // 3. Copia e migra os itens idênticos para a tabela da OS
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

      alert(`Sucesso! Orçamento aprovado e convertido na ${codigoOS}`);
      await carregarDadosDoBanco();
    } catch (err) {
      alert('Erro ao converter orçamento em OS.');
    }
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);

  const orcamentosFiltrados = orcamentos.filter(orc => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return orc.id.toLowerCase().includes(termo) || orc.clientes?.nome?.toLowerCase().includes(termo);
  });

  // ==========================================
  // 4. FUNÇÕES DE RENDERIZAÇÃO ISOLADAS
  // ==========================================
  const renderGradeDigitacao = () => (
    <div style={S.gridDigitacaoStyle}>
      <h4 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>Inserir Item no Orçamento</h4>
      <div style={S.gridCamposItemStyle}>
        <input type="text" placeholder="Produto / Mão de Obra" value={especificacao} onChange={e => set開設cificacao(e.target.value)} style={S.inputItemStyle} />
        <input type="number" placeholder="Qtd" value={qtd} onChange={e => setQtd(Number(e.target.value))} style={S.inputItemStyle} />
        <input type="number" placeholder="Preço (R$)" value={valUnit} onChange={e => setValUnit(Number(e.target.value))} style={S.inputItemStyle} />
        <input type="date" value={dataItem} onChange={e => setDataItem(e.target.value)} style={S.inputItemStyle} />
        <button type="button" onClick={incluirItemNaGrid} style={S.botaoAdicionarStyle}><Plus size={20}/></button>
      </div>
    </div>
  );

  const renderTabelaItensAdicionados = () => (
    <div style={S.tabelaContainerStyle}>
      <table style={S.tabelaStyle}>
        <thead>
          <tr>
            <th style={S.thStyle}>Especificação</th>
            <th style={S.thStyle}>Qtd</th>
            <th style={S.thStyle}>Valor Unit.</th>
            <th style={S.thStyle}>Data Individual</th>
            <th style={S.thStyle}>Total</th>
            <th style={S.thStyle}>Remover</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, idx) => (
            <tr key={idx}>
              <td style={S.tdStyle}>{item.produto_id}</td>
              <td style={S.tdStyle}>{item.quantidade}</td>
              <td style={S.tdStyle}>R$ {Number(item.valor_unitario).toFixed(2)}</td>
              <td style={S.tdStyle}><span style={{ color: '#38bdf8' }}><Calendar size={12}/> {item.data_item}</span></td>
              <td style={S.tdStyle}>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
              <td style={S.tdStyle}>
                <button type="button" onClick={() => setItens(itens.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFiltroBusca = () => (
    <div style={S.buscaContainerStyle}>
      <input type="text" placeholder="Buscar orçamentos..." value={busca} onChange={e => setBusca(e.target.value)} style={S.inputBuscaStyle} />
      <Search size={18} style={S.iconeBuscaStyle} />
    </div>
  );
  // ==========================================
  // 5. ESTRUTURA VISUAL DA PÁGINA
  // ==========================================
  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}>
        <FileText size={26} /> Cadastro de Orçamentos
      </h2>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSalvarOrcamento} style={S.formStyle}>
        <div style={S.gridFormStyle}>
          <div>
            <label style={S.labelStyle}>Cliente *</label>
            <select 
              value={clienteId} 
              onChange={e => setClienteId(e.target.value)} 
              style={S.inputStyle}
            >
              <option value="">Selecione o Cliente...</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={S.labelStyle}>Validade Geral do Orçamento *</label>
            <input 
              type="date" 
              value={validade} 
              onChange={e => setValidade(e.target.value)} 
              style={S.inputStyle} 
            />
          </div>
        </div>

        {renderGradeDigitacao()}
        {itens.length > 0 && renderTabelaItensAdicionados()}

        <div style={S.rodapeFormStyle}>
          <h3 style={S.totalVerdeStyle}>Total Geral: R$ {totalGeralCalculado.toFixed(2)}</h3>
          <div>
            <button type="submit" style={S.botaoSalvarStyle}>
              {idEditando ? 'Atualizar Orçamento' : 'Salvar Orçamento'}
            </button>
            {idEditando && (
              <button 
                type="button" 
                onClick={() => { setIdEditando(null); setClienteId(''); setValidade(''); setItens([]); }} 
                style={S.botaoCancelarStyle}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {renderFiltroBusca()}

      {/* LISTAGEM DE PROPOSTAS DO BANCO DE DADOS */}
      <div style={S.listagemContainerStyle}>
        {carregando ? (
          <p style={{ color: '#94a3b8' }}>Carregando dados do Supabase...</p>
        ) : orcamentosFiltrados.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhum orçamento localizado.</p>
        ) : (
          orcamentosFiltrados.map((orc: any) => (
            <div key={orc.id} style={S.cardOrcamentoStyle}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{orc.id}</span> - <span style={{ fontWeight: '500', color: '#f8fafc' }}>{orc.clientes?.nome}</span>
                <div style={S.cardTextoStyle}>
                  Itens cadastrados: {orc.orcamento_itens ? orc.orcamento_itens.length : 0} | Status: <strong style={{ color: orc.status === 'Aprovado' ? '#16a34a' : orc.status === 'Recusado' ? '#ef4444' : '#ca8a04' }}>{orc.status}</strong> | Validade: {orc.validade}
                </div>
                <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>
                  R$ {Number(orc.valor_total || 0).toFixed(2)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => { 
                    setIdEditando(orc.id); 
                    setClienteId(String(orc.cliente_id)); 
                    setValidade(orc.validade); 
                    setItens(orc.orcamento_itens || []); 
                  }} 
                  style={S.botaoAcoesCardStyle}
                  title="Editar Orçamento"
                >
                  <Edit2 size={16}/>
                </button>
                
                {orc.status === 'Pendente' && (
                  <button 
                    type="button" 
                    onClick={() => converterEmOS(orc)} 
                    style={S.botaoAprovarCardStyle}
                    title="Aprovar e Gerar OS"
                  >
                    <FileCheck size={16}/> Gerar OS
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
