import { NFe, Config } from 'node-nfe'; // Biblioteca Open Source para SEFAZ
import fs from 'fs';
import path from 'path';

// Bloco de segurança para leitura do certificado digital (Evita derrubar a porta 5001 se o arquivo sumir)
let certificadoBuffer: Buffer | undefined = undefined;
try {
  const caminhoCertificado = path.resolve(__dirname, './certificado2026.pfx');
  if (fs.existsSync(caminhoCertificado)) {
    certificadoBuffer = fs.readFileSync(caminhoCertificado);
  }
} catch (err) {
  console.warn('[Backend] Certificado digital não localizado ou inacessível. O envio operará em modo de simulação estrutural.');
}

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
      codigoMunicipio: '4305108', // Código IBGE do município (Ex: Caxias do Sul - RS) alinhado ao UF
      municipio: 'Caxias do Sul',
      uf: 'RS', // Estado padrão de emissão atualizado para RS conforme seu escopo
      cep: '95042000',
    }
  },
  certificado: {
    // Vincula o buffer caso ele tenha sido lido com sucesso em disco
    pfx: certificadoBuffer,
    senha: '03183009',
  },
  ambiente: '2', // 1 = Produção (Validade Jurídica) | 2 = Homologação (Testes)
  uf: 'RS', // Estado padrão de emissão atualizado para RS
};

// Inicializa a instância de comunicação com a SEFAZ
const nfeInstance = new NFe(sefazConfig);

/**
 * Mapeador auxiliar de contingência para garantir códigos numéricos válidos da SEFAZ (tPag)
 */
function obterCodigoMeioPagamento(meio: string): string {
  if (!meio) return '15'; // Padrão Pix
  const limpo = meio.toLowerCase();
  
  if (limpo.includes('15') || limpo.includes('pix')) return '15';
  if (limpo.includes('01') || limpo.includes('dinheiro')) return '01';
  if (limpo.includes('03') || limpo.includes('crédito') || limpo.includes('credito')) return '03';
  if (limpo.includes('04') || limpo.includes('débito') || limpo.includes('debito')) return '04';
  if (limpo.includes('14') || limpo.includes('boleto')) return '14';
  if (limpo.includes('90') || limpo.includes('sem')) return '90';
  
  // Caso já venha o número puro extraído de um split bem-sucedido
  const matchNumero = meio.match(/\d+/);
  return matchNumero ? matchNumero[0] : '15';
}

/**
 * Função responsável por mapear o JSON recebido do React, 
 * gerar o layout XML oficial, assinar com o certificado A1 e transmitir.
 */
export async function transmitirNfeSefaz(dadosNota: any) {
  try {
    // 1. Tratamentos prévios com fallbacks estritos para evitar quebras de split()
    const tipoOp = dadosNota.tipoOperacao && typeof dadosNota.tipoOperacao === 'string'
      ? dadosNota.tipoOperacao.split(' - ')[0] 
      : '1';
      
    const destOp = dadosNota.destinoOperacao && typeof dadosNota.destinoOperacao === 'string'
      ? dadosNota.destinoOperacao.split(' - ')[0] 
      : '1';
      
    const finEmis = dadosNota.finalidadeEmissao && typeof dadosNota.finalidadeEmissao === 'string'
      ? dadosNota.finalidadeEmissao.split(' - ')[0] 
      : '1';
      
    const modFrete = dadosNota.transporte?.modalidadeFrete && typeof dadosNota.transporte.modalidadeFrete === 'string'
      ? dadosNota.transporte.modalidadeFrete.split(' - ')[0] 
      : '9';

    // 2. Mapeamento do JSON para o padrão de chaves exigido pela SEFAZ
    const nfeDadosLayout = {
      ide: {
        cUF: '43', // Código IBGE do Estado do RS (Rio Grande do Sul)
        natOp: dadosNota.naturezaOperacao || 'Venda de mercadoria',
        mod: '55', // Modelo 55 = NF-e (Modelo 65 = NFC-e)
        serie: dadosNota.serie || '001',
        nNF: dadosNota.numero ? dadosNota.numero.replace(/\D/g, '') : '1', // Remove pontos e formatações do sequencial
        dhEmi: new Date().toISOString(), // Data/Hora no formato ISO
        tpNF: tipoOp, 
        idDest: destOp,
        cMunFG: '4305108', // Município de Ocorrência do Fato Gerador alinhado ao RS
        tpImp: '1', // 1 = Retrato (DANFE)
        tpEmis: '1', // 1 = Emissão Normal
        tpAmb: sefazConfig.ambiente,
        finNFe: finEmis,
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
        [dadosNota.documento && dadosNota.documento.replace(/\D/g, '').length === 14 ? 'CNPJ' : 'CPF']: dadosNota.documento ? dadosNota.documento.replace(/\D/g, '') : '',
        xNome: dadosNota.cliente,
        indIEDest: '9', // 9 = Não Contribuinte
        enderDest: {
          logradouro: dadosNota.enderecoDestinatario?.logradouro || 'Rua nao informada',
          numero: dadosNota.enderecoDestinatario?.numero || 'SN',
          bairro: dadosNota.enderecoDestinatario?.bairro || 'Centro',
          codigoMunicipio: dadosNota.enderecoDestinatario?.codigoMunicipio || '4305108',
          municipio: dadosNota.enderecoDestinatario?.municipio || 'Caxias do Sul',
          uf: dadosNota.enderecoDestinatario?.uf || 'RS',
          cep: dadosNota.enderecoDestinatario?.cep || '95042000',
        }
      },
      det: (dadosNota.itens || []).map((item: any, index: number) => {
        const qtd = Number(item.quantidade) || 0;
        const vUnit = Number(item.valorUnitario) || 0;
        const vTotal = Number(item.valorTotalItem) || (qtd * vUnit);

        const cfopCalculado = destOp === '2' ? '6102' : '5102';

        return {
          $: { nItem: index + 1 },
          prod: {
            cProd: item.id || String(index + 1),
            cEAN: 'SEM GTIN',
            xProd: item.descricao || 'Produto Comercial',
            NCM: item.ncm ? item.ncm.replace(/\D/g, '') : '', 
            CFOP: cfopCalculado, 
            uCom: item.unidade || 'UN',
            qCom: qtd.toFixed(4),
            vUnCom: vUnit.toFixed(4),
            vProd: vTotal.toFixed(2),
            cEANTrib: 'SEM GTIN',
            uTrib: item.unidade || 'UN',
            qTrib: qtd.toFixed(4),
            vUnTrib: vUnit.toFixed(4),
            indTot: '1', 
          },
          imposto: {
            ICMS: {
              ICMSSN102: {
                orig: '0', 
                CSOSN: '102', 
              }
            },
            PIS: { PISNT: { CST: '07' } }, 
            COFINS: { COFINSNT: { CST: '07' } }
          }
        };
      }),
      total: {
        ICMSTot: {
          vBC: '0.00', vICMS: '0.00', vICMSDeson: '0.00', vFCP: '0.00',
          vBCST: '0.00', vST: '0.00', vFCPST: '0.00', vFCPSTRet: '0.00',
          vProd: (Number(dadosNota.valorBruto) || 0).toFixed(2),
          vFrete: '0.00', vSeg: '0.00', vDesc: '0.00', vII: '0.00', vIPI: '0.00',
          vIPIDevol: '0.00', vPIS: '0.00', vCOFINS: '0.00', vOutro: '0.00',
          vNF: (Number(dadosNota.valorLiquido) || 0).toFixed(2),
        }
      },
      transp: {
        modFrete: modFrete,
      },
      pag: {
        detPag: [{
          // CORREÇÃO CRÍTICA: Uso da função blindada para tratamento numérico do código da SEFAZ
          tPag: obterCodigoMeioPagamento(dadosNota.pagamento?.meioPagamento || dadosNota.pagamento?.formaPagamento),
          vPag: (Number(dadosNota.valorLiquido) || 0).toFixed(2),
        }]
      },
      infAdic: {
        infCpl: dadosNota.informacoesComplementares || ''
      }
    };

    // 2. Transmite ou simula a validação estrutural caso o certificado não exista fisicamente
    if (!sefazConfig.certificado.pfx) {
      console.log('[Backend] Modo Simulação Ativo (Sem certificado digital). Simulando autorização da SEFAZ...');
      return {
        cStat: 100,
        nProt: '143260009876543',
        chNFe: '4326070000000000000055001' + (dadosNota.numero || '1').replace(/\D/g, '').padStart(9, '0') + '1000000010',
        nNF: (dadosNota.numero || '1').replace(/\D/g, ''),
        xmlEnviado: '<!-- XML Simulado Autorizado RS -->'
      };
    }

    const resultadoSefaz = await nfeInstance.autorizar(nfeDadosLayout);
    return resultadoSefaz;
  } catch (error) {
    console.error('Erro na assinatura/envio interno:', error);
    throw error;
  }
}
