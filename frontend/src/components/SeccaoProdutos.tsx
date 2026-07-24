import React from 'react';
import { Package, Trash2 } from 'lucide-react';

export function SeccaoProdutos({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><Package size={16} /> 3. Detalhamento de Itens e Produtos</legend>
      <div className="form-row gap-items">
        <div className="form-group">
          <label className="form-label">Descrição do Produto</label>
          <input type="text" value={state.itemDescricao} onChange={e => state.setItemDescricao(e.target.value)} placeholder="Ex: Monitor LED 24" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">NCM (Fiscal)</label>
          <input type="text" value={state.itemNcm} onChange={e => state.setItemNcm(e.target.value)} placeholder="Ex: 8471.60.20" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Unidade</label>
          <select value={state.itemUnidade} onChange={e => state.setItemUnidade(e.target.value)} className="input-field">
            <option value="UN">UN</option><option value="PC">PC</option><option value="KG">KG</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Qtd</label>
          <input type="number" value={state.itemQuantidade} onChange={e => state.setItemQuantidade(e.target.value)} placeholder="1" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Val. Unitário</label>
          <input type="number" step="0.01" value={state.itemValorUnitario} onChange={e => state.setItemValorUnitario(e.target.value)} placeholder="0.00" className="input-field" />
        </div>
        <button type="button" onClick={state.handleAdicionarItemTabela} className="btn-add-item" style={{ marginTop: '20px', height: '38px' }}>Adicionar</button>
      </div>

      {state.itensAdicionados.length > 0 && (
        <div className="internal-table-wrapper">
          <table className="internal-table">
            <thead>
              <tr><th>Produto</th><th>NCM</th><th>Qtd x Unitário</th><th>Subtotal</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {state.itensAdicionados.map((item: any) => (
                <tr key={item.id}>
                  <td className="td-internal-desc">{item.descricao} <span className="td-internal-un">({item.unidade})</span></td>
                  <td className="td-internal-ncm">{item.ncm}</td>
                  <td>{item.quantidade} x R$ {item.valorUnitario.toFixed(2)}</td>
                  <td className="td-internal-subtotal">R$ {item.valorTotalItem.toFixed(2)}</td>
                  <td className="th-center">
                    <button type="button" onClick={() => state.handleRemoverItemTabela(item.id)} className="btn-remove-item"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </fieldset>
  );
}
