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
  naturezaOperacao: string;
  cfop: string;
  destinoOperacao: string;
  finalidadeEmissao: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  dataSaida: string;
  horaSaida: string;
  valorBruto: number;
  icms: number;
  pis: number;
  cofins: number;
  valorLiquido: number;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
}

export default function Nfe() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário de Emissão
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria');
  const [cfop, setCfop] = useState('');
  const [destinoOperacao, setDestinoOperacao] = useState('1'); // 1 = Interna, 2 = Interestadual, 3 = Exterior
  const [finalidadeEmissao, setFinalidadeEmissao] = useState('1'); // 1 = Normal, 2 = Complementar, 3 = Ajuste, 4 = Devolução
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [horaSaida, setHoraSaida] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  
  // Estados para Adicionar Itens Dinamicamente
  const [itensAdicionados, setItensAdicionados] = useState<ItemNota[]>([]);
  const [itemDescricao, setItemDescricao] = useState('');
  const [itemNcm, setItemNcm] = useState('');
  const [itemUnidade, setItemUnidade] = useState('UN');
  const [itemQuantidade, setItemQuantidade] = useState('');
  const [itemValorUnitario, setItemValorUnitario] = useState('');
  // Histórico Inicial de Notas Fiscais
  const [notas, setNotas] = useState<NotaFiscal[]>([
    {
      id: 1,
      numero: '000.004.125',
      serie: '001',
      naturezaOperacao: 'Venda de Mercadoria',
      cfop: '5.102',
      destinoOperacao: '1',
      finalidadeEmissao: '1',
      cliente: 'Tech Soluções Ltda',
      documento: '12.345.678/0001-99',
      dataEmissao: '2026-07-20',
      dataSaida: '2026-07-20',
      horaSaida: '14:30',
      valorBruto: 1000.00,
      icms: 180.00,
      pis: 16.50,
      cofins: 76.00,
      valorLiquido: 727.50,
      status: 'Autorizada',
      itens: [
        { id: '1', descricao: 'Notebook Corp Core i5', ncm: '8471.30.12', unidade: 'UN', quantidade: 1, valorUnitario: 1000.00, valorTotalItem: 1000.00 }
      ]
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

  // Lógica de Somatórios e Impostos
  const valorBrutoCalculado = itensAdicionados.reduce((soma, item) => soma + item.valorTotalItem, 0);
  const calcIcms = valorBrutoCalculado * 0.18;
  const calcPis = valorBrutoCalculado * 0.0165;
  const calcCofins = valorBrutoCalculado * 0.076;
  const valorLiquidoCalculado = valorBrutoCalculado - (calcIcms + calcPis + calcCofins);
  const handleEmitirNfe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado || !docCliente || !cfop) {
      alert('Por favor, preencha todos os dados obrigatórios (*).');
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
      naturezaOperacao,
      cfop,
      destinoOperacao,
      finalidadeEmissao,
      cliente: clienteSelecionado,
      documento: docCliente,
      dataEmissao: String(dataEmissao),
      dataSaida: String(dataSaida),
      horaSaida,
      valorBruto: valorBrutoCalculado,
      icms: calcIcms,
      pis: calcPis,
      cofins: calcCofins,
      valorLiquido: valorLiquidoCalculado,
      status: 'Autorizada',
      itens: itensAdicionados
    };

    setNotas([novaNota, ...notas]);
    fecharModal();
  };

  const fecharModal = () => {
    setClienteSelecionado('');
    setDocCliente('');
    setNaturezaOperacao('Venda de Mercadoria');
    setCfop('');
    setDestinoOperacao('1');
    setFinalidadeEmissao('1');
    setDataEmissao(new Date().toISOString().split('T'));
    setDataSaida(new Date().toISOString().split('T'));
    setHoraSaida(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setItensAdicionados([]);
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

  // Formata datas de YYYY-MM-DD para DD/MM/YYYY na listagem visual
  const formatarDataBR = (dataUS: string) => {
    if (!dataUS) return '';
    const partes = dataUS.split('-');
    if (partes.length !== 3) return dataUS;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
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
              <th>Número / Destinatário</th>
              <th>Emissão / Saída</th>
              <th>Valor Bruto</th>
              <th>ICMS (18%)</th>
              <th>PIS / COFINS</th>
              <th>Valor Líquido</th>
              <th>Status SEFAZ</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {notasFiltradas.map((nota) => {
              const estilo = getStatusStyle(nota.status);
              return (
                <tr key={nota.id}>
                  <td className="td-numero">
                    <div style={{ fontWeight: '600' }}>{nota.numero}</div>
                    <span className="sublabel-serie">Série: {nota.serie} | CFOP: {nota.cfop}</span>
                  </td>
                  <td className="td-cliente">
                    <div style={{ fontWeight: '500' }}>{nota.cliente}</div>
                    <span className="sublabel-doc">{nota.documento}</span>
                  </td>
                  <td>
                    <div>{formatarDataBR(nota.dataEmissao)}</div>
                    <span className="sublabel-doc" style={{ fontSize: '11px' }}>Saída: {formatarDataBR(nota.dataSaida)} {nota.horaSaida}</span>
                  </td>
                  <td className="td-bruto">
                    {nota.valorBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="td-icms">
                    {nota.icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="td-pis-cofins">
                    <div>PIS: {nota.pis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div style={{ marginTop: '2px' }}>COF: {nota.cofins.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </td>
                  <td className="td-liquido">
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
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            
            <button type="button" onClick={fecharModal} className="btn-close-modal">
              <X size={20} />
            </button>

            <h3 className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
            <p className="modal-subtitle">Preencha os parâmetros fiscais, dados do cliente e os itens.</p>

            <form onSubmit={handleEmitirNfe} className="form-layout">
              
              {/* BLOCO 1: DADOS FISCAIS DA NOTA */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '2 1 200px' }}>
                  <label className="form-label">Natureza da Operação</label>
                  <select value={naturezaOperacao} onChange={e => setNaturezaOperacao(e.target.value)} className="input-field">
                    <option value="Venda de Mercadoria">Venda de Mercadoria</option>
                    <option value="Prestação de Serviço">Prestação de Serviço</option>
                    <option value="Remessa para Conserto">Remessa para Conserto</option>
                    <option value="Devolução de Mercadoria">Devolução de Mercadoria</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 100px' }}>
                  <label className="form-label">CFOP *</label>
                  <input type="text" required value={cfop} onChange={e => setCfop(e.target.value)} placeholder="Ex: 5.102" className="input-field" />
                </div>
                <div className="form-group" style={{ flex: '1 1 140px' }}>
                  <label className="form-label">Destino da Operação</label>
                  <select value={destinoOperacao} onChange={e => setDestinoOperacao(e.target.value)} className="input-field">
                    <option value="1">1 - Operação Interna</option>
                    <option value="2">2 - Operação Interestadual</option>
                    <option value="3">3 - Operação com Exterior</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 140px' }}>
                  <label className="form-label">Finalidade de Emissão</label>
                  <select value={finalidadeEmissao} onChange={e => setFinalidadeEmissao(e.target.value)} className="input-field">
                    <option value="1">1 - NF-e Normal</option>
                    <option value="2">2 - NF-e Complementar</option>
                    <option value="3">3 - NF-e de Ajuste</option>
                    <option value="4">4 - Devolução de Mercadoria</option>
                  </select>
                </div>
              </div>

              {/* BLOCO 2: DADOS DO DESTINATÁRIO */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '2 1 300px' }}>
                  <label className="form-label">Destinatário *</label>
                  <input type="text" required value={clienteSelecionado} onChange={e => setClienteSelecionado(e.target.value)} placeholder="Razão Social ou Nome" className="input-field" />
                </div>
                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="form-label">CPF / CNPJ *</label>
                  <input type="text" required value={docCliente} onChange={e => setDocCliente(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
                </div>
              </div>

              {/* BLOCO 3: DATAS E HORÁRIOS */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '1 1 150px' }}>
                  <label className="form-label">Data de Emissão</label>
                  <input type="date" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className="input-field" />
                </div>
                <div className="form-group" style={{ flex: '1 1 150px' }}>
                  <label className="form-label">Data de Saída / Entrada</label>
                  <input type="date" value={dataSaida} onChange={e => setDataSaida(e.target.value)} className="input-field" />
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="form-label">Hora da Saída</label>
                  <input type="time" value={horaSaida} onChange={e => setHoraSaida(e.target.value)} className="input-field" />
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
