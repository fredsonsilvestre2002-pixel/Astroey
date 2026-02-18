const palavras = ["gato", "casa", "jogo", "teclado", "codigo"];

const areaJogo = document.getElementById("area-jogo");
const pontosElemento = document.getElementById("pontos");
const vidasElemento = document.getElementById("vidas");
const mensagem = document.getElementById("mensagem");
const btnReiniciar = document.getElementById("btn-reiniciar");

let vidas = 3;
let pontos = 0;
let jogoAtivo = true;

let palavraAtiva = null;
let digitado = "";

/* =========================
   🚀 GARANTE JOGADOR
========================= */
let jogador = document.getElementById("jogador");
jogador.textContent = "🚀";

/* =========================
   🎮 TECLADO
========================= */
document.addEventListener("keydown", (event) => {

    if (!jogoAtivo) return;

    const letra = event.key.toLowerCase();
    if (!/^[a-z]$/.test(letra)) return;

    const palavrasNaTela = document.querySelectorAll(".palavra-caindo");

    if (!palavraAtiva) {
        palavrasNaTela.forEach(p => {
            if (p.dataset.original.startsWith(letra) && !palavraAtiva) {
                palavraAtiva = p;
                digitado = letra;
                atualizarPalavra();
            }
        });
        return;
    }

    digitado += letra;
    atualizarPalavra();
});

/* =========================
   ✏️ ATUALIZA PALAVRA
========================= */
function atualizarPalavra() {

    if (!palavraAtiva) return;

    const original = palavraAtiva.dataset.original;

    if (original.startsWith(digitado)) {

        dispararTiro(palavraAtiva);

        // 💥 efeito de dano
        palavraAtiva.classList.add("dano");
        setTimeout(() => {
            palavraAtiva?.classList.remove("dano");
        }, 150);

        // 🔥 remove letras já digitadas
        palavraAtiva.textContent =
            original.substring(digitado.length);

        if (digitado === original) {

            destruirInimigo(palavraAtiva);

            palavraAtiva = null;
            digitado = "";

            pontos += 10;
            pontosElemento.textContent = pontos;
        }

    } else {

        palavraAtiva.classList.add("dano");

        setTimeout(() => {
            palavraAtiva?.classList.remove("dano");
        }, 200);

        digitado = digitado.slice(0, -1);
    }
}

/* =========================
   🔫 TIRO QUE SEGUE O ALVO
========================= */
function dispararTiro(alvo) {

    const tiro = document.createElement("div");
    tiro.textContent = "🔹";
    tiro.classList.add("tiro");

    areaJogo.appendChild(tiro);

    const areaRect = areaJogo.getBoundingClientRect();
    const jogadorRect = jogador.getBoundingClientRect();

    let startX = jogadorRect.left - areaRect.left + jogadorRect.width / 2;
    let startY = jogadorRect.top - areaRect.top;

    tiro.style.left = startX + "px";
    tiro.style.top = startY + "px";

    const intervalo = setInterval(() => {

        if (!areaJogo.contains(alvo)) {
            clearInterval(intervalo);
            tiro.remove();
            return;
        }

        const alvoRect = alvo.getBoundingClientRect();

        const targetX = alvoRect.left - areaRect.left + alvoRect.width / 2;
        const targetY = alvoRect.top - areaRect.top + alvoRect.height / 2;

        let dx = targetX - startX;
        let dy = targetY - startY;

        const distancia = Math.sqrt(dx * dx + dy * dy);

        const velocidade = 10;

        startX += (dx / distancia) * velocidade;
        startY += (dy / distancia) * velocidade;

        tiro.style.left = startX + "px";
        tiro.style.top = startY + "px";

        if (distancia < 15) {
            clearInterval(intervalo);
            tiro.remove();
        }

    }, 20);
}

/* =========================
   💥 DESTRUIR INIMIGO
========================= */
function destruirInimigo(palavra) {

    const nave = palavra.naveInimiga;

    // para o movimento dela
    clearInterval(palavra.intervalo);

    palavra.classList.add("explodir");
    nave.classList.add("explodir");

    setTimeout(() => {
        palavra.remove();
        nave.remove();
    }, 400);
}

/* =========================
   👾 CRIAR PALAVRA + NAVE
========================= */
function criarPalavra() {

    const texto = palavras[Math.floor(Math.random() * palavras.length)];

    const span = document.createElement("span");
    span.classList.add("palavra-caindo");
    span.dataset.original = texto;
    span.textContent = texto;

    let startX = Math.random() * (areaJogo.clientWidth - 100);
    let startY = 0;

    span.style.left = startX + "px";
    span.style.top = startY + "px";

    const nave = document.createElement("div");
    nave.textContent = "🛸";
    nave.classList.add("nave-inimiga");

    nave.style.left = startX + "px";
    nave.style.top = "-30px";

    span.naveInimiga = nave;

    areaJogo.appendChild(span);
    areaJogo.appendChild(nave);

    const intervalo = setInterval(() => {

        if (!jogoAtivo || !areaJogo.contains(span)) {
            clearInterval(intervalo);
            return;
        }

        const jogadorRect = jogador.getBoundingClientRect();
        const spanRect = span.getBoundingClientRect();

        let dx = jogadorRect.left - spanRect.left;
        let dy = jogadorRect.top - spanRect.top;

        const distancia = Math.sqrt(dx * dx + dy * dy);

        const velocidade = 1.5;

        startX += (dx / distancia) * velocidade;
        startY += (dy / distancia) * velocidade;

        span.style.left = startX + "px";
        span.style.top = startY + "px";

        nave.style.left = startX + "px";
        nave.style.top = startY - 30 + "px";

        // colisão REAL usando bounding box
        if (
            spanRect.bottom >= jogadorRect.top &&
            spanRect.right >= jogadorRect.left &&
            spanRect.left <= jogadorRect.right
        ) {

            clearInterval(intervalo);

            span.remove();
            nave.remove();

            vidas--;
            vidasElemento.textContent = vidas;

            if (vidas <= 0) fimDeJogo();
        }

    }, 20);

    // salva intervalo dentro da palavra
    span.intervalo = intervalo;
}

/* =========================
   💀 GAME OVER
========================= */
function fimDeJogo() {
    jogoAtivo = false;
    mensagem.textContent = "GAME OVER";
    btnReiniciar.style.display = "inline-block";
}

/* =========================
   🔄 REINICIAR
========================= */
btnReiniciar.addEventListener("click", () => {

    vidas = 3;
    pontos = 0;
    jogoAtivo = true;

    vidasElemento.textContent = vidas;
    pontosElemento.textContent = pontos;
    mensagem.textContent = "";

    palavraAtiva = null;
    digitado = "";

    document.querySelectorAll(".palavra-caindo").forEach(e => e.remove());
    document.querySelectorAll(".nave-inimiga").forEach(e => e.remove());
    document.querySelectorAll(".tiro").forEach(e => e.remove());

    btnReiniciar.style.display = "none";
});

/* =========================
   ⏱ SPAWN
========================= */
setInterval(() => {
    if (jogoAtivo) criarPalavra();
}, 2000);
