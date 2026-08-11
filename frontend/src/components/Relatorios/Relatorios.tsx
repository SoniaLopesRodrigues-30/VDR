// src/components/Relatorios/Relatorios.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Wallet, Users, Calendar } from 'lucide-react';
import RelatorioFinanceiro from './RelatorioFinanceiro';
import RelatorioClientes from './RelatorioClientes';
import { supabase } from '../../services/supabaseClient';

export default function Relatorios() {
  const [abaAtiva, setAbaAtiva] = useState<'financeiro' | 'clientes'>('financeiro');
  const [financeiroDados, setFinanceiroDados] = useState([]);
  const [clientesDados, setClientesDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Busca síncrona dos dois cadastros no Supabase
  const buscarDadosDoBanco = useCallback(async () => {
    try {
      setCarregando(true);

      // 1. Busca dados da tabela transações
      const { data: transacoes, error: errFin } = await supabase
        .from('transacoes')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 2. Busca dados da sua tabela de clientes existente (ajuste o nome se for 'cliente' ou 'users')
      const { data: clientes, error: errCli } = await supabase
        .from('clientes')
        .select('*');

      if (errFin) throw errFin;
      if (errCli) throw errCli;

      if (transacoes) setFinanceiroDados(transacoes);
      if (clientes) setClientesDados(clientes);

    } catch (error) {
      console.error(error);
      alert('Erro ao sincronizar relatórios com o Supabase.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarDadosDoBanco();
  }, [buscarDadosDoBanco]);

  const fmtMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* HEADER DA CENTRAL */}
      <div style={headerContainer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} color="#3b82f6" />
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>Central de Relatórios</h1>
        </div>
      </div>

      {/* SELETOR DE ABAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <button onClick={() => setAbaAtiva('financeiro')} style={{ ...abaEstilo, ...(abaAtiva === 'financeiro' ? abaAtivaEstilo : {}) }}>
          <Wallet size={18} /> Fluxo de Caixa
        </button>
        <button onClick={() => setAbaAtiva('clientes')} style={{ ...abaEstilo, ...(abaAtiva === 'clientes' ? abaAtivaEstilo : {}) }}>
          <Users size={18} /> Clientes Cadastrados
        </button>
      </div>

      {/* COMPONENTE FILHO DINÂMICO COM TRATAMENTO DE LOAD */}
      {carregando ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Sincronizando tabelas do Supabase...</div>
      ) : abaAtiva === 'financeiro' ? (
        <RelatorioFinanceiro dados={financeiroDados} fmtMoeda={fmtMoeda} />
      ) : (
        <RelatorioClientes dados={clientesDados} fmtMoeda={fmtMoeda} />
      )}
    </div>
  );
}

const headerContainer: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' };
const abaEstilo: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#475569' };
const abaAtivaEstilo: React.CSSProperties = { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' };
