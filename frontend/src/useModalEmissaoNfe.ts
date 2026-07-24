import { useState } from 'react';
import { type NotaFiscal, type ItemNota } from './ModalEmissaoNfe';

interface UseModalEmissaoProps {
  onEmitir: (nota: NotaFiscal) => void;
  proximoNumeroSequencial: number;
}

export function useModalEmissaoNfe({ onEmitir, proximoNumeroSequencial }: UseModalEmissaoProps) {
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [docCliente, setDocCliente] = useState('');
  const [naturezaOperacao, setNaturezaOperacao] = useState('Venda de Mercadoria');
  
  const [logradouroDest, setLogradouroDest] = useState('');
  const [numeroDest, setNumeroDest] = useState('');
  const [bairroDest, setBairroDest] = useState('');
  const [municipioDest, setMunicipioDest] = useState('Caxias do Sul');
  const [ufDest, setUfDest] = useState('RS');
  const [cepDest, setCepDest] = useState('95042-000');
  const [codMunicipioDest, setCodMunicipioDest] = useState('4305108');
  
  const [tipoOperacao, setTipoOperacao] = useState<NotaFiscal['tipoOperacao']>('1 - Saída');
  const [destinoOperacao, setDestinoOperacao] = useState<NotaFiscal['destinoOperacao']>('1 - Operação Interna (Estadual)');
  const [finalidadeEmissao, setFinalidadeEmissao] = useState<NotaFiscal['finalidadeEmissao']>('1 - NF-e Normal');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [dataSaida, setDataSaida] = useState(new Date().toISOString().split('T')[0]);
  const [horaSaida, setHoraSaida] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [dataVencimentoFatura, setDataVencimentoFatura] = useState(new Date().toISOString().split('T')[0]);

  const [itensAdicionados, setItensAdicionados] = useState<ItemNota[]>([]);
  const [itemDescricao, setItemDescricao] = useState('');
  const [itemNcm, setItemNcm] = useState('');
  const [itemUnidade, setItemUnidade] = useState('UN');
  const [itemQuantidade, setItemQuantidade] = useState('');
  const [itemValorUnitario, setItemValorUnitario] = useState('');

  const [icmsSituacao, setIcmsSituacao] = useState('102');
  const [ipiSituacao, setIpiSituacao] = useState('99');
  const [pisSituacao, setPisSituacao] = useState('07');

  const [qtdVolumes, setQtdVolumes] = useState('');
  const [especieVolumes, setEspecieVolumes] = useState('CX');
  const [pesoBruto, setPesoBruto] = useState('');
  const [pesoLiquido, setPesoLiquido] = useState('');
  const [infoComplementares, setInfoComplementares] = useState(
    'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.'
  );

  const [formaPagamento, setFormaPagamento] = useState<NotaFiscal['pagamento']['formaPagamento']>('Pix');
  const [meioPagamento, setMeioPagamento] = useState('15 - Pix');
  const [modalidadeFrete, setModalidadeFrete] = useState<NotaFiscal['transporte']['modalidadeFrete']>('9 - Sem Ocorrência de Transporte');
  const [transportadorNome, setTransportadorNome] = useState('');
  const [transportadorCnpjCpf, setTransportadorCnpjCpf] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');

  const limparCamposProduto = () => {
    setItemDescricao(''); setItemNcm(''); setItemUnidade('UN'); setItemQuantidade(''); setItemValorUnitario('');
  };

  const handleAdicionarItemTabela = () => {
    if (!itemDescricao || !itemNcm || !itemQuantidade || !itemValorUnitario) {
      alert('Preencha todos os dados do produto.'); return;
    }
    const qtd = parseFloat(itemQuantidade);
    const vUnit = parseFloat(itemValorUnitario);
    
    if (isNaN(qtd) || qtd <= 0 || isNaN(vUnit) || vUnit <= 0) {
      alert('Quantidade e Valor Unitário devem ser válidos.'); return;
    }

    setItensAdicionados([...itensAdicionados, {
      id: Date.now().toString(), descricao: itemDescricao, ncm: itemNcm, unidade: itemUnidade, quantidade: qtd, valorUnitario: vUnit, valorTotalItem: qtd * vUnit
    }]);
    limparCamposProduto();
  };

  const handleRemoverItemTabela = (id: string) => {
    setItensAdicionados(itensAdicionados.filter(item => item.id !== id));
  };

  const valorBrutoCalculado = itensAdicionados.reduce((soma, item) => soma + item.valorTotalItem, 0);
  const valorLiquidoCalculado = valorBrutoCalculado;
  const proximoNumeroStr = String(proximoNumeroSequencial).padStart(6, '0');
  const numeroFaturaCalculado = `FAT-${proximoNumeroStr}`;

  const formatarDataBR = (dataUS: string) => {
    if (!dataUS || dataUS.includes('/')) return dataUS;
    const [ano, mes, dia] = dataUS.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleEmitirNfe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelecionado || !docCliente) { alert('Preencha os dados do cliente.'); return; }
    if (itensAdicionados.length === 0) { alert('Adicione pelo menos 1 produto.'); return; }
    
    const novaNota: NotaFiscal = {
      id: Date.now(),
      numero: `000.${proximoNumeroStr.slice(0, 3)}.${proximoNumeroStr.slice(3)}`,
      serie: '001',
      cliente: clienteSelecionado,
      documento: docCliente,
      dataEmissao: formatarDataBR(dataEmissao),
      valorBruto: valorBrutoCalculado,
      valorLiquido: valorLiquidoCalculado,
      status: 'Pendente',
      itens: itensAdicionados,
      tributacao: { icms: icmsSituacao, ipi: ipiSituacao, pis: pisSituacao },
      quantidadeVolumes: qtdVolumes || '0', especieVolumes,
      pesoBruto: pesoBruto ? parseFloat(pesoBruto).toFixed(3) : '0.000',
      pesoLiquido: pesoLiquido ? parseFloat(pesoLiquido).toFixed(3) : '0.000',
      informacoesComplementares: infoComplementares,
      tipoOperacao, destinoOperacao, finalidadeEmissao,
      dataSaida: formatarDataBR(dataSaida), horaSaida,
      pagamento: { formaPagamento, meioPagamento },
      transporte: {
        modalidadeFrete,
        transportadorNome: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? transportadorNome : undefined,
        transportadorCnpjCpf: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? transportadorCnpjCpf : undefined,
        placaVeiculo: modalidadeFrete !== '9 - Sem Ocorrência de Transporte' ? placaVeiculo : undefined
      },
      enderecoDestinatario: {
        logradouro: logradouroDest || 'Rua nao informada', numero: numeroDest || 'SN', bairro: bairroDest || 'Centro',
        codigoMunicipio: codMunicipioDest, municipio: municipioDest, uf: ufDest, cep: cepDest.replace(/\D/g, '')
      },
      cobranca: formaPagamento !== 'Sem Pagamento' ? {
        fatura: { numero: numeroFaturaCalculado, valorOriginal: valorLiquidoCalculado, valorLiquido: valorLiquidoCalculado, dataVencimento: formatarDataBR(dataVencimentoFatura) },
        duplicatas: [{ numero: `${numeroFaturaCalculado}-01`, vencimento: formatarDataBR(dataVencimentoFatura), valor: valorLiquidoCalculado }]
      } : undefined
    };

    onEmitir(novaNota);
  };

  return {
    clienteSelecionado, setClienteSelecionado, docCliente, setDocCliente, naturezaOperacao, setNaturezaOperacao,
    logradouroDest, setLogradouroDest, numeroDest, setNumeroDest, bairroDest, setBairroDest, municipioDest, setMunicipioDest,
    ufDest, setUfDest, cepDest, setCepDest, codMunicipioDest, setCodMunicipioDest, tipoOperacao, setTipoOperacao,
    destinoOperacao, setDestinoOperacao, finalidadeEmissao, setFinalidadeEmissao, dataEmissao, setDataEmissao,
    dataSaida, setDataSaida, horaSaida, setHoraSaida, dataVencimentoFatura, setDataVencimentoFatura, itensAdicionados,
    itemDescricao, setItemDescricao, itemNcm, setItemNcm, itemUnidade, setItemUnidade, itemQuantidade, setItemQuantidade,
    itemValorUnitario, setItemValorUnitario, qtdVolumes, setQtdVolumes, especieVolumes, setEspecieVolumes,
    pesoBruto, setPesoBruto, pesoLiquido, setPesoLiquido, infoComplementares, setInfoComplementares,
    formaPagamento, setFormaPagamento, meioPagamento, setMeioPagamento, modalidadeFrete, setModalidadeFrete,
    transportadorNome, setTransportadorNome, transportadorCnpjCpf, setTransportadorCnpjCpf, placaVeiculo, setPlacaVeiculo,
    icmsSituacao, setIcmsSituacao, ipiSituacao, setIpiSituacao, pisSituacao, setPisSituacao,
    handleAdicionarItemTabela, handleRemoverItemTabela, handleEmitirNfe, valorBrutoCalculado, valorLiquidoCalculado, numeroFaturaCalculado
  };
}
