import React from 'react';
import { CreditCard } from 'lucide-react';

export function SeccaoFinanceiro({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><CreditCard size={16} /> 5. Informações Financeiras e Cobrança</legend>
      <div className="form-row">
        <div className="form-group fg-natureza">
          <label className="form-label">Forma de Pagamento</label>
          <select value={state.formaPagamento} onChange={e => state.setFormaPagamento(e.target.value as any)} className="input-field">
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
          <input type="text" value={state.meioPagamento} onChange={e => state.setMeioPagamento(e.target.value)} placeholder="Ex: 01 - Dinheiro, 15 - Pix" className="input-field" />
        </div>
      </div>
      {state.formaPagamento !== 'Sem Pagamento' && (
        <div className="form-row mt-info">
          <div className="form-group fg-natureza">
            <label className="form-label">Número da Fatura</label>
            <input type="text" disabled value={state.numeroFaturaCalculado} className="input-field" />
          </div>
          <div className="form-group fg-destinatario">
            <label className="form-label">Data de Vencimento</label>
            <input type="date" required value={state.dataVencimentoFatura} onChange={e => state.setDataVencimentoFatura(e.target.value)} className="input-field" />
          </div>
          <div className="form-group fg-documento">
            <label className="form-label">Valor da Fatura</label>
            <input type="text" disabled value={`R$ ${state.valorLiquidoCalculado.toFixed(2)}`} className="input-field" />
          </div>
        </div>
      )}
    </fieldset>
  );
}
