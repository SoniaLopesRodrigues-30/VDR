import { useState, useMemo } from 'react';
import type { NotaFiscal } from './useNfeForm';
import { downloadXml, downloadPdfBase64 } from './nfeUtils';

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
      pagamento: { formaPagamento: 'Pix', meioPagamento: 'Pagamento À Vista' },
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
