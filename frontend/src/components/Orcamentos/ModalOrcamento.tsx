import React from 'react';
import { X, Trash2, Printer } from 'lucide-react';
import { DocumentoImpressao } from './DocumentoImpressao';

interface ItemOrcamento {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

type StatusOrcamento = 'Pendente' | 'Aprovado' | 'Cancelado';

interface Props {
  onFechar: () => void;
  onSalvar: (e: React.FormEvent) => void;
  clienteId: number | '';
  setClienteId: (id: number | '') => void;
  clientesDisponiveis: { id: number; nome: string }[];
  validade: string;
  setValidade: (v: string) => void;
  descricaoItem: string;
  setDescricaoItem: (d: string) => void;
  qtdItem: number;
  setQtdItem: (q: number) => void;
  valorItem: number;
  setValorItem: (v: number) => void;
  onAdicionarItem: () => void;
  itens: ItemOrcamento[];
  setItens: React.Dispatch<React.SetStateAction<ItemOrcamento[]>>;
  valorTotalGeral: number;
  status: StatusOrcamento;
  setStatus: (s: StatusOrcamento) => void;
}

export function ModalOrcamento({
  onFechar, onSalvar, clienteId, setClienteId, clientesDisponiveis = [], validade, setValidade,
  descricaoItem, setDescricaoItem, qtdItem, setQtdItem, valorItem, setValorItem,
  onAdicionarItem, itens = [], setItens, valorTotalGeral = 0, status = 'Pendente', setStatus
}: Props) {

  const handleImprimirNativo = () => {
    window.print();
  };

  const clienteSelecionado = clientesDisponiveis.find(c => c.id === clienteId);
  const clienteNome = clienteSelecionado ? clienteSelecionado.nome : '';
  const totalFormatado = typeof valorTotalGeral === 'number' ? valorTotalGeral.toFixed(2) : '0.00';

  const handleAdicionarItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    if (!descricaoItem.trim() || qtdItem <= 0 || valorItem <= 0) return;
    onAdicionarItem();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button type="button" onClick={onFechar} className="btn-fechar-modal">
          <X size={20} />
        </button>
        <h3 className="modal-title">Gerar Novo Orçamento</h3>
        
        <form onSubmit={onSalvar} className="form-modal">
          <div className="form-row">
            <div className="form-group" style={{ flex: '2 1 280px' }}>
              <label className="form-label">Selecionar Cliente *</label>
              <select 
                required 
                value={clienteId} 
                onChange={e => setClienteId(e.target.value === '' ? '' : Number(e.target.value))} 
                className="input-padrao"
              >
                <option value="">-- Selecione o cliente cadastrado --</option>
                {clientesDisponiveis.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 180px' }}>
              <label className="form-label">Data de Validade</label>
              <input type="date" value={validade} onChange={e => setValidade(e.target.value)} className="input-padrao" />
            </div>
          </div>

          <div className="secao-itens">
            <span className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Adicionar Produtos / Serviços
            </span>
            <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <input type="text" value={descricaoItem} onChange={e => setDescricaoItem(e.target.value)} placeholder="Descrição" className="input-padrao" style={{ flex: 2 }} />
              <input type="number" min="1" value={qtdItem} onChange={e => setQtdItem(Number(e.target.value))} className="input-padrao" style={{ flex: 0.5 }} />
              <input type="number" step="0.01" min="0" value={valorItem} onChange={e => setValorItem(Number(e.target.value))} placeholder="0.00" className="input-padrao" style={{ flex: 1 }} />
              <button type="button" onClick={handleAdicionarItem} className="btn-adicionar-item">
                + Item
              </button>
            </div>

            {itens.length > 0 && (
              <table className="tabela-itens-interna">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th align="center">Qtd</th>
                    <th align="right">Unitário</th>
                    <th align="right">Total</th>
                    <th align="center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(item => (
                    <tr key={item.id}>
                      <td>{item.descricao}</td>
                      <td align="center">{item.quantidade}</td>
                      <td align="right">R$ {item.valorUnitario.toFixed(2)}</td>
                      <td align="right" style={{ fontWeight: '600' }}>R$ {item.total.toFixed(2)}</td>
                      <td align="center">
                        <button 
                          type="button" 
                          onClick={() => setItens(itens.filter(i => i.id !== item.id))} 
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

          <div className="total-bloco">Total do Orçamento: R$ {totalFormatado}</div>
          
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label className="form-label">Status Inicial</label>
            <select value={status} onChange={e => setStatus(e.target.value as StatusOrcamento)} className="input-padrao">
              <option value="Pendente">Pendente</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
          
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
              <button type="submit" className="btn-salvar">Salvar Orçamento</button>
            </div>
          </div>
        </form>

        {/* Agora inserido fora de nós ocultados por display:none */}
        <DocumentoImpressao 
          clienteNome={clienteNome}
          validade={validade}
          itens={itens}
          valorTotalGeral={valorTotalGeral}
          status={status}
        />

      </div>
    </div>
  );
}
