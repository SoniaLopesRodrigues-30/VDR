// src/DadosGeraisFiscais.tsx
import React from 'react';
import { FileText, User } from 'lucide-react';

interface DadosGeraisProps {
  dadosFiscais: any;
  destinatario: any;
  updateDadosFiscais: (field: string, value: string) => void;
  updateDestinatario: (field: string, value: string) => void;
}

export const LISTA_CFOPS = [
  { cfop: '5101', label: '5101 - Venda de produção do Estabelecimento (Dentro do Estado)' },
  { cfop: '5102', label: '5102 - Venda de mercadoria adquirida de terceiros (Dentro do Estado)' },
  { cfop: '6102', label: '6102 - Venda de mercadoria adquirida de terceiros (Fora do Estado)' },
  { cfop: '5405', label: '5405 - Venda de mercadoria com substituição tributária (ST)' },
  { cfop: '5117', label: '5117 - Venda de mercadoria originada de encomenda para entrega futura' },
  { cfop: '5910', label: '5910 - Remessa em bonificação, doação ou brinde' },
  { cfop: '6910', label: '6910 - Remessa em bonificação, doação ou brinde (Fora do Estado)' },
  { cfop: '5202', label: '5202 - Devolução de compra para comercialização' },
  { cfop: '6202', label: '6202 - Devolução de compra para comercialização (Fora do Estado)' },
];

export function DadosGeraisFiscais({ dadosFiscais, destinatario, updateDadosFiscais, updateDestinatario }: DadosGeraisProps) {
  
  // Função auxiliar para renderizar os inputs text/date de forma limpa e sem repetição de HTML
  const renderInput = (label: string, value: string, cls: string, onChange: (v: string) => void, type = 'text', extra = {}) => (
    <div className={`form-group ${cls}`}>
      <label className="form-label">{label}</label>
      <input type={type} required className="input-field" value={value || ''} onChange={e => onChange(e.target.value)} {...extra} />
    </div>
  );

  return (
    <>
      {/* 1. DADOS GERAIS DA EMISSÃO */}
      <fieldset className="section-divider">
        <legend className="section-subtitle"><FileText size={16} /> 1. Dados Gerais da Emissão</legend>
        
        <div className="form-row">
          <div className="form-group fg-destinatario">
            <label htmlFor="cfop-select" className="form-label">Operação Fiscal / CFOP</label>
            <select
              id="cfop-select"
              className="input-field"
              value={dadosFiscais.cfop || '5102'}
              onChange={(e) => {
                const item = LISTA_CFOPS.find(i => i.cfop === e.target.value);
                updateDadosFiscais('cfop', e.target.value);
                updateDestinatario('naturezaOperacao', item ? item.label.split(' - ')[1] : 'Venda de Mercadoria');
              }}
            >
              {LISTA_CFOPS.map((op, idx) => <option key={`${op.cfop}-${idx}`} value={op.cfop}>{op.label}</option>)}
            </select>
          </div>

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
          {renderInput('Natureza Operação', destinatario.naturezaOperacao, 'fg-natureza', v => updateDestinatario('naturezaOperacao', v), 'text', { placeholder: 'Ex: Venda' })}
          {renderInput('Data Emissão', dadosFiscais.dataEmissao, 'fg-vol-esp', v => updateDadosFiscais('dataEmissao', v), 'date')}
          {renderInput('Data Saída/Entrada', dadosFiscais.dataSaida, 'fg-vol-esp', v => updateDadosFiscais('dataSaida', v), 'date')}
          {renderInput('Hora Saída', dadosFiscais.horaSaida, 'fg-vol-qtd', v => updateDadosFiscais('horaSaida', v), 'text', { placeholder: '00:00' })}
        </div>
      </fieldset>

      {/* 2. IDENTIFICAÇÃO E ENDEREÇO DO CLIENTE */}
      <fieldset className="section-divider">
        <legend className="section-subtitle"><User size={16} /> 2. Identificação e Endereço do Cliente</legend>
        
        <div className="form-row">
          {renderInput('Destinatário / Razão Social *', destinatario.cliente, 'fg-destinatario', v => updateDestinatario('cliente', v), 'text', { placeholder: 'Nome ou Razão Social' })}
          {renderInput('CPF / CNPJ *', destinatario.documento, 'fg-documento', v => updateDestinatario('documento', v), 'text', { placeholder: '00.000.000/0001-00' })}
        </div>

        <div className="form-row mt-negative">
          {renderInput('CEP *', destinatario.cep, 'fg-vol-qtd', v => updateDestinatario('cep', v), 'text', { placeholder: '00000-000' })}
          {renderInput('Logradouro (Rua/Av) *', destinatario.logradouro, 'fg-destinatario', v => updateDestinatario('logradouro', v), 'text', { placeholder: 'Ex: Av. Brasil' })}
          {renderInput('Número *', destinatario.numero, 'fg-vol-qtd', v => updateDestinatario('numero', v), 'text', { placeholder: '123' })}
        </div>

        <div className="form-row mt-negative">
          {renderInput('Bairro *', destinatario.bairro, 'fg-natureza', v => updateDestinatario('bairro', v), 'text', { placeholder: 'Bairro' })}
          {renderInput('Município *', destinatario.municipio, 'fg-natureza', v => updateDestinatario('municipio', v), 'text', { placeholder: 'Cidade' })}
          {renderInput('Cód. IBGE Cidade *', destinatario.codigoMunicipio, 'fg-vol-esp', v => updateDestinatario('codigoMunicipio', v), 'text', { placeholder: 'Ex: 4305108' })}
          {renderInput('UF *', destinatario.uf, 'fg-vol-qtd', v => updateDestinatario('uf', v.toUpperCase()), 'text', { placeholder: 'RS', maxLength: 2 })}
        </div>
      </fieldset>
    </>
  );
}
