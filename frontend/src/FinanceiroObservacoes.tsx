// src/FinanceiroObservacoes.tsx
import React from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import type { NotaFiscal } from './nfe.types';

interface FinanceiroObservacoesProps {
  logistica: {
    formaPagamento: NotaFiscal['pagamento']['formaPagamento'];
    meioPagamento: string;
  };
  dadosFiscais: {
    dataVencimentoFatura: string;
  };
  infoComplementares: string;
  numeroFaturaCalculado: string;
  valorBrutoCalculado: number;
  valorLiquidoCalculado: number;
  updateLogistica: (field: string, value: string) => void;
  updateDadosFiscais: (field: string, value: string) => void;
  setInfoComplementares: (value: string) => void;
}

export function FinanceiroObservacoes({
  logistica,
  dadosFiscais,
  infoComplementares,
  numeroFaturaCalculado,
  valorBrutoCalculado,
  valorLiquidoCalculado,
  updateLogistica,
  updateDadosFiscais,
  setInfoComplementares
}: FinanceiroObservacoesProps) {
  return (
    <>
      {/* SEÇÃO 5: INFORMAÇÕES FINANCEIRAS E COBRANÇA */}
      <fieldset className="section-divider">
        <legend className="section-subtitle">
          <CreditCard size={16} /> 5. Informações Financeiras e Cobrança
        </legend>
        <div className="form-row">
          <div className="form-group fg-natureza">
            <label className="form-label">Forma de Pagamento</label>
            <select value={logistica.formaPagamento} onChange={e => updateLogistica('formaPagamento', e.target.value)} className="input-field">
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Boleto">Boleto</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Sem Pagamento">Sem Pagamento</option>
            </select>
          </div>
          <div className="form-group fg-destinatario">
            <label className="form-label">Meio de Pagamento (Código Sefaz)</label>
            <input type="text" value={logistica.meioPagamento} onChange={e => updateLogistica('meioPagamento', e.target.value)} placeholder="Ex: 01 - Dinheiro, 15 - Pix" className="input-field" />
          </div>
        </div>

        {logistica.formaPagamento !== 'Sem Pagamento' && (
          <div className="form-row mt-info">
            <div className="form-group fg-natureza">
              <label className="form-label">Número da Fatura</label>
              <input type="text" disabled value={numeroFaturaCalculado} className="input-field" />
            </div>
            <div className="form-group fg-destinatario">
              <label className="form-label">Data de Vencimento</label>
              <input type="date" required value={dadosFiscais.dataVencimentoFatura} onChange={e => updateDadosFiscais('dataVencimentoFatura', e.target.value)} className="input-field" />
            </div>
            <div className="form-group fg-documento">
              <label className="form-label">Valor da Fatura</label>
              <input type="text" disabled value={`R$ ${valorLiquidoCalculado.toFixed(2)}`} className="input-field" />
            </div>
          </div>
        )}
      </fieldset>

      {/* SEÇÃO 6: RESUMO DE TOTAIS E OBSERVAÇÕES */}
      <fieldset className="section-divider">
        <legend className="section-subtitle">
          <DollarSign size={16} /> 6. Resumo Faturamento e Observações Fiscais
        </legend>
        <div className="form-group fg-full-width">
          <label className="form-label">Informações Complementares à Nota</label>
          <textarea 
            rows={3}
            value={infoComplementares} 
            onChange={e => setInfoComplementares(e.target.value)} 
            placeholder="Dados adicionais de interesse do fisco..." 
            className="input-field textarea-field"
          />
        </div>

        {valorBrutoCalculado > 0 && (
          <div className="tax-panel">
            <div className="tax-row-products">
              <span>Total Bruto das Mercadorias:</span>
              <span className="weight-bold">{valorBrutoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="tax-row-estimate">
              <span>Estimativa Tributária:</span>
              <span className="tax-free-badge">R$ 0,00 (Simples Nacional)</span>
            </div>
            <div className="tax-row-total">
              <span>Valor Total Líquido da Nota:</span>
              <span className="tax-total-value">{valorLiquidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        )}
      </fieldset>
    </>
  );
}
