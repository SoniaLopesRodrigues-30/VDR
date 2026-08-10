import React from 'react';
import { X, Trash2, Printer } from 'lucide-react';
import { DocumentoImpressao } from './DocumentoImpressao';

interface ItemOrcamento {
  id?: number;
  descricao: string;
  un: string;
  ncm: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

interface FormOrcamento {
  clienteId: number | '';
  validade: string;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
  condicaoPagamento: string;
  previsaoEntrega: string;
  observacao: string;
  descricaoItem: string;
  unItem: string;
  ncmItem: string;
  qtdItem: number;
  valorItem: number;
}

interface Props {
  onFechar: () => void;
  onSalvar: (e: React.FormEvent) => void;
  clientesDisponiveis: { id: number; nome: string }[];
  itens: ItemOrcamento[];
  setItens: React.Dispatch<React.SetStateAction<ItemOrcamento[]>>;
  valorTotalGeral: number;
  form: FormOrcamento;
  handleChangeForm: (campo: keyof FormOrcamento, valor: any) => void;
  onAdicionarItem: () => void;
  idEditando: number | null;
}

export function ModalOrcamento({
  onFechar, onSalvar, clientesDisponiveis = [], itens = [], setItens,
  valorTotalGeral = 0, form, handleChangeForm, onAdicionarItem, idEditando
}: Props) {

  const handleImprimirNativo = () => {
    window.print();
  };

  const clienteSelecionado = clientesDisponiveis.find(c => c.id === form.clienteId);
  const clienteNome = clienteSelecionado ? clienteSelecionado.nome : '';
  
  // Substitua a linha da totalFormatado por esta:
const totalFormatado = typeof valorTotalGeral === 'number' && !isNaN(valorTotalGeral)
  ? valorTotalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
  : 'R$ 0,00';


  const handleAdicionarItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    if (!form.descricaoItem.trim() || form.qtdItem <= 0 || form.valorItem <= 0) return;
    onAdicionarItem();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px' }}>
        <button type="button" onClick={onFechar} className="btn-fechar-modal">
          <X size={20} />
        </button>
        
        <h3 className="modal-title">
          {idEditando ? 'Editar Orçamento' : 'Gerar Novo Orçamento'}
        </h3>
        
        <form onSubmit={onSalvar} className="form-modal">
          
          {/* SELEÇÃO DE CLIENTE E VALIDADE */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '2 1 280px' }}>
              <label className="form-label">Selecionar Cliente *</label>
              <select 
                required 
                value={form.clienteId} 
                onChange={e => handleChangeForm('clienteId', e.target.value === '' ? '' : Number(e.target.value))} 
                className="input-padrao"
              >
                <option value="">-- Selecione o cliente cadastrado --</option>
                {clientesDisponiveis.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="form-label">Data de Validade *</label>
              <input type="date" required value={form.validade} onChange={e => handleChangeForm('validade', e.target.value)} className="input-padrao" />
            </div>
          </div>

          {/* CONDIÇÃO DE PAGAMENTO E PREVISÃO DE ENTREGA */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 220px' }}>
              <label className="form-label">Condição de Pagamento</label>
              <input 
                type="text" 
                value={form.condicaoPagamento} 
                onChange={e => handleChangeForm('condicaoPagamento', e.target.value)} 
                placeholder="Ex: À vista, 30 dias" 
                className="input-padrao" 
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 220px' }}>
              <label className="form-label">Previsão de Entrega</label>
              <input 
                type="text" 
                value={form.previsaoEntrega} 
                onChange={e => handleChangeForm('previsaoEntrega', e.target.value)} 
                placeholder="Ex: 5 dias úteis, Imediata" 
                className="input-padrao" 
              />
            </div>
          </div>
          {/* ADICIONAR PRODUTOS / SERVIÇOS COM FORMATO UNIFICADO */}
          <div className="secao-itens">
            <span className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Adicionar Produtos / Serviços
            </span>
            <div className="form-row" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '3 1 200px' }}>
                <input type="text" value={form.descricaoItem} onChange={e => handleChangeForm('descricaoItem', e.target.value)} placeholder="Descrição" className="input-padrao" />
              </div>
              <div style={{ flex: '0.8 1 60px' }}>
                <input type="text" value={form.unItem} onChange={e => handleChangeForm('unItem', e.target.value)} placeholder="UN" className="input-padrao" title="Unidade de Medida" />
              </div>
              <div style={{ flex: '1.2 1 90px' }}>
                <input type="text" value={form.ncmItem} onChange={e => handleChangeForm('ncmItem', e.target.value)} placeholder="NCM" className="input-padrao" title="Código NCM" />
              </div>
              <div style={{ flex: '0.8 1 60px' }}>
                <input type="number" min="1" value={form.qtdItem} onChange={e => handleChangeForm('qtdItem', Number(e.target.value))} className="input-padrao" />
              </div>
              <div style={{ flex: '1.5 1 100px' }}>
                <input type="number" step="0.01" min="0" value={form.valorItem} onChange={e => handleChangeForm('valorItem', Number(e.target.value))} placeholder="Unitário" className="input-padrao" />
              </div>
              <div>
                <button type="button" onClick={handleAdicionarItem} className="btn-adicionar-item" style={{ height: '38px' }}>
                  + Item
                </button>
              </div>
            </div>

            {itens.length > 0 && (
              <table className="tabela-itens-interna">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th align="center">UN</th>
                    <th align="center">NCM</th>
                    <th align="center">Qtd</th>
                    <th align="right">Unitário</th>
                    <th align="right">Total</th>
                    <th align="center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => (
                    <tr key={item.id || `${item.descricao}-${index}`}>
                      <td>{item.descricao}</td>
                      <td align="center">{item.un}</td>
                      <td align="center">{item.ncm || '-'}</td>
                      <td align="center">{item.quantidade}</td>
                      <td align="right">{item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td align="right" style={{ fontWeight: '600' }}>{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td align="center">
                        <button 
                          type="button" 
                          onClick={() => setItens(itens.filter((_, i) => i !== index))} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="total-bloco">Total do Orçamento: {totalFormatado}</div>
          
          {/* STATUS INICIAL E OBSERVAÇÕES */}
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Status Inicial</label>
              <select value={form.status} onChange={e => handleChangeForm('status', e.target.value)} className="input-padrao">
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: '2 1 300px' }}>
              <label className="form-label">Observações Gerais</label>
              <textarea 
                value={form.observacao} 
                onChange={e => handleChangeForm('observacao', e.target.value)} 
                placeholder="Garantia, observações técnicas..." 
                className="input-padrao"
                style={{ height: '38px', resize: 'vertical' }}
              />
            </div>
          </div>
          
          {/* BOTÕES DO FOOTER */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '24px' }}>
            <div>
              <button 
                type="button" 
                onClick={handleImprimirNativo} 
                className="btn-imprimir"
                disabled={itens.length === 0}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  cursor: itens.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: itens.length === 0 ? 0.5 : 1
                }}
              >
                <Printer size={16} /> Imprimir PDF
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onFechar} className="btn-cancelar">Cancelar</button>
              <button type="submit" className="btn-salvar">
                {idEditando ? 'Salvar Alterações' : 'Salvar Orçamento'}
              </button>
            </div>
          </div>
        </form>

        <DocumentoImpressao 
          clienteNome={clienteNome}
          validade={form.validade}
          itens={itens}
          valorTotalGeral={valorTotalGeral}
          status={form.status}
        />

      </div>
    </div>
  );
}
