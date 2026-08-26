import React from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { useClientes } from './useClientes';
import { ModalCliente } from './ModalCliente';
import './Clientes.css';

export default function Clientes() {
  const {
    busca, setBusca,
    modalAberto, setModalAberto,
    form, handleChangeForm,      // <-- ESSENCIAIS: Devem ser extraídos aqui
    idEditando, iniciarEdicao,
    clientesFiltrados,
    handleSalvarCliente,         // <-- ESSENCIAIS: Devem ser extraídos aqui
    handleDeletar,
    fecharModal                  // <-- ESSENCIAIS: Devem ser extraídos aqui
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
                <td className="td-texto">{cliente.email || 'Não informado'}</td>
                <td>
                  <span className={`status-badge ${cliente.status === 'Ativo' ? 'status-ativo' : 'status-inativo'}`}>
                    {cliente.status}
                  </span>
                </td>
                <td className="td-acoes">
                  <button onClick={() => iniciarEdicao(cliente)} title="Editar" className="btn-acao-editar">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeletar(cliente.id)} title="Excluir" className="btn-acao-excluir">
                    <Trash2 size={16} />
                  </button>
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

      {/* MODAL COM PROPS CORRIGIDAS */}
      {modalAberto && (
        <ModalCliente 
          form={form}
          handleChangeForm={handleChangeForm}
          idEditando={idEditando}
          handleSalvarCliente={handleSalvarCliente}
          fecharModal={fecharModal}
        />
      )}
    </div>
  );
}
