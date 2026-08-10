// ModalOrdemServico.tsx
import React from 'react';
import { SecaoItensModal } from './SecaoItensModal';

export function ModalOrdemServico(props: any) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>Nova Ordem de Serviço ({props.numeroOS})</h2>
        
        <form onSubmit={props.handleSalvarOS}>
          
          {/* CLIENTE */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Cliente *</label>
            <select value={props.clienteId} onChange={(e) => props.setClienteId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required>
              <option value="">-- Selecione o Cliente --</option>
              {props.clientesDisponiveis.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* DATAS (ABERTURA E PREVISÃO) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Data de Abertura</label>
              <input type="date" value={props.dataAbertura} onChange={(e) => props.setDataAbertura(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Previsão de Entrega</label>
              <input type="date" value={props.previsaoEntrega} onChange={(e) => props.setPrevisaoEntrega(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          {/* CONDIÇÃO DE PAGAMENTO E STATUS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Condição de Pagamento</label>
              <input type="text" placeholder="Ex: À vista, Boleto 30 dias" value={props.condicaoPagamento} onChange={(e) => props.setCondicaoPagamento(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Status da OS</label>
              <select value={props.status} onChange={(e) => props.setStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="Aberta">Aberta</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* SELEÇÃO DO TIPO DE ORDEM DE SERVIÇO */}
          <div style={{ marginBottom: '18px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Foco da Ordem de Serviço:</label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="radio" name="tipoOs" value="ambos" checked={props.tipoOs === 'ambos'} onChange={() => props.setTipoOs('ambos')} /> Prestação e Venda (Ambos)
              </label>
              <label style={{ fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="radio" name="tipoOs" value="mao_de_obra" checked={props.tipoOs === 'mao_de_obra'} onChange={() => props.setTipoOs('mao_de_obra')} /> Apenas Mão de Obra (Serviços)
              </label>
              <label style={{ fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="radio" name="tipoOs" value="produtos" checked={props.tipoOs === 'produtos'} onChange={() => props.setTipoOs('produtos')} /> Apenas Venda (Produtos)
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600' }}>Equipamento / Descrição do Objeto</label>
            <input type="text" value={props.equipamento} onChange={(e) => props.setEquipamento(e.target.value)} placeholder="Ex: Computador, Motor Hidráulico" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          {/* INJEÇÃO DA SEGUNDA PARTE (PEÇAS E SERVIÇOS CONDICIONAIS) */}
          <SecaoItensModal props={props} />

          {/* TOTAL */}
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#0f172a', marginBottom: '20px', borderTop: '2px solid #f1f5f9', paddingTop: '12px' }}>
            Valor Total OS: R$ {props.valorTotalOS.toFixed(2)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={props.fecharModal} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Salvar Registro</button>
          </div>

        </form>
      </div>
    </div>
  );
}
