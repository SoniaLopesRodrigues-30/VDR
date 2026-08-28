// src/components/Relatorios/Relatorios.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Wallet, Users, Package, FileText, ClipboardList } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

// Importações dos relatórios modulares individuais
import RelatorioFinanceiro from './RelatorioFinanceiro';
import RelatorioClientes from './RelatorioClientes';
import RelatorioProdutos from './RelatorioProdutos';
import RelatorioOrcamentos from './RelatorioOrcamentos';
import RelatorioOrdens from './RelatorioOrdens';

type Abas = 'financeiro' | 'clientes' | 'produtos' | 'orcamentos' | 'ordens';

export default function Relatorios() {
  const [abaAtiva, setAbaAtiva] = useState<Abas>('financeiro');
  const [carregando, setCarregando] = useState(true);

  // Filtro de competência mensal (Padrão: Mês atual do sistema)
  const hoje = new Date();
  const [mesAnoFiltro, setMesAnoFiltro] = useState(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`);

  // Estados com tipagem inicial explícita
  const [financeiro, setFinanceiro] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [ordens, setOrdens] = useState<any[]>([]);

  const carregarTudo = useCallback(async () => {
    try {
      setCarregando(true);
      
      // CORREÇÃO: Ajustado chamadas para ler 'fluxo_caixa' e 'titulos_receber' unificados
      const [resCaixa, resTitulos, resCli, resProd, resOrc, resOrd] = await Promise.all([
        supabase.from('fluxo_caixa').select('*'),
        supabase.from('titulos_receber').select('*, clientes(nome)').in('status', ['Pendente', 'Atrasado']),
        supabase.from('clientes').select('*'),
        supabase.from('produtos').select('*'),
        supabase.from('orcamentos').select('*'),
        supabase.from('ordens_servico').select('*')
      ]);

      // 1. Mapeia dados reais do caixa
      const reais = (resCaixa.data || []).map(t => ({
        ...t,
        tipo: (t.tipo?.toLowerCase() === 'entrada' || t.tipo?.toLowerCase() === 'receita') ? 'receita' : 'despesa',
        status: 'realizado'
      }));

      // 2. Mapeia previsões futuras do contas a pagar/receber
      const previstos = (resTitulos.data || []).map(t => ({
        id: `prev-${t.id}`,
        descricao: `[Previsão] NFe ${t.nfe_id} - Parcela ${t.parcela}`,
        conta_contabil: t.tipo === 'Pagar' ? 'Custos / Despesas' : 'Receita de Vendas',
        valor: Number(t.valor_parcela || 0),
        data: t.data_vencimento,
        tipo: t.tipo === 'Pagar' ? 'despesa' : 'receita',
        status: 'pendente'
      }));

      setFinanceiro([...reais, ...previstos]);
      
      if (resCli.data) setClientes(resCli.data);
      if (resProd.data) setProdutos(resProd.data);
      if (resOrc.data) setOrcamentos(resOrc.data);
      if (resOrd.data) setOrdens(resOrd.data);

    } catch (err) {
      console.error(err);
      alert('Erro ao sincronizar dados analíticos do Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { 
    carregarTudo(); 
  }, [carregarTudo]);

  // FILTRO DINÂMICO LOCAL: Filtra os registros financeiros com base no Mês/Ano selecionado no topo
  const financeiroFiltrado = useMemo(() => {
    if (!mesAnoFiltro) return financeiro;
    return financeiro.filter(t => {
      if (!t.data) return false;
      // Extrai o padrão YYYY-MM da data do registro (ex: "2026-08-15" vira "2026-08")
      return t.data.substring(0, 7) === mesAnoFiltro;
    });
  }, [financeiro, mesAnoFiltro]);

  const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* CABEÇALHO COM SELETOR DE PERÍODO MENSAL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} color="#3b82f6" />
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Central de Relatórios Gerenciais</h1>
        </div>
        
        {/* SELETOR DE MÊS GERENCIAL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Período de Análise:</label>
          <input 
            type="month" 
            value={mesAnoFiltro}
            onChange={e => setMesAnoFiltro(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: 'bold', backgroundColor: '#f8fafc' }}
          />
        </div>
      </div>

      {/* MENUS DE ABAS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button onClick={() => setAbaAtiva('financeiro')} style={{ ...abaBtn, ...(abaAtiva === 'financeiro' ? ativo : {}) }}><Wallet size={16} /> Financeiro</button>
        <button onClick={() => setAbaAtiva('clientes')} style={{ ...abaBtn, ...(abaAtiva === 'clientes' ? ativo : {}) }}><Users size={16} /> Clientes</button>
        <button onClick={() => setAbaAtiva('produtos')} style={{ ...abaBtn, ...(abaAtiva === 'produtos' ? ativo : {}) }}><Package size={16} /> Produtos</button>
        <button onClick={() => setAbaAtiva('orcamentos')} style={{ ...abaBtn, ...(abaAtiva === 'orcamentos' ? ativo : {}) }}><FileText size={16} /> Orçamentos</button>
        <button onClick={() => setAbaAtiva('ordens')} style={{ ...abaBtn, ...(abaAtiva === 'ordens' ? ativo : {}) }}><ClipboardList size={16} /> Ordens de Serviço</button>
      </div>

      {carregando ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Sincronizando tabelas do Supabase...</div>
      ) : (
        <>
         {abaAtiva === 'financeiro' && (
            <RelatorioFinanceiro 
              dados={financeiro} // ✅ Envia o histórico completo para alimentar o gráfico de barras
              mesAnoSelecionado={mesAnoFiltro} // ✅ Passa o mês ativo para gerar as contas do DRE
              fmtMoeda={fmtMoeda} 
            />
          )}

          {abaAtiva === 'clientes' && <RelatorioClientes dados={clientes} fmtMoeda={fmtMoeda} />}
          {abaAtiva === 'produtos' && <RelatorioProdutos dados={produtos} fmt={fmtMoeda} />}
          {abaAtiva === 'orcamentos' && <RelatorioOrcamentos dados={orcamentos} fmt={fmtMoeda} />}
          {abaAtiva === 'ordens' && <RelatorioOrdens dados={ordens} />}
        </>
      )}
    </div>
  );
}

const abaBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#475569', fontSize: '13px' };
const ativo: React.CSSProperties = { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' };
