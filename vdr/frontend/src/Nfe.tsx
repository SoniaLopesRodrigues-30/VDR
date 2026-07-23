import React from 'react';
import { Plus, Search, FileText, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useNfe } from './useNfe';
import { baixarXmlNfe, imprimirPdfNfe } from './nfeUtils';
import { ModalEmissaoNfe, type NotaFiscal } from './ModalEmissaoNfe';
import './Nfe.css'; 

export default function Nfe() {
  const {
    busca,
    setBusca,
    modalAberto,
    setModalAberto,
    notas,
    notasFiltradas,
    handleEmitirNota
  } = useNfe();

  const getStatusStyle = (status: NotaFiscal['status']) => {
    if (status === 'Autorizada') return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} /> };
    if (status === 'Pendente') return { bg: '#fef3c7', text: '#b45309', icon: <AlertTriangle size={14} /> };
    return { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} /> };
  };

  return (
    <div className="nfe-container">
      {/* PAINEL SUPERIOR */}
      <div className="nfe-header">
        <div>
          <h1 className="nfe-title">Notas Fiscais (NF-e)</h1>
          <p className="nfe-subtitle">Emissão completa com discriminação de produtos, NCM e impostos detalhados.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-emitir">
          <Plus size={18} /> Emitir Nova NF-e
        </button>
      </div>

      {/* DISPOSITIVO DE PESQUISA */}
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

      {/* GRADE DE RESULTADOS */}
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
                    
                    <div className="td-transport-group" style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                      <div><strong>Frete:</strong> {nota.transporte.modalidadeFrete ? nota.transporte.modalidadeFrete.split(' - ')[0] : '9'}</div>
                      {nota.transporte.transportadorNome && (
                        <div><strong>Transp:</strong> {nota.transporte.transportadorNome} {nota.transporte.placaVeiculo && `(${nota.transporte.placaVeiculo})`}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="td-cliente">
                    <span className="cliente-nome">{nota.cliente}</span>
                    <span className="sublabel-doc">{nota.documento}</span>
                    
                    <div className="td-finance-group" style={{ marginTop: '6px', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                      <div>
                        <span style={{ marginRight: '12px' }}><strong>Forma:</strong> {nota.pagamento.formaPagamento}</span>
                        {nota.cobranca?.fatura && (
                          <span><strong>Fatura:</strong> {nota.cobranca.fatura.numero}</span>
                        )}
                      </div>
                      {nota.cobranca?.duplicatas?.[0] && (
                        <div style={{ color: '#2563eb', marginTop: '2px' }}>
                          <strong>Venc. Duplicata:</strong> {nota.cobranca.duplicatas[0].vencimento} ({nota.cobranca.duplicatas[0].valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                        </div>
                      )}
                    </div>

                    {nota.informacoesComplementares && (
                      <div className="td-observacao" style={{ marginTop: '4px' }}>
                        <strong>Obs:</strong> {nota.informacoesComplementares}
                      </div>
                    )}
                  </td>
                  
                  <td className="td-data">{nota.dataEmissao}</td>
                  <td className="td-liquido-total">
                    {nota.valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>
                    <span className="badge-status" style={{ backgroundColor: estilo.bg, color: estilo.text }}>
                      {estilo.icon} {nota.status}
                    </span>
                  </td>
                  <td className="td-acoes">
                    <button type="button" title="Visualizar XML" className="btn-icon-gray" onClick={() => baixarXmlNfe(nota)}>
                      <FileText size={16} />
                    </button>
                    <button type="button" title="Baixar PDF" className="btn-icon-blue" onClick={() => imprimirPdfNfe(nota)}>
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DISPARADOR CONDICIONAL DO FORMULÁRIO */}
      {modalAberto && (
        <ModalEmissaoNfe 
          onClose={() => setModalAberto(false)} 
          onEmitir={handleEmitirNota}
          proximoNumeroSequencial={notas.length + 4125}
        />
      )}
    </div>
  );
}
