// src/components/Relatorios/RelatorioFinanceiro.tsx
import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, PieChart, Filter } from 'lucide-react';

interface Transacao {
  id: number; data: string; descricao: string; conta_contabil: string; tipo: 'receita' | 'despesa'; valor: number;
}

interface Props {
  dados: Transacao[];
  fmtMoeda: (v: number) => string;
}

export default function RelatorioFinanceiro({ dados, fmtMoeda }: Props) {
  const receitas = dados.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesas = dados.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const lucro = receitas - despesas;
  const margem = receitas > 0 ? ((lucro / receitas) * 100).toFixed(1) : '0.0';

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={cardMétrica}><p style={labelMétrica}>Faturamento Bruto</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmtMoeda(receitas)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Total de Custos</p><h2 style={{ margin: 0, color: '#ef4444' }}>{fmtMoeda(despesas)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Lucro Líquido</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{fmtMoeda(lucro)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Margem de Lucro</p><h2 style={{ margin: 0, color: '#8b5cf6' }}>{margem}%</h2></div>
      </div>

      {/* SIMULADORES GRÁFICOS */}
      <div style={{ ...gridEstilo, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '25px' }}>
        <div style={boxGrafico}>
          <div style={headerBox}><PieChart size={18} color="#64748b" /><strong>Gastos por Conta Contábil</strong></div>
          <div style={painelGrafico}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div><span style={{ fontSize: '13px' }}>Aluguel e Infraestrutura (77.4%)</span><div style={{ background: '#ef4444', height: '12px', borderRadius: '4px', width: '77%' }}></div></div>
              <div><span style={{ fontSize: '13px' }}>Marketing e Vendas (22.6%)</span><div style={{ background: '#f59e0b', height: '12px', borderRadius: '4px', width: '22%' }}></div></div>
            </div>
          </div>
        </div>
        
        <div style={boxGrafico}>
          <div style={headerBox}><Filter size={18} color="#64748b" /><strong>Origem das Receitas</strong></div>
          <div style={painelGrafico}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <div><span style={{ fontSize: '13px' }}>Venda de Produtos (65.2%)</span><div style={{ background: '#10b981', height: '12px', borderRadius: '4px', width: '65%' }}></div></div>
              <div><span style={{ fontSize: '13px' }}>Prestação de Serviços (34.8%)</span><div style={{ background: '#06b6d4', height: '12px', borderRadius: '4px', width: '34%' }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Extrato Analítico do Período</h3>
      <div style={containerTabela}>
        <table style={tabelaEstilo}>
          <thead>
            <tr style={thEstilo}>
              <th style={paddingTd}>Data</th><th style={paddingTd}>Conta Contábil</th><th style={paddingTd}>Descrição</th><th style={paddingTd}>Tipo</th><th style={paddingTd}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={paddingTd}>{t.data}</td>
                <td style={paddingTd}>{t.conta_contabil}</td>
                <td style={paddingTd}>{t.descricao}</td>
                <td style={paddingTd}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b' }}>{t.tipo.toUpperCase()}</span>
                </td>
                <td style={{ ...paddingTd, fontWeight: 'bold', color: t.tipo === 'receita' ? '#10b981' : '#ef4444' }}>{fmtMoeda(t.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const gridEstilo: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' };
const cardMétrica: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const labelMétrica: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 };
const boxGrafico: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const headerBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' };
const painelGrafico: React.CSSProperties = { background: '#f8fafc', padding: '20px', borderRadius: '6px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' };
const containerTabela: React.CSSProperties = { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const tabelaEstilo: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };
const thEstilo: React.CSSProperties = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const paddingTd: React.CSSProperties = { padding: '12px 16px' };
