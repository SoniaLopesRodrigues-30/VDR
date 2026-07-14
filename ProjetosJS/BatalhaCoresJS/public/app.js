let coordenadaAtual = "";
let perguntaIdAtual = 1; // Simplificado: usando ID fixo para o exemplo

document.addEventListener("DOMContentLoaded", () => {
    gerarTabuleiro();
    atualizarPlacar();
});

// Gera o tabuleiro 5x5 dinamicamente na tela
function gerarTabuleiro() {
    const tabuleiro = document.getElementById("tabuleiro");
    tabuleiro.innerHTML = ""; // Limpa o tabuleiro
    const letras = ["A", "B", "C", "D", "E"];

    letras.forEach(letra => {
        for (let c = 1; c <= 5; c++) {
            const coord = `${letra}${c}`;
            const botao = document.createElement("button");
            botao.className = "celula";
            botao.id = `celula-${coord}`;
            botao.innerText = coord;
            
            // Evento de clique para abrir a pergunta
            botao.onclick = () => abrirModalPergunta(coord);
            tabuleiro.appendChild(botao);
        }
    });
}

async function abrirModalPergunta(coordenada) {
    coordenadaAtual = coordenada;
    document.getElementById("modal-coord").innerText = coordenada;
    document.getElementById("resposta-usuario").value = "";

    // Busca uma pergunta do servidor C#
    try {
        const response = await fetch(`/api/pergunta-aleatoria`);
        const pergunta = await response.json();
        
        perguntaIdAtual = pergunta.id;
        document.getElementById("texto-pergunta").innerText = pergunta.enunciado;
        document.getElementById("modal-pergunta").style.display = "flex";
    } catch (error) {
        console.error("Erro ao buscar pergunta:", error);
    }
}

async function enviarResposta() {
    const resposta = document.getElementById("resposta-usuario").value;
    
    // Dados que enviamos para o C# validar
    const dados = {
        coordenada: coordenadaAtual,
        perguntaId: perguntaIdAtual,
        respostaUsuario: resposta
    };

    try {
        const response = await fetch('/api/jogar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await response.json();
        
        // Fecha o modal de perguntas
        document.getElementById("modal-pergunta").style.display = "none";

        const botaoCelula = document.getElementById(`celula-${coordenadaAtual}`);

        if (resultado.acertou) {
            alert(`Acertou! A cor escondida era: ${resultado.cor.toUpperCase()}`);
            // Aplica as classes CSS de revelação que criamos no estilo
            botaoCelula.classList.add("revelada", resultado.cor);
            botaoCelula.disabled = true; // Desativa a célula já revelada
        } else {
            alert(`Errou a pergunta! A vez passou.`);
        }

        // Atualiza os pontos e quem joga agora
        atualizarInterface(resultado);

    } catch (error) {
        console.error("Erro ao processar jogada:", error);
    }
}

function atualizarInterface(dadosJogo) {
    document.getElementById("pontos-g1").innerText = `${dadosJogo.pontosGrupo1} pts`;
    document.getElementById("pontos-g2").innerText = `${dadosJogo.pontosGrupo2} pts`;
    document.getElementById("grupo-atual").innerText = `Grupo ${dadosJogo.turnoGrupo}`;
}

async function atualizarPlacar() {
    // Busca o estado inicial do placar
    const response = await fetch('/api/estado-jogo');
    const estado = await response.json();
    atualizarInterface(estado);
}
