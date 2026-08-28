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
  
  // NOVO ESTADO: Define se este lançamento também deve virar um molde de Conta Fixa
  const [ehContaFixa, setEhContaFixa] = useState<'Nao' | 'Sim'>('Nao');

  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [listaClientes, setListaClientes] = useState<Clientes[]>([]);
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
      setEhContaFixa('Nao'); // Desabilita a opção ao editar um título já existente
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
      setHoverIndex(null);
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
    setNfeId('AVULSO'); 
    setClienteId(''); 
    setTermoCliente(''); 
    setValor(''); 
    setVencimento(''); 
    setTipo('Receber');
    setEhContaFixa('Nao');
    cancelarEdicao();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteId) {
      return alert(`Por favor, selecione um ${tipo === 'Pagar' ? 'Fornecedor' : 'Cliente'} válido na lista de sugestões.`);
    }
    if (!valor || !vencimento) {
      return alert('Preencha todos os campos obrigatórios.');
    }

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
      await aoSalvar(); 
      limparFormulario();
    } else {
      try {
        // 1. Lança o título atual normalmente na tabela financeira
        const { error: erroTitulo } = await supabase
          .from('titulos_receber')
          .insert([{ ...dadosCampos, status: 'Pendente' }]);
        
        if (erroTitulo) throw erroTitulo;

        // 2. Se marcou "Sim", salva também o molde na tabela de contas fixas
        if (ehContaFixa === 'Sim') {
          // Extrai o dia do vencimento digitado (Ex: de "2026-08-10" extrai o número 10)
          const diaVencimento = new Date(vencimento).getUTCDate();

          const { error: erroFixa } = await supabase
            .from('contas_fixas')
            .insert([{
              descricao: nfeId === 'AVULSO' ? `Lançamento manual de ${termoCliente}` : nfeId,
              cliente_id: Number(clienteId),
              valor: Number(valor),
              tipo: tipo,
              dia_vencimento: diaVencimento,
              status_ativo: true
            }]);

          if (erroFixa) throw erroFixa;
        }
        
        alert(
          ehContaFixa === 'Sim' 
            ? `Título lançado e configurado como Conta Fixa com sucesso!` 
            : `Título lançado com sucesso!`
        );
        
        await aoSalvar(); 
        limparFormulario();
      } catch (err) { 
        console.error(err);
        alert('Erro na operação do Supabase ao tentar salvar o registro.'); 
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
              placeholder="Digite para buscar..."
              style={S.inputStyle} 
              value={termoCliente}
              onChange={e => { 
                setTermoCliente(e.target.value); 
                setMostrarSugestoes(true); 
                if (!e.target.value) setClienteId(""); 
              }}
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

        {/* NOVO CAMPO SELECT: Aparece apenas para novos lançamentos */}
        {!tituloEmEdicao && (
          <div>
            <label style={S.labelStyle}>Conta Fixa Mensal?</label>
            <select 
              style={{ ...S.inputStyle, backgroundColor: ehContaFixa === 'Sim' ? '#f3e8ff' : '#ffffff', borderColor: ehContaFixa === 'Sim' ? '#c084fc' : '#cbd5e1' }} 
              value={ehContaFixa} 
              onChange={e => setEhContaFixa(e.target.value as any)}
            >
              <option value="Nao">Não (Lançamento Único)</option>
              <option value="Sim">Sim (Salvar como Recorrente)</option>
            </select>
          </div>
        )}
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
