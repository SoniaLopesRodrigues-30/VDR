// src/useNfeForm.ts
import { useState } from 'react';

// INTERFACES FISCAIS CENTRALIZADAS DIRETAMENTE NO HOOK (Evita bugs de compilação no Vite)
export interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotalItem: number;
}

export interface DuplicataNota {
  numero: string;
  vencimento: string;
  valor: number;
}

export interface FaturaNota {
  numero: string;
  valorOriginal: number;
  valorDesconto?: number;
  valorLiquido: number;
  dataVencimento?: string;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  cliente: string;
  documento: string;
  dataEmissao: string;
  status: 'Autorizada' | 'Pendente' | 'Cancelada';
  itens: ItemNota[];
  valorBruto: number;
  valorLiquido: number;
  quantidadeVolumes?: string;
  especieVolumes?: string;
  pesoBruto?: string;
  pesoLiquido?: string;
  informacoesComplementares?: string;
  tipoOperacao: '0 - Entrada' | '1 - Saída';
  destinoOperacao: '1 - Operação Interna (Estadual)' | '2 - Operação Interestadual' | '3 - Operação com Exterior';
  finalidadeEmissao: '1 - NF-e Normal' | '2 - NF-e Complementar' | '3 - NF-e de Ajuste' | '4 - Devolução de Mercadoria';
  dataSaida: string;
  horaSaida: string;
  pagamento: {
    formaPagamento: 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Pix' | 'Boleto' | 'Sem Pagamento';
    meioPagamento: string; 
  };
  transporte: {
    modalidadeFrete: '0 - Contratação por conta do Remetente (CIF)' | '1 - Contratação por conta do Destinatário (FOB)' | '9 - Sem Ocorrência de Transporte';
    transportadorNome?: string;
    transportadorCnpjCpf?: string;
    placaVeiculo?: string;
  };
  enderecoDestinatario: {
    logradouro: string;
    numero: string;
    bairro: string;
    codigoMunicipio: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  cobranca?: {
    fatura: FaturaNota;
    duplicatas: DuplicataNota[];
  };
}

interface UseNfeFormProps {
  proximoNumeroSequencial: number;
  onEmitir: (nota: NotaFiscal) => void;
}

export function useNfeForm({ proximoNumeroSequencial, onEmitir }: UseNfeFormProps) {
  const [destinatario, setDestinatario] = useState({
    cliente: '',
    documento: '',
    naturezaOperacao: 'Venda de Mercadoria',
    logradouro: '',
    numero: '',
    bairro: '',
    municipio: 'Caxias do Sul',
    uf: 'RS',
    cep: '95042-000',
    codigoMunicipio: '4305108',
  });

  const [dadosFiscais, setDadosFiscais] = useState({
    tipoOperacao: '1 - Saída' as NotaFiscal['tipoOperacao'],
    destinoOperacao: '1 - Operação Interna (Estadual)' as NotaFiscal['destinoOperacao'],
    finalidadeEmissao: '1 - NF-e Normal' as NotaFiscal['finalidadeEmissao'],
    dataEmissao: new Date().toISOString().split('T')[0],
    dataSaida: new Date().toISOString().split('T')[0],
    horaSaida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    dataVencimentoFatura: new Date().toISOString().split('T')[0]
  });

  const [produtoInput, setProdutoInput] = useState({
    descricao: '',
    ncm: '',
    unidade: 'UN',
    quantidade: '',
    valorUnitario: '',
  });

  const [logistica, setLogistica] = useState({
    formaPagamento: 'Pix' as NotaFiscal['pagamento']['formaPagamento'],
    meioPagamento: '15 - Pix',
    modalidadeFrete: '9 - Sem Ocorrência de Transporte' as NotaFiscal['transporte']['modalidadeFrete'],
    transportadorNome: '',
    transportadorCnpjCpf: '',
    placaVeiculo: '',
    qtdVolumes: '',
    especieVolumes: 'CX',
    pesoBruto: '',
    pesoLiquido: '',
  });

  const [itensAdicionados, setItensAdicionados] = useState<ItemNota[]>([]);
  const [infoComplementares, setInfoComplementares] = useState(
    'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.'
  );

  const updateDestinatario = (field: string, value: string) => 
    setDestinatario(prev => ({ ...prev, [field]: value }));

  const updateDadosFiscais = (field: string, value: string) => 
    setDadosFiscais(prev => ({ ...prev, [field]: value }));

  const updateProdutoInput = (field: string, value: string) => 
    setProdutoInput(prev => ({ ...prev, [field]: value }));

  const updateLogistica = (field: string, value: string) => 
    setLogistica(prev => ({ ...prev, [field]: value }));

  const handleAdicionarItemTabela = () => {
    const { descricao, ncm, quantidade, valorUnitario, unidade } = produtoInput;
    if (!descricao || !ncm || !quantidade || !valorUnitario) {
      alert('Preencha todos os dados do produto para adicioná-lo à nota.');
      return;
    }
    const qtd = parseFloat(quantidade);
    const vUnit = parseFloat(valorUnitario);
    
    if (isNaN(qtd) || qtd <= 0 || isNaN(vUnit) || vUnit <= 0) {
      alert('Quantidade e Valor Unitário devem ser números válidos maiores que zero.');
      return;
    }

    const novoItem: ItemNota = {
      id: Date.now().toString(),
      descricao,
      ncm,
      unidade,
      quantidade: qtd,
      valorUnitario: vUnit,
      valorTotalItem: qtd * vUnit
    };

    setItensAdicionados([...itensAdicionados, novoItem]);
    setProdutoInput({ descricao: '', ncm: '', unidade: 'UN', quantidade: '', valorUnitario: '' });
  };

  const handleRemoverItemTabela = (id: string) => {
    setItensAdicionados(itensAdicionados.filter(item => item.id !== id));
  };

  const valorBrutoCalculado = itensAdicionados.reduce((soma, item) => soma + item.valorTotalItem, 0);
  const valorLiquidoCalculado = valorBrutoCalculado;
  const proximoNumeroStr = String(proximoNumeroSequencial).padStart(6, '0');
  const numeroFaturaCalculado = `FAT-${proximoNumeroStr}`;

  const formatarDataBR = (dataUS: string) => {
    if (!dataUS) return '';
    if (dataUS.includes('/')) return dataUS; 
    const parts = dataUS.split('-');
    if (parts.length !== 3) return dataUS;
    const [ano, mes, dia] = parts;
    return `${dia}/${mes}/${ano}`;
  };

  const handleEmitirNfe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!destinatario.cliente || !destinatario.documento) {
      alert('Por favor, preencha os dados do cliente.');
      return;
    }

    if (itensAdicionados.length === 0) {
      alert('Adicione pelo menos 1 produto para emitir a nota fiscal.');
      return;
    }

    const isSemFrete = logistica.modalidadeFrete === '9 - Sem Ocorrência de Transporte';

    const novaNota: NotaFiscal = {
      id: Date.now(),
      numero: `000.${proximoNumeroStr.slice(0, 3)}.${proximoNumeroStr.slice(3)}`,
      serie: '001',
      cliente: destinatario.cliente,
      documento: destinatario.documento,
      dataEmissao: formatarDataBR(dadosFiscais.dataEmissao),
      valorBruto: valorBrutoCalculado,
      valorLiquido: valorLiquidoCalculado,
      status: 'Pendente',
      itens: itensAdicionados,
      quantidadeVolumes: logistica.qtdVolumes || '0',
      especieVolumes: logistica.especieVolumes,
      pesoBruto: logistica.pesoBruto ? parseFloat(logistica.pesoBruto).toFixed(3) : '0.000',
      pesoLiquido: logistica.pesoLiquido ? parseFloat(logistica.pesoLiquido).toFixed(3) : '0.000',
      informacoesComplementares: infoComplementares,
      tipoOperacao: dadosFiscais.tipoOperacao,
      destinoOperacao: dadosFiscais.destinoOperacao,
      finalidadeEmissao: dadosFiscais.finalidadeEmissao,
      dataSaida: formatarDataBR(dadosFiscais.dataSaida),
      horaSaida: dadosFiscais.horaSaida,
      pagamento: {
        formaPagamento: logistica.formaPagamento,
        meioPagamento: logistica.meioPagamento
      },
      transporte: {
        modalidadeFrete: logistica.modalidadeFrete,
        transportadorNome: isSemFrete ? undefined : logistica.transportadorNome,
        transportadorCnpjCpf: isSemFrete ? undefined : logistica.transportadorCnpjCpf,
        placaVeiculo: isSemFrete ? undefined : logistica.placaVeiculo
      },
      enderecoDestinatario: {
        logradouro: destinatario.logradouro || 'Rua nao informada',
        numero: destinatario.numero || 'SN',
        bairro: destinatario.bairro || 'Centro',
        codigoMunicipio: destinatario.codigoMunicipio,
        municipio: destinatario.municipio,
        uf: destinatario.uf,
        cep: destinatario.cep.replace(/\D/g, '')
      },
      cobranca: logistica.formaPagamento !== 'Sem Pagamento' ? {
        fatura: {
          numero: numeroFaturaCalculado,
          valorOriginal: valorBrutoCalculado,
          valorLiquido: valorLiquidoCalculado,
          dataVencimento: formatarDataBR(dadosFiscais.dataVencimentoFatura)
        },
        duplicatas: [
          {
            numero: `${numeroFaturaCalculado}-01`,
            vencimento: formatarDataBR(dadosFiscais.dataVencimentoFatura),
            valor: valorLiquidoCalculado
          }
        ]
      } : undefined
    };

    onEmitir(novaNota);
  };

  return {
    destinatario, dadosFiscais, produtoInput, logistica, itensAdicionados, infoComplementares,
    valorBrutoCalculado, valorLiquidoCalculado, numeroFaturaCalculado, updateDestinatario,
    updateDadosFiscais, updateProdutoInput, updateLogistica, setInfoComplementares,
    handleAdicionarItemTabela, handleRemoverItemTabela, handleEmitirNfe,
  };
}
