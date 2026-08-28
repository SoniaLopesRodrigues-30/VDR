// src/components/Relatorios/RelatorioFinanceiro.tsx
import React, { useMemo } from 'react';
import { PieChart, Filter } from 'lucide-react';

interface Transacao {
  id: number; 
  data: string; 
  descricao: string; 
  conta_contabil: string; 
  tipo: 'receita' | 'despesa'; 
  valor: number;
}

interface Props {
  dados: Transacao[];
  fmtMoeda: (v: number) => string;
}

export default function RelatorioFinanceiro({ dados, fmtMoeda }: Props) {
  // 1. Cálculos Globais
  const receitas = useMemo(() => dados.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0), [dados]);
  const despesas = useMemo(() => dados.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0), [dados]);
  const lucro = receitas - despesas;
  const margem = receitas > 0 ? ((lucro / receitas) * 100).toFixed(1) : '0.0';

  // 2. Gráfico Dinâmico: Gastos por Conta Contábil (Despesas)
  const gastosPorConta = useMemo(() => {
    const despesasFiltradas = dados.filter(t => t.tipo === 'despesa');
    const agrupado: Record<string, number> = {};
    
    despesasFiltradas.forEach(t => {
      agrupado[t.conta_contabil] = (agrupado[t.conta_contabil] || 0) + t.valor;
    });

    return Object.entries(agrupado)
      .map(([nome, valor]) => ({
        nome,
        porcentagem: despesas > 0 ? (valor / despesas) * 100 : 0
      }))
      .sort((a, b) => b.porcentagem - a.porcentagem); // Do maior para o menor
  }, [dados, despesas]);

  // 3. Gráfico Dinâmico: Origem das Receitas
  const receitasPorConta = useMemo(() => {
    const receitasFiltradas = dados.filter(t => t.tipo === 'receita');
    const agrupado: Record<string, number> = {};
    
    receitasFiltradas.forEach(t => {
      agrupado[t.conta_contabil] = (agrupado[t.conta_contabil] || 0) + t.valor;
    });

    return Object.entries(agrupado)
      .map(([nome, valor]) => ({
        nome,
        porcentagem: receitas > 0 ? (valor / receitas) * 100 : 0
      }))
      .sort((a, b) => b.porcentagem - a.porcentagem);
  }, [dados, receitas]);

  // Cores dinâmicas para as barras do gráfico
  const coresDespesas = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#64748b'];
  const coresReceitas = ['#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={cardMétrica}><p style={labelMétrica}>Faturamento Bruto</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmtMoeda(receitas)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Total de Custos</p><h2 style={{ margin: 0, color: '#ef4444' }}>{fmtMoeda(despesas)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Lucro Líquido</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{fmtMoeda(lucro)}</h2></div>
        <div style={cardMétrica}><p style={labelMétrica}>Margem de Lucro</p><h2 style={{ margin: 0, color: '#8b5cf6' }}>{margem}%</h2></div>
      </div>

      {/* PAINÉIS DE GRÁFICOS DINÂMICOS */}
      <div style={{ ...gridEstilo, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '25px' }}>
        
        {/* GRÁFICO DESPESAS */}
        <div style={boxGrafico}>
          <div style={headerBox}><PieChart size={18} color="#64748b" /><strong>Gastos por Conta Contábil</strong></div>
          <div style={painelGrafico}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {gastosPorConta.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Nenhuma despesa no período.</span>
              ) : (
                gastosPorConta.slice(0, 3).map((item, idx) => (
                  <div key={item.nome}>
                    <div style={{ display: 'flex', justifyContent: 'between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{item.nome} ({item.porcentagem.toFixed(1)}%)</span>
                    </div>
                    <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '4px', width: '100%' }}>
                      <div style={{ background: coresDespesas[idx] || '#cbd5e1', height: '10px', borderRadius: '4px', width: `${item.porcentagem}%`, transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* GRÁFICO RECEITAS */}
        <div style={boxGrafico}>
          <div style={headerBox}><Filter size={18} color="#64748b" /><strong>Origem das Receitas</strong></div>
          <div style={painelGrafico}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {receitasPorConta.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Nenhuma receita no período.</span>
              ) : (
                receitasPorConta.slice(0, 3).map((item, idx) => (
                  <div key={item.nome}>
                    <div style={{ display: 'flex', justifyContent: 'between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{item.nome} ({item.porcentagem.toFixed(1)}%)</span>
                    </div>
                    <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '4px', width: '100%' }}>
                      <div style={{ background: coresReceitas[idx] || '#cbd5e1', height: '10px', borderRadius: '4px', width: `${item.porcentagem}%`, transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* TABELA */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Extrato Analítico do Período</h3>
      <div style={containerTabela}>
        <table style={tabelaEstilo}>
          <thead>
            <tr>
              <th style={thEstilo}>Data</th>
              <th style={thEstilo}>Conta Contábil</th>
              <th style={thEstilo}>Descrição</th>
              <th style={thEstilo}>Tipo</th>
              <th style={thEstilo}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr><td colSpan={5} style={{ ...paddingTd, textAlign: 'center', color: '#94a3b8' }}>Nenhum lançamento encontrado para os filtros selecionados.</td></tr>
            ) : (
              dados.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* Ajuste: Data formatada para PT-BR considerando timezone UTC */}
                  <td style={paddingTd}>{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td style={paddingTd}>{t.conta_contabil}</td>
                  <td style={paddingTd}>{t.descricao}</td>
                  <td style={paddingTd}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>
                      {t.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...paddingTd, fontWeight: 'bold', color: t.tipo === 'receita' ? '#10b981' : '#ef4444' }}>{fmtMoeda(t.valor)}</td>
                </tr>
              ))
            )}
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
// Ajuste: Mudado o height para 'auto' para comportar os gráficos dinâmicos sem estourar o container
const painelGrafico: React.CSSProperties = { background: '#f8fafc', padding: '16px', borderRadius: '6px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' };
const containerTabela: React.CSSProperties = { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const tabelaEstilo: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };
// Ajuste: thEstilo movido diretamente para as tags th individuais da tabela
const thEstilo: React.CSSProperties = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', padding: '12px 16px', fontWeight: '600' };
const paddingTd: React.CSSProperties = { padding: '12px 16px', color: '#334155' };
