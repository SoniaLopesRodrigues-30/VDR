// Clientes.tsx
import React from 'react';
import { Plus, Search, Trash2, Edit, X } from 'lucide-react';
import { useClientes } from './useClientes';
import { DadosBasicosForm, EnderecoForm } from './CamposFormulario';
import './Clientes.css';

export default function Clientes() {
  const {
    busca, setBusca, modalAberto, setModalAberto,
    nome, setNome, tipo, setTipo, documento, setDocumento,
    inscricaoEstadual, setInscricaoEstadual, email, setEmail,
    telefone, setTelefone, status, setStatus, cep, setCep,
    logradouro, setLogradouro, numero, setNumero, bairro, setBairro,
    cidade, setCidade, uf, setUf, clientesFiltrados,
    handleSalvarCliente, handleDeletar, fecharModal
  } = useClientes();

  return (
    <div className="clientes-container">
      
      {/* CABEÇALHO */}
      <div className="header-container">
        <div>
          <h1 className="header-title">Clientes</h1>
          <p className="header-subtitle">Gerencie cadastros, contatos e endereços.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-novo-cliente">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* BUSCA */}
      <div className="busca-container">
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por nome, e-mail, CPF/CNPJ ou cidade..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {/* TABELA */}
      <div className="tabela-wrapper">
        <table className="tabela-clientes">
          <thead>
            <tr>
              <th>Nome / Razão Social</th>
              <th>CPF / CNPJ</th>
              <th>Localidade</th>
              <th>E-mail</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((cliente) => (
              <tr key={cliente.id}>
                <td className="td-nome">
                  {cliente.nome}
                  <span className="span-tipo">{cliente.tipo}</span>
                </td>
                <td className="td-documento">{cliente.documento}</td>
                <td className="td-texto">
                  {cliente.endereco.cidade ? `${cliente.endereco.cidade} - ${cliente.endereco.uf}` : 'Não informado'}
                </td>
                <td className="td-texto">{cliente.email}</td>
                <td>
                  <span className={`status-badge ${cliente.status === 'Ativo' ? 'status-ativo' : 'status-inativo'}`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="td-acoes">
                  <button title="Editar" className="btn-acao-editar"><Edit size={16} /></button>
                  <button onClick={() => handleDeletar(cliente.id)} title="Excluir" className="btn-acao-excluir"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="tabela-vazia">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <button type="button" onClick={fecharModal} className="btn-fechar-modal">
              <X size={20} />
            </button>

            <h3 className="modal-title">Cadastrar Novo Cliente</h3>

            <form onSubmit={handleSalvarCliente} className="form-modal">
              
              {/* SELETOR DE TIPO */}
              <div className="form-group">
                <label className="form-label">Tipo de Pessoa</label>
                <div className="form-radio-group">
                  <label className="form-radio-label">
                    <input type="radio" name="tipo" checked={tipo === 'Física'} onChange={() => { setTipo('Física'); setDocumento(''); }} /> Pessoa Física
                  </label>
                  <label className="form-radio-label">
                    <input type="radio" name="tipo" checked={tipo === 'Jurídica'} onChange={() => { setTipo('Jurídica'); setDocumento(''); }} /> Pessoa Jurídica
                  </label>
                </div>
              </div>

              {/* BLOCO 1: DADOS BÁSICOS (Subcomponente Organizado) */}
              <DadosBasicosForm 
                tipo={tipo} nome={nome} setNome={setNome}
                documento={documento} setDocumento={setDocumento}
                inscricaoEstadual={inscricaoEstadual} setInscricaoEstadual={setInscricaoEstadual}
              />

              {/* CONTATOS */}
              <div className="form-row">
                <div className="form-group form-group-email">
                  <label className="form-label">E-mail *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: maria@email.com" className="input-padrao" />
                </div>
                <div className="form-group form-group-telefone">
                  <label className="form-label">Telefone</label>
                  <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Ex: (11) 99999-9999" className="input-padrao" />
                </div>
              </div>

              {/* BLOCO 2: ENDEREÇO COMPLETO E STATUS (Subcomponente Organizado) */}
              <EnderecoForm 
                cep={cep} setCep={setCep} logradouro={logradouro} setLogradouro={setLogradouro}
                numero={numero} setNumero={setNumero} bairro={bairro} setBairro={setBairro}
                cidade={cidade} setCidade={setCidade} uf={uf} setUf={setUf}
                status={status} setStatus={setStatus}
              />

              {/* BOTÕES DO FOOTER */}
              <div className="modal-actions-footer">
                <button type="button" onClick={fecharModal} className="btn-cancelar">Cancelar</button>
                <button type="submit" className="btn-salvar">Salvar Cliente</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
