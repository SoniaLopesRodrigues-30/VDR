// src/components/Relatorios/RelatorioClientes.tsx
import React from 'react';

interface Cliente {
  id: number | string;
  nome: string;      // ou razao_social
  email: string;
  cidade?: string;   // opcional caso não tenha preenchido
  status?: string;   // se tiver controle de ativo/inativo
  total_compras?: number; 
}

interface Props {
  dados: Cliente[];
  fmtMoeda: (v: number) => string;
}

export default function RelatorioClientes({ dados, fmtMoeda }: Props) {
  const totalClientes = dados.length;
  
  // Mapeamento dinâmico de compras se o seu banco tiver essa contagem, senão assume 0
  const totalGeralCompras = dados.reduce((acc, c) => acc + (c.total_compras || 0), 0);
  const ticketMedio = totalClientes > 0 ? totalGeralCompras / totalClientes : 0;

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={cardMétrica}><p style={labelMétrica}>Total de Clientes no Banco</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{totalClientes}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Volume de Receita Acumulada</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmtMoeda(totalGeralCompras)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Média de Consumo (Ticket Médio)</p><h2 style={{ margin: 0, color: '#8b5cf6' }}>{fmtMoeda(ticketMedio)}</h2></div>
      </div>

      {/* TABELA */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Relação Comercial de Clientes</h3>
      <div style={containerTabela}>
        <table style={tabelaEstilo}>
          <thead>
            <tr style={thEstilo}>
              <th style={paddingTd}>ID</th>
              <th style={paddingTd}>Nome Completo / Empresa</th>
              <th style={paddingTd}>E-mail de Contato</th>
              <th style={paddingTd}>Cidade</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...paddingTd, color: '#64748b', fontSize: '12px' }}>{c.id}</td>
                <td style={{ ...paddingTd, fontWeight: '500' }}>{c.nome}</td>
                <td style={paddingTd}>{c.email}</td>
                <td style={paddingTd}>{c.cidade || 'Não informada'}</td>
              </tr>
            ))}
            {dados.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum cliente registrado no Supabase por enquanto.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const gridEstilo: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' };
const cardMétrica: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const labelMétrica: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 };
const containerTabela: React.CSSProperties = { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const tabelaEstilo: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };
const thEstilo: React.CSSProperties = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const paddingTd: React.CSSProperties = { padding: '12px 16px' };
