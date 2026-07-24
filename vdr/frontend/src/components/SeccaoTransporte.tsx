import React from 'react';
import { Truck } from 'lucide-react';

export function SeccaoTransporte({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><Truck size={16} /> 4. Logística e Transporte de Volumes</legend>
      <div className="form-row">
        <div className="form-group fg-natureza">
          <label className="form-label">Modalidade do Frete</label>
          <select value={state.modalidadeFrete} onChange={e => state.setModalidadeFrete(e.target.value as any)} className="input-field">
            <option value="9 - Sem Ocorrência de Transporte">9 - Sem Frete</option>
            <option value="0 - Contratação por conta do Remetente (CIF)">0 - CIF (Remetente)</option>
            <option value="1 - Contratação por conta do Destinatário (FOB)">1 - FOB (Destinatário)</option>
          </select>
        </div>
        {state.modalidadeFrete !== '9 - Sem Ocorrência de Transporte' && (
          <>
            <div className="form-group fg-destinatario">
              <label className="form-label">Transportadora / Razão Social</label>
              <input type="text" value={state.transportadorNome} onChange={e => state.setTransportadorNome(e.target.value)} placeholder="Nome do transportador" className="input-field" />
            </div>
            <div className="form-group fg-peso">
              <label className="form-label">Placa do Veículo</label>
              <input type="text" value={state.placaVeiculo} onChange={e => state.setPlacaVeiculo(e.target.value)} placeholder="AAA0A00" className="input-field" />
            </div>
          </>
        )}
      </div>
      <div className="form-row mt-negative">
        <div className="form-group fg-vol-qtd">
          <label className="form-label">Qtd. Volumes</label>
          <input type="number" min="0" value={state.qtdVolumes} onChange={e => state.setQtdVolumes(e.target.value)} placeholder="0" className="input-field" />
        </div>
        <div className="form-group fg-vol-esp">
          <label className="form-label">Espécie Volumes</label>
          <select value={state.especieVolumes} onChange={e => state.setEspecieVolumes(e.target.value)} className="input-field">
            <option value="CX">CX (Caixa)</option>
            <option value="PC">PC (Pacote)</option>
            <option value="PL">PL (Palete)</option>
            <option value="SACO">SACO</option>
            <option value="VOL">VOL (Volume)</option>
          </select>
        </div>
        <div className="form-group fg-peso">
          <label className="form-label">Peso Bruto (KG)</label>
          <input type="number" min="0" step="0.001" value={state.pesoBruto} onChange={e => state.setPesoBruto(e.target.value)} placeholder="0,000" className="input-field" />
        </div>
        <div className="form-group fg-peso">
          <label className="form-label">Peso Líquido (KG)</label>
          <input type="number" min="0" step="0.001" value={state.pesoLiquido} onChange={e => state.setPesoLiquido(e.target.value)} placeholder="0,000" className="input-field" />
        </div>
      </div>
    </fieldset>
  );
}
