import React, { useState } from 'react';
import { Plus, Search, FileText, Download, AlertTriangle, CheckCircle, XCircle, X, Trash2, Package } from 'lucide-react';
import './Nfe.css'; // Importação do arquivo de estilos que você acabou de criar!

interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  valorBruto: number;
  icms: number;
  pis: number;
  cofins: number;
  valorLiquido: number;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
}
      {/* MODAL DE EMISSÃO COM SEÇÃO DE PRODUTOS */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <button type="button" onClick={fecharModal} className="btn-close-modal">
              <X size={20} />
            </button>

            <h3 className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
            <p className="modal-subtitle">Preencha os dados e adicione os itens da nota eletrônica.</p>

            <form onSubmit={handleEmitirNfe} className="form-layout">
              
              {/* DADOS DO CLIENTE */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '1 1 150px' }}>
                  <label className="form-label">Natureza da Operação</label>
                  <select value={naturezaOperacao} onChange={e => setNaturezaOperacao(e.target.value)} className="input-field">
                    <option value="Venda de Mercadoria">Venda de Mercadoria</option>
                    <option value="Prestação de Serviço">Prestação de Serviço</option>
                    <option value="Remessa para Conserto">Remessa para Conserto</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '2 1 240px' }}>
                  <label className="form-label">Destinatário *</label>
                  <input type="text" required value={clienteSelecionado} onChange={e => setClienteSelecionado(e.target.value)} placeholder="Razão Social ou Nome" className="input-field" />
                </div>
                <div className="form-group" style={{ flex: '1 1 160px' }}>
                  <label className="form-label">CPF / CNPJ *</label>
                  <input type="text" required value={docCliente} onChange={e => setDocCliente(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
                </div>
              </div>

              {/* SEÇÃO ADICIONAR PRODUTOS */}
              <div className="section-divider">
                <span className="section-subtitle">
                  <Package size={16} /> Adicionar Itens à Nota
                </span>
                
                <div className="form-row" style={{ marginBottom: '10px', gap: '10px' }}>
                  <div className="form-group" style={{ flex: '2 1 200px' }}>
                    <input type="text" value={itemDescricao} onChange={e => setItemDescricao(e.target.value)} placeholder="Descrição do Produto" className="input-field" />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 100px' }}>
                    <input type="text" value={itemNcm} onChange={e => setItemNcm(e.target.value)} placeholder="NCM (Ex: 8471)" className="input-field" />
                  </div>
                  <div className="form-group" style={{ flex: '0 0 70px' }}>
                    <select value={itemUnidade} onChange={e => setItemUnidade(e.target.value)} className="input-field">
                      <option value="UN">UN</option>
                      <option value="KG">KG</option>
                      <option value="PC">PÇ</option>
                      <option value="CX">CX</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1 1 70px' }}>
                    <input type="number" min="1" value={itemQuantidade} onChange={e => setItemQuantidade(e.target.value)} placeholder="Qtd" className="input-field" />
                  </div>
                  <div className="form-group" style={{ flex: '1 1 90px' }}>
                    <input type="number" step="0.01" value={itemValorUnitario} onChange={e => setItemValorUnitario(e.target.value)} placeholder="R$ Unit." className="input-field" />
                  </div>
                  <div style={{ flex: '0 0 42px' }}>
                    <button type="button" onClick={handleAdicionarItemTabela} className="btn-add-item">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTAGEM TEMPORÁRIA DOS ITENS ADICIONADOS */}
              {itensAdicionados.length > 0 && (
                <div className="internal-table-wrapper">
                  <table className="internal-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>NCM</th>
                        <th>Qtd</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensAdicionados.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '500' }}>{item.descricao} <span style={{ color: '#64748b', fontSize: '10px' }}>({item.unidade})</span></td>
                          <td style={{ fontFamily: 'monospace' }}>{item.ncm}</td>
                          <td>{item.quantidade} x R$ {item.valorUnitario.toFixed(2)}</td>
                          <td style={{ fontWeight: '600' }}>R$ {item.valorTotalItem.toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button type="button" onClick={() => handleRemoverItemTabela(item.id)} className="btn-remove-item"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TOTAIS E CÁLCULO DE TRIBUTOS EM TEMPO REAL */}
              {valorBrutoCalculado > 0 && (
                <div className="tax-panel">
                  <div className="tax-row-products">
                    <span>Valor Bruto dos Produtos:</span>
                    <span style={{ fontWeight: '700' }}>{valorBrutoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="tax-row-estimate">
                    <span>Retenção Estimada de Impostos (ICMS 18% + PIS/COFINS 9,25%):</span>
                    <span style={{ color: '#b91c1c', fontWeight: '500' }}>- {(calcIcms + calcPis + calcCofins).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="tax-row-total">
                    <span>Valor Líquido da Nota:</span>
                    <span style={{ color: '#16a34a' }}>{valorLiquidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              )}

              {/* BOTÕES DE AÇÃO */}
              <div className="modal-footer">
                <button type="button" onClick={fecharModal} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-transmit">
                  Transmitir NF-e
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
