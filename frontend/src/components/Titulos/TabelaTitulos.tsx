// src/components/Titulos/TabelaTitulos.tsx
import React from 'react';
import type { Titulo } from './useTitulos';
import * as S from './Titulos.styles';

interface TabelaTitulosProps {
  carregando: boolean;
  titulos: Titulo[];
  onBaixar: (t: Titulo) => void;
  onEditar: (t: Titulo) => void;
  onDeletar: (id: string, nfeId: string) => void; // <--- Adicionado na interface
}

export default function TabelaTitulos({ carregando, titulos, onBaixar, onEditar, onDeletar }: TabelaTitulosProps) {
  return (
    <div style={S.tabelaContainerStyle}>
      <table style={S.tabelaStyle}>
        <thead>
          <tr>
            <th style={S.thStyle}>Fluxo</th>
            <th style={S.thStyle}>Documento</th>
            <th style={S.thStyle}>Pessoa / Empresa</th>
            <th style={S.thStyle}>Vencimento</th>
            <th style={S.thStyle}>Valor Parcela</th>
            <th style={S.thStyle}>Status</th>
            <th style={S.thStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {carregando ? (
            <tr><td colSpan={7} style={S.tdStyle}>Carregando registros do Supabase...</td></tr>
          ) : titulos.length === 0 ? (
            <tr><td colSpan={7} style={S.tdStyle}>Nenhum título encontrado.</td></tr>
          ) : (
            titulos.map((t) => (
              <tr key={t.id}>
                <td style={{ ...S.tdStyle, fontWeight: 'bold', color: t.tipo === 'Pagar' ? '#ef4444' : '#16a34a' }}>
                  {t.tipo === 'Pagar' ? 'PAGAR' : 'RECEBER'}
                </td>
                <td style={S.tdStyle}>{t.nfe_id} {t.parcela > 1 && `(Parc. ${t.parcela})`}</td>
                <td style={S.tdStyle}>{t.clientes?.nome || 'Não identificado'}</td>
                <td style={S.tdStyle}>{t.data_vencimento ? new Date(t.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '---'}</td>
                <td style={{ ...S.tdStyle, fontWeight: 'bold' }}>R$ {Number(t.valor_parcela).toFixed(2)}</td>
                <td style={S.tdStyle}><span style={S.badgeStyle(t.status, t.tipo)}>{t.status}</span></td>
                <td style={S.tdStyle}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {t.status === 'Pendente' && (
                      <>
                        <button type="button" onClick={() => onBaixar(t)} style={{ ...S.botaoAcaoStyle, backgroundColor: t.tipo === 'Pagar' ? '#ef4444' : '#16a34a' }}>
                          {t.tipo === 'Pagar' ? 'Pagar' : 'Liquidar'}
                        </button>
                        <button type="button" onClick={() => onEditar(t)} style={{ ...S.botaoAcaoStyle, backgroundColor: '#3b82f6' }}>
                          Editar
                        </button>
                      </>
                    )}
                    {/* O botão de excluir fica disponível para qualquer status, servindo como controle gerencial */}
                    <button 
                      type="button" 
                      onClick={() => onDeletar(t.id, t.nfe_id)} 
                      style={{ ...S.botaoAcaoStyle, backgroundColor: '#64748b' }} // Cor cinza discreta para exclusão
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
