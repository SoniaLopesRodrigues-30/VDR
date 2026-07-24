// src/ModalEmissaoNfe.tsx
import React from 'react';
import { X } from 'lucide-react';
import { useNfeForm } from './useNfeForm';
// CORREÇÃO: Apontando a importação do tipo para dentro do Hook
import type { NotaFiscal } from './useNfeForm';
import { DadosGeraisFiscais } from './DadosGeraisFiscais';
import { DetalhamentoProdutos } from './DetalhamentoProdutos';
import { LogisticaTransporte } from './LogisticaTransporte'; 
import { FinanceiroObservacoes } from './FinanceiroObservacoes'; 
import './ModalEmissaoNfe.css';

interface ModalEmissaoProps {
  onClose: () => void;
  onEmitir: (nota: NotaFiscal) => void;
  proximoNumeroSequencial: number;
}

export function ModalEmissaoNfe({ onClose, onEmitir, proximoNumeroSequencial }: ModalEmissaoProps) {
  const {
    destinatario, dadosFiscais, produtoInput, logistica, itensAdicionados,
    infoComplementares, valorBrutoCalculado, valorLiquidoCalculado, numeroFaturaCalculado,
    updateDestinatario, updateDadosFiscais, updateProdutoInput, updateLogistica,
    setInfoComplementares, handleAdicionarItemTabela, handleRemoverItemTabela, handleEmitirNfe,
  } = useNfeForm({ proximoNumeroSequencial, onEmitir });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="btn-close-modal"><X size={20} /></button>

        <h3 className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
        <p className="modal-subtitle">Preencha as seções abaixo de forma estruturada para realizar a transmissão fiscal.</p>

        <form onSubmit={handleEmitirNfe} className="form-layout">
          
          <DadosGeraisFiscais 
            dadosFiscais={dadosFiscais} destinatario={destinatario}
            updateDadosFiscais={updateDadosFiscais} updateDestinatario={updateDestinatario}
          />

          <DetalhamentoProdutos 
            produtoInput={produtoInput} itensAdicionados={itensAdicionados} updateProdutoInput={updateProdutoInput}
            handleAdicionarItemTabela={handleAdicionarItemTabela} handleRemoverItemTabela={handleRemoverItemTabela}
          />

          <LogisticaTransporte 
            logistica={logistica} updateLogistica={updateLogistica} 
          />

          <FinanceiroObservacoes 
            logistica={logistica} dadosFiscais={dadosFiscais} infoComplementares={infoComplementares}
            numeroFaturaCalculado={numeroFaturaCalculado} valorBrutoCalculado={valorBrutoCalculado}
            valorLiquidoCalculado={valorLiquidoCalculado} updateLogistica={updateLogistica}
            updateDadosFiscais={updateDadosFiscais} setInfoComplementares={setInfoComplementares}
          />

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-transmit">Transmitir NF-e</button>
          </div>
        </form>
      </div>
    </div>
  );
}
