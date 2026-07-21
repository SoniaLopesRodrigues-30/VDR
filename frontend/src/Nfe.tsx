import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './Nfe.css'; 
import { baixarXmlNfe, imprimirPdfNfe } from './nfeUtils';

// IMPORTAÇÃO CORRETA E LIMPA AQUI:
import { ModalEmissaoNfe, type NotaFiscal } from './ModalEmissaoNfe';

export default function Nfe() {

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [notas, setNotas] = useState<NotaFiscal[]>([
    {
      id: 1,
      numero: '000.004.125',
      serie: '001',
      cliente: 'Tech Soluções Ltda',
      documento: '12.345.678/0001-99',
      dataEmissao: '20/07/2026',
      valorBruto: 1000.00,
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

  // Filtro otimizado com useMemo (evita reprocessar ao abrir/fechar modal)
  const notasFiltradas = useMemo(() => {
    return notas.filter(nota =>
      nota.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      nota.numero.includes(busca) ||
      nota.documento.includes(busca)
    );
  }, [notas, busca]);

  const getStatusStyle = (status: NotaFiscal['status']) => {
    if (status === 'Autorizada') return { bg: '#dcfce7', text: '#15803d', icon: <CheckCircle size={14} /> };
    if (status === 'Pendente') return { bg: '#fef3c7', text: '#b45309', icon: <AlertTriangle size={14} /> };
    return { bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={14} /> };
  };

  const handleEmitirNota = (novaNota: NotaFiscal) => {
    setNotas([novaNota, ...notas]);
    setModalAberto(false);
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
                    <button type="button" title="Visualizar XML / DANFE" className="btn-icon-gray" onClick={() => baixarXmlNfe(nota)}>
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

      {/* MODAL ISOLADO */}
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
