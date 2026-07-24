import React from 'react';
import { DollarSign } from 'lucide-react';

export function SeccaoResumo({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><DollarSign size={16} /> 6. Resumo Faturamento e Observações Fiscais</legend>
      <div className="form-group fg-full-width">
        <label className="form-label">Informações Complementares à Nota</label>
        <textarea rows={3} value={state.infoComplementares} onChange={e => state.setInfoComplementares(e.target.value)} placeholder="Dados adicionais de interesse do fisco..." className="input-field textarea-field" />
      </div>
      {state.valorBrutoCalculado > 0 && (
        <div className="tax-panel">
          <div className="tax-row-products">
            <span>Total Bruto das Mercadorias:</span>
            <span className="weight-bold">{state.valorBrutoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className="tax-row-estimate">
            <span>Estimativa Tributária:</span>
            <span className="tax-free-badge">R$ 0,00 (Simples Nacional)</span>
          </div>
          <div className="tax-row-total">
            <span>Valor Total Líquido da Nota:</span>
            <span className="tax-total-value">{state.valorLiquidoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
      )}
    </fieldset>
  );
}
