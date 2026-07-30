import React from 'react';
import { Plus, Search } from 'lucide-react';
import { useOrcamentos } from './useOrcamentos';
import { TabelaOrcamentos } from './TabelaOrcamentos';
import { ModalOrcamento } from './ModalOrcamento';
import './Orcamentos.css';

export default function Orcamentos() {
  const hooks = useOrcamentos();

  return (
    <div className="orcamentos-container">
      {/* CABEÇALHO */}
      <div className="header-container">
        <div>
          <h1 className="header-title">Orçamentos</h1>
          <p className="header-subtitle">Emita, controle e gerencie propostas comerciais.</p>
        </div>
        <button onClick={() => hooks.setModalAberto(true)} className="btn-novo-orcamento">
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      {/* BUSCA */}
      <div className="busca-container">
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por número ou cliente..." 
          value={hooks.busca}
          onChange={(e) => hooks.setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      {/* TABELA COMPONENTIZADA */}
      <TabelaOrcamentos orcamentos={hooks.orcamentosFiltrados} />

      {/* MODAL COMPONENTIZADO */}
      {hooks.modalAberto && (
        <ModalOrcamento 
          onFechar={hooks.fecharModal}
          onSalvar={hooks.handleSalvarOrcamento}
          clienteId={hooks.clienteId}
          setClienteId={hooks.setClienteId}
          clientesDisponiveis={hooks.clientesDisponiveis}
          validade={hooks.validade}
          setValidade={hooks.setValidade}
          descricaoItem={hooks.descricaoItem}
          setDescricaoItem={hooks.setDescricaoItem}
          qtdItem={hooks.qtdItem}
          setQtdItem={hooks.setQtdItem}
          valorItem={hooks.valorItem}
          setValorItem={hooks.setValorItem}
          onAdicionarItem={hooks.handleAdicionarItem}
          itens={hooks.itens}
          setItens={hooks.setItens}
          valorTotalGeral={hooks.valorTotalGeral}
          status={hooks.status}
          setStatus={hooks.setStatus}
        />
      )}
    </div>
  );
}
