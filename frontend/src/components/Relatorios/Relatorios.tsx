// src/components/Relatorios/Relatorios.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

  const [financeiro, setFinanceiro] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [ordens, setOrdens] = useState([]);

  const carregarTudo = useCallback(async () => {
    try {
      setCarregando(true);
      const [resFin, resCli, resProd, resOrc, resOrd] = await Promise.all([
        supabase.from('transacoes').select('*'),
        supabase.from('clientes').select('*'),
        supabase.from('produtos').select('*'),
        supabase.from('orcamentos').select('*'),
        supabase.from('ordens_servico').select('*') // Mude para o nome exato do seu Supabase se for diferente
      ]);

      if (resFin.data) setFinanceiro(resFin.data);
      if (resCli.data) setClientes(resCli.data);
      if (resProd.data) setProdutos(resProd.data);
      if (resOrc.data) setOrcamentos(resOrc.data);
      if (resOrd.data) setOrdens(resOrd.data);

    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados do Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <BarChart3 size={28} color="#3b82f6" />
        <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Central de Relatórios Gerenciais</h1>
      </div>

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
          {abaAtiva === 'financeiro' && <RelatorioFinanceiro dados={financeiro} fmtMoeda={fmtMoeda} />}
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
