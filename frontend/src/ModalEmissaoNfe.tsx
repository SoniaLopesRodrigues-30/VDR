import React from 'react';
import { X } from 'lucide-react';
import { useModalEmissaoNfe } from './useModalEmissaoNfe';
import { SeccaoDadosGerais } from './components/SeccaoDadosGerais';
import { SeccaoCliente } from './components/SeccaoCliente';
import { SeccaoProdutos } from './components/SeccaoProdutos';
import { SeccaoTributaria } from './components/SeccaoTributaria'; 
import { SeccaoTransporte } from './components/SeccaoTransporte';
import { SeccaoFinanceiro } from './components/SeccaoFinanceiro';
import { SeccaoResumo } from './components/SeccaoResumo';
import './ModalEmissaoNfe.css';

export interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

export interface DuplicataNota { numero: string; vencimento: string; valor: number; }
export interface FaturaNota { numero: string; valorOriginal: number; valorDesconto?: number; valorLiquido: number; dataVencimento?: string; }

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
  valorBruto: number;
  valorLiquido: number;
  quantidadeVolumes?: string;
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string;
  tipoOperacao: '0 - Entrada' | '1 - Saída';
  destinoOperacao: '1 - Operação Interna (Estadual)' | '2 - Operação Interestadual' | '3 - Operação com Exterior';
  finalidadeEmissao: '1 - NF-e Normal' | '2 - NF-e Complementar' | '3 - NF-e de Ajuste' | '4 - Devolução de Mercadoria';
  dataSaida: string;
  horaSaida: string;
  pagamento: { formaPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'Boleto' | 'Sem Pagamento'; meioPagamento: string; };
  transporte: { modalidadeFrete: '0 - Contratação por conta do Remetente (CIF)' | '1 - Contratação por conta do Destinatário (FOB)' | '9 - Sem Ocorrência de Transporte'; transportadorNome?: string; transportadorCnpjCpf?: string; placaVeiculo?: string; };
  enderecoDestinatario: { logradouro: string; numero: string; bairro: string; codigoMunicipio: string; municipio: string; uf: string; cep: string; };
  tributacao: { icms: string; ipi: string; pis: string; };
  cobranca?: { fatura: FaturaNota; duplicatas: DuplicataNota[]; };
}

interface ModalEmissaoProps {
  onClose: () => void;
  onEmitir: (nota: NotaFiscal) => void;
  proximoNumeroSequencial: number;
}

export function ModalEmissaoNfe({ onClose, onEmitir, proximoNumeroSequencial }: ModalEmissaoProps) {
  const state = useModalEmissaoNfe({ onEmitir, proximoNumeroSequencial });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onClose} className="btn-close-modal">
          <X size={20} />
        </button>

        <h3 className="modal-title">Emitir Nota Fiscal (NF-e)</h3>
        <p className="modal-subtitle">Preencha as seções abaixo de forma estruturada para realizar a transmissão fiscal.</p>

        <form onSubmit={state.handleEmitirNfe} className="form-layout">
          <SeccaoDadosGerais state={state} />
          <SeccaoCliente state={state} />
          <SeccaoProdutos state={state} />
          <SeccaoTributaria state={state} />
          <SeccaoTransporte state={state} />
          <SeccaoFinanceiro state={state} />
          <SeccaoResumo state={state} />

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
            <button type="submit" className="btn-transmit">Transmitir NF-e</button>
          </div>
        </form>
      </div>
    </div>
  );
}
