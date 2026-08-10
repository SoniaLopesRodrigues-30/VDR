import React from 'react';
import { FileText } from 'lucide-react';

export function SeccaoDadosGerais({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><FileText size={16} /> 1. Dados Gerais da Emissão</legend>
      <div className="form-row">
        <div className="form-group fg-natureza">
          <label className="form-label">Tipo Op. (tpNF)</label>
          <select value={state.tipoOperacao} onChange={e => state.setTipoOperacao(e.target.value)} className="input-field">
            <option value="1 - Saída">1 - Saída</option>
            <option value="0 - Entrada">0 - Entrada</option>
          </select>
        </div>
        <div className="form-group fg-destinatario">
          <label className="form-label">Destino Operação (idDest)</label>
          <select value={state.destinoOperacao} onChange={e => state.setDestinoOperacao(e.target.value)} className="input-field">
            <option value="1 - Operação Interna (Estadual)">1 - Interna (No Estado)</option>
            <option value="2 - Operação Interestadual">2 - Interestadual (Fora do Estado)</option>
          </select>
        </div>
        <div className="form-group fg-documento">
          <label className="form-label">Finalidade (finNFe)</label>
          <select value={state.finalidadeEmissao} onChange={e => state.setFinalidadeEmissao(e.target.value)} className="input-field">
            <option value="1 - NF-e Normal">1 - Normal</option>
            <option value="2 - NF-e Complementar">2 - Complementar</option>
            <option value="3 - NF-e de Ajuste">3 - de Ajuste</option>
            <option value="4 - Devolução de Mercadoria">4 - Devolução</option>
          </select>
        </div>
      </div>
      <div className="form-row mt-negative">
        <div className="form-group fg-natureza">
          <label className="form-label">Natureza Operação</label>
          <input type="text" value={state.naturezaOperacao} onChange={e => state.setNaturezaOperacao(e.target.value)} className="input-field" placeholder="Ex: Venda de Mercadoria" />
        </div>
        <div className="form-group fg-vol-esp">
          <label className="form-label">Data Emissão</label>
          <input type="date" required value={state.dataEmissao} onChange={e => state.setDataEmissao(e.target.value)} className="input-field" />
        </div>
        <div className="form-group fg-vol-esp">
          <label className="form-label">Data Saída/Entrada</label>
          <input type="date" required value={state.dataSaida} onChange={e => state.setDataSaida(e.target.value)} className="input-field" />
        </div>
        <div className="form-group fg-vol-qtd">
          <label className="form-label">Hora Saída</label>
          <input type="text" required value={state.horaSaida} onChange={e => state.setHoraSaida(e.target.value)} placeholder="00:00" className="input-field" />
        </div>
      </div>
    </fieldset>
  );
}
