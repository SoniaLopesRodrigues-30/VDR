import React from 'react';
import { User } from 'lucide-react';

export function SeccaoCliente({ state }: { state: any }) {
  return (
    <fieldset className="section-divider">
      <legend className="section-subtitle"><User size={16} /> 2. Identificação e Endereço do Cliente</legend>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Destinatário / Razão Social *</label>
          <input type="text" required value={state.clienteSelecionado} onChange={e => state.setClienteSelecionado(e.target.value)} placeholder="Nome completo ou Razão Social" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">CPF / CNPJ *</label>
          <input type="text" required value={state.docCliente} onChange={e => state.setDocCliente(e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
        </div>
      </div>
      <div className="form-row mt-negative">
        <div className="form-group">
          <label className="form-label">CEP *</label>
          <input type="text" required value={state.cepDest} onChange={e => state.setCepDest(e.target.value)} placeholder="00000-000" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Logradouro (Rua/Av) *</label>
          <input type="text" required value={state.logradouroDest} onChange={e => state.setLogradouroDest(e.target.value)} placeholder="Ex: Av. Brasil" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Número *</label>
          <input type="text" required value={state.numeroDest} onChange={e => state.setNumeroDest(e.target.value)} placeholder="123" className="input-field" />
        </div>
      </div>
      <div className="form-row mt-negative">
        <div className="form-group">
          <label className="form-label">Bairro *</label>
          <input type="text" required value={state.bairroDest} onChange={e => state.setBairroDest(e.target.value)} placeholder="Bairro" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Município *</label>
          <input type="text" required value={state.municipioDest} onChange={e => state.setMunicipioDest(e.target.value)} placeholder="Cidade" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">Cód. IBGE Cidade *</label>
          <input type="text" required value={state.codMunicipioDest} onChange={e => state.setCodMunicipioDest(e.target.value)} placeholder="Ex: 4305108" className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">UF *</label>
          <input type="text" required maxLength={2} value={state.ufDest} onChange={e => state.setUfDest(e.target.value.toUpperCase())} placeholder="RS" className="input-field" />
        </div>
      </div>
    </fieldset>
  );
}
