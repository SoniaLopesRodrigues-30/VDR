import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function SeccaoTributaria({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><ShieldAlert size={16} /> 4. Dados Tributários Aplicados</legend>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Situação Tributária (ICMS/CSOSN)</label>
          <select value={state.icmsSituacao} onChange={e => state.setIcmsSituacao(e.target.value)} className="input-field">
            <option value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</option>
            <option value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</option>
            <option value="300">300 - Imune (Simples Nacional)</option>
            <option value="400">400 - Não tributada pelo Simples Nacional</option>
            <option value="900">900 - Outros</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Enquadramento do IPI (CST)</label>
          <select value={state.ipiSituacao} onChange={e => state.setIpiSituacao(e.target.value)} className="input-field">
            <option value="99">99 - Outras Saídas (IPI Não Tributado)</option>
            <option value="50">50 - Saída Tributada</option>
            <option value="53">53 - Saída Não Tributada</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Contribuição do PIS (CST)</label>
          <select value={state.pisSituacao} onChange={e => state.setPisSituacao(e.target.value)} className="input-field">
            <option value="07">07 - Operação Isenta da Contribuição</option>
            <option value="01">01 - Operação Tributável (Alíquota Básica)</option>
            <option value="49">49 - Outras Operações de Saída</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}
