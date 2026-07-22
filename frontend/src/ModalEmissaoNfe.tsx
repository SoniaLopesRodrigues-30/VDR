import React, { useState } from 'react';
import { X, Plus, Trash2, Package, Truck, CreditCard, FileText, DollarSign, User } from 'lucide-react';
import './ModalEmissaoNfe.css';

// DECLARAÇÃO DOS TIPOS FISCAIS OBRIGATÓRIOS
export interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

export interface DuplicataNota {
  numero: string;
  vencimento: string;
  valor: number;
}

export interface FaturaNota {
  numero: string;
  valorOriginal: number;
  valorDesconto?: number;
  valorLiquido: number;
  dataVencimento?: string;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
  valorBruto: number;
  valorLiquido: number;
  quantidadeVolumes?: string;
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string;

  tipoOperacao: '0 - Entrada' | '1 - Saída';
  destinoOperacao: '1 - Operação Interna (Estadual)' | '2 - Operação Interestadual' | '3 - Operação com Exterior';
  finalidadeEmissao: '1 - NF-e Normal' | '2 - NF-e Complementar' | '3 - NF-e de Ajuste' | '4 - Devolução de Mercadoria';
  dataSaida: string;
  horaSaida: string;

  pagamento: {
    formaPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'Boleto' | 'Sem Pagamento';
    meioPagamento: string; 
  };
  transporte: {
    modalidadeFrete: '0 - Contratação por conta do Remetente (CIF)' | '1 - Contratação por conta do Destinatário (FOB)' | '9 - Sem Ocorrência de Transporte';
    transportadorNome?: string;
    transportadorCnpjCpf?: string;
    placaVeiculo?: string;
  };
  enderecoDestinatario: {
    logradouro: string;
    numero: string;
    bairro: string;
    codigoMunicipio: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  cobranca?: {
    fatura: FaturaNota;
    duplicatas: DuplicataNota[];
  };
}

interface ModalEmissaoProps {
  onClose: () => void;
  onEmitir: (nota: NotaFiscal) => void;
  proximoNumeroSequencial: number;
}

export function ModalEmissaoNfe({ onClose, onEmitir, proximoNumeroSequencial }: ModalEmissaoProps) {
  // Estados de Identificação do Cliente
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria');
  
  // NOVOS ESTADOS ADICIONADOS: Dados de Endereço Dinâmicos do Destinatário (Caxias do Sul - RS)
  const [logradouroDest, setLogradouroDest] = useState('');
  const [numeroDest, setNumeroDest] = useState('');
  const [bairroDest, setBairroDest] = useState('');
  const [municipioDest, setMunicipioDest] = useState('Caxias do Sul');
  const [ufDest, setUfDest] = useState('RS');
  const [cepDest, setCepDest] = useState('95042-000');
  const [codMunicipioDest, setCodMunicipioDest] = useState('4305108'); // Código IBGE exato de Caxias do Sul
  
  // Estados fiscais de emissão (com correção estrita para inputs do tipo "date")
  const [tipoOperacao, setTipoOperacao] = useState<NotaFiscal['tipoOperacao']>('1 - Saída');
  const [destinoOperacao, setDestinoOperacao] = useState<NotaFiscal['destinoOperacao']>('1 - Operação Interna (Estadual)');
  const [finalidadeEmissao, setFinalidadeEmissao] = useState<NotaFiscal['finalidadeEmissao']>('1 - NF-e Normal');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [horaSaida, setHoraSaida] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [dataVencimentoFatura, setDataVencimentoFatura] = useState(new Date().toISOString().split('T')[0]);

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

  // Estados para Pagamento e Transporte
  const [formaPagamento, setFormaPagamento] = useState<NotaFiscal['pagamento']['formaPagamento']>('Pix');
  const [meioPagamento, setMeioPagamento] = useState('15 - Pix');
  const [modalidadeFrete, setModalidadeFrete] = useState<NotaFiscal['transporte']['modalidadeFrete']>('9 - Sem Ocorrência de Transporte');
  const [transportadorNome, setTransportadorNome] = useState('');
  const [transportadorCnpjCpf, setTransportadorCnpjCpf] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
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

  const proximoNumeroStr = String(proximoNumeroSequencial).padStart(6, '0');
  const numeroFaturaCalculado = `FAT-${proximoNumeroStr}`;

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

    // CORREÇÃO DEFINITIVA DA DATA DO MODAL (Previne loops e duplicações)
    const formatarDataBR = (dataUS: string) => {
      if (!dataUS) return '';
      if (dataUS.includes('/')) return dataUS; 
      
      const parts = dataUS.split('-');
      if (parts.length !== 3) return dataUS;
      
      const [ano, mes, dia] = parts;
      return `${dia}/${mes}/${ano}`;
    };
    
    const novaNota: NotaFiscal = {
      id: Date.now(),
      numero: `000.${proximoNumeroStr.slice(0, 3)}.${proximoNumeroStr.slice(3)}`,
      serie: '001',
      cliente: clienteSelecionado,
      documento: docCliente,
      dataEmissao: formatarDataBR(dataEmissao),
      valorBruto: valorBrutoCalculado,
      valorLiquido: valorLiquidoCalculado,
      status: 'Pendente',
      itens: itensAdicionados,
      quantidadeVolumes: qtdVolumes || '0',
      especieVolumes: especieVolumes,
      pesoBruto: pesoBruto ? parseFloat(pesoBruto).toFixed(3) : '0.000',
      pesoLiquido: pesoLiquido ? parseFloat(pesoLiquido).toFixed(3) : '0.000',
      informacoesComplementares: infoComplementares,
      
      tipoOperacao,
      destinoOperacao,
      finalidadeEmissao,
      dataSaida: formatarDataBR(dataSaida),
      horaSaida,

      pagamento: {
        formaPagamento,
        meioPagamento
      },
      transporte: {
        modalidadeFrete,
        transportadorNome: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? transportadorNome : undefined,
        transportadorCnpjCpf: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? transportadorCnpjCpf : undefined,
        placaVeiculo: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? placaVeiculo : undefined
      },
      // INTEGRAÇÃO DO ENDEREÇO COLETADO DINAMICAMENTE (Crucial para o Back-end)
      enderecoDestinatario: {
        logradouro: logradouroDest || 'Rua nao informada',
        numero: numeroDest || 'SN',
        bairro: bairroDest || 'Centro',
        codigoMunicipio: codMunicipioDest,
        municipio: municipioDest,
        uf: ufDest,
        cep: cepDest.replace(/\D/g, '')
      },
      cobranca: formaPagamento !== 'Sem Pagamento' ? {
        fatura: {
          numero: numeroFaturaCalculado,
          valorOriginal: valorLiquidoCalculado,
          valorLiquido: valorLiquidoCalculado,
          dataVencimento: formatarDataBR(dataVencimentoFatura)
        },
        duplicatas: [
          {
            numero: `${numeroFaturaCalculado}-01`,
            vencimento: formatarDataBR(dataVencimentoFatura),
            valor: valorLiquidoCalculado
          }
        ]
      } : undefined
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
        <p className="modal-subtitle">Preencha as seções abaixo de forma estruturada para realizar a transmissão fiscal.</p>

        <form onSubmit={handleEmitirNfe} className="form-layout">
          
          {/* SEÇÃO 1: INFORMAÇÕES GERAIS FISCAIS */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <FileText size={16} /> 1. Dados Gerais da Emissão
            </legend>
            
            <div className="form-row">
              <div className="form-group fg-natureza">
                <label className="form-label">Tipo Op. (tpNF)</label>
                <select value={tipoOperacao} onChange={e => setTipoOperacao(e.target.value as any)} className="input-field">
                  <option value="1 - Saída">1 - Saída</option>
                  <option value="0 - Entrada">0 - Entrada</option>
                </select>
              </div>
              <div className="form-group fg-destinatario">
                <label className="form-label">Destino Operação (idDest)</label>
                <select value={destinoOperacao} onChange={e => setDestinoOperacao(e.target.value as any)} className="input-field">
                  <option value="1 - Operação Interna (Estadual)">1 - Interna (No Estado)</option>
                  <option value="2 - Operação Interestadual">2 - Interestadual (Fora do Estado)</option>
                </select>
              </div>
              <div className="form-group fg-documento">
                <label className="form-label">Finalidade (finNFe)</label>
                <select value={finalidadeEmissao} onChange={e => setFinalidadeEmissao(e.target.value as any)} className="input-field">
                  <option value="1 - NF-e Normal">1 - Normal</option>
                  <option value="2 - NF-e Complementar">2 - Complementar</option>
                  <option value="3 - NF-e de Ajuste">3 - de Ajuste</option>
                  <option value="4 - Devolução de Mercadoria">4 - Devolução</option>
                </select>
              </div>
            </div>

            <div className="form-row mt-negative">
              <div className="form-group fg-natureza">
                <label className="form-label">Natureza Operação</label>
                <input type="text" value={naturezaOperacao} onChange={e => setNaturezaOperacao(e.target.value)} className="input-field" placeholder="Ex: Venda de Mercadoria" />
              </div>
              <div className="form-group fg-vol-esp">
                <label className="form-label">Data Emissão</label>
                <input type="date" required value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} className="input-field" />
              </div>
              <div className="form-group fg-vol-esp">
                <label className="form-label">Data Saída/Entrada</label>
                <input type="date" required value={dataSaida} onChange={e => setDataSaida(e.target.value)} className="input-field" />
              </div>
              <div className="form-group fg-vol-qtd">
                <label className="form-label">Hora Saída</label>
                <input type="text" required value={horaSaida} onChange={e => setHoraSaida(e.target.value)} placeholder="00:00" className="input-field" />
              </div>
            </div>
          </fieldset>
          {/* SEÇÃO 2: DADOS DE IDENTIFICAÇÃO E ENDEREÇO DO DESTINATÁRIO */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <User size={16} /> 2. Identificação e Endereço do Cliente
            </legend>
            
            <div className="form-row">
              <div className="form-group fg-destinatario">
                <label className="form-label">Destinatário / Razão Social *</label>
                <input type="text" required value={clienteSelecionado} onChange={e => setClienteSelecionado(e.target.value)} placeholder="Nome completo ou Razão Social" className="input-field" />
              </div>
              <div className="form-group fg-documento">
                <label className="form-label">CPF / CNPJ *</label>
                <input type="text" required value={docCliente} onChange={e => setDocCliente(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
              </div>
            </div>

            <div className="form-row mt-negative">
              <div className="form-group fg-vol-qtd">
                <label className="form-label">CEP *</label>
                <input type="text" required value={cepDest} onChange={e => setCepDest(e.target.value)} placeholder="00000-000" className="input-field" />
              </div>
              <div className="form-group fg-destinatario">
                <label className="form-label">Logradouro (Rua/Av) *</label>
                <input type="text" required value={logradouroDest} onChange={e => setLogradouroDest(e.target.value)} placeholder="Ex: Av. Brasil" className="input-field" />
              </div>
              <div className="form-group fg-vol-qtd">
                <label className="form-label">Número *</label>
                <input type="text" required value={numeroDest} onChange={e => setNumeroDest(e.target.value)} placeholder="123" className="input-field" />
              </div>
            </div>

            <div className="form-row mt-negative">
              <div className="form-group fg-natureza">
                <label className="form-label">Bairro *</label>
                <input type="text" required value={bairroDest} onChange={e => setBairroDest(e.target.value)} placeholder="Bairro" className="input-field" />
              </div>
              <div className="form-group fg-natureza">
                <label className="form-label">Município *</label>
                <input type="text" required value={municipioDest} onChange={e => setMunicipioDest(e.target.value)} placeholder="Cidade" className="input-field" />
              </div>
              <div className="form-group fg-vol-esp">
                <label className="form-label">Cód. IBGE Cidade *</label>
                <input type="text" required value={codMunicipioDest} onChange={e => setCodMunicipioDest(e.target.value)} placeholder="Ex: 4305108" className="input-field" />
              </div>
              <div className="form-group fg-vol-qtd">
                <label className="form-label">UF *</label>
                <input type="text" required maxLength={2} value={ufDest} onChange={e => setUfDest(e.target.value.toUpperCase())} placeholder="RS" className="input-field" />
              </div>
            </div>
          </fieldset>

          {/* SEÇÃO 3: PRODUTOS E ITENS DA NOTA */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <Package size={16} /> 3. Detalhamento de Itens e Produtos
            </legend>
            
            <div className="form-row mb-items gap-items">
              <div className="form-group fg-prod-desc">
                <label className="form-label">Descrição do Produto</label>
                <input type="text" value={itemDescricao} onChange={e => setItemDescricao(e.target.value)} placeholder="Ex: Monitor LED 24" className="input-field" />
              </div>
              <div className="form-group fg-prod-ncm">
                <label className="form-label">NCM (Fiscal)</label>
                <input type="text" value={itemNcm} onChange={e => setItemNcm(e.target.value)} placeholder="Ex: 8471.60.20" className="input-field" />
              </div>
              <div className="form-group fg-prod-un">
                <label className="form-label">Unidade</label>
                <select value={itemUnidade} onChange={e => setItemUnidade(e.target.value)} className="input-field">
                  <option value="UN">UN</option>
                  <option value="KG">KG</option>
                  <option value="PC">PÇ</option>
                  <option value="CX">CX</option>
                </select>
              </div>
              <div className="form-group fg-prod-qtd">
                <label className="form-label">Qtd.</label>
                <input type="number" value={itemQuantidade} onChange={e => setItemQuantidade(e.target.value)} placeholder="0" className="input-field" />
              </div>
              <div className="form-group fg-prod-val">
                <label className="form-label">Valor Unit.</label>
                <input type="number" step="0.01" value={itemValorUnitario} onChange={e => setItemValorUnitario(e.target.value)} placeholder="R$ 0,00" className="input-field" />
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
          {/* SEÇÃO 4: LOGÍSTICA E TRANSPORTE */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <Truck size={16} /> 4. Logística e Transporte de Volumes
            </legend>
            
            <div className="form-row">
              <div className="form-group fg-natureza">
                <label className="form-label">Modalidade do Frete</label>
                <select value={modalidadeFrete} onChange={e => setModalidadeFrete(e.target.value as any)} className="input-field">
                  <option value="9 - Sem Ocorrência de Transporte">9 - Sem Frete</option>
                  <option value="0 - Contratação por conta do Remetente (CIF)">0 - CIF (Remetente)</option>
                  <option value="1 - Contratação por conta do Destinatário (FOB)">1 - FOB (Destinatário)</option>
                </select>
              </div>
              {modalidadeFrete !== '9 - Sem Ocorrência de Transporte' && (
                <>
                  <div className="form-group fg-destinatario">
                    <label className="form-label">Transportadora / Razão Social</label>
                    <input type="text" value={transportadorNome} onChange={e => setTransportadorNome(e.target.value)} placeholder="Nome do transportador" className="input-field" />
                  </div>
                  <div className="form-group fg-peso">
                    <label className="form-label">Placa do Veículo</label>
                    <input type="text" value={placaVeiculo} onChange={e => setPlacaVeiculo(e.target.value)} placeholder="AAA0A00" className="input-field" />
                  </div>
                </>
              )}
            </div>

            <div className="form-row mt-negative">
              <div className="form-group fg-vol-qtd">
                <label className="form-label">Qtd. Volumes</label>
                <input type="number" min="0" value={qtdVolumes} onChange={e => setQtdVolumes(e.target.value)} placeholder="0" className="input-field" />
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
          </fieldset>

          {/* SEÇÃO 5: FINANCEIRO, CONDIÇÕES DE PAGAMENTO E FATURA */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <CreditCard size={16} /> 5. Informações Financeiras e Cobrança
            </legend>
            
            <div className="form-row">
              <div className="form-group fg-natureza">
                <label className="form-label">Forma de Pagamento</label>
                <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value as any)} className="input-field">
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Sem Pagamento">Sem Pagamento</option>
                </select>
              </div>
              <div className="form-group fg-destinatario">
                <label className="form-label">Meio de Pagamento (Código Sefaz)</label>
                <input type="text" value={meioPagamento} onChange={e => setMeioPagamento(e.target.value)} placeholder="Ex: 01 - Dinheiro, 15 - Pix" className="input-field" />
              </div>
            </div>

            {/* DETALHAMENTO DINÂMICO DA FATURA */}
            {formaPagamento !== 'Sem Pagamento' && (
              <div className="form-row mt-info">
                <div className="form-group fg-natureza">
                  <label className="form-label">Número da Fatura</label>
                  <input type="text" disabled value={numeroFaturaCalculado} className="input-field" />
                </div>
                <div className="form-group fg-destinatario">
                  <label className="form-label">Data de Vencimento</label>
                  <input type="date" required value={dataVencimentoFatura} onChange={e => setDataVencimentoFatura(e.target.value)} className="input-field" />
                </div>
                <div className="form-group fg-documento">
                  <label className="form-label">Valor da Fatura</label>
                  <input type="text" disabled value={`R$ ${valorLiquidoCalculado.toFixed(2)}`} className="input-field" />
                </div>
              </div>
            )}
          </fieldset>

          {/* SEÇÃO 6: RESUMO DE TOTAIS E OBSERVAÇÕES */}
          <fieldset className="section-divider">
            <legend className="section-subtitle">
              <DollarSign size={16} /> 6. Resumo Faturamento e Observações Fiscais
            </legend>
            
            <div className="form-group fg-full-width">
              <label className="form-label">Informações Complementares à Nota</label>
              <textarea 
                rows={3}
                value={infoComplementares} 
                onChange={e => setInfoComplementares(e.target.value)} 
                placeholder="Dados adicionais de interesse do fisco..." 
                className="input-field textarea-field"
              />
            </div>

            {/* PAINEL DE TOTAIS */}
            {valorBrutoCalculado > 0 && (
              <div className="tax-panel">
                <div className="tax-row-products">
                  <span>Total Bruto das Mercadorias:</span>
                  <span className="weight-bold">{valorBrutoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="tax-row-estimate">
                  <span>Estimativa Tributária:</span>
                  <span className="tax-free-badge">R$ 0,00 (Simples Nacional)</span>
                </div>
                <div className="tax-row-total">
                  <span>Valor Total Líquido da Nota:</span>
                  <span className="tax-total-value">{valorLiquidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            )}
          </fieldset>

          {/* RODAPÉ E TRANSMISSÃO */}
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
