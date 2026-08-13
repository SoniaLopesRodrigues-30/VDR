import React from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import * as S from './OrdensServico.styles';

export function FormularioOS({
  clientes,
  clienteId,
  setClienteId,
  validade,
  setValidade,
  itens,
  setItens,
  idEditando,
  setIdEditando,
  especificacao,
  setEspecificacao,
  qtd,
  setQtd,
  valUnit,
  setValUnit,
  dataItem,
  setDataItem,
  incluirItemNaGrid,
  handleSalvarOS,
  totalGeralCalculado
}) {
  return (
    <form onSubmit={handleSalvarOS} style={S.formStyle}>
      <div style={S.gridFormStyle}>
        <div>
          <label style={S.labelStyle}>Cliente *</label>
          <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={S.inputStyle}>
            <option value="">Selecione o Cliente...</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div>
          <label style={S.labelStyle}>Data Limite Geral *</label>
          <input type="date" value={validade} onChange={e => setValidade(e.target.value)} style={S.inputStyle} />
        </div>
      </div>

      <div style={S.gridDigitacaoStyle}>
        <h4 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>Inserir Item Realizado / Peça Usada</h4>
        <div style={S.gridCamposItemStyle}>
          <input type="text" placeholder="Produto / Mão de Obra" value={especificacao} onChange={e => setEspecificacao(e.target.value)} style={S.inputItemStyle} />
          <input type="number" placeholder="Qtd" value={qtd} onChange={e => setQtd(Number(e.target.value))} style={S.inputItemStyle} />
          <input type="number" placeholder="Valor (R$)" value={valUnit} onChange={e => setValUnit(Number(e.target.value))} style={S.inputItemStyle} />
          <input type="date" value={dataItem} onChange={e => setDataItem(e.target.value)} style={S.inputItemStyle} />
          <button type="button" onClick={incluirItemNaGrid} style={S.botaoAdicionarStyle}><Plus size={20}/></button>
        </div>
      </div>

      {itens.length > 0 && (
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
      )}

      <div style={S.rodapeFormStyle}>
        <h3 style={S.totalVerdeStyle}>Total Geral da OS: R$ {totalGeralCalculado.toFixed(2)}</h3>
        <div>
          <button type="submit" style={S.botaoSalvarStyle}>
            {idEditando ? 'Atualizar OS' : 'Salvar OS'}
          </button>
          {idEditando && (
            <button type="button" onClick={() => { setIdEditando(null); setClienteId(''); setValidade(''); setItens([]); }} style={S.botaoCancelarStyle}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
