// SecaoItensModal.tsx
import React from 'react';

export function SecaoItensModal({ props }: { props: any }) {
  return (
    <>
      {/* SELETOR DE TIPO DE ORDEM DE SERVIÇO */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
          Tipo da Ordem de Serviço
        </label>
        <select 
          value={props.form.tipoOs} 
          onChange={(e) => props.updateField('tipoOs', e.target.value)} 
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', color: '#334155' }}
        >
          <option value="ambos">Ambos (Serviços e Produtos)</option>
          <option value="mao_de_obra">Apenas Serviços / Mão de Obra</option>
          <option value="produtos">Apenas Produtos</option>
        </select>
      </div>

      {/* SEÇÃO DE SERVIÇOS  */}
      {props.tipoOs !== 'produtos' && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '14px' }}>
                    
          {props.servicos.map((s: any) => (
            <div key={s.id} style={{ fontSize: '13px', color: '#475569', padding: '2px 0' }}>
              • {s.descricao} ({s.quantidade}x) - R$ {s.total.toFixed(2)}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
  
          </div>

        </div>
      )}

      {/* NOVA SEÇÃO DE PRODUTOS COMPLETA */}
      {props.tipoOs !== 'mao_de_obra' && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '20px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#b45309', display: 'block', marginBottom: '8px' }}>Produtos/Serviços</span>
          
          {/* Formulário de Inserção em Grade para não poluir o layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input type="text" placeholder="Descrição do Produto" value={props.descPeca} onChange={(e) => props.setDescPeca(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="NCM (Ex: 84713012)" value={props.ncmPeca} onChange={(e) => props.setNcmPeca(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="date" value={props.dataItemPeca} onChange={(e) => props.setDataItemPeca(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select value={props.tipoUnidade} onChange={(e) => props.setTipoUnidade(e.target.value)} style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="PC">PC</option>
              <option value="MT">MT</option>
              <option value="LT">LT</option>
            </select>
            <input type="number" placeholder="Qtd" value={props.qtdPeca} onChange={(e) => props.setQtdPeca(Number(e.target.value))} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="number" placeholder="Valor Un (R$)" value={props.valorPeca} onChange={(e) => props.setValorPeca(Number(e.target.value))} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <button type="button" onClick={props.handleAdicionarPeca} style={{ padding: '6px 20px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Adicionar Item</button>
          </div>

          {/* Listagem detalhada dos produtos inseridos na OS */}
          {props.pecas.length > 0 && (
            <div style={{ backgroundColor: '#fafafa', borderRadius: '6px', padding: '10px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>Itens adicionados:</span>
              {props.pecas.map((p: any) => (
                <div key={p.id} style={{ fontSize: '13px', color: '#334155', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{p.descricao}</strong> <span style={{ color: '#64748b', fontSize: '11px' }}>[NCM: {p.ncm}] ({p.dataItem ? new Date(`${p.dataItem}T12:00:00`).toLocaleDateString('pt-BR') : ''})</span>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {p.quantidade} {p.tipoUnidade} x R$ {p.valorUnitario.toFixed(2)}
                    </div>
                  </div>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>
                    R$ {p.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
