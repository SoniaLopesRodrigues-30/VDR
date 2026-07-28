// src/ModalEmissaoNfe.tsx

import { X } from 'lucide-react';
import { useNfeForm } from './useNfeForm';
import type { NotaFiscal } from './useNfeForm';
import { DadosGeraisFiscais } from './DadosGeraisFiscais';
import { DetalhamentoProdutos } from './DetalhamentoProdutos';
import { LogisticaTransporte } from './LogisticaTransporte'; 
import { FinanceiroObservacoes } from './FinanceiroObservacoes'; 

import { baixarXmlNfe, imprimirPdfNfe } from './nfeUtils'; 

import './ModalEmissaoNfe.css';

interface ModalEmissaoProps {
  onClose: () => void;
  onEmitir: (nota: NotaFiscal) => void;
  proximoNumeroSequencial: number;
}

export function ModalEmissaoNfe({ onClose, onEmitir, proximoNumeroSequencial }: ModalEmissaoProps) {
  
  // Função interceptadora para gerar os documentos automaticamente quando o hook disparar o onEmitir
   // Função interceptadora corrigida e ativada
  const handleOnEmitirInterceptado = (notaGerada: NotaFiscal) => {    
    // 1. Abre o PDF do DANFE na tela para visualização
    imprimirPdfNfe(notaGerada);
    
    // CORREÇÃO: Linha ativada (sem as duas barras) para fazer o download do XML junto
    baixarXmlNfe(notaGerada);

    // 3. Executa a função original para atualizar o banco/sistema
    onEmitir(notaGerada);
  };


  const {
    destinatario, dadosFiscais, produtoInput, logistica, itensAdicionados,
    infoComplementares, valorBrutoCalculado, valorLiquidoCalculado, numeroFaturaCalculado,
    updateDestinatario, updateDadosFiscais, updateProdutoInput, updateLogistica,
    setInfoComplementares, handleAdicionarItemTabela, handleRemoverItemTabela, handleEmitirNfe,
  } = useNfeForm({ proximoNumeroSequencial, onEmitir: handleOnEmitirInterceptado });

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn-close-modal"
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        <h3 id="modal-title" className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
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
            <button type="submit" className="btn-transmit">Transmitir & Gerar Documentos</button>
          </div>
        </form>
      </div>
    </div>
  );
}
