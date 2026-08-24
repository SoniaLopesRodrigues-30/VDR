// src/components/Titulos/Titulos.tsx
import React from 'react';
import { Landmark } from 'lucide-react';
import { useTitulos } from './useTitulos';
import FormTitulo from './FormTitulo';
import TabelaTitulos from './TabelaTitulos';
import * as S from './Titulos.styles';

export default function Titulos() {
  const { 
    busca, 
    setBusca, 
    carregando, 
    titulosFiltrados, 
    handleBaixarTitulo, 
    handleAtualizarTitulo,
    handleDeletarTitulo,
    carregarTitulos,
    tituloEmEdicao,
    iniciarEdicao,
    cancelarEdicao 
  } = useTitulos();

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}>
        <Landmark size={26} /> Gestão Financeira — Títulos a Pagar e Receber
      </h2>

      {/* FORMULÁRIO ISOLADO DE LANÇAMENTO E EDIÇÃO */}
      <FormTitulo 
        tituloEmEdicao={tituloEmEdicao} 
        cancelarEdicao={cancelarEdicao} 
        aoSalvar={carregarTitulos}
        aoAtualizar={handleAtualizarTitulo} 
      />

      {/* BARRA DE PESQUISA */}
      <div style={S.buscaContainerStyle}>
        <input 
          type="text" 
          placeholder="Filtrar por cliente, fornecedor, documento ou tipo (pagar/receber)..." 
          style={S.inputStyle} 
          value={busca} 
          onChange={e => setBusca(e.target.value)} 
        />
      </div>

      {/* TABELA DE LISTAGEM DE REGISTROS */}
      <TabelaTitulos 
        carregando={carregando} 
        titulos={titulosFiltrados} 
        onBaixar={handleBaixarTitulo} 
        onEditar={iniciarEdicao} 
        onDeletar={handleDeletarTitulo}
      />
    </div>
  );
}
