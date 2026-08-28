// src/components/OrdensServico/ListaOS.jsx
import React from 'react';
import { Edit2, CheckSquare, Printer } from 'lucide-react';
import * as S from './OrdensServico.styles';

export function ListaOS({
  carregando,
  ordensFiltradas,
  onEditarOS, // CORREÇÃO: Recebe a função unificada e tratada vinda do componente pai
  handleFinalizarOS,
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
              <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>
                R$ {Number(os.valor_total || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Botão de Editar protegido contra alterações em OS finalizadas */}
              {os.status !== 'Finalizada' && (
                <button 
                  type="button" 
                  onClick={() => onEditarOS(os)} // CORREÇÃO: Dispara a ação tratada com splits corretos de data
                  style={S.botaoAcoesCardStyle}
                  title="Editar OS"
                >
                  <Edit2 size={16}/>
                </button>
              )}

              {/* Botão de Impressão */}
              <button 
                type="button" 
                onClick={() => lidarComImpressaoOS(os)} 
                style={S.botaoImprimirCardStyle || S.botaoAcoesCardStyle}
                title="Imprimir O.S."
              >
                <Printer size={16}/>
              </button>
              
              {/* Botão de Finalização */}
              {os.status !== 'Finalizada' && (
                <button type="button" onClick={() => handleFinalizarOS(os)} style={S.botaoFinalizarCardStyle}>
                  <CheckSquare size={16}/> Finalizar
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
