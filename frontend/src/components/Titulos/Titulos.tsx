// src/components/Titulos/Titulos.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Landmark, Search } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import * as S from './Titulos.styles';

interface Clientes {
  id: string;
  nome: string;
}

interface Titulo {
  id: string;
  nfe_id: string;
  cliente_id: number;
  parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'Pendente' | 'Pago';
  clientes?: { nome: string };
}

export default function Titulos() {
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  // Estados do Formulário de Lançamento Manual
  const [nfeId, setNfeId] = useState('AVULSO'); // Identificador padrão para lançamentos manuais
  const [clienteId, setClienteId] = useState('');
  const [termoCliente, setTermoCliente] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [vencimento, setVencimento] = useState('');

  // Estados de Busca do Dropdown de Clientes
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [listaClientes, setListaClientes] = useState<Clientes[]>([]);
  const [buscandoBanco, setBuscandoBanco] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const carregarDadosDoBanco = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('titulos_receber')
        .select('*, clientes(nome)')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      if (data) setTitulos(data as Titulo[]);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregarDadosDoBanco(); }, []);

  // Debounce para busca de clientes no cadastro
  useEffect(() => {
    if (termoCliente.trim().length < 2) {
      setListaClientes([]);
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
        if (data) setListaClientes(data as Clientes[]);
      } catch (err) {
        console.error(err);
      } finally {
        setBuscandoBanco(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [termoCliente]);

  const handleSalvarTituloManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !valor || !vencimento) {
      alert('Por favor, preencha todos os campos obrigatórios do título.');
      return;
    }

    try {
      const { error } = await supabase.from('titulos_receber').insert([{
        nfe_id: nfeId,
        cliente_id: Number(clienteId),
        parcela: 1, // Lançamentos manuais nascem como parcela única 1
        valor_parcela: Number(valor),
        data_vencimento: vencimento,
        status: 'Pendente'
      }]);

      if (error) throw error;

      alert('Título lançado manualmente com sucesso!');
      setNfeId('AVULSO');
      setClienteId('');
      setTermoCliente('');
      setValor('');
      setVencimento('');
      await carregarDadosDoBanco();
    } catch (err) {
      alert('Erro ao registrar título no Supabase.');
    }
  };

  const handleBaixarTitulo = async (titulo: Titulo) => {
    if (!confirm(`Confirmar o recebimento do título ref. ${titulo.nfe_id} no valor de R$ ${Number(titulo.valor_parcela).toFixed(2)}?`)) return;

    try {
      await supabase.from('titulos_receber').update({ status: 'Pago' }).eq('id', titulo.id);
      
      // Lançamento automático no fluxo de caixa existente do VDR GESTOR
      await supabase.from('fluxo_caixa').insert([{
        descricao: `Recebimento Ref. ${titulo.nfe_id}`,
        valor: titulo.valor_parcela,
        tipo: 'Entrada',
        data: new Date().toISOString()
      }]);

      alert('Título liquidado e enviado para o fluxo de caixa!');
      await carregarDadosDoBanco();
    } catch (err) {
      alert('Erro ao dar baixa no boleto.');
    }
  };

  const titulosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return titulos.filter(t => 
      !termo || 
      t.nfe_id.toLowerCase().includes(termo) || 
      t.clientes?.nome?.toLowerCase().includes(termo)
    );
  }, [titulos, busca]);

  return (
    <div style={S.containerStyle}>
      <h2 style={S.tituloStyle}><Landmark size={26} /> Gestão de Títulos e Contas a Receber</h2>

      {/* FORMULÁRIO DE LANÇAMENTO MANUAL */}
      <form onSubmit={handleSalvarTituloManual} style={S.formStyle}>
        <div style={S.gridFormStyle}>
          <div>
            <label style={S.labelStyle}>Documento / Origem</label>
            <input type="text" style={S.inputStyle} value={nfeId} onChange={e => setNfeId(e.target.value)} required />
          </div>

          <div>
            <label style={S.labelStyle}>Cliente</label>
            <div style={S.selectContainerStyle}>
              <input 
                type="text" 
                placeholder="Pesquisar cliente..." 
                style={S.inputStyle} 
                value={termoCliente}
                onChange={e => {
                  setTermoCliente(e.target.value);
                  setMostrarSugestoes(true);
                  if (e.target.value === "") setClienteId("");
                }}
                onFocus={() => setMostrarSugestoes(true)}
                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 250)}
                required
              />
              {mostrarSugestoes && termoCliente.trim().length >= 2 && (
                <ul style={S.dropdownSugestoesStyle}>
                  {buscandoBanco ? (
                    <li style={S.itemSugestaoStyle}>🔄 Consultando...</li>
                  ) : listaClientes.length > 0 ? (
                    listaClientes.map((c, idx) => (
                      <li 
                        key={c.id}
                        style={{ ...S.itemSugestaoStyle, ...(hoverIndex === idx ? S.itemSugestaoHoverStyle : {}) }}
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
                    <li style={S.itemSugestaoStyle}>Nenhum cliente encontrado</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label style={S.labelStyle}>Valor do Título (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" style={S.inputStyle} value={valor} onChange={e => setValor(e.target.value !== '' ? Number(e.target.value) : '')} required />
          </div>

          <div>
            <label style={S.labelStyle}>Data de Vencimento</label>
            <input type="date" style={S.inputStyle} value={vencimento} onChange={e => setVencimento(e.target.value)} required />
          </div>
        </div>
        <button type="submit" style={S.botaoSalvarStyle}>Lançar Título Manual</button>
      </form>

      {/* BARRA DE PESQUISA */}
      <div style={S.buscaContainerStyle}>
        <input type="text" placeholder="Filtrar títulos por cliente ou documento..." style={S.inputStyle} value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {/* LISTA DE REGISTROS */}
      <div style={S.tabelaContainerStyle}>
        <table style={S.tabelaStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={S.thStyle}>Documento</th>
              <th style={S.thStyle}>Cliente</th>
              <th style={S.thStyle}>Vencimento</th>
              <th style={S.thStyle}>Valor Parcela</th>
              <th style={S.thStyle}>Status</th>
              <th style={S.thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td colSpan={6} style={S.tdStyle}>Carregando registros do Supabase...</td></tr>
            ) : titulosFiltrados.length === 0 ? (
              <tr><td colSpan={6} style={S.tdStyle}>Nenhum título encontrado.</td></tr>
            ) : (
              titulosFiltrados.map((t) => (
                <tr key={t.id}>
                  <td style={S.tdStyle}>{t.nfe_id} {t.parcela > 1 && `(Parc. ${t.parcela})`}</td>
                  <td style={S.tdStyle}>{t.clientes?.nome || 'Não identificado'}</td>
                  <td style={S.tdStyle}>{new Date(t.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                  <td style={{ ...S.tdStyle, fontWeight: 'bold' }}>R$ {Number(t.valor_parcela).toFixed(2)}</td>
                  <td style={S.tdStyle}><span style={S.badgeStyle(t.status)}>{t.status}</span></td>
                  <td style={S.tdStyle}>
                    {t.status === 'Pendente' && (
                      <button type="button" onClick={() => handleBaixarTitulo(t)} style={S.botaoAcaoStyle}>Liquidar</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
