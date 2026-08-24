// ListaOC.tsx
import React from 'react';
import * as S from './OrdemCompra.styles';

interface ListaOCProps {
  carregando: boolean;
  ordensFiltradas: any[];
  ativarEdicaoOC: (oc: any) => void;
}

export function ListaOC({ carregando, ordensFiltradas, activarEdicaoOC }: ListaOCProps) {
  if (carregando) return <p style={{ color: '#64748b' }}>🔄 Carregando ordens do Supabase...</p>;

  return (
    <div style={S.listagemContainerStyle}>
      {ordensFiltradas.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Nenhuma ordem de compra encontrada.</p>
      ) : (
        ordensFiltradas.map((oc) => (
          <div key={oc.id} style={S.cardOCStyle}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#0284c7' }}>{oc.id}</span>
              <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                Fornecedor: {oc.clientes?.nome || 'Não identificado'}
              </span>
              <div style={S.cardTextoStyle}>
                Vencimento: {oc.data_vencimento ? new Date(oc.data_vencimento).toLocaleDateString('pt-BR') : 'Não informada'} | 
                Itens: {oc.ordens_compra_itens?.length || 0} | 
                <strong> Total: R$ {Number(oc.valor_total).toFixed(2)}</strong>
              </div>
            </div>
            <div>
              <button type="button" onClick={() => activarEdicaoOC(oc)} style={S.botaoAcoesCardStyle}>
                Editar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
