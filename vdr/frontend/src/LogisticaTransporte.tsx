// LogisticaTransporte.tsx
import React from 'react';
import { Truck } from 'lucide-react';

interface LogisticaTransporteProps {
  logistica: any;
  updateLogistica: (field: string, value: string) => void;
}

export function LogisticaTransporte({ logistica, updateLogistica }: LogisticaTransporteProps) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle">
        <Truck size={16} /> 4. Logística e Transporte de Volumes
      </legend>
      <div className="form-row">
        <div className="form-group fg-natureza">
          <label className="form-label">Modalidade do Frete</label>
          <select value={logistica.modalidadeFrete} onChange={e => updateLogistica('modalidadeFrete', e.target.value)} className="input-field">
            <option value="9 - Sem Ocorrência de Transporte">9 - Sem Frete</option>
            <option value="0 - Contratação por conta do Remetente (CIF)">0 - CIF (Remetente)</option>
            <option value="1 - Contratação por conta do Destinatário (FOB)">1 - FOB (Destinatário)</option>
          </select>
        </div>
        {logistica.modalidadeFrete !== '9 - Sem Ocorrência de Transporte' && (
          <>
            <div className="form-group fg-destinatario">
              <label className="form-label">Transportadora / Razão Social</label>
              <input type="text" value={logistica.transportadorNome} onChange={e => updateLogistica('transportadorNome', e.target.value)} placeholder="Nome do transportador" className="input-field" />
            </div>
            <div className="form-group fg-peso">
              <label className="form-label">Placa do Veículo</label>
              <input type="text" value={logistica.placaVeiculo} onChange={e => updateLogistica('placaVeiculo', e.target.value)} placeholder="AAA0A00" className="input-field" />
            </div>
          </>
        )}
      </div>

      <div className="form-row mt-negative">
        <div className="form-group fg-vol-qtd">
          <label className="form-label">Qtd. Volumes</label>
          <input type="number" min="0" value={logistica.qtdVolumes} onChange={e => updateLogistica('qtdVolumes', e.target.value)} placeholder="0" className="input-field" />
        </div>
        <div className="form-group fg-vol-esp">
          <label className="form-label">Espécie Volumes</label>
          <select value={logistica.especieVolumes} onChange={e => updateLogistica('especieVolumes', e.target.value)} className="input-field">
            <option value="CX">CX (Caixa)</option>
            <option value="PC">PC (Pacote)</option>
            <option value="PL">PL (Palete)</option>
            <option value="SACO">SACO</option>
            <option value="VOL">VOL (Volume)</option>
          </select>
        </div>
        <div className="form-group fg-peso">
          <label className="form-label">Peso Bruto (KG)</label>
          <input type="number" min="0" step="0.001" value={logistica.pesoBruto} onChange={e => updateLogistica('pesoBruto', e.target.value)} placeholder="0,000" className="input-field" />
        </div>
        <div className="form-group fg-peso">
          <label className="form-label">Peso Líquido (KG)</label>
          <input type="number" min="0" step="0.001" value={logistica.pesoLiquido} onChange={e => updateLogistica('pesoLiquido', e.target.value)} placeholder="0,000" className="input-field" />
        </div>
      </div>
    </fieldset>
  );
}
