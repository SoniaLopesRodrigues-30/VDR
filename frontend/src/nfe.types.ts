// src/nfe.types.ts

// Objeto real para forçar o compilador a reconhecer e exportar este arquivo sem bugs
export const NFE_BUILD_CONFIG = { versao: '4.00' };

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
