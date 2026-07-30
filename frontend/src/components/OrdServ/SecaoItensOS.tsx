import React from 'react';
import { Trash2, Printer } from 'lucide-react';

// Criando a interface diretamente aqui dentro para cortar a dependência que causou o erro
interface ItemTabelaOS {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

interface SecaoProps {
  onFechar: () => void;
  status: StatusOS;
  
  // Serviços
  descServico: string;
  setDescServico: (d: string) => void;
  qtdServico: number;
  setQtdServico: (q: number) => void;
  valorServico: number;
  setValorServico: (v: number) => void;
  servicos: ItemTabelaOS[]; // Atualizado aqui
  setServicos: React.Dispatch<React.SetStateAction<ItemTabelaOS[]>>; // Atualizado aqui
  handleAdicionarServico: () => void;

  // Peças
  descPeca: string;
  setDescPeca: (d: string) => void;
  qtdPeca: number;
  setQtdPeca: (q: number) => void;
  valorPeca: number;
  setValorPeca: (v: number) => void;
  pecas: ItemTabelaOS[]; // Atualizado aqui
  setPecas: React.Dispatch<React.SetStateAction<ItemTabelaOS[]>>; // Atualizado aqui
  handleAdicionarPeca: () => void;

  valorTotalOS: number;
}

export function SecaoItensOS({
  onFechar, servicos = [], setServicos, handleAdicionarServico,
  descServico, setDescServico, qtdServico, setQtdServico, valorServico, setValorServico,
  pecas = [], setPecas, handleAdicionarPeca,
  descPeca, setDescPeca, qtdPeca, setQtdPeca, valorPeca, setValorPeca,
  valorTotalOS = 0
}: SecaoProps) {

  const handleImprimirNativo = () => {
    window.print();
  };

  const totalFormatado = typeof valorTotalOS === 'number' ? valorTotalOS.toFixed(2) : '0.00';

  const triggerAdicionarServico = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!descServico.trim() || qtdServico <= 0 || valorServico <= 0) return;
    handleAdicionarServico();
  };

  const triggerAdicionarPeca = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!descPeca.trim() || qtdPeca <= 0 || valorPeca <= 0) return;
    handleAdicionarPeca();
  };

  return (
    <>
      {/* SEÇÃO 1: SERVIÇOS / MÃO DE OBRA */}
      <div className="secao-itens" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
        <span className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          1. Mão de Obra / Serviços
        </span>
        <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <input type="text" value={descServico} onChange={e => setDescServico(e.target.value)} placeholder="Descrição do serviço executado" className="input-padrao" style={{ flex: 2 }} />
          <input type="number" min="1" value={qtdServico} onChange={e => setQtdServico(Number(e.target.value))} className="input-padrao" style={{ flex: 0.5 }} />
          <input type="number" step="0.01" min="0" value={valorServico} onChange={e => setValorServico(Number(e.target.value))} placeholder="0.00" className="input-padrao" style={{ flex: 1 }} />
          <button type="button" onClick={triggerAdicionarServico} className="btn-adicionar-item">+ Serviço</button>
        </div>
        
        {servicos.length > 0 && (
          <table className="tabela-itens-interna" style={{ marginTop: '8px', width: '100%' }}>
            <tbody>
              {servicos.map(s => (
                <tr key={s.id}>
                  <td style={{ fontSize: '13px' }}>{s.descricao}</td>
                  <td align="center" style={{ fontSize: '13px', width: '50px' }}>{s.quantidade}x</td>
                  <td align="right" style={{ fontSize: '13px', width: '100px' }}>R$ {s.valorUnitario.toFixed(2)}</td>
                  <td align="center" style={{ width: '40px' }}>
                    <button type="button" onClick={() => setServicos(servicos.filter(i => i.id !== s.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SEÇÃO 2: PEÇAS / REPOSIÇÃO */}
      <div className="secao-itens" style={{ marginTop: '15px' }}>
        <span className="form-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          2. Peças / Componentes Substituídos
        </span>
        <div className="form-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <input type="text" value={descPeca} onChange={e => setDescPeca(e.target.value)} placeholder="Descrição da peça de reposição" className="input-padrao" style={{ flex: 2 }} />
          <input type="number" min="1" value={qtdPeca} onChange={e => setQtdPeca(Number(e.target.value))} className="input-padrao" style={{ flex: 0.5 }} />
          <input type="number" step="0.01" min="0" value={valorPeca} onChange={e => setValorPeca(Number(e.target.value))} placeholder="0.00" className="input-padrao" style={{ flex: 1 }} />
          <button type="button" onClick={triggerAdicionarPeca} className="btn-adicionar-item">+ Peça</button>
        </div>

        {pecas.length > 0 && (
          <table className="tabela-itens-interna" style={{ marginTop: '8px', width: '100%' }}>
            <tbody>
              {pecas.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: '13px' }}>{p.descricao}</td>
                  <td align="center" style={{ fontSize: '13px', width: '50px' }}>{p.quantidade}x</td>
                  <td align="right" style={{ fontSize: '13px', width: '100px' }}>R$ {p.valorUnitario.toFixed(2)}</td>
                  <td align="center" style={{ width: '40px' }}>
                    <button type="button" onClick={() => setPecas(pecas.filter(i => i.id !== p.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* BLOCO TOTALIZADOR */}
      <div className="total-bloco" style={{ marginTop: '20px' }}>Total da OS: R$ {totalFormatado}</div>
      
      {/* RODAPÉ DO MODAL */}
      <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '24px' }}>
        <div>
          <button 
            type="button" 
            onClick={handleImprimirNativo} 
            className="btn-imprimir"
            disabled={servicos.length === 0 && pecas.length === 0}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              cursor: (servicos.length === 0 && pecas.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (servicos.length === 0 && pecas.length === 0) ? 0.5 : 1
            }}
          >
            <Printer size={16} /> Imprimir OS
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onFechar} className="btn-cancelar">Cancelar</button>
          <button type="submit" className="btn-salvar">Salvar Ordem de Serviço</button>
        </div>
      </div>
    </>
  );
}
