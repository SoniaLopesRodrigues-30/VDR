// useOrdemServico.ts
import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient'; 


export interface ItemTabela { id: number; descricao: string; quantidade: number; valorUnitario: number; total: number; tipoUnidade: string; ncm: string; dataItem: string; }
export type StatusOS = 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
export type TipoOS = 'mao_de_obra' | 'produtos' | 'ambos';
export interface OrdemServico { id: number; numero: string; clienteId: number; clienteNome: string; dataAbertura: string; previsaoEntrega: string; condicaoPagamento: string; tipoOs: TipoOS; equipamento: string; servicos: any[]; pecas: ItemTabela[]; valorTotal: number; status: StatusOS; }

// Estado inicial padrão para limpar o formulário rapidamente
const estadoInicialForm = {
  id: undefined as number | undefined, numero: '', clienteId: '' as number | '', dataAbertura: '',
  previsaoEntrega: '', condicaoPagamento: '', tipoOs: 'ambos' as TipoOS, equipamento: '', status: 'Aberta' as StatusOS
};

export function useOrdemServico() {
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<any[]>([]);

  // 1. Agrupamento de estados do Form Principal e Sub-tabelas
  const [form, setForm] = useState(estadoInicialForm);
  const [servicos, setServicos] = useState<any[]>([]);
  const [pecas, setPecas] = useState<ItemTabela[]>([]);

  // Estados isolados apenas para os inputs temporários do modal
  const [tmpServ, setTmpServ] = useState({ descricao: '', quantidade: 1, valorUnitario: 0 });
  const [tmpProd, setTmpProd] = useState({ descricao: '', quantidade: 1, valorUnitario: 0, tipoUnidade: 'UN', ncm: '', dataItem: '' });

  // Atalho para atualizar qualquer campo do formulário principal dinamicamente
  const updateField = (campo: keyof typeof estadoInicialForm, valor: any) => setForm(p => ({ ...p, [campo]: valor }));

  // Requisições unificadas
  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data: clis } = await supabase.from('clientes').select('id, nome').order('nome');
      const { data: oss } = await supabase.from('ordens_servico').select('*').order('id', { ascending: false });
      if (clis) setClientesDisponiveis(clis);
      if (oss) setOrdensServico(oss.map(item => ({
        id: item.id, numero: item.numero, clienteId: item.cliente_id, clienteNome: item.cliente_name,
        dataAbertura: item.data_abertura, previsaoEntrega: item.previsao_entrega || '', condicaoPagamento: item.condicao_pagamento || '',
        tipoOs: item.tipo_os, equipamento: item.equipamento, servicos: item.servicos || [], pecas: item.pecas || [],
        valorTotal: Number(item.valor_total || 0), status: item.status
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregarDados(); }, []);

  // Cálculos dinâmicos
  const valorTotalServicos = useMemo(() => form.tipoOs === 'produtos' ? 0 : servicos.reduce((acc, i) => acc + (i.total || 0), 0), [servicos, form.tipoOs]);
  const valorTotalPecas = useMemo(() => form.tipoOs === 'mao_de_obra' ? 0 : pecas.reduce((acc, i) => acc + (i.total || 0), 0), [pecas, form.tipoOs]);
  const valorTotalOS = useMemo(() => valorTotalServicos + valorTotalPecas, [valorTotalServicos, valorTotalPecas]);

  const ordensFiltradas = useMemo(() => {
    const t = busca.toLowerCase().trim();
    return ordensServico.filter(os => !t || os.numero?.toLowerCase().includes(t) || os.clienteNome?.toLowerCase().includes(t) || os.equipamento?.toLowerCase().includes(t));
  }, [busca, ordensServico]);

  // Inserções temporárias de itens
  const handleAdicionarServico = () => {
    if (!tmpServ.descricao.trim()) return;
    setServicos(p => [...p, { id: Date.now() + Math.random(), ...tmpServ, total: tmpServ.quantidade * tmpServ.valorUnitario }]);
    setTmpServ({ descricao: '', quantidade: 1, valorUnitario: 0 });
  };

  const handleAdicionarPeca = () => {
    if (!tmpProd.descricao.trim()) return;
    setPecas(p => [...p, { id: Date.now() + Math.random(), ...tmpProd, total: tmpProd.quantidade * tmpProd.valorUnitario }]);
    setTmpProd({ descricao: '', quantidade: 1, valorUnitario: 0, tipoUnidade: 'UN', ncm: '', dataItem: form.dataAbertura });
  };

  // Modais de Controle
  const abrirNovoModal = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setForm({ ...estadoInicialForm, numero: `OS-${new Date().getFullYear()}-${String(ordensServico.length + 1).padStart(3, '0')}`, dataAbertura: hoje });
    setTmpProd(p => ({ ...p, dataItem: hoje })); setServicos([]); setPecas([]); setModalAberto(true);
  };

  const abrirEditarModal = (os: OrdemServico) => {
    setForm({ id: os.id, numero: os.numero, clienteId: os.clienteId, dataAbertura: os.dataAbertura, previsaoEntrega: os.previsaoEntrega, condicaoPagamento: os.condicaoPagamento, tipoOs: os.tipoOs, equipamento: os.equipamento, status: os.status });
    setServicos(os.servicos); setPecas(os.pecas); setTmpProd(p => ({ ...p, dataItem: os.dataAbertura })); setModalAberto(true);
  };

  const fecharModal = () => { setForm(estadoInicialForm); setModalAberto(false); };

  // SALVAMENTO UNIFICADO COM UPSERT (Insert e Update automáticos)
  const handleSalvarOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) return alert('Selecione o cliente.');

    try {
      const cli = clientesDisponiveis.find(c => c.id === form.clienteId);
      const { error } = await supabase.from('ordens_servico').upsert({
        id: form.id, // Se o ID for undefined, o Supabase gera um Insert. Se houver ID, faz Update.
        numero: form.numero, cliente_id: form.clienteId, cliente_name: cli?.nome || 'Desconhecido',
        data_abertura: form.dataAbertura, previsao_entrega: form.previsaoEntrega || null, condicao_pagamento: form.condicao_pagamento,
        tipo_os: form.tipoOs, equipamento: form.equipamento, valor_total: valorTotalOS, status: form.status,
        servicos: form.tipoOs !== 'produtos' ? servicos : [], pecas: form.tipoOs !== 'mao_de_obra' ? pecas : []
      });

      if (error) throw error;
      fecharModal(); alert('Operação realizada com sucesso!'); carregarDados();
    } catch (error) { alert('Erro ao salvar no banco.'); }
  };

  const handleExcluirOS = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Excluir permanentemente?') && !(await supabase.from('ordens_servico').delete().eq('id', id)).error) {
      alert('Excluído!'); carregarDados();
    }
  };

  return {
    modalAberto, busca, setBusca, ordensFiltradas, clientesDisponiveis, valorTotalOS, loading, servicos, pecas,
    form, updateField, tmpServ, setTmpServ, tmpProd, setTmpProd, handleAdicionarServico, handleAdicionarPeca,
    abrirNovoModal, abrirEditarModal, fecharModal, handleSalvarOS, handleExcluirOS
  };
}
