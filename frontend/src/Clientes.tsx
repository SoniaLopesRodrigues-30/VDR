import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit, X } from 'lucide-react';

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface Cliente {
  id: number;
  nome: string;
  tipo: 'Física' | 'Jurídica';
  documento: string; 
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  endereco: Endereco;
}

export default function Clientes() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário (Dados Básicos)
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Física' | 'Jurídica'>('Física');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  
  // Estados do Formulário (Endereço)
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  
  // Lista de Clientes com o objeto de endereço estruturado
  const [clientes, setClientes] = useState<Cliente[]>([
    { 
      id: 1, 
      nome: 'Ana Silva', 
      tipo: 'Física', 
      documento: '123.456.789-00', 
      email: 'ana.silva@email.com', 
      telefone: '(11) 99999-1111', 
      status: 'Ativo',
      endereco: { cep: '01001-000', logradouro: 'Praça da Sé', numero: '100', bairro: 'Sé', cidade: 'São Paulo', uf: 'SP' }
    },
    { 
      id: 2, 
      nome: 'Tech Soluções Ltda', 
      tipo: 'Jurídica', 
      documento: '12.345.678/0001-99', 
      email: 'contato@techsolucoes.com', 
      telefone: '(21) 3333-2222', 
      status: 'Ativo',
      endereco: { cep: '20040-002', logradouro: 'Avenida Rio Branco', numero: '500', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ' }
    },
  ]);

  // Salvar Cliente
  const handleSalvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !documento) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    const novoCliente: Cliente = {
      id: Date.now(),
      nome,
      tipo,
      documento,
      email,
      telefone,
      status,
      endereco: { cep, logradouro, numero, bairro, cidade, uf }
    };
    setClientes([novoCliente, ...clientes]);
    fecharModal();
  };

  const fecharModal = () => {
    setNome('');
    setTipo('Física');
    setDocumento('');
    setEmail('');
    setTelefone('');
    setStatus('Ativo');
    setCep('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setCidade('');
    setUf('');
    setModalAberto(false);
  };

  const handleDeletar = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
    cliente.documento.includes(busca) ||
    cliente.endereco.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Clientes</h1>
          <p style={{ color: '#64748b', marginTop: '4px', margin: 0 }}>Gerencie cadastros, contatos e endereços.</p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* BUSCA */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', marginBottom: '20px', maxWidth: '400px', gap: '8px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por nome, e-mail, CPF/CNPJ ou cidade..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
        />
      </div>

      {/* TABELA */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#475569' }}>Nome / Razão Social</th>
              <th style={{ padding: '16px', color: '#475569' }}>CPF / CNPJ</th>
              <th style={{ padding: '16px', color: '#475569' }}>Localidade</th>
              <th style={{ padding: '16px', color: '#475569' }}>E-mail</th>
              <th style={{ padding: '16px', color: '#475569' }}>Status</th>
              <th style={{ padding: '16px', color: '#475569', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>
                  {cliente.nome}
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>{cliente.tipo}</span>
                </td>
                <td style={{ padding: '16px', color: '#334155', fontFamily: 'monospace' }}>{cliente.documento}</td>
                <td style={{ padding: '16px', color: '#334155' }}>
                  {cliente.endereco.cidade ? `${cliente.endereco.cidade} - ${cliente.endereco.uf}` : 'Não informado'}
                </td>
                <td style={{ padding: '16px', color: '#334155' }}>{cliente.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: cliente.status === 'Ativo' ? '#dcfce7' : '#fee2e2', color: cliente.status === 'Ativo' ? '#15803d' : '#b91c1c', padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
                    {cliente.status}
                  </span>
                </td>
                <td style={{ padding: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Edit size={16} /></button>
                  <button onClick={() => handleDeletar(cliente.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* MODAL */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: '8px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <button type="button" onClick={fecharModal} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 20px 0' }}>Cadastrar Novo Cliente</h3>

            <form onSubmit={handleSalvarCliente} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* SELETOR DE TIPO (FÍSICA / JURÍDICA) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Tipo de Pessoa</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" checked={tipo === 'Física'} onChange={() => { setTipo('Física'); setDocumento(''); }} /> Pessoa Física
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input type="radio" name="tipo" checked={tipo === 'Jurídica'} onChange={() => { setTipo('Jurídica'); setDocumento(''); }} /> Pessoa Jurídica
                  </label>
                </div>
              </div>

              {/* DADOS BÁSICOS (LADO A LADO) */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                    {tipo === 'Física' ? 'Nome Completo *' : 'Razão Social *'}
                  </label>
                  <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder={tipo === 'Física' ? "Ex: Maria Souza" : "Ex: Minha Empresa Ltda"} style={inputStyle} />
                </div>

                <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                    {tipo === 'Física' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <input type="text" required value={documento} onChange={e => setDocumento(e.target.value)} placeholder={tipo === 'Física' ? "000.000.000-00" : "00.000.000/0001-00"} style={inputStyle} />
                </div>
              </div>

              {/* CONTATOS (LADO A LADO) */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>E-mail *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: maria@email.com" style={inputStyle} />
                </div>

                <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Telefone</label>
                  <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Ex: (11) 99999-9999" style={inputStyle} />
                </div>
              </div>

              {/* DIVISOR VISUAL PARA ENDEREÇO */}
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Endereço do Cliente</span>
              </div>

              {/* ENDEREÇO LINHA 1 (CEP / LOGRADOURO / NÚMERO) */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>CEP</label>
                  <input type="text" value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000" style={inputStyle} />
                </div>
                <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Rua / Logradouro</label>
                  <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Ex: Av. Central" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Número</label>
                  <input type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 123" style={inputStyle} />
                </div>
              </div>

              {/* ENDEREÇO LINHA 2 (BAIRRO / CIDADE / UF) */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Bairro</label>
                  <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Ex: Centro" style={inputStyle} />
                </div>
                <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>Cidade</label>
                  <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: São Paulo" style={inputStyle} />
                </div>
                <div style={{ flex: '0 0 70px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#475569' }}>UF</label>
                  <input type="text" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} placeholder="SP" style={inputStyle} />
                </div>
              </div>

              {/* CONFIGURAÇÃO DE STATUS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Status do Cadastro</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'Ativo' | 'Inativo')} style={inputStyle}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button type="button" onClick={fecharModal} style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#475569' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ backgroundColor: '#38bdf8', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#0f172a' }}>
                  Salvar Cliente
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const
};
