import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Users, FileText, ClipboardList, Package, LayoutDashboard, Receipt } from 'lucide-react';
import Clientes from './Clientes';
import Nfe from './Nfe';

// Componentes temporários para as outras telas não quebrarem o código
const Dashboard = () => <div style={{ padding: '24px' }}><h2>📊 Painel Geral (Dashboard)</h2></div>;
const Orcamentos = () => <div style={{ padding: '24px' }}><h2>📄 Gestão de Orçamentos</h2></div>;
const OrdensServico = () => <div style={{ padding: '24px' }}><h2>🛠️ Ordens de Serviço (OS)</h2></div>;
const Produtos = () => <div style={{ padding: '24px' }}><h2>📦 Cadastro de Produtos</h2></div>;

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        
        {/* MENU LATERAL (SIDEBAR) */}
        <nav style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '32px', color: '#38bdf8', paddingLeft: '8px' }}>
            VDR GESTOR
          </div>

          <Link to="/" style={menuStyle}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/clientes" style={menuStyle}><Users size={20} /> Clientes</Link>
          <Link to="/produtos" style={menuStyle}><Package size={20} /> Produtos</Link>
          <Link to="/orcamentos" style={menuStyle}><FileText size={20} /> Orçamentos</Link>
          <Link to="/ordens" style={menuStyle}><ClipboardList size={20} /> Ordens de Serviço</Link>
          <Link to="/nfe" style={menuStyle}><Receipt size={20} /> Nota Fiscal (NF-e)</Link>
          
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
