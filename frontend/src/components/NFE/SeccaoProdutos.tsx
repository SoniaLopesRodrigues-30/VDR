// src/components/Nfe/SeccaoProdutos.tsx
import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export function SeccaoProdutos({ state }: { state: any }) {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Estados temporários do item que está sendo digitado antes de ir para a Grid
  const [termoProduto, setTermoProduto] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);

  useEffect(() => {
    if (!termoProduto || termoProduto.trim().length < 2) {
      setListaProdutos([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setBuscando(true);
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('id, nome, preco_venda, ncm')
          .ilike('nome', `%${termoProduto}%`)
          .limit(5);

        if (!error && data) setListaProdutos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [termoProduto]);

  const handleAdicionarItemNaGrid = () => {
    if (!produtoId || qtd <= 0 || valUnit <= 0) {
      alert('Selecione um produto válido e informe a quantidade/valor.');
      return;
    }
    
    // Adiciona o produto na lista global de itens da NF-e no state principal
    state.setItensNfe([...state.itensNfe, { 
      produto_id: produtoId, 
      nome: termoProduto,
      quantidade: qtd, 
      valor_unitario: valUnit 
    }]);

    // Reseta o bloco de digitação do produto
    setTermoProduto(''); setProdutoId(''); setQtd(1); setValUnit(0);
  };

  const handleRemoverItemDaGrid = (indexParaRemover: number) => {
    state.setItensNfe(state.itensNfe.filter((_: any, idx: number) => idx !== indexParaRemover));
  };

  return (
    <fieldset className="section-divider" style={{ marginBottom: '24px' }}>
      <legend className="section-subtitle"><Package size={16} /> 3. Produtos e Serviços da Nota Fiscal</legend>
      
      {/* Campo de Busca e Digitação */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr', gap: '12px', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ position: 'relative' }}>
          <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Pesquisar Produto</label>
          <input 
            type="text" 
            placeholder="Digite o nome do produto..." 
            className="input-field"
            value={termoProduto}
            onChange={e => {
              setTermoProduto(e.target.value);
              setMostrarSugestoes(true);
            }}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 250)}
          />
          {mostrarSugestoes && termoProduto.trim().length >= 2 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', maxHeight: '140px', overflowY: 'auto', zIndex: 100, padding: 0, listStyle: 'none' }}>
              {buscando ? (
                <li style={{ padding: '8px', color: '#64748b', fontSize: '13px' }}>🔄 Buscando...</li>
              ) : listaProdutos.length > 0 ? (
                listaProdutos.map((p, idx) => (
                  <li 
                    key={p.id}
                    style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: hoverIndex === idx ? '#f1f5f9' : '#ffffff', borderBottom: '1px solid #f1f5f9', color: '#1f2937' }}
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseLeave={() => setHoverIndex(null)}
                    onClick={() => {
                      setProdutoId(p.id);
                      setTermoProduto(p.nome);
                      setValUnit(Number(p.preco_venda) || 0); // Puxa o preço padrão automaticamente
                      setMostrarSugestoes(false);
                    }}
                  >
                    <strong>[{p.id}]</strong> {p.nome} - R$ {Number(p.preco_venda).toFixed(2)}
                  </li>
                ))
              ) : (
                <li style={{ padding: '8px', color: '#94a3b8', fontSize: '13px' }}>Nenhum produto cadastrado.</li>
              )}
            </ul>
          )}
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Quantidade</label>
          <input type="number" className="input-field" value={qtd} onChange={e => setQtd(Number(e.target.value))} min={1} />
        </div>
        <div>
          <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>R$ Unitário</label>
          <input type="number" step="0.01" className="input-field" value={valUnit} onChange={e => setValUnit(Number(e.target.value))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" onClick={handleAdicionarItemNaGrid} style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', padding: '10px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Grid de Itens Inseridos */}
      {state.itensNfe.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#ffffff' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Item</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Qtd</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Preço Unit.</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Subtotal</th>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#475569' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {state.itensNfe.map((item: any, index: number) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#334155' }}>{item.nome}</td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#334155' }}>{item.quantidade}</td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#334155' }}>R$ {item.valor_unitario.toFixed(2)}</td>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>
                    <button type="button" onClick={() => handleRemoverItemDaGrid(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </fieldset>
  );
}
