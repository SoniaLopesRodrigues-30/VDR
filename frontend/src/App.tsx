// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, FileText, ClipboardList, Package, LayoutDashboard, Receipt, DollarSign, BarChart3 } from 'lucide-react';

import Clientes from './components/Clientes/Clientes';
import Orcamentos from './components/Orcamentos/Orcamentos'; 
import Nfe from './Nfe';
import { OrdensServico } from "./components/OrdServ/OrdensServico";
import FluxoCaixa from './components/FluxoCaixa/FluxoCaixa';

// IMPORTAÇÃO CORRETA DO COMPONENTE REAL DE PRODUTOS
import Produtos from './components/Produtos/Produtos';

// IMPORTAÇÃO DA NOVA CENTRAL DE RELATÓRIOS SEPARADA
import Relatorios from './components/Relatorios/Relatorios';

// IMPORTAÇÃO DOS ESTILOS ESTRUTURAIS DO APP
import * as S from './App.styles';

const Dashboard = () => <div style={{ padding: '24px' }}><h2>📊 Painel Geral (Dashboard)</h2></div>;

function MenuLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isAtivo = location.pathname === to;

  return (
    <Link 
      to={to} 
      style={{
        ...S.menuStyle,
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
      <div style={S.layoutStyle}>
        
        {/* MENU LATERAL (SIDEBAR) */}
        <nav style={S.sidebarStyle}>
          <div style={S.logoStyle}>VDR GESTOR</div>

          <MenuLink to="/"><LayoutDashboard size={20} /> Dashboard</MenuLink>
          <MenuLink to="/clientes"><Users size={20} /> Clientes</MenuLink>
          <MenuLink to="/produtos"><Package size={20} /> Produtos</MenuLink>
          <MenuLink to="/orcamentos"><FileText size={20} /> Orçamentos</MenuLink>
          <MenuLink to="/ordens"><ClipboardList size={20} /> Ordens de Serviço</MenuLink>
          <MenuLink to="/nfe"><Receipt size={20} /> Nota Fiscal (NF-e)</MenuLink>
          <MenuLink to="/fluxo-caixa"><DollarSign size={20} /> Fluxo de Caixa</MenuLink>
          <MenuLink to="/relatorios"><BarChart3 size={20} /> Relatórios</MenuLink>
          
          <div style={S.footerStyle}>v1.0.0 (2026)</div>
        </nav>

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        <main style={S.mainContentStyle}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/ordens" element={<OrdensServico />} />
            <Route path="/nfe" element={<Nfe />} />
            <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}
