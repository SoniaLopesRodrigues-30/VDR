// src/components/Relatorios/RelatorioFinanceiro.tsx
import React, { useMemo } from 'react';
import { PieChart, Filter, TrendingUp, BarChart2 } from 'lucide-react';

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
  mesAnoSelecionado: string; // "YYYY-MM"
  fmtMoeda: (v: number) => string;
}

export default function RelatorioFinanceiro({ dados, mesAnoSelecionado, fmtMoeda }: Props) {
  
  // 1. FILTRAGEM LOCAL SEGURA (Apenas o mês selecionado)
  const dadosDoMes = useMemo(() => {
    if (!Array.isArray(dados)) return [];
    return dados.filter(t => t && t.data && typeof t.data === 'string' && t.data.substring(0, 7) === mesAnoSelecionado);
  }, [dados, mesAnoSelecionado]);

  const receitasMes = useMemo(() => dadosDoMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor || 0), 0), [dadosDoMes]);
  const despesasMes = useMemo(() => dadosDoMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor || 0), 0), [dadosDoMes]);
  const lucroMes = receitasMes - despesasMes;
  const margemMes = receitasMes > 0 ? ((lucroMes / receitasMes) * 100).toFixed(1) : '0.0';

  // 2. DRE GERENCIAL SEGURO
  const dreAgrupado = useMemo(() => {
    const receitasPorConta: Record<string, number> = {};
    const despesasPorConta: Record<string, number> = {};

    dadosDoMes.forEach(t => {
      const categoria = t.conta_contabil || 'Outros / Não Definido';
      const valorNum = Number(t.valor || 0);

      if (t.tipo === 'receita') {
        receitasPorConta[categoria] = (receitasPorConta[categoria] || 0) + valorNum;
      } else {
        despesasPorConta[categoria] = (despesasPorConta[categoria] || 0) + valorNum;
      }
    });

    return {
      receitas: Object.entries(receitasPorConta),
      despesas: Object.entries(despesasPorConta)
    };
  }, [dadosDoMes]);

  // 3. EVOLUÇÃO MENSAL BLINDADA (Últimos 6 meses)
  const evolucaoMensal = useMemo(() => {
    if (!Array.isArray(dados)) return [];
    const mesesAgrupados: Record<string, { receita: number; despesa: number }> = {};

    dados.forEach(t => {
      // Proteção contra linhas sem data ou registros corrompidos no Supabase
      if (!t || !t.data || typeof t.data !== 'string' || t.data.length < 7) return;
      
      const chaveMes = t.data.substring(0, 7); // "YYYY-MM"
      const valorNum = Number(t.valor || 0);

      if (!mesesAgrupados[chaveMes]) {
        mesesAgrupados[chaveMes] = { receita: 0, despesa: 0 };
      }
      
      if (t.tipo === 'receita') {
        mesesAgrupados[chaveMes].receita += valorNum;
      } else {
        mesesAgrupados[chaveMes].despesa += valorNum;
      }
    });

    return Object.entries(mesesAgrupados)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([mes, valores]) => {
        const partes = mes.split('-');
        const rotulo = partes.length === 2 ? `${partes[1]}/${partes[0]}` : mes;
        return {
          rotulo,
          ...valores,
          maiorValor: Math.max(valores.receita, valores.despesa)
        };
      });
  }, [dados]);

  const tetoMaximoGrafico = useMemo(() => {
    if (evolucaoMensal.length === 0) return 1;
    return Math.max(...evolucaoMensal.map(m => m.maiorValor), 1);
  }, [evolucaoMensal]);

  return (
    <div>
      {/* CARDS VISUAIS */}
      <div style={gridEstilo}>
        <div style={cardMetrica}><p style={labelMetrica}>Faturamento Bruto</p><h2 style={{ margin: 0, color: '#10b981' }}>{fmtMoeda(receitasMes)}</h2></div>
        <div style={cardMetrica}><p style={labelMetrica}>Total de Custos</p><h2 style={{ margin: 0, color: '#ef4444' }}>{fmtMoeda(despesasMes)}</h2></div>
        <div style={cardMetrica}><p style={labelMetrica}>Lucro Líquido</p><h2 style={{ margin: 0, color: '#3b82f6' }}>{fmtMoeda(lucroMes)}</h2></div>
        <div style={cardMetrica}><p style={labelMetrica}>Margem de Lucro</p><h2 style={{ margin: 0, color: '#8b5cf6' }}>{margemMes}%</h2></div>
      </div>

      {/* DRE E EVOLUÇÃO */}
      <div style={{ ...gridEstilo, gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', marginBottom: '25px' }}>
        
        {/* DRE ESTRUTURADO */}
        <div style={boxQuadro}>
          <div style={headerBox}><BarChart2 size={18} color="#0284c7" /><strong>Demonstrativo de Resultado (DRE Gerencial)</strong></div>
          <div style={{ padding: '5px 0' }}>
            
            <div style={linhaDrePai}><span>(+) RECEITA BRUTA OPERACIONAL</span><strong style={{ color: '#10b981' }}>{fmtMoeda(receitasMes)}</strong></div>
            {dreAgrupado.receitas.map(([conta, valor]) => (
              <div key={conta} style={linhaDreFilho}><span>{conta}</span><span>{fmtMoeda(valor)}</span></div>
            ))}

            <div style={{ ...linhaDrePai, marginTop: '10px' }}><span>(-) CUSTOS E DESPESAS OPERACIONAIS</span><strong style={{ color: '#ef4444' }}>{fmtMoeda(despesasMes)}</strong></div>
            {dreAgrupado.despesas.map(([conta, valor]) => (
              <div key={conta} style={linhaDreFilho}><span>{conta}</span><span>{fmtMoeda(valor)}</span></div>
            ))}

            <div style={{ ...linhaDrePai, marginTop: '15px', backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
              <span>(=) LUCRO LÍQUIDO DO PERÍODO</span>
              <strong style={{ color: lucroMes >= 0 ? '#3b82f6' : '#ef4444', fontSize: '15px' }}>{fmtMoeda(lucroMes)}</strong>
            </div>
          </div>
        </div>
        
        {/* EVOLUÇÃO MENSAL */}
        <div style={boxQuadro}>
          <div style={headerBox}><TrendingUp size={18} color="#7c3aed" /><strong>Evolução Mensal (Faturamento vs Custos)</strong></div>
          <div style={containerGraficoBarras}>
            {evolucaoMensal.length === 0 ? (
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Sem histórico de lançamentos disponível.</span>
            ) : (
              evolucaoMensal.map(mes => {
                const altReceita = (mes.receita / tetoMaximoGrafico) * 100;
                const altDespesa = (mes.despesa / tetoMaximoGrafico) * 100;

                return (
                  <div key={mes.rotulo} style={colunaGrafico}>
                    <div style={grupoBarras}>
                      <div title={`Receita: ${fmtMoeda(mes.receita)}`} style={{ ...barraEstilo, height: `${Math.max(altReceita, 4)}%`, backgroundColor: '#10b981' }}></div>
                      <div title={`Despesa: ${fmtMoeda(mes.despesa)}`} style={{ ...barraEstilo, height: `${Math.max(altDespesa, 4)}%`, backgroundColor: '#ef4444' }}></div>
                    </div>
                    <span style={rotuloMesStyle}>{mes.rotulo}</span>
                  </div>
                );
              })
            )}
          </div>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div> Receitas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div> Despesas</div>
          </div>
        </div>

      </div>

      {/* EXTRATO ANALÍTICO */}
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
            {dadosDoMes.length === 0 ? (
              <tr><td colSpan={5} style={{ ...paddingTd, textAlign: 'center', color: '#94a3b8' }}>Nenhum lançamento encontrado para este mês.</td></tr>
            ) : (
              dadosDoMes.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={paddingTd}>{t.data ? new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '---'}</td>
                  <td style={paddingTd}>{t.conta_contabil || 'Geral'}</td>
                  <td style={paddingTd}>{t.descricao}</td>
                  <td style={paddingTd}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', background: t.tipo === 'receita' ? '#d1fae5' : '#fee2e2', color: t.tipo === 'receita' ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>
                      {(t.tipo || '').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...paddingTd, fontWeight: 'bold', color: t.tipo === 'receita' ? '#10b981' : '#ef4444' }}>{fmtMoeda(t.valor || 0)}</td>
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
const cardMetrica: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const labelMetrica: React.CSSProperties = { margin: '0 0 5px 0', fontSize: '13px', color: '#64748b', fontWeight: 500 };
const boxQuadro: React.CSSProperties = { background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const headerBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontSize: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' };const linhaDrePai: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '8px 10px', fontSize: '13px', fontWeight: 'bold', color: '#1e293b', backgroundColor: '#f8fafc', borderRadius: '4px' };const linhaDreFilho: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '6px 20px', fontSize: '13px', color: '#475569', borderBottom: '1px dashed #f1f5f9' };const containerGraficoBarras: React.CSSProperties = { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '180px', padding: '10px 0', borderBottom: '2px solid #e2e8f0', gap: '10px', flex: 1 };const colunaGrafico: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%' };const grupoBarras: React.CSSProperties = { display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', height: '100%', justifyContent: 'center' };const barraEstilo: React.CSSProperties = { width: '16px', borderRadius: '3px 3px 0 0', minHeight: '4px', transition: 'height 0.4s ease' };const rotuloMesStyle: React.CSSProperties = { fontSize: '11px', color: '#64748b', marginTop: '6px', fontWeight: 'bold' };const containerTabela: React.CSSProperties = { overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };const tabelaEstilo: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };const thEstilo: React.CSSProperties = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', padding: '12px 16px', fontWeight: '600' };const paddingTd: React.CSSProperties = { padding: '12px 16px', color: '#334155' };