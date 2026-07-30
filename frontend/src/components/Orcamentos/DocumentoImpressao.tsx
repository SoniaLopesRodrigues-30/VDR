import React from 'react';

interface ItemOrcamento {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

type StatusOrcamento = 'Pendente' | 'Aprovado' | 'Cancelado';

interface DocumentoProps {
  clienteNome: string;
  validade: string;
  itens: ItemOrcamento[];
  valorTotalGeral: number;
  status: StatusOrcamento;
}

export function DocumentoImpressao({ clienteNome, validade, itens = [], valorTotalGeral = 0, status }: DocumentoProps) {
  
  const formatarData = (dataString: string) => {
    if (!dataString) return 'Não informada';
    try {
      const data = new Date(`${dataString}T12:00:00`);
      if (isNaN(data.getTime())) return 'Não informada';
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Não informada';
    }
  };

  return (
    <>
      {/* Bloco de estilo que força a ocultação de tudo e exibe apenas o PDF ao imprimir */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-impressao-pdf, #area-impressao-pdf * {
            visibility: visible;
          }
          #area-impressao-pdf {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div id="area-impressao-pdf" style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#334155', backgroundColor: '#fff' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '28px', letterSpacing: '0.5px' }}>ORÇAMENTO</h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' }}>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Válido até: {formatarData(validade)}</p>
          </div>
          <div>
            <span style={{ 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '14px',
              textTransform: 'uppercase',
              background: status === 'Aprovado' ? '#dcfce7' : status === 'Cancelado' ? '#fee2e2' : '#fef9c3',
              color: status === 'Aprovado' ? '#166534' : status === 'Cancelado' ? '#991b1b' : '#854d0e',
              fontWeight: 'bold'
            }}>
              {status}
            </span>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div style={{ margin: '30px 0', padding: '16px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px' }}>Dados do Cliente</h3>
          <p style={{ margin: 0, fontSize: '15px' }}><strong>Nome / Razão Social:</strong> {clienteNome || 'Não selecionado'}</p>
        </div>

        {/* Tabela de Itens */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ textAlign: 'left', padding: '12px 10px', fontSize: '14px', color: '#475569' }}>Descrição</th>
              <th style={{ textAlign: 'center', padding: '12px 10px', width: '80px', fontSize: '14px', color: '#475569' }}>Qtd</th>
              <th style={{ textAlign: 'right', padding: '12px 10px', width: '120px', fontSize: '14px', color: '#475569' }}>Unitário</th>
              <th style={{ textAlign: 'right', padding: '12px 10px', width: '120px', fontSize: '14px', color: '#475569' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 10px', fontSize: '14px' }}>{item.descricao}</td>
                <td style={{ textAlign: 'center', padding: '12px 10px', fontSize: '14px' }}>{item.quantidade}</td>
                <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '14px' }}>R$ {item.valorUnitario.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '12px 10px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>R$ {item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totalizador */}
        <div style={{ marginTop: '40px', textAlign: 'right', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>
            Valor Total Geral: R$ {valorTotalGeral.toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
}
