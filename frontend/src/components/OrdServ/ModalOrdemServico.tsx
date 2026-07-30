import React from 'react';
import { X, Trash2, Printer } from 'lucide-react';
import { DocumentoImpressaoOS } from './DocumentoImpressaoOS';
import { SecaoItensOS } from './SecaoItensOS';

// Interface declarada direto aqui para cortar o vínculo com o useOrdemServico e parar o erro
interface ItemTabelaOS {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';

interface Props {
  onFechar: () => void;
  onSalvar: (e: React.FormEvent) => void;
  numeroOS: string;
  clienteId: number | '';
  setClienteId: (id: number | '') => void;
  clientesDisponiveis: { id: number; nome: string }[];
  dataAbertura: string;
  setDataAbertura: (d: string) => void;
  equipamento: string;
  setEquipamento: (e: string) => void;
  defeito: string;
  setDefeito: (d: string) => void;
  laudoTecnico: string;
  setLaudoTecnico: (l: string) => void;
  status: StatusOS;
  setStatus: (s: StatusOS) => void;
  
  // Serviços
  descServico: string;
  setDescServico: (d: string) => void;
  qtdServico: number;
  setQtdServico: (q: number) => void;
  valorServico: number;
  setValorServico: (v: number) => void;
  servicos: ItemTabelaOS[]; // Atualizado
  setServicos: React.Dispatch<React.SetStateAction<ItemTabelaOS[]>>; // Atualizado
  handleAdicionarServico: () => void;

  // Peças
  descPeca: string;
  setDescPeca: (d: string) => void;
  qtdPeca: number;
  setQtdPeca: (q: number) => void;
  valorPeca: number;
  setValorPeca: (v: number) => void;
  pecas: ItemTabelaOS[]; // Atualizado
  setPecas: React.Dispatch<React.SetStateAction<ItemTabelaOS[]>>; // Atualizado
  handleAdicionarPeca: () => void;

  valorTotalOS: number;
}

export function ModalOrdemServico(props: Props) {
  const {
    onFechar, onSalvar, numeroOS, clienteId, setClienteId, clientesDisponiveis = [],
    dataAbertura, setDataAbertura, equipamento, setEquipamento, defeito, setDefeito,
    laudoTecnico, setLaudoTecnico, status = 'Aberta', setStatus, valorTotalOS = 0
  } = props;

  const clienteSelecionado = clientesDisponiveis.find(c => c.id === clienteId);
  const clienteNome = clienteSelecionado ? clienteSelecionado.nome : '';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
        <button type="button" onClick={onFechar} className="btn-fechar-modal">
          <X size={20} />
        </button>
        <h3 className="modal-title">Gerenciar Ordem de Serviço ({numeroOS})</h3>
        
        <form onSubmit={onSalvar} className="form-modal">
          {/* SELEÇÃO DO CLIENTE E STATUS */}
          <div className="form-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '2 1 250px' }}>
              <label className="form-label">Cliente *</label>
              <select required value={clienteId} onChange={e => setClienteId(e.target.value === '' ? '' : Number(e.target.value))} className="input-padrao">
                <option value="">-- Selecione o cliente --</option>
                {clientesDisponiveis.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '1 1 150px' }}>
              <label className="form-label">Data de Abertura</label>
              <input type="date" value={dataAbertura} onChange={e => setDataAbertura(e.target.value)} className="input-padrao" />
            </div>
            <div className="form-group" style={{ flex: '1 1 150px' }}>
              <label className="form-label">Status da OS</label>
              <select value={status} onChange={e => setStatus(e.target.value as StatusOS)} className="input-padrao">
                <option value="Aberta">Aberta</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* DADOS DO EQUIPAMENTO */}
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Equipamento / Objeto do Reparo</label>
            <input type="text" value={equipamento} onChange={e => setEquipamento(e.target.value)} placeholder="Ex: Notebook Dell Inspiron / Motor HP" className="input-padrao" />
          </div>

          {/* DIAGNÓSTICO E LAUDO */}
          <div className="form-row" style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 300px' }}>
              <label className="form-label">Defeito Relatado</label>
              <textarea value={defeito} onChange={e => setDefeito(e.target.value)} placeholder="Sintomas informados pelo cliente..." className="input-padrao" style={{ minHeight: '60px', resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ flex: '1 1 300px' }}>
              <label className="form-label">Laudo Técnico / Solução</label>
              <textarea value={laudoTecnico} onChange={e => setLaudoTecnico(e.target.value)} placeholder="Laudo ou procedimentos técnicos aplicados..." className="input-padrao" style={{ minHeight: '60px', resize: 'vertical' }} />
            </div>
          </div>

          {/* PARTE 2 INJETADA: Subseções dinâmicas de Serviços e Peças */}
          <SecaoItensOS {...props} />

        </form>

        {/* Impressão Oculta */}
        <DocumentoImpressaoOS 
          numeroOS={numeroOS}
          clienteNome={clienteNome}
          dataAbertura={dataAbertura}
          equipamento={equipamento}
          defeito={defeito}
          laudoTecnico={laudoTecnico}
          servicos={props.servicos}
          pecas={props.pecas}
          valorTotalOS={valorTotalOS}
          status={status}
        />
      </div>
    </div>
  );
}
