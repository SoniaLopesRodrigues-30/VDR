import React from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { useOrcamentos } from './useOrcamentos';
import { ModalOrcamento } from './ModalOrcamento';
import './Orcamentos.css'; 

export default function Orcamentos() {
  const {
    modalAberto,
    setModalAberto,
    busca,
    setBusca,
    orcamentosFiltrados,
    clientesDisponiveis,
    itens,
    setItens,
    valorTotalGeral,
    form,
    handleChangeForm,
    onAdicionarItem,
    fecharModal,
    handleSalvarOrcamento,
    carregando,
    idEditando,          
    iniciarEdicao,       
    handleDeletarOrcamento 
  } = useOrcamentos();

  return (
    <div className="orcamentos-container">
      
      {/* CABEÇALHO */}
      <div className="header-container">
        <div>
          <h1 className="header-title">Orçamentos</h1>
          <p className="header-subtitle">Visualize, crie e gerencie as propostas comerciais.</p>
        </div>
        <button onClick={() => setModalAberto(true)} className="btn-novo-orcamento">
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      {/* BUSCA */}
      <div className="busca-container">
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por número ou nome do cliente..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {/* TABELA PRINCIPAL DE LISTAGEM */}
      <div className="tabela-wrapper">
        <table className="tabela-orcamentos">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Validade</th>
              <th align="right">Valor Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={6} className="tabela-vazia">Carregando orçamentos do banco...</td>
              </tr>
            ) : orcamentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="tabela-vazia">Nenhum orçamento encontrado.</td>
              </tr>
            ) : (
              orcamentosFiltrados.map((orcamento) => (
                <tr key={orcamento.id}>
                  <td className="td-numero" style={{ fontWeight: '600', color: '#2563eb' }}>
                    {orcamento.numero}
                  </td>
                  <td className="td-nome">{orcamento.clienteNome}</td>
                  <td className="td-texto">
                    {orcamento.validade 
                      ? new Date(orcamento.validade + 'T00:00:00').toLocaleDateString('pt-BR') 
                      : 'Não informada'}
                  </td>
                  <td className="td-valor" align="right" style={{ fontWeight: '600' }}>
                    {orcamento.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>
                    <span className={`status-badge status-${orcamento.status.toLowerCase()}`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="td-acoes" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => iniciarEdicao(orcamento)} title="Editar" className="btn-acao-editar" style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeletarOrcamento(orcamento.id)} title="Excluir" className="btn-acao-excluir" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RENDERIZAÇÃO DO MODAL */}
      {modalAberto && (
        <ModalOrcamento
          onFechar={fecharModal}
          onSalvar={handleSalvarOrcamento}
          clientesDisponiveis={clientesDisponiveis}
          itens={itens}
          setItens={setItens}
          valorTotalGeral={valorTotalGeral}
          form={form}
          handleChangeForm={handleChangeForm}
          onAdicionarItem={onAdicionarItem}
          idEditando={idEditando}
        />
      )}
    </div>
  );
}
