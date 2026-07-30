import React from 'react';

interface ItemTabela {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

interface DocumentoOSProps {
  numeroOS: string;
  clienteNome: string;
  dataAbertura: string;
  equipamento: string;
  defeito: string;
  laudoTecnico: string;
  servicos: ItemTabela[];
  pecas: ItemTabela[];
  valorTotalOS: number;
  status: StatusOS;
}

export function DocumentoImpressaoOS({
  numeroOS, clienteNome, dataAbertura, equipamento, defeito,
  laudoTecnico, servicos = [], pecas = [], valorTotalOS = 0, status
}: DocumentoOSProps) {
  
  const formatarData = (dataString: string) => {
    if (!dataString) return new Date().toLocaleDateString('pt-BR');
    try {
      const data = new Date(`${dataString}T12:00:00`);
      return isNaN(data.getTime()) ? 'Não informada' : data.toLocaleDateString('pt-BR');
    } catch {
      return 'Não informada';
    }
  };

  return (
    <>
      <style>{`
        .container-os-secreta {
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .container-os-secreta, .container-os-secreta * {
            visibility: visible !important;
          }
          .container-os-secreta {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            opacity: 1 !important;
            background-color: #fff !important;
          }
        }
      `}</style>

      <div className="container-os-secreta" style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#334155' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '26px' }}>ORDEM DE SERVIÇO</h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' }}>Número: <strong>{numeroOS || 'OS-PROVISÓRIA'}</strong></p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Data de Abertura: {formatarData(dataAbertura)}</p>
          </div>
          <div>
            <span style={{ 
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', textTransform: 'uppercase', fontWeight: 'bold',
              background: status === 'Concluída' ? '#dcfce7' : status === 'Cancelada' ? '#fee2e2' : status === 'Em Andamento' ? '#dbeafe' : '#fef9c3',
              color: status === 'Concluída' ? '#166534' : status === 'Cancelada' ? '#991b1b' : status === 'Em Andamento' ? '#1e40af' : '#854d0e',
            }}>
              {status}
            </span>
          </div>
        </div>

        {/* Dados do Cliente e Equipamento */}
        <div style={{ display: 'flex', gap: '20px', margin: '25px 0' }}>
          <div style={{ flex: 1, padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px' }}>Cliente</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{clienteNome || 'Não selecionado'}</p>
          </div>
          <div style={{ flex: 1, padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px' }}>Objeto / Equipamento</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{equipamento || 'Não especificado'}</p>
          </div>
        </div>

        {/* Diagnóstico Técnico */}
        <div style={{ margin: '20px 0', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px' }}>Defeito Relatado / Sintomas</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontStyle: 'italic' }}>{defeito || 'Sem descrição cadastrada.'}</p>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '14px' }}>Laudo Técnico / Solução</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{laudoTecnico || 'Serviço em fase de análise diagnóstica.'}</p>
        </div>

        {/* Seção de Serviços */}
        {servicos.length > 0 && (
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0f172a' }}>Mão de Obra e Serviços</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '13px' }}>Descrição</th>
                  <th style={{ textAlign: 'center', padding: '8px 10px', width: '60px', fontSize: '13px' }}>Qtd</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', width: '100px', fontSize: '13px' }}>Unitário</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', width: '100px', fontSize: '13px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontSize: '13px' }}>{s.descricao}</td>
                    <td style={{ textAlign: 'center', padding: '8px 10px', fontSize: '13px' }}>{s.quantidade}</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px' }}>R$ {s.valorUnitario.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', fontWeight: 'bold' }}>R$ {s.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Seção de Peças */}
        {pecas.length > 0 && (
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0f172a' }}>Peças e Componentes Substituídos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '13px' }}>Descrição</th>
                  <th style={{ textAlign: 'center', padding: '8px 10px', width: '60px', fontSize: '13px' }}>Qtd</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', width: '100px', fontSize: '13px' }}>Unitário</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', width: '100px', fontSize: '13px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pecas.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 10px', fontSize: '13px' }}>{p.descricao}</td>
                    <td style={{ textAlign: 'center', padding: '8px 10px', fontSize: '13px' }}>{p.quantidade}</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px' }}>R$ {p.valorUnitario.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px', fontSize: '13px', fontWeight: 'bold' }}>R$ {p.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total Geral */}
        <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid #e2e8f0', paddingTop: '15px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
            Valor Total Geral da OS: R$ {valorTotalOS.toFixed(2)}
          </span>
        </div>

        {/* Linhas para Assinatura (Fidelidade Jurídica) */}
        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '220px', textAlign: 'center', borderTop: '1px solid #94a3b8', paddingTop: '8px', fontSize: '12px' }}>
            Responsável Técnico
          </div>
          <div style={{ width: '220px', textAlign: 'center', borderTop: '1px solid #94a3b8', paddingTop: '8px', fontSize: '12px' }}>
            Assinatura do Cliente
          </div>
        </div>
      </div>
    </>
  );
}
