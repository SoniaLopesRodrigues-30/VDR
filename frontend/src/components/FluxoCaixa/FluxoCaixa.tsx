// src/components/FluxoCaixa/FluxoCaixa.tsx
import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, X, Printer, Calendar } from 'lucide-react';
import { useFluxoCaixa } from './useFluxoCaixa';
import { gerarHtmlCaixa } from './LayoutImpressaoCaixa';

// Importação dos novos subcomponentes modulares
import { TabelaCaixa } from './TabelaCaixa';

export default function FluxoCaixa() {
  const { transacoes, carregando, mostrarForm, setMostrarForm, form, setForm, receitas: totalBancoReceitas, despesas: totalBancoDespesas, salvar, excluir, idEditando, prepararEdicao, cancelarAcao } = useFluxoCaixa();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Regra de filtro de data por mês
  const dataActual = new Date();
  const mesAnoAtual = `${dataActual.getFullYear()}-${String(dataActual.getMonth() + 1).padStart(2, '0')}`;
  const [mesFiltro, setMesFiltro] = useState(mesAnoAtual);

  const transacoesFiltradas = transacoes.filter(t => t.data && t.data.substring(0, 7) === mesFiltro);

  const receitasFiltradas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + Number(t.valor || 0), 0);
  const despesasFiltradas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + Number(t.valor || 0), 0);
  const saldoFiltrado = receitasFiltradas - despesasFiltradas;

  const lidarComImpressaoCaixa = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      const [ano, mes] = mesFiltro.split('-');
      doc.write(gerarHtmlCaixa({ transacoes: transacoesFiltradas, receitas: receitasFiltradas, despesas: despesasFiltradas, periodo: `${mes}/${ano}` }, "/logo.png"));
      doc.close();
    }
    setTimeout(() => { document.body.removeChild(iframe); }, 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2>Fluxo de Caixa</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <Calendar size={16} color="#64748b" />
            <input type="month" value={mesFiltro} onChange={e => setMesFiltro(e.target.value)} style={{ background: 'none', border: 'none', color: '#334155', fontWeight: 'bold', fontSize: '14px', outline: 'none', cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={lidarComImpressaoCaixa} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Imprimir Relatório">
            <Printer size={16} /> Imprimir Relatório
          </button>
          <button onClick={() => mostrarForm ? cancelarAcao() : setMostrarForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: mostrarForm ? '#64748b' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {mostrarForm ? <X size={16} /> : <Plus size={16} />} {mostrarForm ? 'Fechar' : 'Novo Lançamento'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={cardEstilo}><p style={labelCard}>Receitas do Mês</p><h3 style={{ color: '#10b981', margin: 0 }}>{fmt(receitasFiltradas)}</h3><ArrowUpCircle color="#10b981" /></div>
        <div style={cardEstilo}><p style={labelCard}>Despesas do Mês</p><h3 style={{ color: '#ef4444', margin: 0 }}>{fmt(despesasFiltradas)}</h3><ArrowDownCircle color="#ef4444" /></div>
        <div style={cardEstilo}><p style={labelCard}>Saldo do Mês</p><h3 style={{ color: saldoFiltrado >= 0 ? '#3b82f6' : '#ef4444', margin: 0 }}>{fmt(saldoFiltrado)}</h3><Wallet color={saldoFiltrado >= 0 ? '#3b82f6' : '#ef4444'} /></div>
      </div>

      {mostrarForm && <FormularioCaixa {...{ idEditando, form, setForm, salvar, cancelarAcao, inp }} />}

      <TabelaCaixa {...{ carregando, transacoesFiltradas, prepararEdicao, excluir, fmt, pad }} />
    </div>
  );
}

// Objetos fixos de Estilo mantidos isolados
const cardEstilo: React.CSSProperties = { background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const labelCard: React.CSSProperties = { fontSize: '14px', color: '#64748b', margin: '0 0 5px 0' };
const inp: React.CSSProperties = { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' };
const pad: React.CSSProperties = { padding: '12px 16px' };
