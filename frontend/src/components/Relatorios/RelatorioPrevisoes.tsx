// src/components/Relatorios/RelatorioPrevisoes.tsx
import React, { useMemo, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Scale, Calendar, Filter, Search } from 'lucide-react';
import { estilos } from './estilosPrevisoes';
import LinhaTabelaPrevisao from './LinhaTabelaPrevisao';

interface RelatorioPrevisoesProps {
  dados?: any[];
  fmtMoeda: (v: number) => string;
}

export default function RelatorioPrevisoes({ dados = [], fmtMoeda }: RelatorioPrevisoesProps) {
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'realizado' | 'pendente' | 'atrasado'>('todos');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  // 🔍 NOVO ESTADO: Termo de busca por texto
  const [buscaTexto, setBuscaTexto] = useState('');

  const hojeStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { dadosFiltrados, resumo } = useMemo(() => {
    let entradasRealizadas = 0, entradasPrevistas = 0;
    let saidasRealizadas = 0, saidasPrevistas = 0;
    let totalAtrasado = 0;

    const listaSegura = Array.isArray(dados) ? dados : [];

    const filtrados = listaSegura
      .map(item => {
        if (!item) return null;
        
        const dataRegistro = item.data && typeof item.data === 'string' ? item.data.substring(0, 10) : '';
        const estaAtrasado = item.status === 'pendente' && dataRegistro !== '' && dataRegistro < hojeStr;
        const valor = Number(item.valor || item.valor_parcela || 0);

        if (estaAtrasado) totalAtrasado += valor;
        if (item.tipo === 'receita') {
          if (item.status === 'realizado') entradasRealizadas += valor;
          else entradasPrevistas += valor;
        } else {
          if (item.status === 'realizado') saidasRealizadas += valor;
          else saidasPrevistas += valor;
        }

        return { ...item, estaAtrasado, dataOrdenacao: dataRegistro };
      })
      .filter((item): item is any => {
        if (!item) return false;
        
        // 1. Filtro por Tipo de Fluxo
        const bateTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
        
        // 2. Filtro por Situação/Status
        let bateStatus = true;
        if (filtroStatus === 'realizado') bateStatus = item.status === 'realizado';
        else if (filtroStatus === 'pendente') bateStatus = item.status === 'pendente' && !item.estaAtrasado;
        else if (filtroStatus === 'atrasado') bateStatus = item.estaAtrasado;

        // 3. NOVO FILTRO: Texto digitado (compara com descrição, histórico ou conta contábil)
        const termo = buscaTexto.toLowerCase().trim();
        const textoDescricao = String(item.descricao || item.historico || '').toLowerCase();
        const textoCategoria = String(item.conta_contabil || item.categoria || '').toLowerCase();
        const bateTexto = termo === '' || textoDescricao.includes(termo) || textoCategoria.includes(termo);

        return bateTipo && bateStatus && bateTexto;
      })
      .sort((a, b) => (a.dataOrdenacao || '').localeCompare(b.dataOrdenacao || ''));

    return {
      dadosFiltrados: filtrados,
      resumo: {
        totalEntradas: entradasRealizadas + entradasPrevistas,
        entradasRealizadas, entradasPrevistas,
        totalSaidas: saidasRealizadas + saidasPrevistas,
        saidasRealizadas, saidasPrevistas,
        totalAtrasado,
        saldoProjetado: (entradasRealizadas + entradasPrevistas) - (saidasRealizadas + saidasPrevistas)
      }
    };
  }, [dados, filtroStatus, filtroTipo, buscaTexto, hojeStr]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SEÇÃO DE CARDS DE INDICADORES */}
      <div style={estilos.gridCards}>
        <div style={estilos.card}>
          <div style={estilos.cardHeader}><span>Previsão de Entradas</span><ArrowUpCircle color="#10b981" size={24} /></div>
          <div style={estilos.cardValor}>{fmtMoeda(resumo.totalEntradas)}</div>
          <div style={estilos.cardFooter}><span>Realizado: {fmtMoeda(resumo.entradasRealizadas)}</span><span style={{ color: '#059669', fontWeight: 'bold' }}>Previsto: {fmtMoeda(resumo.entradasPrevistas)}</span></div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardHeader}><span>Previsão de Saídas</span><ArrowDownCircle color="#ef4444" size={24} /></div>
          <div style={estilos.cardValor}>{fmtMoeda(resumo.totalSaidas)}</div>
          <div style={estilos.cardFooter}><span>Realizado: {fmtMoeda(resumo.saidasRealizadas)}</span><span style={{ color: '#dc2626', fontWeight: 'bold' }}>Previsto: {fmtMoeda(resumo.saidasPrevistas)}</span></div>
        </div>

        <div style={{ ...estilos.card, borderLeft: resumo.totalAtrasado > 0 ? '4px solid #f59e0b' : '1px solid #e2e8f0' }}>
          <div style={estilos.cardHeader}><span>Pendente Atrasado</span></div>
          <div style={{ ...estilos.cardValor, color: resumo.totalAtrasado > 0 ? '#b45309' : '#64748b' }}>{fmtMoeda(resumo.totalAtrasado)}</div>
        </div>

        <div style={{ ...estilos.card, borderLeft: `4px solid ${resumo.saldoProjetado >= 0 ? '#3b82f6' : '#ef4444'}` }}>
          <div style={estilos.cardHeader}><span>Saldo Projetado</span><Scale color={resumo.saldoProjetado >= 0 ? '#3b82f6' : '#ef4444'} size={24} /></div>
          <div style={{ ...estilos.cardValor, color: resumo.saldoProjetado >= 0 ? '#1e3a8a' : '#7f1d1d' }}>{fmtMoeda(resumo.saldoProjetado)}</div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE DE FILTROS COM BARRA DE BUSCA INTEGRADA */}
      <div style={estilos.painelFiltros}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: 'bold' }}>
          <Filter size={16} />
          <span>Filtrar Tabela:</span>
        </div>

        {/* 🔍 INPUT DE BUSCA POR TEXTO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', minWidth: '240px', flex: '1 1 auto' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', marginLeft: '10px', pointerEvents: 'none' }} />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou categoria..."
            value={buscaTexto}
            onChange={e => setBuscaTexto(e.target.value)}
            style={{ 
              width: '100%',
              padding: '6px 12px 6px 32px', 
              border: '1px solid #cbd5e1', 
              borderRadius: '6px', 
              fontSize: '13px', 
              outline: 'none', 
              color: '#334155',
              backgroundColor: '#fff'
            }}
          />
        </div>

        <div style={estilos.grupoFiltro}><label style={{ color: '#64748b' }}>Fluxo:</label>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)} style={estilos.select}>
            <option value="todos">Todos os Fluxos</option>
            <option value="receita">Apenas Entradas</option>
            <option value="despesa">Apenas Saídas</option>
          </select>
        </div>

        <div style={estilos.grupoFiltro}><label style={{ color: '#64748b' }}>Situação:</label>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)} style={estilos.select}>
            <option value="todos">Todas as Situações</option>
            <option value="realizado">Realizados</option>
            <option value="pendente">Previstos (No Prazo)</option>
            <option value="atrasado">Atrasados (Vencidos)</option>
          </select>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>Exibindo {dadosFiltrados.length} registro(s)</div>
      </div>

      {/* CRONOGRAMA DE DADOS */}
      <div style={estilos.containerTabela}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}><Calendar size={18} color="#64748b" /><h3 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>Cronograma Estatístico</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569' }}>
                <th style={estilos.th}>Data Venc.</th><th style={estilos.th}>Descrição</th><th style={estilos.th}>Categoria</th><th style={estilos.th}>Status</th><th style={estilos.th}>Tipo</th><th style={{ ...estilos.th, textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Nenhuma movimentação corresponde aos filtros.</td></tr>
              ) : (
                dadosFiltrados.map((item, idx) => (
                  <LinhaTabelaPrevisao key={item.id || idx} item={item} idx={idx} fmtMoeda={fmtMoeda} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
