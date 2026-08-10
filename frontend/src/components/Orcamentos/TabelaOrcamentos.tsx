// src/components/Orcamentos/TabelaOrcamentos.tsx
import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

// Interfaces ajustadas exatamente para o que o useOrcamentos.ts entrega
interface Orcamento {
  id: number;
  numero: string; // Adicionado para bater com o padrão 'ORC-001' do seu hook
  clienteNome: string;
  clienteId: number;
  validade: string;
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
            <th>Validade</th>
            <th>Valor Total</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orcamentos.map((orc) => (
            <tr key={orc.id}>
              {/* Usa a propriedade .numero que geramos de forma bonita no hook */}
              <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{orc.numero}</td>
              <td className="td-cliente">
                {orc.clienteNome}
              </td>
              {/* Tratamento da data para evitar fuso horário invertendo o dia */}
              <td>
                {orc.validade 
                  ? new Date(`${orc.validade}T12:00:00`).toLocaleDateString('pt-BR') 
                  : 'Não informada'}
              </td>
              {/* Formatação nativa de moeda brasileira com separador de milhar */}
              <td className="td-valor">
                {(orc.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
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
            <tr>
              <td colSpan={6} className="tabela-vazia" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                Nenhum orçamento localizado no sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
