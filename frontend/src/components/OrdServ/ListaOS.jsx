// src/components/OrdensServico/ListaOS.jsx
import React from 'react';
import { Edit2, CheckSquare, Printer, DollarSign } from 'lucide-react';
import * as S from './OrdensServico.styles';

export function ListaOS({
  carregando,
  ordensFiltradas,
  onEditarOS,
  handleFinalizarOS,
  handleBaixaParcialOS, 
  lidarComImpressaoOS
}) {
  return (
    <div style={S.listagemContainerStyle}>
      {carregando ? (
        <p style={{ color: '#94a3b8' }}>Carregando dados do Supabase...</p>
      ) : ordensFiltradas.length === 0 ? (
        <p style={{ color: '#64748b' }}>Nenhuma ordem de serviço localizada.</p>
      ) : (
        ordensFiltradas.map((os) => (
          <div key={os.id} style={S.cardOSStyle}>
            <div>
              <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{os.id}</span> -{' '}
              <span style={{ color: '#f8fafc', fontWeight: '500' }}>{os.clientes?.nome || 'Cliente'}</span>
              <div style={S.cardTextoStyle}>
                Itens: {os.ordens_servico_itens ? os.ordens_servico_itens.length : 0} | Status:{' '}
                <strong style={{ color: os.status === 'Finalizada' ? '#16a34a' : '#ca8a04' }}>{os.status}</strong>
              </div>
              <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px', fontSize: '15px' }}>
                R$ {Number(os.valor_total || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Botão de Editar */}
              {os.status !== 'Finalizada' && (
                <button type="button" onClick={() => onEditarOS(os)} style={S.botaoAcoesCardStyle} title="Editar OS">
                  <Edit2 size={16}/>
                </button>
              )}

              {/* Botão de Impressão */}
              <button type="button" onClick={() => lidarComImpressaoOS(os)} style={S.botaoImprimirCardStyle || S.botaoAcoesCardStyle} title="Imprimir O.S.">
                <Printer size={16}/>
              </button>

              {/* Botão de Baixa Parcial */}
              {os.status !== 'Finalizada' && (
                <button type="button" onClick={() => handleBaixaParcialOS(os)} style={{ ...S.botaoAcoesCardStyle, backgroundColor: '#0284c7' }} title="Registrar Recebimento Parcial">
                  <DollarSign size={16}/>
                </button>
              )}
              
              {/* Botão de Finalização Total */}
              {os.status !== 'Finalizada' && (
                <button type="button" onClick={() => handleFinalizarOS(os)} style={S.botaoFinalizarCardStyle}>
                  <CheckSquare size={16}/> Quitar Total
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}