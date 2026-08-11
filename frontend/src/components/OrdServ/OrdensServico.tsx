// OrdensServico.tsx
import React from 'react';
import { Plus, Search, User, Wrench, Calendar, Edit, Trash2, Printer } from 'lucide-react';
import { useOrdemServico } from './useOrdemServico';
import { ModalOrdemServico } from './ModalOrdemServico';
import { gerarImpressaoOS } from './gerarImpressao';

import logoEmpresa from 'C:/Sonia/Projetos/vdr/frontend/src/assets/LOGO.png'; // caminho da imagem



export function OrdensServico() {
  const hooks = useOrdemServico();

  const obterEstiloStatus = (status: string) => {
    switch (status) {
      case 'Concluída': return { bg: '#dcfce7', text: '#166534' };
      case 'Cancelada': return { bg: '#fee2e2', text: '#991b1b' };
      case 'Em Andamento': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#fef9c3', text: '#854d0e' };
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', marginbottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Ordens de Serviço</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Controle manutenções, laudos técnicos, peças e mão de obra baseadas no Supabase.
          </p>
        </div>
        <button 
          onClick={hooks.abrirNovoModal} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={18} /> Nova OS
        </button>
      </div>

      {/* FILTRO BUSCA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <Search size={18} color="#94a3b8" />
        <input 
          type="text" 
          placeholder="Buscar por número, cliente ou equipamento..." 
          value={hooks.busca}
          onChange={(e) => hooks.setBusca(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#334155' }}
        />
      </div>

      {/* CARREGAMENTO / LISTA */}
      {hooks.loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Carregando dados da nuvem...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {hooks.ordensFiltradas.map(os => {
            const cores = obterEstiloStatus(os.status);
            return (
              <div key={os.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '16px' }}>{os.numero}</span>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: cores.bg, color: cores.text, textTransform: 'uppercase' }}>{os.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={15} color="#94a3b8" /> <strong>Cliente:</strong> {os.clienteNome}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wrench size={15} color="#94a3b8" /> <strong>Objeto:</strong> {os.equipamento}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="#94a3b8" /> <strong>Abertura:</strong> {os.dataAbertura ? new Date(`${os.dataAbertura}T12:00:00`).toLocaleDateString('pt-BR') : '--'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Valor da Ordem</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>R$ {os.valorTotal.toFixed(2)}</span>
                  </div>
                  
                  {/* BOTÕES DE AÇÃO */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <button onClick={() => gerarImpressaoOS(os, obterEstiloStatus, logoEmpresa)}>
                    <Printer size={14} /> Imprimir
                    </button>
                    <button onClick={() => hooks.abrirEditarModal(os)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 }}>
                      <Edit size={14} /> Editar
                    </button>
                    <button onClick={(e) => hooks.handleExcluirOS(os.id, e)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: 0 }}>
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {hooks.ordensFiltradas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Nenhuma ordem de serviço foi localizada.</p>
            </div>
          )}
        </div>
      )}

      {/* COMPONENTE DO MODAL */}
      {hooks.modalAberto && <ModalOrdemServico {...hooks} />}
    </div>
  );
}
