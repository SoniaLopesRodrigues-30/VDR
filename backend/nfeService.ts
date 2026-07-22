import { NFe, Config } from 'node-nfe'; // Biblioteca Open Source para SEFAZ
import fs from 'fs';
import path from 'path';

// Configurações básicas de comunicação com a SEFAZ
const sefazConfig: Config = {
  empresa: {
    cnpj: '00000000000000', // CNPJ da sua empresa emissora
    razaoSocial: 'Sua Empresa Ltda',
    inscricaoEstadual: '123456789',
    regimeTributario: '1', // 1 = Simples Nacional
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      codigoMunicipio: '3550308', // Código IBGE do município (Ex: São Paulo)
      municipio: 'São Paulo',
      uf: 'SP',
      cep: '01001000',
    }
  },
  certificado: {
    // Carrega o arquivo do certificado digital A1 (.pfx ou .p12)
    pfx: fs.readFileSync(path.resolve(__dirname, './certificado2026.pfx')),
    senha: '03183009',
  },
  ambiente: '2', // 1 = Produção (Validade Jurídica) | 2 = Homologação (Testes)
  uf: 'SP', // Estado padrão de emissão
};

// Inicializa a instância de comunicação com a SEFAZ
const nfeInstance = new NFe(sefazConfig);

/**
 * Função responsável por mapear o JSON recebido do React, 
 * gerar o layout XML oficial, assinar com o certificado A1 e transmitir.
 */
export async function transmitirNfeSefaz(dadosNota: any) {
  try {
    // 1. Mapeamento do JSON para o padrão de chaves exigido pela SEFAZ
    const nfeDadosLayout = {
      ide: {
        cUF: '35', // Código IBGE do Estado de SP
        natOp: dadosNota.naturezaOperacao,
        mod: '55', // Modelo 55 = NF-e (Modelo 65 = NFC-e)
        serie: dadosNota.serie,
        nNF: dadosNota.numero.replace(/\./g, ''), // Remove pontos do sequencial
        dhEmi: new Date().toISOString(), // Data/Hora no formato ISO
        tpNF: dadosNota.tipoOperacao.split(' - ')[0], // Captura '0' ou '1'
        idDest: dadosNota.destinoOperacao.split(' - ')[0],
        cMunFG: '3550308',
        tpImp: '1', // 1 = Retrato (DANFE)
        tpEmis: '1', // 1 = Emissão Normal
        tpAmb: sefazConfig.ambiente,
        finNFe: dadosNota.finalidadeEmissao.split(' - ')[0],
        indFinal: '1', // 1 = Consumidor Final
        indPres: '1', // 1 = Operação Presencial
      },
      emit: {
        CNPJ: sefazConfig.empresa.cnpj,
        xNome: sefazConfig.empresa.razaoSocial,
        IE: sefazConfig.empresa.inscricaoEstadual,
        CRT: sefazConfig.empresa.regimeTributario,
        enderEmit: sefazConfig.empresa.endereco,
      },
      dest: {
        // Verifica se é CPF ou CNPJ limpando caracteres especiais
        [dadosNota.documento.replace(/\D/g, '').length === 14 ? 'CNPJ' : 'CPF']: dadosNota.documento.replace(/\D/g, ''),
        xNome: dadosNota.cliente,
        indIEDest: '9', // 9 = Não Contribuinte
      },
      det: dadosNota.itens.map((item: any, index: number) => ({
        $: { nItem: index + 1 },
        prod: {
          cProd: item.id,
          cEAN: 'SEM GTIN',
          xProd: item.descricao,
          NCM: item.ncm.replace(/\./g, ''), // Limpa pontos do NCM
          CFOP: '5102', // CFOP Padrão para Venda de Mercadoria dentro do Estado
          uCom: item.unidade,
          qCom: item.quantidade.toFixed(4),
          vUnCom: item.valorUnitario.toFixed(10),
          vProd: item.valorTotalItem.toFixed(2),
          cEANTrib: 'SEM GTIN',
          uTrib: item.unidade,
          qTrib: item.quantidade.toFixed(4),
          vUnTrib: item.valorUnitario.toFixed(10),
          indTot: '1', // Valor do item compõe o total da NF-e
        },
        imposto: {
          // Como informamos Simples Nacional (CRT=1), usamos o grupo ICMSSN
          ICMS: {
            ICMSSN102: {
              orig: '0', // 0 = Nacional
              CSOSN: '102', // 102 = Tributada sem permissão de crédito (Padrão Simples)
            }
          },
          PIS: { PISNT: { CST: '07' } }, // 07 = Operação Isenta
          COFINS: { COFINSNT: { CST: '07' } }
        }
      })),
      total: {
        ICMSTot: {
          vBC: '0.00', vICMS: '0.00', vICMSDeson: '0.00', vFCP: '0.00',
          vBCST: '0.00', vST: '0.00', vFCPST: '0.00', vFCPSTRet: '0.00',
          vProd: dadosNota.valorBruto.toFixed(2),
          vFrete: '0.00', vSeg: '0.00', vDesc: '0.00', vII: '0.00', vIPI: '0.00',
          vIPIDevol: '0.00', vPIS: '0.00', vCOFINS: '0.00', vOutro: '0.00',
          vNF: dadosNota.valorLiquido.toFixed(2),
        }
      },
      transp: {
        modFrete: dadosNota.transporte.modalidadeFrete.split(' - ')[0],
      },
      pag: {
        detPag: {
          tPag: '15', // 15 = Pix (01=Dinheiro, 03=Cartão Crédito, 14=Boleto)
          vPag: dadosNota.valorLiquido.toFixed(2),
        }
      },
      infAdic: {
        infCpl: dadosNota.informacoesComplementares
      }
    };

    // 2. Transmite usando o pacote que gera o XML, assina com o pfx e dispara o SOAP
    const resultadoSefaz = await nfeInstance.autorizar(nfeDadosLayout);
    
    return resultadoSefaz;
  } catch (error) {
    console.error('Erro na assinatura/envio interno:', error);
    throw error;
  }
}
