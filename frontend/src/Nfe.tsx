import React, { useState, useMemo } from 'react';
import { Plus, Search, FileText, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './Nfe.css'; 
import { baixarXmlNfe, imprimirPdfNfe } from './nfeUtils';

// IMPORTAÇÃO CONECTADA AO FORMULÁRIO MODAL
import { ModalEmissaoNfe, type NotaFiscal } from './ModalEmissaoNfe';

export default function Nfe() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estado inicial contendo o histórico de notas fiscais emitidas
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
      informacoesComplementares: 'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.',
      
      tipoOperacao: '1 - Saída',
      destinoOperacao: '1 - Operação Interna (Estadual)',
      finalidadeEmissao: '1 - NF-e Normal',
      dataSaida: '20/07/2026',
      horaSaida: '14:30',

      pagamento: {
        formaPagamento: 'Pix',
        meioPagamento: 'Pagamento À Vista'
      },
      transporte: {
        modalidadeFrete: '0 - Contratação por conta do Remetente (CIF)',
        transportadorNome: 'TransLog Transportes S.A.',
        transportadorCnpjCpf: '98.765.432/0001-11',
        placaVeiculo: 'ABC1D23'
      },
      enderecoDestinatario: {
        logradouro: 'Av. Julio de Castilhos',
        numero: '1400',
        bairro: 'Centro',
        codigoMunicipio: '4305108',
        municipio: 'Caxias do Sul',
        uf: 'RS',
        cep: '95010000'
      },
      cobranca: {
        fatura: { 
          numero: 'FAT-4125', 
          valorOriginal: 1000.00, 
          valorLiquido: 1000.00 
        },
        duplicatas: [
          { numero: 'DUP-4125/01', vencimento: '20/08/2026', valor: 1000.00 }
        ]
      }
    }
  ]);

  // Filtro performático utilizando cache de memória
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
  const handleEmitirNota = async (novaNota: NotaFiscal) => {
    // Coloca a nota na listagem com o feedback visual amarelo de processamento
    const notaEmProcessamento: NotaFiscal = {
      ...novaNota,
      status: 'Pendente'
    };

    setNotas([notaEmProcessamento, ...notas]);
    setModalAberto(false);

    try {
      // Isola os dados de funções do React, evitando falhas de serialização no JSON.stringify
      const dadosLimposParaEnvio = {
        id: novaNota.id,
        numero: novaNota.numero,
        serie: novaNota.serie,
        cliente: novaNota.cliente,
        documento: novaNota.documento,
        dataEmissao: novaNota.dataEmissao,
        valorBruto: novaNota.valorBruto,
        valorLiquido: novaNota.valorLiquido,
        itens: novaNota.itens.map(item => ({
          id: item.id,
          descricao: item.descricao,
          ncm: item.ncm,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorTotalItem: item.valorTotalItem
        })),
        quantidadeVolumes: novaNota.quantidadeVolumes,
        especieVolumes: novaNota.especieVolumes,
        pesoBruto: novaNota.pesoBruto,
        pesoLiquido: novaNota.pesoLiquido,
        informacoesComplementares: novaNota.informacoesComplementares,
        tipoOperacao: novaNota.tipoOperacao,
        destinoOperacao: novaNota.destinoOperacao,
        finalidadeEmissao: novaNota.finalidadeEmissao,
        dataSaida: novaNota.dataSaida,
        horaSaida: novaNota.horaSaida,
        pagamento: {
          formaPagamento: novaNota.pagamento?.formaPagamento,
          meioPagamento: novaNota.pagamento?.meioPagamento
        },
        transporte: {
          modalidadeFrete: novaNota.transporte?.modalidadeFrete,
          transportadorNome: novaNota.transporte?.transportadorNome,
          transportadorCnpjCpf: novaNota.transporte?.transportadorCnpjCpf,
          placaVeiculo: novaNota.transporte?.placaVeiculo
        },
        enderecoDestinatario: novaNota.enderecoDestinatario ? {
          logradouro: novaNota.enderecoDestinatario.logradouro,
          numero: novaNota.enderecoDestinatario.numero,
          bairro: novaNota.enderecoDestinatario.bairro,
          codigoMunicipio: novaNota.enderecoDestinatario.codigoMunicipio,
          municipio: novaNota.enderecoDestinatario.municipio,
          uf: novaNota.enderecoDestinatario.uf,
          cep: novaNota.enderecoDestinatario.cep,
        } : undefined,
        cobranca: novaNota.cobranca ? {
          fatura: {
            numero: novaNota.cobranca.fatura.numero,
            valorOriginal: novaNota.cobranca.fatura.valorOriginal,
            valorLiquido: novaNota.cobranca.fatura.valorLiquido,
            dataVencimento: novaNota.cobranca.fatura.dataVencimento
          },
          duplicatas: novaNota.cobranca.duplicatas.map(dup => ({
            numero: dup.numero,
            vencimento: dup.vencimento,
            valor: dup.valor
          }))
        } : undefined
      };

      console.log("[Front-end] Enviando payload estruturado:", dadosLimposParaEnvio);

      // Dispara a requisição HTTP POST para a porta 5001 aberta com tratamento CORS
      const response = await fetch('http://localhost:5001/v1/nfe', {       
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosLimposParaEnvio)
      });

      if (!response.ok) {
        const erroServidor = await response.json().catch(() => ({ mensagem: 'Erro na resposta interna do servidor.' }));
        throw new Error(erroServidor.mensagem || `Erro HTTP: ${response.status}`);
      }

      const dadosRetorno = await response.json();

      // Transmissão concluída com sucesso: Atualiza o card para verde (Autorizada)
      setNotas(notasAtuais =>
        notasAtuais.map(n =>
          n.id === novaNota.id
            ? {
                ...n,
                status: 'Autorizada',
                numero: dadosRetorno.numeroNota || n.numero,
                informacoesComplementares: `${n.informacoesComplementares || ''} [Protocolo SEFAZ: ${dadosRetorno.protocolo}] [Chave: ${dadosRetorno.chaveAcesso}]`
              }
            : n
        )
      );

      alert(`Sucesso! NF-e Nº ${dadosRetorno.numeroNota || novaNota.numero} foi transmitida e AUTORIZADA pela SEFAZ.`);

    } catch (error: any) {
      console.error('[Front-end] Falha detalhada na transmissão:', error);
      
      // Erro na transmissão: Altera o card para vermelho (Cancelada/Erro)
      setNotas(notasAtuais =>
        notasAtuais.map(n =>
          n.id === novaNota.id
            ? {
                ...n,
                status: 'Cancelada',
                informacoesComplementares: `${n.informacoesComplementares || ''} [ERRO DE TRANSMISSÃO]: ${error.message}`
              }
            : n
        )
      );

      alert(`Falha no envio: ${error.message}`);
    }
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
                      {nota.cobranca?.duplicatas && nota.cobranca.duplicatas.length > 0 && (
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
