import { useState, useMemo } from 'react';
import type { NotaFiscal } from './useNfeForm';
import { downloadXml, downloadPdfBase64 } from './nfeUtils';
// IMPORTAÇÃO DA CONEXÃO DO SUPABASE
import { supabase } from './services/supabaseClient';


export function useNfe() {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [notas, setNotas] = useState<NotaFiscal[]>([
    {
      id: 1,
      numero: '000.004.125',
      serie: '001',
      cliente: 'Tech Soluções Ltda',
      documento: '12.345.678/0001-99',
      dataEmissao: '20/07/2026',
      valorBruto: 1000.00,
      valorLiquido: 1000.00,
      status: 'Autorizada',
      itens: [{ id: '1', descricao: 'Notebook Corp Core i5', ncm: '8471.30.12', unidade: 'UN', quantidade: 1, valorUnitario: 1000.00, valorTotalItem: 1000.00 }],
      quantidadeVolumes: '1',
      especieVolumes: 'CX',
      pesoBruto: '1.500',
      pesoLiquido: '1.200',
      informacoesComplementares: 'DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NAO GERA DIREITO A CREDITO FISCAL DE IPI.',
      tipoOperacao: '1 - Saída',
      destinoOperacao: '1 - Operação Interna (Estadual)',
      finalidadeEmissao: '1 - NF-e Normal',
      dataSaida: '20/07/2026',
      horaSaida: '14:30',
      pagamento: { formaPagamento: 'Boleto', meioPagamento: 'Pagamento À Vista' }, // Ajustado para corresponder ao novo fluxo
      transporte: {
        modalidadeFrete: '0 - Contratação por conta do Remetente (CIF)',
        transportadorNome: 'TransLog Transportes S.A.',
        transportadorCnpjCpf: '98.765.432/0001-11',
        placaVeiculo: 'ABC1D23'
      },
      enderecoDestinatario: { logradouro: 'Av. Julio de Castilhos', numero: '1400', bairro: 'Centro', codigoMunicipio: '4305108', municipio: 'Caxias do Sul', uf: 'RS', cep: '95010000' },
      cobranca: {
        fatura: { numero: 'FAT-4125', valorOriginal: 1000.00, valorLiquido: 1000.00 },
        duplicatas: [{ numero: 'DUP-4125/01', vencimento: '20/08/2026', valor: 1000.00 }]
      }
    }
  ]);

  const notasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return notas.filter(nota =>
      nota.cliente.toLowerCase().includes(termo) ||
      nota.numero.includes(busca) ||
      nota.documento.includes(busca)
    );
  }, [notas, busca]);

  const handleEmitirNota = async (novaNota: NotaFiscal) => {
    const idProvisorio = Date.now();
    const notaEmProcessamento: NotaFiscal = {
      ...novaNota,
      id: idProvisorio,
      status: 'Pendente'
    };

    setNotas(prevNotas => [notaEmProcessamento, ...prevNotas]);
    setModalAberto(false);

    try {
      // 1. Envia os dados para a sua API local que monta e transmite o XML à SEFAZ
      const response = await fetch('http://localhost:5001/v1/nfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaNota)
      });
      
      const data = await response.json();
      
      if (data.sucesso) {
        setNotas(prevNotas => 
          prevNotas.map(n => n.id === idProvisorio ? { 
            ...n, 
            status: 'Autorizada', 
            numero: data.numeroNota,
            chaveAcesso: data.chaveAcesso 
          } : n)
        );

        if (data.xmlCompleto) downloadXml(data.xmlCompleto, data.numeroNota);
        if (data.pdfDanfe) downloadPdfBase64(data.pdfDanfe, data.numeroNota);

        // --- AUTOMAÇÃO GERAÇÃO DE BOLETOS / TÍTULOS NO SUPABASE ---
        // Só gera boletos automáticos se for selecionada a opção 'Boleto'
        if (novaNota.pagamento.formaPagamento === 'Boleto') {
          // Obtém o número de parcelas (se não mapeado, assume 1x por segurança)
          const numParcelas = (novaNota as any).parcelas || 1;
          const valorDaParcela = novaNota.valorLiquido / numParcelas;
          const payloadTitulos = [];

          // Calcula a data base a partir do primeiro vencimento informado no formulário
          const dataPrimeiroVencimento = novaNota.dataSaida 
            ? new Date(novaNota.dataSaida.split('/').reverse().join('-')) 
            : new Date();

          for (let i = 1; i <= numParcelas; i++) {
            const dataVencimentoParcela = new Date(dataPrimeiroVencimento);
            // Empurra o vencimento de 30 em 30 dias para cada parcela subsequente
            dataVencimentoParcela.setDate(dataVencimentoParcela.getDate() + ((i - 1) * 30));

            payloadTitulos.push({
              nfe_id: data.numeroNota, // Número gerado de retorno da SEFAZ
              cliente_id: (novaNota as any).clienteId || null, // ID mapeado da tabela clientes
              parcela: i,
              valor_parcela: valorDaParcela,
              data_vencimento: dataVencimentoParcela.toISOString().split('T')[0],
              status: 'Pendente'
            });
          }

          // Grava em lote as parcelas de cobrança diretamente no Supabase
          const { error: erroSupabase } = await supabase
            .from('titulos_receber')
            .insert(payloadTitulos);

          if (erroSupabase) {
            console.error('Erro ao salvar boletos no Supabase:', erroSupabase);
            alert('Nota autorizada, mas houve um erro ao provisionar os boletos no contas a receber.');
          } else {
            alert(`🎉 NF-e emitida com sucesso! ${numParcelas} parcela(s) lançada(s) no Contas a Receber.`);
          }
        }

      } else {
        marcarComoCancelada(idProvisorio);
        alert(data.mensagem || 'Rejeição encontrada na estrutura fiscal.');
      }
    } catch (error: any) {
      console.error("[Front-end] Falha detalhada na transmissão:", error);
      marcarComoCancelada(idProvisorio);
      alert(`Falha no envio: ${error.message}`);
    }
  };

  const marcarComoCancelada = (id: number) => {
    setNotas(prevNotas => prevNotas.map(n => n.id === id ? { ...n, status: 'Cancelada' } : n));
  };

  return {
    busca,
    setBusca,
    modalAberto,
    setModalAberto,
    notas,
    notasFiltradas,
    handleEmitirNota
  };
}
