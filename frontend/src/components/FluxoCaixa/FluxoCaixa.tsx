// src/components/FluxoCaixa/FluxoCaixa.tsx
import React, { useState } from 'react';
// Adicionado o ícone Trash2 do lucide
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, X, Trash2 } from 'lucide-react';
import * as S from './FluxoCaixa.styles';

interface Transacao {
  id: number;
  data: string;
  descricao: string;
  tipo: 'receita' | 'despesa';
  valor: number;
}

export default function FluxoCaixa() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, data: '10/08/2026', descricao: 'Venda de Produto - NF #102', tipo: 'receita', valor: 1500.00 },
    { id: 2, data: '10/08/2026', descricao: 'Pagamento Fornecedor de Componentes', tipo: 'despesa', valor: 450.00 },
    { id: 3, data: '11/08/2026', descricao: 'Ordem de Serviço #4029 - Concluída', tipo: 'receita', valor: 380.00 },
    { id: 4, data: '11/08/2026', descricao: 'Assinatura Software de Servidor', tipo: 'despesa', valor: 120.00 },
  ]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
  const saldoTotal = receitas - despesas;

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAdicionarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || parseFloat(valor) <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    const novaTransacao: Transacao = {
      id: Date.now(),
      data: data.split('-').reverse().join('/'),
      descricao,
      tipo,
      valor: parseFloat(valor),
    };

    setTransacoes([novaTransacao, ...transacoes]);
    setDescricao('');
    setValor('');
    setMostrarForm(false);
  };

  // NOVA FUNÇÃO: Remove o item filtrando pelo ID
  const handleDeletarTransacao = (id: number) => {
    if (confirm('Tem certeza que deseja remover este lançamento?')) {
      setTransacoes(transacoes.filter(t => t.id !== id));
    }
  };

  return (
    <div style={S.fluxoCaixaContainer}>
      
      <div style={S.headerContainer}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>💰 Fluxo de Caixa</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Controle suas entradas e saídas financeiras em tempo real.</p>
        </div>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)} 
          style={{ ...S.botaoLancar, backgroundColor: mostrarForm ? '#ef4444' : '#38bdf8', color: mostrarForm ? '#fff' : '#0f172a' }}
        >
          {mostrarForm ? <><X size={18} /> Fechar</> : <><Plus size={18} /> Novo Lançamento</>}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleAdicionarLancamento} style={S.formContainer}>
          <div style={S.grupoInput}>
            <label style={S.labelStyle}>Descrição</label>
            <input type="text" placeholder="Ex: Aluguel" value={descricao} onChange={(e) => setDescricao(e.target.value)} style={S.inputStyle} required />
          </div>
          <div style={S.grupoInput}>
            <label style={S.labelStyle}>Valor (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} style={S.inputStyle} required />
          </div>
          <div style={S.grupoInput}>
            <label style={S.labelStyle}>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')} style={S.inputStyle}>
              <option value="receita">🟢 Receita (Entrada)</option>
              <option value="despesa">🔴 Despesa (Saída)</option>
            </select>
          </div>
          <div style={S.grupoInput}>
            <label style={S.labelStyle}>Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={S.inputStyle} required />
          </div>
          <button type="submit" style={S.botaoSalvar}>Confirmar</button>
        </form>
      )}

      {/* CARDS DE RESUMO */}
      <div style={S.cardsGridStyle}>
        <div style={S.cardBaseStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Receitas</span>
            <ArrowUpCircle color="#22c55e" size={24} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', marginTop: '8px' }}>{formatarMoeda(receitas)}</div>
        </div>

        <div style={S.cardBaseStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Despesas</span>
            <ArrowDownCircle color="#ef4444" size={24} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c', marginTop: '8px' }}>{formatarMoeda(despesas)}</div>
        </div>

        <div style={{ ...S.cardBaseStyle, borderLeft: `4px solid ${saldoTotal >= 0 ? '#38bdf8' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Saldo em Caixa</span>
            <Wallet color={saldoTotal >= 0 ? '#0284c7' : '#ef4444'} size={24} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: saldoTotal >= 0 ? '#0f172a' : '#b91c1c', marginTop: '8px' }}>{formatarMoeda(saldoTotal)}</div>
        </div>
      </div>

      {/* TABELA DE MOVIMENTAÇÕES */}
      <div style={S.tabelaContainerStyle}>
        <div style={S.tabelaHeaderStyle}>Extrato Recente</div>
        <table style={S.tableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={S.thStyle}>Data</th>
              <th style={S.thStyle}>Descrição</th>
              <th style={S.thStyle}>Tipo</th>
              <th style={S.thStyle}>Valor</th>
              <th style={{ ...S.thStyle, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={S.tdStyle}>{t.data}</td>
                <td style={{ ...S.tdStyle, fontWeight: '500', color: '#334155' }}>{t.descricao}</td>
                <td style={S.tdStyle}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                    backgroundColor: t.tipo === 'receita' ? '#dcfce7' : '#fee2e2',
                    color: t.tipo === 'receita' ? '#15803d' : '#b91c1c', textTransform: 'capitalize'
                  }}>{t.tipo}</span>
                </td>
                <td style={{ ...S.tdStyle, fontWeight: '600', color: t.tipo === 'receita' ? '#16a34a' : '#dc2626' }}>
                  {t.tipo === 'receita' ? '+ ' : '- '}{formatarMoeda(t.valor)}
                </td>
                {/* COLUNA DE AÇÃO ADICIONADA */}
                <td style={{ ...S.tdStyle, textAlign: 'center' }}>
                  <button onClick={() => handleDeletarTransacao(t.id)} style={S.botaoDeletar} title="Excluir lançamento">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
