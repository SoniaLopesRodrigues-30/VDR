import React from 'react';
import { X } from 'lucide-react';

// Tipagem exata das propriedades para evitar erros no TypeScript
interface ModalClienteProps {
  form: {
    nome: string;
    tipo: 'Física' | 'Jurídica';
    documento: string;
    inscricaoEstadual: string;
    email: string;
    telefone: string;
    status: 'Ativo' | 'Inativo';
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  handleChangeForm: (campo: any, valor: string) => void;
  idEditando: number | null;
  handleSalvarCliente: (e: React.FormEvent) => Promise<void>;
  fecharModal: () => void;
}

export function ModalCliente({
  form,
  handleChangeForm,
  idEditando,
  handleSalvarCliente,
  fecharModal
}: ModalClienteProps) {

  // MÁSCARAS DE FORMATAÇÃO
  const formatarCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatarCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatarCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    }
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <button type="button" onClick={fecharModal} className="btn-fechar-modal">
          <X size={20} />
        </button>

        <h3 className="modal-title">
          {idEditando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
        </h3>

        <form onSubmit={handleSalvarCliente} className="form-modal">
          
          {/* SELETOR DE TIPO */}
          <div className="form-group">
            <label className="form-label">Tipo de Pessoa</label>
            <div className="form-radio-group">
              <label className="form-radio-label">
                <input 
                  type="radio" 
                  name="tipo" 
                  checked={form.tipo === 'Física'} 
                  onChange={() => { handleChangeForm('tipo', 'Física'); handleChangeForm('documento', ''); }} 
                /> Pessoa Física
              </label>
              <label className="form-radio-label">
                <input 
                  type="radio" 
                  name="tipo" 
                  checked={form.tipo === 'Jurídica'} 
                  onChange={() => { handleChangeForm('tipo', 'Jurídica'); handleChangeForm('documento', ''); }} 
                /> Pessoa Jurídica                  
              </label>
            </div>
          </div>

          {/* DADOS BÁSICOS */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 240px' }}>
              <label className="form-label">
                {form.tipo === 'Física' ? 'Nome Completo *' : 'Razão Social *'}
              </label>
              <input 
                type="text" 
                required 
                value={form.nome} 
                onChange={e => handleChangeForm('nome', e.target.value)} 
                placeholder={form.tipo === 'Física' ? "Ex: Maria Souza" : "Ex: Minha Empresa Ltda"} 
                className="input-padrao" 
              />
            </div>

            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="form-label">
                {form.tipo === 'Física' ? 'CPF *' : 'CNPJ *'}
              </label>
              <input 
                type="text" 
                required 
                value={form.documento} 
                onChange={e => {
                  const valor = form.tipo === 'Física' 
                    ? formatarCPF(e.target.value) 
                    : formatarCNPJ(e.target.value);
                  handleChangeForm('documento', valor);
                }} 
                placeholder={form.tipo === 'Física' ? "000.000.000-00" : "00.000.000/0001-00"} 
                className="input-padrao" 
              />
            </div>
          </div>

          {/* EXIBE INSCRIÇÃO ESTADUAL SE FOR PESSOA JURÍDICA */}
          {form.tipo === 'Jurídica' && (
            <div className="form-row">
              <div className="form-group" style={{ flex: '1 1 100%' }}>
                <label className="form-label">Inscrição Estadual</label>
                <input 
                  type="text" 
                  value={form.inscricaoEstadual} 
                  onChange={e => handleChangeForm('inscricaoEstadual', e.target.value)} 
                  placeholder="Isento ou número da IE" 
                  className="input-padrao" 
                />
              </div>
            </div>
          )}

          {/* CONTATOS */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 240px' }}>
              <label className="form-label">E-mail</label>
              <input 
                type="email"                    
                value={form.email} 
                onChange={e => handleChangeForm('email', e.target.value)} 
                placeholder="Ex: maria@email.com" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="form-label">Telefone</label>
              <input 
                type="text" 
                value={form.telefone} 
                onChange={e => handleChangeForm('telefone', formatarTelefone(e.target.value))} 
                placeholder="Ex: (11) 99999-9999" 
                className="input-padrao" 
              />
            </div>
          </div>

          {/* DIVISOR VISUAL PARA ENDEREÇO */}
          <div className="divisor-endereco">
            <span className="label-secao">Endereço do Cliente</span>
          </div>

          {/* ENDEREÇO LINHA 1 */}
          <div className="form-row">
            <div className="form-group flex-cep">
              <label className="form-label" style={{ fontSize: '13px' }}>CEP</label>
              <input 
                type="text" 
                value={form.cep} 
                onChange={e => handleChangeForm('cep', formatarCEP(e.target.value))} 
                placeholder="00000-000" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group flex-rua">
              <label className="form-label" style={{ fontSize: '13px' }}>Rua / Logradouro</label>
              <input 
                type="text" 
                value={form.logradouro} 
                onChange={e => handleChangeForm('logradouro', e.target.value)} 
                placeholder="Ex: Av. Central" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group flex-num">
              <label className="form-label" style={{ fontSize: '13px' }}>Número</label>
              <input 
                type="text" 
                value={form.numero} 
                onChange={e => handleChangeForm('numero', e.target.value)} 
                placeholder="Ex: 123" 
                className="input-padrao" 
              />
            </div>
          </div>

          {/* ENDEREÇO LINHA 2 */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Bairro</label>
              <input 
                type="text" 
                value={form.bairro} 
                onChange={e => handleChangeForm('bairro', e.target.value)} 
                placeholder="Ex: Centro" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 140px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Cidade</label>
              <input 
                type="text" 
                value={form.cidade} 
                onChange={e => handleChangeForm('cidade', e.target.value)} 
                placeholder="Ex: São Paulo" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group" style={{ flex: '0 0 70px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>UF</label>
              <input 
                type="text" 
                maxLength={2} 
                value={form.uf} 
                onChange={e => handleChangeForm('uf', e.target.value.toUpperCase())} 
                placeholder="SP" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group" style={{ flex: '0 0 100px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>Status</label>
              <select 
                value={form.status} 
                onChange={e => handleChangeForm('status', e.target.value as 'Ativo' | 'Inativo')} 
                className="input-padrao"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* BOTÕES DO FOOTER */}
          {/* BOTÕES DO FOOTER - CORRIGIDO */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <button type="button" onClick={fecharModal} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              {idEditando ? 'Salvar Alterações' : 'Salvar Cliente'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
