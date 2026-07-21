import React, { useState } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';

// DECLARAÇÃO DIRETA DOS TIPOS AQUI
export interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  valorBruto: number;
  valorLiquido: number;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
  quantidadeVolumes?: string;
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string;
}


export function ModalEmissaoNfe({ onClose, onEmitir, proximoNumeroSequencial }: ModalEmissaoProps) {
  // Estados do Formulário de Emissão
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria');
  
  // Estados para Adicionar Itens Dinamicamente
  const [itensAdicionados, setItensAdicionados] = useState<ItemNota[]>([]);
  const [itemDescricao, setItemDescricao] = useState('');
  const [itemNcm, setItemNcm] = useState('');
  const [itemUnidade, setItemUnidade] = useState('UN');
  const [itemQuantidade, setItemQuantidade] = useState('');
  const [itemValorUnitario, setItemValorUnitario] = useState('');

  // Estados para Dados de Transporte e Observações
  const [qtdVolumes, setQtdVolumes] = useState('');
  const [especieVolumes, setEspecieVolumes] = useState('CX');
  const [pesoBruto, setPesoBruto] = useState('');
  const [pesoLiquido, setPesoLiquido] = useState('');
  const [infoComplementares, setInfoComplementares] = useState(
    'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.'
  );

  const handleAdicionarItemTabela = () => {
    if (!itemDescricao || !itemNcm || !itemQuantidade || !itemValorUnitario) {
      alert('Preencha todos os dados do produto para adicioná-lo à nota.');
      return;
    }
    const qtd = parseFloat(itemQuantidade);
    const vUnit = parseFloat(itemValorUnitario);
    
    if (isNaN(qtd) || qtd <= 0 || isNaN(vUnit) || vUnit <= 0) {
      alert('Quantidade e Valor Unitário devem ser números válidos maiores que zero.');
      return;
    }

    const novoItem: ItemNota = {
      id: Date.now().toString(),
      descricao: itemDescricao,
      ncm: itemNcm,
      unidade: itemUnidade,
      quantidade: qtd,
      valorUnitario: vUnit,
      valorTotalItem: qtd * vUnit
    };

    setItensAdicionados([...itensAdicionados, novoItem]);
    limparCamposProduto();
  };

  const handleRemoverItemTabela = (id: string) => {
    setItensAdicionados(itensAdicionados.filter(item => item.id !== id));
  };

  const limparCamposProduto = () => {
    setItemDescricao('');
    setItemNcm('');
    setItemUnidade('UN');
    setItemQuantidade('');
    setItemValorUnitario('');
  };

  const valorBrutoCalculado = itensAdicionados.reduce((soma, item) => soma + item.valorTotalItem, 0);
  const valorLiquidoCalculado = valorBrutoCalculado;

  const handleEmitirNfe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteSelecionado || !docCliente) {
      alert('Por favor, preencha os dados do cliente.');
      return;
    }

    if (itensAdicionados.length === 0) {
      alert('Adicione pelo menos 1 produto para emitir a nota fiscal.');
      return;
    }

    const proximoNumero = String(proximoNumeroSequencial).padStart(6, '0');
    
    const novaNota: NotaFiscal = {
      id: Date.now(),
      numero: `000.${proximoNumero.slice(0, 3)}.${proximoNumero.slice(3)}`,
      serie: '001',
      cliente: clienteSelecionado,
      documento: docCliente,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      valorBruto: valorBrutoCalculado,
      valorLiquido: valorLiquidoCalculado,
      status: 'Autorizada',
      itens: itensAdicionados,
      quantidadeVolumes: qtdVolumes || '0',
      especieVolumes: especieVolumes,
      pesoBruto: pesoBruto ? parseFloat(pesoBruto).toFixed(3) : '0.000',
      pesoLiquido: pesoLiquido ? parseFloat(pesoLiquido).toFixed(3) : '0.000',
      informacoesComplementares: infoComplementares
    };

    onEmitir(novaNota);
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="btn-close-modal">
          <X size={20} />
        </button>

        <h3 className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
        <p className="modal-subtitle">Preencha os dados e adicione os itens da nota eletrônica.</p>

        <form onSubmit={handleEmitirNfe} className="form-layout">
          {/* DADOS DO CLIENTE */}
          <div className="form-row">
            <div className="form-group fg-natureza">
              <label className="form-label">Natureza da Operação</label>
              <select value={naturezaOperacao} onChange={e => setNaturezaOperacao(e.target.value)} className="input-field">
                <option value="Venda de Mercadoria">Venda de Mercadoria</option>
                <option value="Prestação de Serviço">Prestação de Serviço</option>
                <option value="Remessa para Conserto">Remessa para Conserto</option>
              </select>
            </div>
            <div className="form-group fg-destinatario">
              <label className="form-label">Destinatário *</label>
              <input type="text" required value={clienteSelecionado} onChange={e => setClienteSelecionado(e.target.value)} placeholder="Razão Social ou Nome" className="input-field" />
            </div>
            <div className="form-group fg-documento">
              <label className="form-label">CPF / CNPJ *</label>
              <input type="text" required value={docCliente} onChange={e => setDocCliente(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
            </div>
          </div>

          {/* DADOS DE TRANSPORTES */}
          <div className="form-row mt-negative">
            <div className="form-group fg-vol-qtd">
              <label className="form-label">Qtd. Volumes</label>
              <input type="number" min="0" value={qtdVolumes} onChange={e => setQtdVolumes(e.target.value)} placeholder="Ex: 2" className="input-field" />
            </div>
            <div className="form-group fg-vol-esp">
              <label className="form-label">Espécie Volumes</label>
              <select value={especieVolumes} onChange={e => setEspecieVolumes(e.target.value)} className="input-field">
                <option value="CX">CX (Caixa)</option>
                <option value="PC">PC (Pacote)</option>
                <option value="PL">PL (Palete)</option>
                <option value="SACO">SACO</option>
                <option value="VOL">VOL (Volume)</option>
              </select>
            </div>
            <div className="form-group fg-peso">
              <label className="form-label">Peso Bruto (KG)</label>
              <input type="number" min="0" step="0.001" value={pesoBruto} onChange={e => setPesoBruto(e.target.value)} placeholder="0,000" className="input-field" />
            </div>
            <div className="form-group fg-peso">
              <label className="form-label">Peso Líquido (KG)</label>
              <input type="number" min="0" step="0.001" value={pesoLiquido} onChange={e => setPesoLiquido(e.target.value)} placeholder="0,000" className="input-field" />
            </div>
          </div>

          {/* ADICIONAR PRODUTOS */}
          <div className="section-divider">
            <span className="section-subtitle">
              <Package size={16} /> Adicionar Itens à Nota
            </span>
            <div className="form-row mb-items gap-items">
              <div className="form-group fg-prod-desc">
                <input type="text" value={itemDescricao} onChange={e => setItemDescricao(e.target.value)} placeholder="Descrição do Produto" className="input-field" />
              </div>
              <div className="form-group fg-prod-ncm">
                <input type="text" value={itemNcm} onChange={e => setItemNcm(e.target.value)} placeholder="NCM (Ex: 8471)" className="input-field" />
              </div>
              <div className="form-group fg-prod-un">
                <select value={itemUnidade} onChange={e => setItemUnidade(e.target.value)} className="input-field">
                  <option value="UN">UN</option>
                  <option value="KG">KG</option>
                  <option value="PC">PÇ</option>
                  <option value="CX">CX</option>
                </select>
              </div>
              <div className="form-group fg-prod-qtd">
                <input type="number" min="1" value={itemQuantidade} onChange={e => setItemQuantidade(e.target.value)} placeholder="Qtd" className="input-field" />
              </div>
              <div className="form-group fg-prod-val">
                <input type="number" step="0.01" value={itemValorUnitario} onChange={e => setItemValorUnitario(e.target.value)} placeholder="R$ Unit." className="input-field" />
              </div>
              <div className="fg-btn-add">
                <button type="button" onClick={handleAdicionarItemTabela} className="btn-add-item">
                  <Plus size={18} />
                </button>
              </div>
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
                    <th>Qtd</th>
                    <th>Subtotal</th>
                    <th></th>
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
                        <button type="button" onClick={() => handleRemoverItemTabela(item.id)} className="btn-remove-item">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
       
          {/* TOTAIS E REGIME TRIBUTÁRIO */}
          {valorBrutoCalculado > 0 && (
            <div className="tax-panel">
              <div className="tax-row-products">
                <span>Total dos Produtos:</span>
                <span className="weight-bold">{valorBrutoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="tax-row-estimate">
                <span>Impostos Incidentes:</span>
                <span className="tax-free-badge">R$ 0,00 (Simples Nacional)</span>
              </div>
              <div className="tax-row-total">
                <span>Valor Total da Nota:</span>
                <span className="tax-total-value">{valorLiquidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>
          )}

          {/* CAMPO DE INFORMAÇÕES COMPLEMENTARES */}
          <div className="form-group fg-full-width mt-info">
            <label className="form-label">Informações Complementares / Observações Fiscais</label>
            <textarea 
              rows={3}
              value={infoComplementares} 
              onChange={e => setInfoComplementares(e.target.value)} 
              placeholder="Instruções adicionais, decretos estaduais..." 
              className="input-field textarea-field"
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-transmit">
              Transmitir NF-e
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
