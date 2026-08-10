// ModalOrdemServico.tsx
import React from 'react';

export function ModalOrdemServico(props: any) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>Nova Ordem de Serviço ({props.numeroOS})</h2>
        
        <form onSubmit={props.handleSalvarOS}>
          
          {/* CLIENTE DYNAMIC SELECT */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Cliente *</label>
            <select value={props.clienteId} onChange={(e) => props.setClienteId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
              <option value="">-- Selecione o Cliente da Lista --</option>
              {props.clientesDisponiveis.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Data de Abertura</label>
              <input type="date" value={props.dataAbertura} onChange={(e) => props.setDataAbertura(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Status</label>
              <select value={props.status} onChange={(e) => props.setStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="Aberta">Aberta</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Equipamento / Objeto</label>
            <input type="text" value={props.equipamento} onChange={(e) => props.setEquipamento(e.target.value)} placeholder="Ex: Ar Condicionado Split" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Defeito Relatado</label>
            <textarea value={props.defeito} onChange={(e) => props.setDefeito(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Laudo Técnico</label>
            <textarea value={props.laudoTecnico} onChange={(e) => props.setLaudoTecnico(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
          </div>

          {/* ADICIONAR SERVIÇOS */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '14px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>Mão de Obra / Serviços</span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" placeholder="Descrição do Serviço" value={props.descServico} onChange={(e) => props.setDescServico(e.target.value)} style={{ flex: 2, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="Qtd" value={props.qtdServico} onChange={(e) => props.setQtdServico(Number(e.target.value))} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="R$" value={props.valorServico} onChange={(e) => props.setValorServico(Number(e.target.value))} style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <button type="button" onClick={props.handleAdicionarServico} style={{ padding: '6px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
            </div>
            {props.servicos.map((s: any) => <div key={s.id} style={{ fontSize: '13px', color: '#475569', padding: '2px 0' }}>• {s.descricao} ({s.quantidade}x) - R$ {s.total.toFixed(2)}</div>)}
          </div>

          {/* ADICIONAR PEÇAS */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '8px' }}>Peças / Materiais</span>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" placeholder="Nome da Peça" value={props.descPeca} onChange={(e) => props.setDescPeca(e.target.value)} style={{ flex: 2, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="Qtd" value={props.qtdPeca} onChange={(e) => props.setQtdPeca(Number(e.target.value))} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="number" placeholder="R$" value={props.valorPeca} onChange={(e) => props.setValorPeca(Number(e.target.value))} style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <button type="button" onClick={props.handleAdicionarPeca} style={{ padding: '6px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
            </div>
            {props.pecas.map((p: any) => <div key={p.id} style={{ fontSize: '13px', color: '#475569', padding: '2px 0' }}>• {p.descricao} ({p.quantidade}x) - R$ {p.total.toFixed(2)}</div>)}
          </div>

          {/* VALOR GLOBAL DO MODAL */}
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#0f172a', marginBottom: '20px' }}>
            Total Global: R$ {props.valorTotalOS.toFixed(2)}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={props.fecharModal} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Gravar OS</button>
          </div>

        </form>
      </div>
    </div>
  );
}
