import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { transmitirNfeSefaz } from './nfeService';

// Carrega as variáveis de ambiente (.env)
dotenv.config();

const app = express();
const PORT = 5000;



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Responde imediatamente à requisição de checagem do navegador (Preflight)
  if (req.method === 'OPTIONS') {
     res.sendStatus(200);
     return;
  }
  next();
});
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
    if (respostaSefaz.cStat === 100) {
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
        cStat: respostaSefaz.cStat,
        mensagem: `Rejeição da SEFAZ: ${respostaSefaz.xMotivo}`
      });
       return;
    }

  } catch (error: any) {
    console.error('[Backend] Erro crítico no processamento da NF-e:', error);
     res.status(500).json({
      sucesso: false,
      mensagem: 'Falha interna no servidor ao tentar assinar ou transmitir a nota fiscal.',
      detalhe: error.message
    });
     return;
  }
});

// Inicializa o servidor HTTP na porta definida
app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`===================================================`);
  console.log(` Emissor de NF-e Nativo Rodando de Verdade!`);
  console.log(` Endpoint de envio: http://localhost:${PORT}/v1/nfe`);
  console.log(`===================================================`);
});
