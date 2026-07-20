// server.js
const express = require('express');
const app = express();
const PORT = 5200;

app.use(express.json());
app.use(express.static('public')); // Serve os arquivos da pasta public (index, css, js)

// Banco de Dados de Perguntas sobre Espiritismo
const perguntas = [
    { id: 1, enunciado: "Quem é o codificador do Espiritismo?", respostaCorreta: "Allan Kardec" },
    { id: 2, enunciado: "Em qual país nasceu o Espiritismo?", respostaCorreta: "França" },
    { id: 3, enunciado: "Qual é o primeiro livro publicado por Allan Kardec?", respostaCorreta: "O Livro dos Espíritos" },
    { id: 4, enunciado: "Em que ano foi publicado O Livro dos Espíritos?", respostaCorreta: "1857" },
    { id: 5, enunciado: "Quantos livros compõem a chamada Codificação Kardequiana?", respostaCorreta: "5" },
    { id: 6, enunciado: "Qual o nome da lei que rege a nossa evolução através de várias vidas corporais?", respostaCorreta: "Reencarnação" },
    { id: 7, enunciado: "Complete a máxima: Fora da caridade não há...", respostaCorreta: "Salvação" },
    { id: 8, enunciado: "Quem foi o médium brasileiro que psicografou o livro Nosso Lar?", respostaCorreta: "Chico Xavier" },
    { id: 9, enunciado: "Qual o nome do guia espiritual que trabalhava com Chico Xavier?", respostaCorreta: "Emmanuel" },
    { id: 10, enunciado: "Como se chama a faculdade que permite a comunicação entre os homens e os espíritos?", respostaCorreta: "Mediunidade" }
];

// Estado do Jogo na memória
let pontosGrupo1 = 0;
let pontosGrupo2 = 0;
let turnoGrupo = 1;
let tabuleiro = {};

// Inicializa o Tabuleiro estilo Batalha Naval Clássica
// Inicializa o Tabuleiro estilo Batalha Naval Clássica
function inicializarTabuleiro() {
    const letras = ["A", "B", "C", "D", "E"];
    
    // 1. Preenche tudo com branco (água)
    letras.forEach(letra => {
        for (let c = 1; c <= 5; c++) { // Garantido com 'let'
            tabuleiro[`${letra}${c}`] = { cor: "branco", revelada: false };
        }
    });

    // 2. Define a frota contínua de cores
    const frota = [
        { cor: "azul", tamanho: 4 },
        { cor: "verde", tamanho: 3 },
        { cor: "amarelo", tamanho: 2 },
        { cor: "vermelho", tamanho: 1 }
    ];

    // 3. Posiciona os blocos contínuos de cores
    frota.forEach(navio => {
        let posicionado = false;
        while (!posicionado) {
            const horizontal = Math.random() < 0.5;
            const linhaInicial = Math.floor(Math.random() * 5);
            const colInicial = Math.floor(Math.random() * 5) + 1;
            let coordenadas = [];
            let espacoLivre = true;

            for (let i = 0; i < navio.tamanho; i++) { // Garantido com 'let'
                let l = horizontal ? linhaInicial : linhaInicial + i;
                let c = horizontal ? colInicial + i : colInicial;

                if (l >= 5 || c > 5) { espacoLivre = false; break; }

                let coordTeste = `${letras[l]}${c}`;
                if (tabuleiro[coordTeste].cor !== "branco") { espacoLivre = false; break; }
                
                coordenadas.push(coordTeste);
            }

            if (espacoLivre) {
                coordenadas.forEach(coord => { tabuleiro[coord].cor = navio.cor; });
                posicionado = true;
            }
        }
    });
}


// Executa a montagem do mapa de cores
inicializarTabuleiro();

// Rota 1: Envia o estado atual do placar
app.get('/api/estado-jogo', (req, res) => {
    res.json({ pontosGrupo1, pontosGrupo2, turnoGrupo });
});

// Rota 2: Sorteia uma pergunta aleatória
app.get('/api/pergunta-aleatoria', (req, res) => {
    const perguntaSorteada = perguntas[Math.floor(Math.random() * perguntas.length)];
    res.json(perguntaSorteada);
});

// Rota 3: Processa a resposta enviada pela tela
app.post('/api/jogar', (req, res) => {
    const { coordenada, perguntaId, respostaUsuario } = req.body;
    const pergunta = perguntas.find(p => p.id === perguntaId);
    
    const corNaCoordenada = tabuleiro[coordenada] ? tabuleiro[coordenada].cor : "branco";

    let respostaLimpaUsuario = respostaUsuario.trim().toLowerCase();
    let respostaLimpaCorreta = pergunta.respostaCorreta.trim().toLowerCase();

    // Validador inteligente (aceita respostas parciais por aproximação)
    if (respostaLimpaCorreta.includes(respostaLimpaUsuario) && respostaLimpaUsuario !== "") {
        if (tabuleiro[coordenada]) {
            tabuleiro[coordenada].revelada = true;
            
            // Calcula pontuação baseada na cor
            let pontos = { "azul": 10, "verde": 20, "amarelo": 30, "vermelho": -10 }[corNaCoordenada] || 0;
            if (turnoGrupo === 1) pontosGrupo1 += pontos;
            else pontosGrupo2 += pontos;
        }
        turnoGrupo = turnoGrupo === 1 ? 2 : 1;
        return res.json({ acertou: true, cor: corNaCoordenada, pontosGrupo1, pontosGrupo2, turnoGrupo });
    }

    turnoGrupo = turnoGrupo === 1 ? 2 : 1;
    res.json({ acertou: false, cor: corNaCoordenada, pontosGrupo1, pontosGrupo2, turnoGrupo });
});

// Liga o servidor na porta correspondente
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
