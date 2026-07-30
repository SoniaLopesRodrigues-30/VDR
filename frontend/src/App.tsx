import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, FileText, ClipboardList, Package, LayoutDashboard, Receipt } from 'lucide-react';
import Clientes from './Clientes';
import Orcamentos from './components/Orcamentos/Orcamentos'; 
import Nfe from './Nfe';

// 1. IMPORTAÇÃO CORRIGIDA COM CHAVES PARA EVITAR O ERRO DE EXPORT DEFAULT
import { OrdensServico } from "./components/OrdServ/OrdensServico";

// Componentes temporários restantes
const Dashboard = () => <div style={{ padding: '24px' }}><h2>📊 Painel Geral (Dashboard)</h2></div>;
const Produtos = () => <div style={{ padding: '24px' }}><h2>📦 Cadastro de Produtos</h2></div>;

// Componente auxiliar para dar efeito visual de "Link Ativo" no menu lateral
function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isAtivo = location.pathname === to;

  return (
    <Link 
      to={to} 
      style={{
        ...menuStyle,
        backgroundColor: isAtivo ? '#1e293b' : 'transparent',
        color: isAtivo ? '#38bdf8' : '#cbd5e1'
      }}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        
        {/* MENU LATERAL (SIDEBAR) */}
        <nav style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '32px', color: '#38bdf8', paddingLeft: '8px' }}>
            VDR GESTOR
          </div>

          {/* links utilizando o modificador dinâmico de ativo */}
          <MenuLink to="/"><LayoutDashboard size={20} /> Dashboard</MenuLink>
          <MenuLink to="/clientes"><Users size={20} /> Clientes</MenuLink>
          <MenuLink to="/produtos"><Package size={20} /> Produtos</MenuLink>
          <MenuLink to="/orcamentos"><FileText size={20} /> Orçamentos</MenuLink>
          <MenuLink to="/ordens"><ClipboardList size={20} /> Ordens de Serviço</MenuLink>
          <MenuLink to="/nfe"><Receipt size={20} /> Nota Fiscal (NF-e)</MenuLink>
          
          <div style={{ marginTop: 'auto', fontSize: '12px', color: '#64748b', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '12px' }}>
            v1.0.0 (2026)
          </div>
        </nav>

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
            {/* 2. ROTA MAPEADA PARA RECEBER O COMPONENTE NOMEADO */}
            <Route path="/ordens" element={<OrdensServico />} />
            <Route path="/nfe" element={<Nfe />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

// Estilização padrão dos botões do menu
const menuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#cbd5e1',
  textDecoration: 'none',
  padding: '12px',
  borderRadius: '6px',
  fontWeight: '500',
  transition: 'all 0.2s',
  cursor: 'pointer'
};
