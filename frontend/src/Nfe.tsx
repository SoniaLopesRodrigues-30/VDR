import React, { useState } from 'react';
import { Plus, Search, FileText, Download, AlertTriangle, CheckCircle, XCircle, X, Trash2, Package } from 'lucide-react';
import './Nfe.css'; 

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
  quantidadeVolumes?: string; 
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string; 
}

export default function Nfe() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

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
  // Histórico Inicial de Notas Fiscais
  const [notas, setNotas] = useState<NotaFiscal[]>([
    {
      id: 1,
      numero: '000.004.125',
      serie: '001',
      cliente: 'Tech Soluções Ltda',
      documento: '12.345.678/0001-99',
      dataEmissao: '20/07/2026',
      valorBruto: 1000.00,
      icms: 0,
      pis: 0,
      cofins: 0,
      valorLiquido: 1000.00,
      status: 'Autorizada',
      itens: [
        { id: '1', descricao: 'Notebook Corp Core i5', ncm: '8471.30.12', unidade: 'UN', quantidade: 1, valorUnitario: 1000.00, valorTotalItem: 1000.00 }
      ],
      quantidadeVolumes: '1',
      especieVolumes: 'CX',
      pesoBruto: '1.500',
      pesoLiquido: '1.200',
      informacoesComplementares: 'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.'
    }
  ]);

  // Adiciona um item temporariamente na lista da nota fiscal atual
  const handleAdicionarItemTabela = () => {
    if (!itemDescricao || !itemNcm || !itemQuantidade || !itemValorUnitario) {
      alert('Preencha todos os dados do produto para adicioná-lo à nota.');
      return;
    }
    const qtd = parseFloat(itemQuantidade);
    const vUnit = parseFloat(itemValorUnitario);
    
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
    setItemDescricao('');
    setItemNcm('');
    setItemUnidade('UN');
    setItemQuantidade('');
    setItemValorUnitario('');
  };

  const handleRemoverItemTabela = (id: string) => {
    setItensAdicionados(itensAdicionados.filter(item => item.id !== id));
  };

  // Lógica de Somatórios e Impostos (Simples Nacional - Sem destaque de impostos)
  const valorBrutoCalculado = itensAdicionados.reduce((soma, item) => soma + item.valorTotalItem, 0);
  const calcIcms = 0;
  const calcPis = 0;
  const calcCofins = 0;
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

    const proximoNumero = String(notas.length + 4125).padStart(6, '0');
    
    const novaNota: NotaFiscal = {
      id: Date.now(),
      numero: `000.${proximoNumero.slice(0, 3)}.${proximoNumero.slice(3)}`,
      serie: '001',
      cliente: clienteSelecionado,
      documento: docCliente,
      dataEmissao: new Date().toLocaleDateString('pt-BR'),
      valorBruto: valorBrutoCalculado,
      icms: calcIcms,
      pis: calcPis,
      cofins: calcCofins,
      valorLiquido: valorLiquidoCalculado,
      status: 'Autorizada',
      itens: itensAdicionados,
      quantidadeVolumes: qtdVolumes || '0',
      especieVolumes: especieVolumes,
      pesoBruto: pesoBruto ? parseFloat(pesoBruto).toFixed(3) : '0.000',
      pesoLiquido: pesoLiquido ? parseFloat(pesoLiquido).toFixed(3) : '0.000',
      informacoesComplementares: infoComplementares
    };

    setNotas([novaNota, ...notas]);
    fecharModal();
  };

  const fecharModal = () => {
    setClienteSelecionado('');
    setDocCliente('');
    setNaturezaOperacao('Venda de Mercadoria');
    setItensAdicionados([]);
    setQtdVolumes(''); 
    setEspecieVolumes('CX'); 
    setPesoBruto('');
    setPesoLiquido('');
    setInfoComplementares('DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.');
    setModalAberto(false);
  };

  const notasFiltradas = notas.filter(nota =>
    nota.cliente.toLowerCase().includes(busca.toLowerCase()) ||
    nota.numero.includes(busca) ||
    nota.documento.includes(busca)
  );

  const getStatusStyle = (status: NotaFiscal['status']) => {
    if (status === 'Autorizada') return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} /> };
    if (status === 'Pendente') return { bg: '#fef3c7', text: '#b45309', icon: <AlertTriangle size={14} /> };
    return { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} /> };
  };
  return (
    <div className="nfe-container">
      
      {/* CABEÇALHO */}
      <div className="nfe-header">
        <div>
          <h1 className="nfe-title">Notas Fiscais (NF-e)</h1>
          <p className="nfe-subtitle">Emissão completa com discriminação de produtos, NCM e impostos detalhados.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-emitir">
          <Plus size={18} /> Emitir Nova NF-e
        </button>
      </div>

      {/* FILTRO DE BUSCA */}
      <div className="search-container">
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por Nº da nota, cliente ou CPF/CNPJ..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
        />
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className="table-wrapper">
        <table className="main-table">
          <thead>
            <tr>
              <th>Número / Série</th>
              <th>Destinatário / Cliente</th>
              <th>Data de Emissão</th>
              <th>Valor Total da Nota</th>
              <th>Status SEFAZ</th>
              <th className="th-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {notasFiltradas.map((nota) => {
              const estilo = getStatusStyle(nota.status);
              return (
                <tr key={nota.id}>
                  <td className="td-numero">
                    {nota.numero}
                    <span className="sublabel-serie">Série: {nota.serie}</span>
                    {nota.quantidadeVolumes && (
                      <div className="td-transport-group">
                        <span className="td-vol-label">
                          Vol: {nota.quantidadeVolumes} ({nota.especieVolumes})
                        </span>
                        {nota.pesoBruto && (
                          <span className="td-peso-label">
                            P. Bruto: {nota.pesoBruto} kg | P. Líq: {nota.pesoLiquido} kg
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="td-cliente">
                    <span className="cliente-nome">{nota.cliente}</span>
                    <span className="sublabel-doc">{nota.documento}</span>
                    {nota.informacoesComplementares && (
                      <div className="td-observacao">
                        <strong>Obs:</strong> {nota.informacoesComplementares}
                      </div>
                    )}
                  </td>

                  <td className="td-data">
                    {nota.dataEmissao}
                  </td>
                  <td className="td-liquido-total">
                    {nota.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>
                    <span className="badge-status" style={{ backgroundColor: estilo.bg, color: estilo.text }}>
                      {estilo.icon} {nota.status}
                    </span>
                  </td>
                  <td className="td-acoes">
                    <button type="button" title="Visualizar XML / DANFE" className="btn-icon-gray"><FileText size={16} /></button>
                    <button type="button" title="Baixar PDF" className="btn-icon-blue"><Download size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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

              {/* LINHA: DADOS DE TRANSPORTES / VOLUMES E PESOS */}
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

              {/* SEÇÃO ADICIONAR PRODUTOS */}
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
                          <td className="td-internal-desc">{item.descricao} <span className="td-internal-un">({item.unidade})</span></td>
                          <td className="td-internal-ncm">{item.ncm}</td>
                          <td>{item.quantidade} x R$ {item.valorUnitario.toFixed(2)}</td>
                          <td className="td-internal-subtotal">R$ {item.valorTotalItem.toFixed(2)}</td>
                          <td className="th-center">
                            <button type="button" onClick={() => handleRemoverItemTabela(item.id)} className="btn-remove-item"><Trash2 size={14} /></button>
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
