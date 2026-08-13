import React from 'react';
import * as S from './Orcamentos.styles';

export function ListaOrcamentos({
  carregando,
  orcamentosFiltrados,
  setIdEditando,
  setClienteId,
  setValidade,
  setItens,
  lidarComImpressao,
  converterEmOS
}) {
  return (
    <div style={S.listagemContainerStyle}>
      {carregando ? (
        <p style={S.textoInformativoStyle}>Carregando dados do Supabase...</p>
      ) : orcamentosFiltrados.length === 0 ? (
        <p style={S.textoInformativoStyle}>Nenhum orçamento localizado.</p>
      ) : (
        orcamentosFiltrados.map((orc) => (
          <div key={orc.id} style={S.cardOrcamentoStyle}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{orc.id}</span> -{' '}
              <span style={{ fontWeight: '500', color: '#f8fafc' }}>{orc.clientes?.nome}</span>
              <div style={S.cardTextoStyle}>
                Itens cadastrados: {orc.orcamento_itens ? orc.orcamento_itens.length : 0} | Status:{' '}
                <strong style={{ color: orc.status === 'Aprovado' ? '#16a34a' : orc.status === 'Recusado' ? '#ef4444' : '#ca8a04' }}>
                  {orc.status}
                </strong>{' '}
                | Validade: {orc.validade}
              </div>
              <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>
                R$ {Number(orc.valor_total || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => { 
                  setIdEditando(orc.id); 
                  setClienteId(String(orc.cliente_id)); 
                  setValidade(orc.validade); 
                  setItens(orc.orcamento_itens || []); 
                }} 
                style={S.botaoAcoesCardStyle}
                title="Editar Orçamento"
              >
                Editar
              </button>

              <button 
                type="button" 
                onClick={() => lidarComImpressao(orc)} 
                style={S.botaoImprimirCardStyle || S.botaoAcoesCardStyle}
                title="Imprimir Orçamento"
              >
                Imprimir
              </button>
              
              {orc.status === 'Pendente' && (
                <button type="button" onClick={() => converterEmOS(orc)} style={S.botaoAprovarCardStyle} title="Aprovar e Gerar OS">
                  Gerar OS
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
