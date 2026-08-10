import React from 'react';
import { Plus, Search, Trash2, Printer } from 'lucide-react';
import { useOrcamentos } from './useOrcamentos';
import { ModalOrcamento } from './ModalOrcamento';
import './Orcamentos.css'; // Certifique-se de ter esse arquivo de estilos criado

export default function Orcamentos() {
  const {
    modalAberto,
    setModalAberto,
    busca,
    setBusca,
    orcamentosFiltrados,
    clienteId,
    setClienteId,
    clientesDisponiveis,
    validade,
    setValidade,
    descricaoItem,
    setDescricaoItem,
    qtdItem,
    setQtdItem,
    valorItem,
    setValorItem,
    itens,
    setItens,
    valorTotalGeral,
    status,
    setStatus,
    onAdicionarItem,
    fecharModal,
    handleSalvarOrcamento,
    carregando
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
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={5} className="tabela-vazia">Carregando orçamentos do banco...</td>
              </tr>
            ) : orcamentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="tabela-vazia">Nenhum orçamento encontrado.</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RENDERIZAÇÃO DO MODAL COM TODAS AS PROPS CONECTADAS */}
      {modalAberto && (
        <ModalOrcamento
          onFechar={fecharModal}
          onSalvar={handleSalvarOrcamento}
          clienteId={clienteId}
          setClienteId={setClienteId}
          clientesDisponiveis={clientesDisponiveis}
          validade={validade}
          setValidade={setValidade}
          descricaoItem={descricaoItem}
          setDescricaoItem={setDescricaoItem}
          qtdItem={qtdItem}
          setQtdItem={setQtdItem}
          valorItem={valorItem}
          setValorItem={setValorItem}
          onAdicionarItem={onAdicionarItem}
          itens={itens}
          setItens={setItens}
          valorTotalGeral={valorTotalGeral}
          status={status}
          setStatus={setStatus}
        />
      )}
    </div>
  );
}
