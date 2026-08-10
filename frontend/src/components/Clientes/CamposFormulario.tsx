// CamposFormulario.tsx
import React from 'react';

interface DadosBasicosProps {
  tipo: 'Física' | 'Jurídica';
  nome: string;
  setNome: (v: string) => void;
  documento: string;
  setDocumento: (v: string) => void;
  inscricaoEstadual: string;
  setInscricaoEstadual: (v: string) => void;
}

export const DadosBasicosForm: React.FC<DadosBasicosProps> = ({
  tipo, nome, setNome, documento, setDocumento, inscricaoEstadual, setInscricaoEstadual
}) => (
  <div className="form-row">
    <div className="form-group form-group-nome-razao">
      <label className="form-label">{tipo === 'Física' ? 'Nome Completo *' : 'Razão Social *'}</label>
      <input type="text" required value={nome} onChange={e => setNome(e.target.value)} placeholder={tipo === 'Física' ? "Ex: Maria Souza" : "Ex: Minha Empresa Ltda"} className="input-padrao" />
    </div>
    <div className="form-group form-group-documento">
      <label className="form-label">{tipo === 'Física' ? 'CPF *' : 'CNPJ *'}</label>
      <input type="text" required value={documento} onChange={e => setDocumento(e.target.value)} placeholder={tipo === 'Física' ? "000.000.000-00" : "00.000.000/0001-00"} className="input-padrao" />
    </div>
    {tipo === 'Jurídica' && (
      <div className="form-group form-group-ie">
        <label className="form-label">Inscrição Estadual</label>
        <input type="text" value={inscricaoEstadual} onChange={e => setInscricaoEstadual(e.target.value)} placeholder="Isento ou Nº" className="input-padrao" />
      </div>
    )}
  </div>
);

interface EnderecoProps {
  cep: string; setCep: (v: string) => void;
  logradouro: string; setLogradouro: (v: string) => void;
  numero: string; setNumero: (v: string) => void;
  bairro: string; setBairro: (v: string) => void;
  cidade: string; setCidade: (v: string) => void;
  uf: string; setUf: (v: string) => void;
  status: 'Ativo' | 'Inativo'; setStatus: (v: 'Ativo' | 'Inativo') => void;
}

export const EnderecoForm: React.FC<EnderecoProps> = ({
  cep, setCep, logradouro, setLogradouro, numero, setNumero, bairro, setBairro, cidade, setCidade, uf, setUf, status, setStatus
}) => (
  <>
    <div className="divisor-endereco"><span className="label-secao">Endereço do Cliente</span></div>
    <div className="form-row">
      <div className="form-group flex-cep">
        <label className="form-label">CEP</label>
        <input type="text" value={cep} onChange={e => setCep(e.target.value)} placeholder="00000-000" className="input-padrao" />
      </div>
      <div className="form-group flex-rua">
        <label className="form-label">Rua / Logradouro</label>
        <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Ex: Av. Central" className="input-padrao" />
      </div>
      <div className="form-group flex-num">
        <label className="form-label">Número</label>
        <input type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 123" className="input-padrao" />
      </div>
    </div>
    <div className="form-row">
      <div className="form-group form-group-bairro">
        <label className="form-label">Bairro</label>
        <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Ex: Centro" className="input-padrao" />
      </div>
      <div className="form-group form-group-cidade">
        <label className="form-label">Cidade</label>
        <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: São Paulo" className="input-padrao" />
      </div>
      <div className="form-group form-group-uf">
        <label className="form-label">UF</label>
        <input type="text" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} placeholder="SP" className="input-padrao" />
      </div>
      <div className="form-group form-group-status">
        <label className="form-label">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as 'Ativo' | 'Inativo')} className="input-padrao">
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
      </div>
    </div>
  </>
);
