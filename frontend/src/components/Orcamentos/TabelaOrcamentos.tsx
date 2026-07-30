import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

// Tipagem definida direto aqui dentro para evitar erros de importação de arquivo
interface ItemOrcamento {
  id: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
}

interface Orcamento {
  id: number;
  clienteId: number;
  clienteNome: string;
  dataCriacao: string;
  validade: string;
  itens: ItemOrcamento[];
  valorTotal: number;
  status: 'Pendente' | 'Aprovado' | 'Cancelado';
}

interface Props {
  orcamentos: Orcamento[];
}

export function TabelaOrcamentos({ orcamentos }: Props) {
  return (
    <div className="tabela-wrapper">
      <table className="tabela-orcamentos">
        <thead>
          <tr>
            <th>Nº Proposta</th>
            <th>Cliente</th>
            <th>Data Emissão</th>
            <th>Validade</th>
            <th>Valor Total</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map((orc) => (
            <tr key={orc.id}>
              <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{orc.id}</td>
              <td className="td-cliente">
                {orc.clienteNome}
                <span className="span-itens-qtd">{(orc.itens || []).length} item(ns)</span>
              </td>
              <td>{orc.dataCriacao}</td>
              <td>{orc.validade ? new Date(orc.validade).toLocaleDateString('pt-BR') : 'Não informada'}</td>
              <td className="td-valor">R$ {(orc.valorTotal || 0).toFixed(2)}</td>
              <td>
                <span className={`status-badge ${orc.status === 'Aprovado' ? 'status-aprovado' : orc.status === 'Cancelado' ? 'status-cancelado' : 'status-pendente'}`}>
                  {orc.status}
                </span>
              </td>
              <td className="td-acoes">
                <button title="Visualizar" className="btn-acao"><FileText size={16} /></button>
                <button title="Excluir" className="btn-acao-excluir"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {orcamentos.length === 0 && (
            <tr><td colSpan={7} className="tabela-vazia" style={{textAlign: 'center', padding: '32px'}}>Nenhum orçamento gerado.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
