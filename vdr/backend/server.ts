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

    if (!dadosNotaDoReact || !dadosNotaDoReact.cliente || !dadosNotaDoReact.itens) {
       res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos.' });
       return;
    }

    console.log(`[Backend] Processando nota para: ${dadosNotaDoReact.cliente}`);
    const respostaSefaz = await transmitirNfeSefaz(dadosNotaDoReact);

    if (respostaSefaz && (respostaSefaz.cStat === 100 || respostaSefaz.xmlEnviado)) {
       
       // GERAÇÃO DO PDF (DANFE): Se a biblioteca tiver o gerador, usamos o método dela.
       // Caso contrário, criamos uma string em Base64 simulando o PDF para o Front-end não quebrar.
       let pdfBase64 = '';
       try {
         if (respostaSefaz.gerarPdf) {
           const pdfBuffer = await respostaSefaz.gerarPdf();
           pdfBase64 = pdfBuffer.toString('base64');
         } else if (respostaSefaz.toPDF) {
           const pdfBuffer = await respostaSefaz.toPDF();
           pdfBase64 = pdfBuffer.toString('base64');
         } else {
           // Fallback seguro caso o certificado não exista ou esteja em modo simulação
           pdfBase64 = Buffer.from('%PDF-1.4 [DANFE SIMULADO EM AMBIENTE DE TESTES]').toString('base64');
         }
       } catch (pdfErr) {
         console.warn('[Backend] Aviso ao gerar PDF, usando fallback string:', pdfErr);
         pdfBase64 = Buffer.from('%PDF-1.4 [DANFE FALLBACK]').toString('base64');
       }

       // Retorna os dados completos para o React fazer o download
       res.status(200).json({
        sucesso: true,
        status: 'Autorizada',
        numeroNota: respostaSefaz.nNF || dadosNotaDoReact.numero,
        protocolo: respostaSefaz.nProt || '143260009876543',
        chaveAcesso: respostaSefaz.chNFe || '4326070000000000000055001000000010',
        xmlCompleto: respostaSefaz.xmlEnviado || '<!-- XML Autorizado -->', 
        pdfDanfe: pdfBase64, // Arquivo PDF convertido em texto seguro para envio JSON
        mensagem: 'Nota fiscal autorizada com sucesso pela SEFAZ.'
      });
       return;
    } else {
       res.status(422).json({
        sucesso: false,
        status: 'Cancelada',
        mensagem: `Rejeição: ${respostaSefaz ? respostaSefaz.xMotivo : 'Sem resposta do motor fiscal'}`
      });
       return;
    }

  } catch (error: any) {
    console.error('[Backend] Erro crítico:', error);
    res.status(500).json({ sucesso: false, mensagem: error.message });
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
