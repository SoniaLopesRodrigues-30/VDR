// src/components/Relatorios/LinhaTabelaPrevisao.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { estilos } from './estilosPrevisoes';

interface LinhaProps {
  item: any;
  idx: number;
  fmtMoeda: (v: number) => string;
}

const formatarData = (dataStr: any) => {
  if (!dataStr || typeof dataStr !== 'string') return 'Sem Data';
  const partes = dataStr.substring(0, 10).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
};

export default function LinhaTabelaPrevisao({ item, idx, fmtMoeda }: LinhaProps) {
  if (!item) return null;
  
  const isReceita = item.tipo === 'receita';
  let statusLabel = 'Realizado';
  let estiloStatus = { bg: '#d1fae5', texto: '#065f46' };

  if (item.status === 'pendente') {
    if (item.estaAtrasado) {
      statusLabel = 'Atrasado';
      estiloStatus = { bg: '#fee2e2', texto: '#991b1b' };
    } else {
      statusLabel = 'Previsto';
      estiloStatus = { bg: '#fef3c7', texto: '#d97706' };
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: item.estaAtrasado ? '#fff5f5' : (idx % 2 === 0 ? '#fafafa' : '#fff') }}>
      <td style={{ ...estilos.td, color: item.estaAtrasado ? '#991b1b' : '#334155', fontWeight: item.estaAtrasado ? 'bold' : 'normal' }}>
        {formatarData(item.data)}
      </td>
      <td style={estilos.td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.estaAtrasado && <AlertTriangle size={14} color="#ef4444" />}
          <span>{item.descricao || item.historico || 'Sem descrição'}</span>
        </div>
      </td>
      <td style={estilos.td}>{item.conta_contabil || item.categoria || '-'}</td>
      <td style={estilos.td}>
        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: estiloStatus.bg, color: estiloStatus.texto }}>
          {statusLabel}
        </span>
      </td>
      <td style={{ ...estilos.td, color: isReceita ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
        {isReceita ? 'Entrada' : 'Saída'}
      </td>
      <td style={{ ...estilos.td, textAlign: 'right', color: isReceita ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
        {isReceita ? '+' : '-'} {fmtMoeda(Number(item.valor || item.valor_parcela || 0))}
      </td>
    </tr>
  );
}
