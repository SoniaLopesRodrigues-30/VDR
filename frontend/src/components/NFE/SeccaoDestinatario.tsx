// src/components/Nfe/SeccaoDestinatario.tsx
import React, { useState, useEffect } from 'react';
import { User, Search } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import * as S from './OrdemCompra.styles'; // Reutilizando a estrutura de dropdown que já funciona

export function SeccaoDestinatario({ state }: { state: any }) {
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Busca os clientes no Supabase conforme o usuário digita no termo de busca do state
  useEffect(() => {
    if (!state.termoBuscaCliente || state.termoBuscaCliente.trim().length < 2) {
      setListaClientes([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setBuscando(true);
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome, documento, inscricao_estadual, email') // Traz dados úteis para a NF-e
          .ilike('nome', `%${state.termoBuscaCliente}%`)
          .eq('status', 'Ativo')
          .limit(5);

        if (!error && data) setListaClientes(data);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [state.termoBuscaCliente]);

  return (
    <fieldset className="section-divider" style={{ marginBottom: '24px' }}>
      <legend className="section-subtitle"><User size={16} /> 2. Dados do Destinatário / Cliente</legend>
      
      <div className="form-row" style={{ position: 'relative' }}>
        <div className="form-group" style={{ width: '100%' }}>
          <label className="form-label">Buscar Cliente (Nome ou Razão Social)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Digite o nome do cliente para pesquisar no banco..." 
              className="input-field"
              value={state.termoBuscaCliente}
              onChange={e => {
                state.setTermoBuscaCliente(e.target.value);
                setMostrarSugestoes(true);
                if (e.target.value === "") state.setClienteId("");
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 250)}
              required
            />
            
            {/* Menu Suspenso de Clientes */}
            {mostrarSugestoes && state.termoBuscaCliente.trim().length >= 2 && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px',
                marginTop: '4px', maxHeight: '150px', overflowY: 'auto', zIndex: 100, padding: 0, listStyle: 'none'
              }}>
                {buscando ? (
                  <li style={{ padding: '10px', color: '#64748b', fontSize: '14px' }}>🔄 Consultando banco de dados...</li>
                ) : listaClientes.length > 0 ? (
                  listaClientes.map((c, idx) => (
                    <li 
                      key={c.id}
                      style={{ 
                        padding: '10px 12px', fontSize: '14px', cursor: 'pointer',
                        backgroundColor: hoverIndex === idx ? '#f1f5f9' : '#ffffff',
                        borderBottom: '1px solid #f1f5f9', color: '#1f2937'
                      }}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => {
                        state.setClienteId(c.id);
                        state.setTermoBuscaCliente(c.nome);
                        state.setClienteSelecionadoCompleto(c); // Guarda o objeto todo para a nota
                        setMostrarSugestoes(false);
                      }}
                    >
                      <strong>[{c.id}]</strong> {c.nome} {c.documento ? `- CPF/CNPJ: ${c.documento}` : ''}
                    </li>
                  ))
                ) : (
                  <li style={{ padding: '10px', color: '#94a3b8', fontSize: '14px' }}>❌ Nenhum cliente encontrado.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Exibe dados resumidos do cliente selecionado para o faturamento */}
      {state.clienteId && state.clienteSelecionadoCompleto && (
        <div className="form-row" style={{ marginTop: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
          <div><strong>Código Interno:</strong> {state.clienteId}</div>
          <div style={{ marginLeft: '20px' }}><strong>CPF/CNPJ:</strong> {state.clienteSelecionadoCompleto.documento || 'Não informado'}</div>
          <div style={{ marginLeft: '20px' }}><strong>I.E.:</strong> {state.clienteSelecionadoCompleto.inscricao_estadual || 'Isento'}</div>
        </div>
      )}
    </fieldset>
  );
}
