// src/components/Titulos/FormTitulo.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { Titulo } from './useTitulos';
import * as S from './Titulos.styles';

interface Clientes { id: string; nome: string; }
interface FormTituloProps {
  tituloEmEdicao: Titulo | null;
  cancelarEdicao: () => void;
  aoSalvar: () => void;
  aoAtualizar: (id: string, dados: Partial<Titulo>) => Promise<void>;
}

export default function FormTitulo({ tituloEmEdicao, cancelarEdicao, aoSalvar, aoAtualizar }: FormTituloProps) {
  const [tipo, setTipo] = useState<'Receber' | 'Pagar'>('Receber');
  const [nfeId, setNfeId] = useState('AVULSO');
  const [clienteId, setClienteId] = useState('');
  const [termoCliente, setTermoCliente] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [vencimento, setVencimento] = useState('');

  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [listaClientes, setListaClientes] = useState<Clientes[]>([]); // Inicializado sempre como array vazio
  const [buscandoBanco, setBuscandoBanco] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (tituloEmEdicao) {
      setTipo(tituloEmEdicao.tipo);
      setNfeId(tituloEmEdicao.nfe_id);
      setClienteId(String(tituloEmEdicao.cliente_id));
      setTermoCliente(tituloEmEdicao.clientes?.nome || '');
      setValor(tituloEmEdicao.valor_parcela);
      setVencimento(tituloEmEdicao.data_vencimento);
    }
  }, [tituloEmEdicao]);

  useEffect(() => {
    if (termoCliente.trim().length < 2) { 
      setListaClientes([]); 
      return; 
    }
    if (tituloEmEdicao && termoCliente === tituloEmEdicao.clientes?.nome) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setBuscandoBanco(true);
      try {
        const { data } = await supabase
          .from('clientes')
          .select('id, nome')
          .ilike('nome', `%${termoCliente}%`)
          .eq('status', 'Ativo')
          .limit(5);
        setListaClientes(data ? (data as Clientes[]) : []);
      } catch (err) { 
        console.error(err); 
        setListaClientes([]);
      } finally { 
        setBuscandoBanco(false); 
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [termoCliente, tituloEmEdicao]);

  const limparFormulario = () => {
    setNfeId('AVULSO'); setClienteId(''); setTermoCliente(''); setValor(''); setVencimento(''); setTipo('Receber');
    cancelarEdicao();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !valor || !vencimento) return alert('Preencha os campos obrigatórios.');

    const dadosCampos = { 
      nfe_id: nfeId, 
      cliente_id: Number(clienteId), 
      parcela: 1, 
      valor_parcela: Number(valor), 
      data_vencimento: vencimento, 
      tipo 
    };

    if (tituloEmEdicao) {
      await aoAtualizar(tituloEmEdicao.id, dadosCampos);
      limparFormulario();
      aoSalvar();
    } else {
      try {
        const { error } = await supabase.from('titulos_receber').insert([{ ...dadosCampos, status: 'Pendente' }]);
        if (error) throw error;
        alert(`Título a ${tipo.toLowerCase()} lançado com sucesso!`);
        limparFormulario();
        aoSalvar(); 
      } catch (err) { 
        alert('Erro na operação do Supabase.'); 
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={S.formStyle}>
      <div style={S.gridFormStyle}>
        <div>
          <label style={S.labelStyle}>Tipo Financeiro</label>
          <select style={S.inputStyle} value={tipo} onChange={e => setTipo(e.target.value as any)}>
            <option value="Receber">🟢 Contas a Receber</option>
            <option value="Pagar">🔴 Contas a Pagar</option>
          </select>
        </div>

        <div>
          <label style={S.labelStyle}>Documento / Origem</label>
          <input type="text" style={S.inputStyle} value={nfeId} onChange={e => setNfeId(e.target.value)} required />
        </div>

        <div>
          <label style={S.labelStyle}>{tipo === 'Pagar' ? 'Fornecedor' : 'Cliente'}</label>
          <div style={S.selectContainerStyle}>
            <input 
              type="text" 
              placeholder={`Buscar...`}
              style={S.inputStyle} 
              value={termoCliente}
              onChange={e => { setTermoCliente(e.target.value); setMostrarSugestoes(true); if (!e.target.value) setClienteId(""); }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 250)}
              required
            />
            {mostrarSugestoes && termoCliente.trim().length >= 2 && (
              <ul style={S.dropdownSugestoesStyle}>
                {buscandoBanco ? (
                  <li style={S.itemSugestaoStyle(false)}>🔄 Consultando...</li>
                ) : Array.isArray(listaClientes) && listaClientes.length > 0 ? (
                  listaClientes.map((c, idx) => (
                    <li 
                      key={c.id} 
                      style={S.itemSugestaoStyle(hoverIndex === idx)} 
                      onMouseEnter={() => setHoverIndex(idx)} 
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => { 
                        setClienteId(c.id); 
                        setTermoCliente(c.nome); 
                        setMostrarSugestoes(false); 
                      }}
                    >
                      <strong>[{c.id}]</strong> {c.nome}
                    </li>
                  ))
                ) : (
                  <li style={S.itemSugestaoStyle(false)}>Nenhum registro encontrado</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label style={S.labelStyle}>Valor (R$)</label>
          <input type="number" step="0.01" style={S.inputStyle} value={valor} onChange={e => setValor(e.target.value !== '' ? Number(e.target.value) : '')} required />
        </div>

        <div>
          <label style={S.labelStyle}>Vencimento</label>
          <input type="date" style={S.inputStyle} value={vencimento} onChange={e => setVencimento(e.target.value)} required />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={S.botaoSalvarStyle}>
          {tituloEmEdicao ? 'Atualizar Alterações' : 'Lançar Título'}
        </button>
        {tituloEmEdicao && (
          <button type="button" onClick={limparFormulario} style={{ ...S.botaoSalvarStyle, backgroundColor: '#64748b' }}>
            Cancelar Edição
          </button>
        )}
      </div>
    </form>
  );
}
