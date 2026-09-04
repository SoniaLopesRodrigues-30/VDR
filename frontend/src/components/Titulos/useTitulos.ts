import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';

export interface Titulo {
  id: string;
  nfe_id: string;
  cliente_id: number;
  parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  tipo: 'Receber' | 'Pagar';
  clientes?: { nome: string };
}

export function useTitulos() {
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [tituloEmEdicao, setTituloEmEdicao] = useState<Titulo | null>(null);

  const carregarTitulos = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('titulos_receber')
        .select('*, clientes(nome)')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      if (data) setTitulos(data as Titulo[]);
    } catch (error) {
      console.error('Erro ao buscar títulos:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { 
    carregarTitulos(); 
  }, [carregarTitulos]);

  // Ativa o modo de edição salvando o título selecionado no estado
  const iniciarEdicao = (titulo: Titulo) => {
    if (titulo.status === 'Pago') {
      alert('Títulos que já foram pagos ou liquidados não podem ser editados.');
      return;
    }
    setTituloEmEdicao(titulo);
  };

  // Limpa o estado de edição
  const cancelarEdicao = () => {
    setTituloEmEdicao(null);
  };
  
  const handleGerarContasFixas = async () => {
    // 1. Obtém o mês/ano atual apenas para sugerir um padrão no prompt
    const hoje = new Date();
    const padraoMesAno = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

    // 2. Pergunta ao usuário qual período ele deseja processar
    const periodoInformado = prompt(
      "Para qual mês/ano deseja gerar as contas fixas? (Formato: MM/AAAA)", 
      padraoMesAno
    );

    // Se o usuário cancelar ou deixar em branco, interrompe a execução
    if (!periodoInformado) return;

    // 3. Valida se o formato digitado está correto via Expressão Regular (Regex)
    const regexValida = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regexValida.test(periodoInformado.trim())) {
      alert("Formato inválido! Por favor, utilize o padrão MM/AAAA (Exemplo: 09/2026).");
      return;
    }

    // 4. Separa o mês e o ano digitados pelo usuário
    const [mes, ano] = periodoInformado.trim().split('/');

    try {
      setCarregando(true);

      // Busca os modelos base ativos
      const { data: moldes, error: erroMoldes } = await supabase
        .from('contas_fixas')
        .select('*')
        .eq('status_ativo', true);

      if (erroMoldes) throw erroMoldes;
      if (!moldes || moldes.length === 0) {
        alert('Nenhuma conta fixa ativa encontrada para gerar.');
        return;
      }

      // 5. Prepara os títulos reais com as datas apontando para o mês/ano indicados
      const novosTitulos = moldes.map((molde) => {
        const diaStr = String(molde.dia_vencimento).padStart(2, '0');
        
        // Monta a data no padrão aceito pelo banco (AAAA-MM-DD)
        const dataVencimentoFormatada = `${ano}-${mes}-${diaStr}`;

        return {
          nfe_id: `FIXA - ${molde.descricao}`,
          cliente_id: molde.cliente_id,
          parcela: 1,
          valor_parcela: molde.valor,
          data_vencimento: dataVencimentoFormatada,
          tipo: molde.tipo,
          status: 'Pendente'
        };
      });

      // 6. Insere o lote no banco de dados de uma vez só
      const { error: erroInsert } = await supabase
        .from('titulos_receber')
        .insert(novosTitulos);

      if (erroInsert) throw erroInsert;

      alert(`${novosTitulos.length} títulos foram gerados com sucesso para o período ${mes}/${ano}!`);
      await carregarTitulos(); // Recarrega a tabela principal da tela
    } catch (error) {
      console.error(error);
      alert('Erro ao processar a geração das contas fixas.');
    } finally {
      setCarregando(false);
    }
  };



  // FUNÇÃO DE ATUALIZAÇÃO
  const handleAtualizarTitulo = async (id: string, dadosAtualizados: Partial<Titulo>) => {
    try {
      const { error } = await supabase
        .from('titulos_receber')
        .update(dadosAtualizados)
        .eq('id', id);

      if (error) throw error;

      alert('Título atualizado com sucesso!');
      setTituloEmEdicao(null); // Fecha o modo de edição
      await carregarTitulos(); // Recarrega a tabela de registros
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar o título no banco de dados.');
    }
  };

  // Função dinâmica para efetuar o pagamento/recebimento
    // Função dinâmica para efetuar o pagamento/recebimento
  const handleBaixarTitulo = async (titulo: Titulo) => {
    const acaoTexto = titulo.tipo === 'Pagar' ? 'pagamento' : 'recebimento';
    if (!confirm(`Confirmar o ${acaoTexto} do título ref. ${titulo.nfe_id} no valor de R$ ${Number(titulo.valor_parcela).toFixed(2)}?`)) return;

    try {
      // 1. Atualiza o status do título
      const { error: updateError } = await supabase
        .from('titulos_receber')
        .update({ status: 'Pago' })
        .eq('id', titulo.id);
      
      if (updateError) throw updateError;
      
      // Ajuste de Data: Formata para YYYY-MM-DD de forma segura para evitar erro 400
      const dataHoje = new Date().toISOString().split('T')[0];

      // 2. Insere no fluxo de caixa
      const { error: insertError } = await supabase
        .from('fluxo_caixa')
        .insert([{
          descricao: `${titulo.tipo === 'Pagar' ? 'Pagamento' : 'Recebimento'} Ref. ${titulo.nfe_id} - Parc. ${titulo.parcela}`,
          valor: Number(titulo.valor_parcela),
          tipo: titulo.tipo === 'Pagar' ? 'saida' : 'entrada', // Alterado aqui
          data: dataHoje
        }]);

            if (insertError) {
        // Transforma o objeto de erro em texto para vermos na tela o campo problemático
        console.error("Mensagem do Banco:", insertError.message);
        console.error("Detalhes do Banco:", insertError.details);
        console.error("Dica do Banco:", insertError.hint);
        
        // Joga o erro detalhado direto no alerta da tela
        alert(`Erro do Banco: ${insertError.message} \nDetalhes: ${insertError.details}`);
        throw insertError;
      }


      alert(`Título liquidado e registrado no Fluxo de Caixa!`);
      await carregarTitulos();
    } catch (error: any) {
      console.error(error);
      // Se o banco trouxer uma mensagem amigável, nós mostramos no alert
      const mensagemErro = error?.message || 'Erro ao processar a baixa do título.';
      alert(`Não foi possível baixar o título. Motivo: ${mensagemErro}`);
    }
  };

  // Deletar os lançamentos de títulos
  const handleDeletarTitulo = async (id: string, nfeId: string) => {
    if (!confirm(`Tem certeza absoluta que deseja excluir permanentemente o título ref. ${nfeId}?`)) {
        return;
    }

    try {
        const { error } = await supabase
          .from('titulos_receber')
          .delete()
          .eq('id', id);

        if (error) throw error;

        alert('Título deletado com sucesso do sistema!');
        
        // Se o título deletado era o que estava sendo editado, limpa o formulário
        if (tituloEmEdicao?.id === id) {
          cancelarEdicao();
        }

        await carregarTitulos(); // Recarrega os registros da tabela
    } catch (error) {
        console.error(error);
        alert('Erro ao tentar deletar o título no Supabase.');
    }
  };

  // Lógica de pesquisa local combinada
  const titulosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return titulos;
    return titulos.filter(t => 
      String(t.nfe_id).toLowerCase().includes(termo) || 
      t.clientes?.nome?.toLowerCase().includes(termo) ||
      t.tipo.toLowerCase().includes(termo)
    );
  }, [titulos, busca]);

  return { 
    busca, 
    setBusca, 
    carregando, 
    titulosFiltrados, 
    handleBaixarTitulo, 
    handleAtualizarTitulo, 
    carregarTitulos,
    tituloEmEdicao,
    handleDeletarTitulo,
    iniciarEdicao,
    handleGerarContasFixas,
    cancelarEdicao 
  };
}
