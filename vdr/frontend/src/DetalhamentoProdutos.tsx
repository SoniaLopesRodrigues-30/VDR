/// DetalhamentoProdutos.tsx
import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import type { ItemNota } from './useNfeForm';
interface DetalhamentoProdutosProps {
  produtoInput: any;
  itensAdicionados: ItemNota[];
  updateProdutoInput: (field: string, value: string) => void;
  handleAdicionarItemTabela: () => void;
  handleRemoverItemTabela: (id: string) => void;
}


export function DetalhamentoProdutos({
  produtoInput,
  itensAdicionados,
  updateProdutoInput,
  handleAdicionarItemTabela,
  handleRemoverItemTabela
}: DetalhamentoProdutosProps) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle">
        <Package size={16} /> 3. Detalhamento de Itens e Produtos
      </legend>
      <div className="form-row mb-items gap-items">
        <div className="form-group fg-prod-desc">
          <label className="form-label">Descrição do Produto</label>
          <input type="text" value={produtoInput.descricao} onChange={e => updateProdutoInput('descricao', e.target.value)} placeholder="Ex: Monitor LED 24" className="input-field" />
        </div>
        <div className="form-group fg-prod-ncm">
          <label className="form-label">NCM (Fiscal)</label>
          <input type="text" value={produtoInput.ncm} onChange={e => updateProdutoInput('ncm', e.target.value)} placeholder="Ex: 8471.60.20" className="input-field" />
        </div>
        <div className="form-group fg-prod-un">
          <label className="form-label">Unidade</label>
          <select value={produtoInput.unidade} onChange={e => updateProdutoInput('unidade', e.target.value)} className="input-field">
            <option value="UN">UN</option>
            <option value="KG">KG</option>
            <option value="PC">PÇ</option>
            <option value="CX">CX</option>
          </select>
        </div>
        <div className="form-group fg-prod-qtd">
          <label className="form-label">Qtd.</label>
          <input type="number" value={produtoInput.quantidade} onChange={e => updateProdutoInput('quantidade', e.target.value)} placeholder="0" className="input-field" />
        </div>
        <div className="form-group fg-prod-val">
          <label className="form-label">Valor Unit.</label>
          <input type="number" step="0.01" value={produtoInput.valorUnitario} onChange={e => updateProdutoInput('valorUnitario', e.target.value)} placeholder="R$ 0,00" className="input-field" />
        </div>
        <div className="fg-btn-add">
          <button type="button" onClick={handleAdicionarItemTabela} className="btn-add-item" title="Adicionar produto">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* LISTAGEM TEMPORÁRIA DOS ITENS */}
      {itensAdicionados.length > 0 && (
        <div className="internal-table-wrapper">
          <table className="internal-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>NCM</th>
                <th>Qtd x Unitário</th>
                <th>Subtotal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensAdicionados.map((item) => (
                <tr key={item.id}>
                  <td className="td-internal-desc">{item.descricao} <span className="td-internal-un">({item.unidade})</span></td>
                  <td className="td-internal-ncm">{item.ncm}</td>
                  <td>{item.quantidade} x R$ {item.valorUnitario.toFixed(2)}</td>
                  <td className="td-internal-subtotal">R$ {item.valorTotalItem.toFixed(2)}</td>
                  <td className="th-center">
                    <button type="button" onClick={() => handleRemoverItemTabela(item.id)} className="btn-remove-item" title="Remover item">
                      <Trash2 size={14} />
                    </button>
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
