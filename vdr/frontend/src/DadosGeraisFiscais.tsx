// DadosGeraisFiscais.tsx
import React from 'react';
import { FileText, User } from 'lucide-react';

interface DadosGeraisFiscaisProps {
  dadosFiscais: any;
  destinatario: any;
  updateDadosFiscais: (field: string, value: string) => void;
  updateDestinatario: (field: string, value: string) => void;
}

export function DadosGeraisFiscais({
  dadosFiscais,
  destinatario,
  updateDadosFiscais,
  updateDestinatario
}: DadosGeraisFiscaisProps) {
  return (
    <>
      {/* SEÇÃO 1: INFORMAÇÕES GERAIS FISCAIS */}
      <fieldset className="section-divider">
        <legend className="section-subtitle">
          <FileText size={16} /> 1. Dados Gerais da Emissão
        </legend>
        <div className="form-row">
          <div className="form-group fg-natureza">
            <label className="form-label">Tipo Op. (tpNF)</label>
            <select value={dadosFiscais.tipoOperacao} onChange={e => updateDadosFiscais('tipoOperacao', e.target.value)} className="input-field">
              <option value="1 - Saída">1 - Saída</option>
              <option value="0 - Entrada">0 - Entrada</option>
            </select>
          </div>
          <div className="form-group fg-destinatario">
            <label className="form-label">Destino Operação (idDest)</label>
            <select value={dadosFiscais.destinoOperacao} onChange={e => updateDadosFiscais('destinoOperacao', e.target.value)} className="input-field">
              <option value="1 - Operação Interna (Estadual)">1 - Interna (No Estado)</option>
              <option value="2 - Operação Interestadual">2 - Interestadual (Fora do Estado)</option>
            </select>
          </div>
          <div className="form-group fg-documento">
            <label className="form-label">Finalidade (finNFe)</label>
            <select value={dadosFiscais.finalidadeEmissao} onChange={e => updateDadosFiscais('finalidadeEmissao', e.target.value)} className="input-field">
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
            <input type="text" value={destinatario.naturezaOperacao} onChange={e => updateDestinatario('naturezaOperacao', e.target.value)} className="input-field" placeholder="Ex: Venda de Mercadoria" />
          </div>
          <div className="form-group fg-vol-esp">
            <label className="form-label">Data Emissão</label>
            <input type="date" required value={dadosFiscais.dataEmissao} onChange={e => updateDadosFiscais('dataEmissao', e.target.value)} className="input-field" />
          </div>
          <div className="form-group fg-vol-esp">
            <label className="form-label">Data Saída/Entrada</label>
            <input type="date" required value={dadosFiscais.dataSaida} onChange={e => updateDadosFiscais('dataSaida', e.target.value)} className="input-field" />
          </div>
          <div className="form-group fg-vol-qtd">
            <label className="form-label">Hora Saída</label>
            <input type="text" required value={dadosFiscais.horaSaida} onChange={e => updateDadosFiscais('horaSaida', e.target.value)} placeholder="00:00" className="input-field" />
          </div>
        </div>
      </fieldset>

      {/* SEÇÃO 2: DADOS DE IDENTIFICAÇÃO E ENDEREÇO DO DESTINATÁRIO */}
      <fieldset className="section-divider">
        <legend className="section-subtitle">
          <User size={16} /> 2. Identificação e Endereço do Cliente
        </legend>
        <div className="form-row">
          <div className="form-group fg-destinatario">
            <label className="form-label">Destinatário / Razão Social *</label>
            <input type="text" required value={destinatario.cliente} onChange={e => updateDestinatario('cliente', e.target.value)} placeholder="Nome completo ou Razão Social" className="input-field" />
          </div>
          <div className="form-group fg-documento">
            <label className="form-label">CPF / CNPJ *</label>
            <input type="text" required value={destinatario.documento} onChange={e => updateDestinatario('documento', e.target.value)} placeholder="00.000.000/0001-00" className="input-field" />
          </div>
        </div>

        <div className="form-row mt-negative">
          <div className="form-group fg-vol-qtd">
            <label className="form-label">CEP *</label>
            <input type="text" required value={destinatario.cep} onChange={e => updateDestinatario('cep', e.target.value)} placeholder="00000-000" className="input-field" />
          </div>
          <div className="form-group fg-destinatario">
            <label className="form-label">Logradouro (Rua/Av) *</label>
            <input type="text" required value={destinatario.logradouro} onChange={e => updateDestinatario('logradouro', e.target.value)} placeholder="Ex: Av. Brasil" className="input-field" />
          </div>
          <div className="form-group fg-vol-qtd">
            <label className="form-label">Número *</label>
            <input type="text" required value={destinatario.numero} onChange={e => updateDestinatario('numero', e.target.value)} placeholder="123" className="input-field" />
          </div>
        </div>

        <div className="form-row mt-negative">
          <div className="form-group fg-natureza">
            <label className="form-label">Bairro *</label>
            <input type="text" required value={destinatario.bairro} onChange={e => updateDestinatario('bairro', e.target.value)} placeholder="Bairro" className="input-field" />
          </div>
          <div className="form-group fg-natureza">
            <label className="form-label">Município *</label>
            <input type="text" required value={destinatario.municipio} onChange={e => updateDestinatario('municipio', e.target.value)} placeholder="Cidade" className="input-field" />
          </div>
          <div className="form-group fg-vol-esp">
            <label className="form-label">Cód. IBGE Cidade *</label>
            <input type="text" required value={destinatario.codigoMunicipio} onChange={e => updateDestinatario('codigoMunicipio', e.target.value)} placeholder="Ex: 4305108" className="input-field" />
          </div>
          <div className="form-group fg-vol-qtd">
            <label className="form-label">UF *</label>
            <input type="text" required maxLength={2} value={destinatario.uf} onChange={e => updateDestinatario('uf', e.target.value.toUpperCase())} placeholder="RS" className="input-field" />
          </div>
        </div>
      </fieldset>
    </>
  );
}
