import React from 'react';
import { Plus, Search, Trash2, Edit, X } from 'lucide-react';
import { useClientes } from './useClientes';
import './Clientes.css';

export default function Clientes() {
  const {
    busca, setBusca,
    modalAberto, setModalAberto,
    nome, setNome,
    tipo, setTipo,
    documento, setDocumento,
    email, setEmail,
    telefone, setTelefone,
    status, setStatus,
    cep, setCep,
    logradouro, setLogradouro,
    numero, setNumero,
    bairro, setBairro,
    cidade, setCidade,
    uf, setUf,
    clientesFiltrados,
    handleSalvarCliente,
    handleDeletar,
    fecharModal
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

      {/* MODAL */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <button type="button" onClick={fecharModal} className="btn-fechar-modal">
              <X size={20} />
            </button>

            <h3 className="modal-title">Cadastrar Novo Cliente</h3>

            <form onSubmit={handleSalvarCliente} className="form-modal">
              
              {/* SELETOR DE TIPO (FÍSICA / JURÍDICA) */}
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

              {/* DADOS BÁSICOS (LADO A LADO) */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '1 1 240px' }}>
                  <label className="form-label">
                    {tipo === 'Física' ? 'Nome Completo *' : 'Razão Social *'}
                  </label>
                  <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder={tipo === 'Física' ? "Ex: Maria Souza" : "Ex: Minha Empresa Ltda"} className="input-padrao" />
                </div>

                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="form-label">
                    {tipo === 'Física' ? 'CPF *' : 'CNPJ *'}
                  </label>
                  <input type="text" required value={documento} onChange={e => setDocumento(e.target.value)} placeholder={tipo === 'Física' ? "000.000.000-00" : "00.000.000/0001-00"} className="input-padrao" />
                </div>
              </div>

              {/* CONTATOS (LADO A LADO) */}
              <div className="form-row">
                <div className="form-group" style={{ flex: '1 1 240px' }}>
                  <label className="form-label">E-mail *</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Ex: maria@email.com" className="input-padrao" />
                </div>
                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="form-label">Telefone</label>
                  <input type="text" value={telefone} onChange={e => setTelephone => setTelefone(e.target.value)} placeholder="Ex: (11) 99999-9999" className="input-padrao" />
                </div>
              </div>

              {/* DIVISOR VISUAL PARA ENDEREÇO */}
              <div className="divisor-endereco">
                <span className="label-secao">Endereço do Cliente</span>
              </div>

              {/* ENDEREÇO LINHA 1 (CEP / LOGRADOURO / NÚMERO) */}
              <div className="form-row">
                <div className="form-group flex-cep">
                  <label className="form-label" style={{ fontSize: '13px' }}>CEP</label>
                  <input type="text" value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000" className="input-padrao" />
                </div>
                <div className="form-group flex-rua">
                  <label className="form-label" style={{ fontSize: '13px' }}>Rua / Logradouro</label>
                  <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Ex: Av. Central" className="input-padrao" />
                </div>
                <div className="form-group flex-num">
                  <label className="form-label" style={{ fontSize: '13px' }}>Número</label>
                  <input type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 123" className="input-padrao" />
                </div>
              </div>

              {/* ENDEREÇO LINHA 2 (BAIRRO / CIDADE / UF) */}
              <div className="form-row">
                <div className="form-group flex-bairro-cidade">
                  <label className="form-label" style={{ fontSize: '13px' }}>Bairro</label>
                  <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Ex: Centro" className="input-padrao" />
                </div>
                <div className="form-group flex-bairro-cidade">
                  <label className="form-label" style={{ fontSize: '13px' }}>Cidade</label>
                  <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: São Paulo" className="input-padrao" />
                </div>
                <div className="form-group flex-uf">
                  <label className="form-label" style={{ fontSize: '13px' }}>UF</label>
                  <input type="text" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} placeholder="SP" className="input-padrao" />
                </div>
              </div>

              {/* CONFIGURAÇÃO DE STATUS */}
              <div className="form-group" style={{ marginTop: '4px' }}>
                <label className="form-label">Status do Cadastro</label>
                <select value={status} onChange={e => setStatus(e.target.value as 'Ativo' | 'Inativo')} className="input-padrao">
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="modal-footer">
                <button type="button" onClick={fecharModal} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
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
