import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Wrench, Plus, Trash2, Edit2, Search, Calendar, CheckSquare } from 'lucide-react';

interface ItemOS {
  produto_id: string;
  quantidade: number;
  valor_unitario: number;
  data_item: string;
}

export default function OrdensServico() {
  // ==========================================
  // 1. ESTADOS CENTRALIZADOS E PROTEGIDOS
  // ==========================================
  const [ordens, setOrdens] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [itens, setItens] = useState<ItemOS[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  
  const [clienteId, setClienteId] = useState('');
  const [validade, setValidade] = useState('');
  const [idEditando, setIdEditando] = useState<string | null>(null);

  // Estados locais para controle da linha de digitação de itens
  const [especificacao, setEspecificacao] = useState('');
  const [qtd, setQtd] = useState(1);
  const [valUnit, setValUnit] = useState(0);
  const [dataItem, setDataItem] = useState('');

  // ==========================================
  // 2. CONEXÃO ASSÍNCRONA COM O SUPABASE
  // ==========================================
  const carregarDadosDoBanco = async () => {
    try {
      setCarregando(true);
      const { data: dadosClientes } = await supabase.from('clientes').select('id, nome').eq('status', 'Ativo');
      if (dadosClientes) setClientes(dadosClientes);

      const { data: dadosOS } = await supabase.from('ordens_servico').select('*, clientes(nome), ordens_servico_itens(*)');
      if (dadosOS) setOrdens(dadosOS);
    } catch (err) {
      console.error('Erro de conexão com o banco:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  // ==========================================
  // 3. REGRAS DE NEGÓCIO (CÁLCULOS E EVENTOS)
  // ==========================================
  const incluirItemNaGrid = () => {
    if (!especificacao || qtd <= 0 || valUnit <= 0 || !dataItem) {
      alert('Preencha todos os campos do item (Especificação, Qtd, Valor e Data).');
      return;
    }
    setItens([...itens, { produto_id: especificacao, quantidade: qtd, valor_unitario: valUnit, data_item: dataItem }]);
    setEspecificacao(''); setQtd(1); setValUnit(0); setDataItem('');
  };

  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !validade || itens.length === 0) {
      alert('Preencha os campos obrigatórios e adicione ao menos um item.');
      return;
    }

    const valorTotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);
    const codigoOS = idEditando || `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      if (idEditando) {
        await supabase.from('ordens_servico').update({ cliente_id: Number(clienteId), validade, valor_total: valorTotal }).eq('id', idEditando);
        await supabase.from('ordens_servico_itens').delete().eq('os_id', idEditando);
      } else {
        await supabase.from('ordens_servico').insert([{ id: codigoOS, cliente_id: Number(clienteId), validade, status: 'Em Execução', valor_total: valorTotal }]);
      }

      const payloadItens = itens.map(item => ({
        os_id: codigoOS,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        data_item: item.data_item
      }));

      await supabase.from('ordens_servico_itens').insert(payloadItens);
      
      alert('Ordem de serviço gravada com sucesso!');
      setClienteId(''); setValidade(''); setItens([]); setIdEditando(null);
      await carregarDadosDoBanco();
    } catch (error) {
      alert('Erro ao processar salvamento no Supabase.');
    }
  };

  const handleFinalizarOS = async (os: any) => {
    if (!confirm(`Finalizar a ${os.id}? O valor total irá automaticamente para o fluxo de caixa como receita.`)) return;
    try {
      await supabase.from('ordens_servico').update({ status: 'Finalizada' }).eq('id', os.id);
      await supabase.from('fluxo_caixa').insert([{
        descricao: `Faturamento OS ref. ${os.id}`,
        valor: os.valor_total,
        tipo: 'Entrada',
        data: new Date().toISOString()
      }]);
      alert('OS Finalizada e integrada ao caixa!');
      await carregarDadosDoBanco();
    } catch (err) {
      alert('Erro ao processar faturamento no caixa.');
    }
  };

  const totalGeralCalculado = itens.reduce((acc, i) => acc + (i.quantidade * i.valor_unitario), 0);

  const ordensFiltradas = ordens.filter(os => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return os.id.toLowerCase().includes(termo) || os.clientes?.nome?.toLowerCase().includes(termo);
  });

  // ==========================================
  // 4. FUNÇÕES DE RENDERIZAÇÃO ISOLADAS
  // ==========================================
  const renderGradeDigitacao = () => (
    <div style={{ border: '1px solid #334155', padding: '16px', borderRadius: '6px', backgroundColor: '#131e31', marginBottom: '20px' }}>
      <h4 style={{ color: '#38bdf8', marginBottom: '12px', fontSize: '14px' }}>Inserir Item Realizado / Peça Usada</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 0.5fr', gap: '10px' }}>
        <input type="text" placeholder="Produto / Mão de Obra" value={especificacao} onChange={e => setEspecificacao(e.target.value)} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
        <input type="number" placeholder="Qtd" value={qtd} onChange={e => setQtd(Number(e.target.value))} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
        <input type="number" placeholder="Valor (R$)" value={valUnit} onChange={e => setValUnit(Number(e.target.value))} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
        <input type="date" value={dataItem} onChange={e => setDataItem(e.target.value)} style={{ padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
        <button type="button" onClick={incluirItemNaGrid} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Plus size={20}/></button>
      </div>
    </div>
  );

  const renderTabelaItensAdicionados = () => (
    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0f172a' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Especificação</th>
            <th style={{ padding: '12px' }}>Qtd</th>
            <th style={{ padding: '12px' }}>Valor Unit.</th>
            <th style={{ padding: '12px' }}>Data Individual</th>
            <th style={{ padding: '12px' }}>Total</th>
            <th style={{ padding: '12px' }}>Remover</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
              <td style={{ padding: '12px' }}>{item.produto_id}</td>
              <td style={{ padding: '12px' }}>{item.quantidade}</td>
              <td style={{ padding: '12px' }}>R$ {Number(item.valor_unitario).toFixed(2)}</td>
              <td style={{ padding: '12px' }}><span style={{ color: '#38bdf8' }}><Calendar size={12}/> {item.data_item}</span></td>
              <td style={{ padding: '12px' }}>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
              <td style={{ padding: '12px' }}>
                <button type="button" onClick={() => setItens(itens.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFiltroBusca = () => (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <input type="text" placeholder="Buscar ordens de serviço..." value={busca} onChange={e => setBusca(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }} />
      <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
    </div>
  );

  // ==========================================
  // 5. ESTRUTURA VISUAL DA PÁGINA
  // ==========================================
  return (
    <div style={{ padding: '24px', color: '#cbd5e1', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Wrench size={26} /> Ordens de Serviço (OS)
      </h2>

            {/* FORMULÁRIO DE CADASTRO E EDIÇÃO */}
      <form onSubmit={handleSalvarOS} style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Cliente *</label>
            <select value={clienteId} onChange={e => setClienteId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
              <option value="">Selecione o Cliente...</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}>Data Limite Geral *</label>
            <input type="date" value={validade} onChange={e => setValidade(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
          </div>
        </div>

        {/* Chamada das funções modulares de itens */}
        {renderGradeDigitacao()}
        {itens.length > 0 && renderTabelaItensAdicionados()}

        {/* Rodapé do Formulário: Totalizadores e Ações */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <h3 style={{ color: '#22c55e', margin: 0 }}>Total Geral da OS: R$ {totalGeralCalculado.toFixed(2)}</h3>
          <div>
            <button type="submit" style={{ backgroundColor: '#38bdf8', color: '#0f172a', padding: '12px 24px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              {idEditando ? 'Atualizar OS' : 'Salvar OS'}
            </button>
            {idEditando && (
              <button type="button" onClick={() => { setIdEditando(null); setClienteId(''); setValidade(''); setItens([]); }} style={{ marginLeft: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>
      {/* BARRA DE PESQUISA */}
      {renderFiltroBusca()}

      {/* PAINEL DE REGISTROS VINDOS DO BANCO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {carregando ? (
          <p style={{ color: '#94a3b8' }}>Carregando dados do Supabase...</p>
        ) : ordensFiltradas.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhuma ordem de serviço localizada.</p>
        ) : (
          ordensFiltradas.map((os: any) => (
            <div key={os.id} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '16px' }}>{os.id}</span> - <span style={{ color: '#f8fafc', fontWeight: '500' }}>{os.clientes?.nome || 'Cliente'}</span>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  Itens Cadastrados: {os.ordens_servico_itens ? os.ordens_servico_itens.length : 0} | Status: <strong style={{ color: os.status === 'Finalizada' ? '#16a34a' : '#ca8a04' }}>{os.status}</strong>
                </div>
                <div style={{ fontWeight: 'bold', color: '#22c55e', marginTop: '4px', fontSize: '15px' }}>
                  R$ {Number(os.valor_total || 0).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => { 
                    setIdEditando(os.id); 
                    setClienteId(String(os.cliente_id)); 
                    setValidade(os.validade); 
                    setItens(os.ordens_servico_itens || []); 
                  }} 
                  style={{ background: '#334155', border: 'none', padding: '8px', color: '#38bdf8', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                  title="Editar Registro"
                >
                  <Edit2 size={16}/>
                </button>
                
                {os.status !== 'Finalizada' && (
                  <button 
                    type="button" 
                    onClick={() => handleFinalizarOS(os)} 
                    style={{ background: '#16a34a', border: 'none', padding: '8px 12px', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckSquare size={16}/> Finalizar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
