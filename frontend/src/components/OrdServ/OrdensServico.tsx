// src/components/OrdensServico/OrdensServico.tsx
import React from 'react';
import { Wrench, Search } from 'lucide-react';
import { useOrdensServico } from './useOrdensServico';
import { FormularioOS } from './FormularioOS';
import { ListaOS } from './ListaOS';
import * as S from './OrdensServico.styles';

export default function OrdensServico() {
  // Consome todas as variáveis e ações diretamente do custom hook estruturado
  const hooks = useOrdensServico();

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}><Wrench size={26} /> Ordens de Serviço (OS)</h2>

      {/* Repassa as propriedades tratadas para o formulário */}
      <FormularioOS 
        clientes={hooks.clientes} clienteId={hooks.clienteId} setClienteId={hooks.setClienteId}
        validade={hooks.validade} setValidade={hooks.setValidade} itens={hooks.itens} setItens={hooks.setItens}
        idEditando={hooks.idEditando} cancelarEdicao={hooks.cancelarEdicao} especificacao={hooks.especificacao}
        setEspecificacao={hooks.setEspecificacao} qtd={hooks.qtd} setQtd={hooks.setQtd}
        valUnit={hooks.valUnit} setValUnit={hooks.setValUnit} dataItem={hooks.dataItem}
        setDataItem={hooks.setDataItem} incluirItemNaGrid={hooks.incluirItemNaGrid}
        handleSalvarOS={hooks.handleSalvarOS} totalGeralCalculado={hooks.totalGeralCalculado}
      />

      {/* Caixa de Busca Local */}
      <div style={S.buscaContainerStyle}>
        <input 
          type="text" 
          placeholder="Buscar ordens de serviço..." 
          value={hooks.busca} 
          onChange={e => hooks.setBusca(e.target.value)} 
          style={S.inputBuscaStyle} 
        />
        <Search size={18} style={S.iconeBuscaStyle} />
      </div>

      {/* Tabela/Grade de Cards dos registros cadastrados */}
      <ListaOS 
        carregando={hooks.carregando} ordensFiltradas={hooks.ordensFiltradas} 
        onEditarOS={hooks.ativarEdicaoOS} handleFinalizarOS={hooks.handleFinalizarOS} 
        handleBaixaParcialOS={hooks.handleBaixaParcialOS} lidarComImpressaoOS={hooks.lidarComImpressaoOS}
      />
    </div>
  );
}
