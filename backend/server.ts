import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { transmitirNfeSefaz } from './nfeService';

// Carrega as variáveis de ambiente (.env)
dotenv.config();

const app = express();

// ALTERAÇÃO CRÍTICA: Porta atualizada para 5001 devido ao conflito do sistema operacional
const PORT = 5001;

// Middleware essencial para ler os payloads em JSON enviados pelo React
app.use(express.json());

// CORREÇÃO CRÍTICA DO CORS: Substituição do bloco manual pela biblioteca oficial.
// Isso resolve o erro "TypeError: Failed to fetch" limpando as requisições OPTIONS (Preflight) do navegador.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

/**
 * Rota POST que recebe a nota enviada pelo componente React
 */
app.post('/v1/nfe', async (req: Request, res: Response): Promise<void> => {
  try {
    const dadosNotaDoReact = req.body;

    // Validação básica se os dados obrigatórios foram recebidos
    if (!dadosNotaDoReact || !dadosNotaDoReact.cliente || !dadosNotaDoReact.itens) {
       res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Dados da nota fiscal incompletos ou inválidos.' 
      });
       return;
    }

    console.log(`[Backend] Recebida NF-e para processamento. Cliente: ${dadosNotaDoReact.cliente}`);

    // Executa a função da Parte 1 (Geração, Assinatura e Transmissão SOAP)
    const respostaSefaz = await transmitirNfeSefaz(dadosNotaDoReact);

    /**
     * O retorno da biblioteca costuma conter o status da SEFAZ:
     * cStat === 100 significa "Autorizado o uso da NF-e" (Sucesso completo)
     */
    if (respostaSefaz && respostaSefaz.cStat === 100) {
       res.status(200).json({
        sucesso: true,
        status: 'Autorizada',
        numeroNota: respostaSefaz.nNF || dadosNotaDoReact.numero,
        protocolo: respostaSefaz.nProt,
        chaveAcesso: respostaSefaz.chNFe,
        xmlCompleto: respostaSefaz.xmlEnviado, // XML assinado e autorizado para download
        mensagem: 'Nota fiscal autorizada com sucesso pela SEFAZ.'
      });
       return;
    } else {
      // Caso a SEFAZ rejeite por algum motivo (erro de tributação, CNPJ inválido, etc.)
       res.status(422).json({
        sucesso: false,
        status: 'Cancelada',
        cStat: respostaSefaz ? respostaSefaz.cStat : 'Desconhecido',
        mensagem: `Rejeição da SEFAZ: ${respostaSefaz ? respostaSefaz.xMotivo : 'Sem resposta do motor fiscal'}`
      });
       return;
    }

   } catch (error: any) {
    console.error('[Backend] Erro crítico no processamento da NF-e:', error);
    res.status(500).json({
      sucesso: false,
      // MUDANÇA AQUI: Repassa o detalhe do erro real para o Front-end conseguir ler
      mensagem: error.message || 'Falha interna no servidor ao tentar assinar ou transmitir a nota fiscal.',
      detalhe: error.stack
    });

     return;
  }
});

// Inicialização com binding universal ('0.0.0.0') para aceitar tráfego de rede
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(` Emissor de NF-e Nativo Rodando de Verdade!`);
  console.log(` Endpoint de envio: http://localhost:${PORT}/v1/nfe`);
  console.log(`===================================================`);
});
