

import React, { useState } from 'react';
import { useOrcamentos } from './useOrcamentos';
import { FileText, Plus, Trash2, Edit2, Search, Calendar, FileCheck } from 'lucide-react';

export default function Orcamentos() {
  const {
    busca, setBusca, carregando, clientes, itens, setItens,
    form, setForm, idEditando, setIdEditando,
    orcamentosFiltrados, handleSalvarOrcamento, iniciarEdicao, converterOrcamentoEmOS
  } = useOrcamentos();

  // Estados do formulário da linha de item
  const [especificacao, setEspecificacao] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);
  const [dataItem, setDataItem] = useState('');

  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os dados do item (Especificação, Qtd, Valor e Data).');
      return;
    }
    
    setItens([
      ...itens, 
      { produto_id: especificacao, quantidade: qtd, valor_unitario: valUnit, data_item: dataItem }
    ]);
    
    // Limpa campos do item
    setEspecificacao(''); setQtd(1); setValUnit(0); setDataItem('');
  };

  const removerItemDaGrid = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const totalGeralOrcamento = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);

  return (
    <div style={{ padding: '24px', color: '#cbd5e1', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileText size={26} /> Cadastro de Orçamentos
      </h2>

      {/* FORMULÁRIO */}
      <form onSubmit={handleSalvarOrcamento} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Cliente *</label>
            <select value={form.clienteId} onChange={e => setForm({...form, clienteId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
              <option value="">Selecione o Cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Validade Geral do Orçamento *</label>
            <input type="date" value={form.validade} onChange={e => setForm({...form, validade: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
          </div>
        </div>

        {/* INCLUSÃO DE PRODUTO / MÃO DE OBRA */}
        <div style={{ border: '1px solid #334155', padding: '16px', borderRadius: '6px', backgroundColor: '#131e31', marginBottom: '20px' }}>
          <h4 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>Inserir Produto ou Mão de Obra</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.5fr', gap: '10px' }}>
            <input type="text" placeholder="Especificação (Ex: Memória RAM ou Mão de obra)" value={especificacao} onChange={e => setEspecificacao(e.target.value)} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            <input type="number" placeholder="Qtd" value={qtd} onChange={e => setQtd(Number(e.target.value))} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            <input type="number" placeholder="Preço (R$)" value={valUnit} onChange={e => setValUnit(Number(e.target.value))} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            <input type="date" value={dataItem} onChange={e => setDataItem(e.target.value)} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
            <button type="button" onClick={incluirItemNaGrid} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}><Plus size={20}/></button>
          </div>
        </div>

        {/* LISTAGEM DOS ITENS ADICIONADOS */}
        {itens.length > 0 && (
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0f172a', borderRadius: '4px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Especificação (Prod/Serv)</th>
                  <th style={{ padding: '12px' }}>Qtd</th>
                  <th style={{ padding: '12px' }}>Valor Unit.</th>
                  <th style={{ padding: '12px' }}>Data do Item</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px' }}>{item.produto_id}</td>
                    <td style={{ padding: '12px' }}>{item.quantidade}</td>
                    <td style={{ padding: '12px' }}>R$ {Number(item.valor_unitario).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}><span style={{ color: '#38bdf8', fontSize: '13px' }}><Calendar size={12} style={{ marginRight: '4px' }}/>{item.data_item}</span></td>
                    <td style={{ padding: '12px' }}>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <button type="button" onClick={() => removerItemDaGrid(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <h3 style={{ color: '#22c55e', margin: 0 }}>Total Geral: R$ {totalGeralOrcamento.toFixed(2)}</h3>
          <div>
            <button type="submit" style={{ backgroundColor: '#22c55e', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar Orçamento</button>
            {idEditando && <button type="button" onClick={() => { setIdEditando(null); setForm(estadoInicialForm); setItens([]); }} style={{ marginLeft: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
          </div>
        </div>
      </form>

      {/* HISTÓRICO */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input type="text" placeholder="Buscar orçamento por código ou cliente..." value={busca} onChange={e => setBusca(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {carregando ? <p>Conectando ao Supabase...</p> : orcamentosFiltrados.map(orc => (
          <div key={orc.id} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{orc.id}</span> - <span style={{ fontWeight: '500' }}>{orc.clientes?.nome}</span>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Itens cadastrados: {orc.orcamento_itens?.length || 0} | Validade: {orc.validade}</div>
              <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>R$ {Number(orc.valor_total).toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => iniciarEdicao(orc)} style={{ background: '#334155', border: 'none', padding: '8px', color: '#38bdf8', cursor: 'pointer', borderRadius: '4px' }}><Edit2 size={16}/></button>
              {orc.status === 'Pendente' && (
                <button onClick={() => converterOrcamentoEmOS(orc)} style={{ background: '#15803d', border: 'none', padding: '8px 12px', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileCheck size={16}/> Gerar OS
                </button>
              )}
              {orc.status === 'Aprovado' && <span style={{ padding: '6px 12px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>Convertido</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

