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
   🚀 JOGADOR (SPRITE)
========================= */
let jogador = document.getElementById("jogador");
jogador.innerHTML = '<img src="assets/player.png" class="sprite-player">';

/* =========================
   📱 INPUT MOBILE INVISÍVEL
========================= */
let inputMobile = document.getElementById("input-mobile");
if (!inputMobile) {
  inputMobile = document.createElement("input");
  inputMobile.type = "text";
  inputMobile.id = "input-mobile";
  inputMobile.autocapitalize = "none";
  inputMobile.autocomplete = "off";
  inputMobile.spellcheck = false;

  // invisível mas focável
  inputMobile.style.position = "fixed";
  inputMobile.style.opacity = 0;
  inputMobile.style.left = "-9999px";
  inputMobile.style.top = "0";

  document.body.appendChild(inputMobile);
}

/* =========================
   📱 FOCO AUTOMÁTICO
========================= */
function focarInput() {
  if (inputMobile) inputMobile.focus();
}
window.addEventListener("load", focarInput);
areaJogo.addEventListener("click", focarInput);
window.addEventListener("touchstart", focarInput);

/* =========================
   🔠 PROCESSAR LETRA (ÚNICO)
========================= */
function processarLetra(letra) {
  if (!jogoAtivo) return;

  const palavrasNaTela = document.querySelectorAll(".palavra-caindo");

  // Se ainda não tem palavra ativa, escolhe a primeira que combina
  if (!palavraAtiva) {
    for (const p of palavrasNaTela) {
      if (p.dataset.original && p.dataset.original.startsWith(letra)) {
        palavraAtiva = p;
        digitado = letra;
        atualizarPalavra();
        return;
      }
    }
    return;
  }

  // Já tem palavra ativa → continua nela
  digitado += letra;
  atualizarPalavra();
}

/* =========================
   ⌨️ TECLADO DESKTOP
========================= */
document.addEventListener("keydown", (event) => {
  if (!jogoAtivo) return;

  const letra = event.key.toLowerCase();
  if (!/^[a-z]$/.test(letra)) return;

  processarLetra(letra);
});

/* =========================
   📱 TECLADO MOBILE
========================= */
inputMobile.addEventListener("input", (event) => {
  if (!jogoAtivo) return;

  const letra = event.target.value.slice(-1).toLowerCase();
  event.target.value = "";

  if (!/^[a-z]$/.test(letra)) return;

  processarLetra(letra);
});

/* =========================
   ✏️ ATUALIZA PALAVRA
========================= */
function registrarLetraCorreta() {
  // marca que existe 1 hit pendente para essa palavra
  palavraAtiva.pendingHits = (palavraAtiva.pendingHits || 0) + 1;

  // dispara bala que, ao acertar, aplica o dano de verdade
  dispararTiro(palavraAtiva);
}

function registrarLetraErrada() {
  // ✅ CORRIGIDO: erro NÃO causa dano visual
  // mantém o foco e remove só a última letra errada
  digitado = digitado.slice(0, -1);

  // (opcional) mostrar mensagem, sem tremer/vermelho:
  // mensagem.textContent = "Letra errada!";
}

function atualizarPalavra() {
  if (!palavraAtiva) return;

  const original = palavraAtiva.dataset.original;

  // ainda não definimos progresso? começa em 0
  palavraAtiva.progresso = palavraAtiva.progresso ?? 0;

  // valida o que foi digitado VS original
  if (original.startsWith(digitado)) {
    // gera bala(s) somente para letras novas corretas
    while (
      palavraAtiva.progresso + (palavraAtiva.pendingHits || 0) <
      digitado.length
    ) {
      registrarLetraCorreta();
    }
  } else {
    registrarLetraErrada();
  }
}

/* =========================
   🔫 TIRO QUE SEGUE O ALVO
========================= */
function dispararTiro(alvoPalavra) {
  const tiro = document.createElement("div");
  tiro.innerHTML = '<img src="assets/bullet.png" class="sprite-bullet">';
  tiro.classList.add("tiro");
  areaJogo.appendChild(tiro);

  const areaRect = areaJogo.getBoundingClientRect();
  const jogadorRect = jogador.getBoundingClientRect();

  let x = jogadorRect.left - areaRect.left + jogadorRect.width / 2;
  let y = jogadorRect.top - areaRect.top;

  tiro.style.left = x + "px";
  tiro.style.top = y + "px";

  const intervalo = setInterval(() => {
    if (!areaJogo.contains(alvoPalavra)) {
      clearInterval(intervalo);
      tiro.remove();
      return;
    }

    const alvoRect = alvoPalavra.getBoundingClientRect();

    const tx = alvoRect.left - areaRect.left + alvoRect.width / 2;
    const ty = alvoRect.top - areaRect.top + alvoRect.height / 2;

    const dx = tx - x;
    const dy = ty - y;

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const vel = 10;

    x += (dx / dist) * vel;
    y += (dy / dist) * vel;

    tiro.style.left = x + "px";
    tiro.style.top = y + "px";

    if (dist < 14) {
      clearInterval(intervalo);
      tiro.remove();
      aplicarDanoNoAlvo(alvoPalavra);
    }
  }, 20);
}

/* =========================
   💥 APLICAR DANO (SÓ NO HIT)
========================= */
function aplicarDanoNoAlvo(palavra) {
  if (!palavra || !areaJogo.contains(palavra)) return;

  palavra.pendingHits = palavra.pendingHits || 0;
  if (palavra.pendingHits <= 0) return;

  palavra.pendingHits--;

  // ✅ Dano visual acontece AQUI (quando a bala encosta)
  palavra.classList.add("dano");
  palavra.naveInimiga?.classList.add("dano");

  setTimeout(() => {
    palavra?.classList.remove("dano");
    palavra?.naveInimiga?.classList.remove("dano");
  }, 200);

  // avança 1 letra do progresso REAL
  palavra.progresso = palavra.progresso ?? 0;
  palavra.progresso++;

  const original = palavra.dataset.original;
  palavra.textContent = original.substring(palavra.progresso);

  // completou? explode
  if (palavra.progresso >= original.length) {
    destruirInimigo(palavra);

    if (palavra === palavraAtiva) {
      palavraAtiva = null;
      digitado = "";
    }

    pontos += 10;
    pontosElemento.textContent = pontos;
  }
}

/* =========================
   💥 DESTRUIR INIMIGO
========================= */
function destruirInimigo(palavra) {
  const nave = palavra.naveInimiga;

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

  // inicia progresso/pending hits
  span.progresso = 0;
  span.pendingHits = 0;

  let startX = Math.random() * (areaJogo.clientWidth - 120);
  let startY = 0;

  span.style.left = startX + "px";
  span.style.top = startY + "px";

  const nave = document.createElement("div");
  nave.innerHTML = '<img src="assets/enemy.png" class="sprite-enemy">';
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

    const areaRect = areaJogo.getBoundingClientRect();
    const jogadorRect = jogador.getBoundingClientRect();

    const jogadorX = jogadorRect.left - areaRect.left + jogadorRect.width / 2;
    const jogadorY = jogadorRect.top - areaRect.top + jogadorRect.height / 2;

    let dx = jogadorX - startX;
    let dy = jogadorY - startY;

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const vel = 1.5;

    startX += (dx / dist) * vel;
    startY += (dy / dist) * vel;

    span.style.left = startX + "px";
    span.style.top = startY + "px";

    nave.style.left = startX + "px";
    nave.style.top = (startY - 30) + "px";

    // colisão (quando chega perto do jogador)
    if (dist < 25) {
      clearInterval(intervalo);

      span.remove();
      nave.remove();

      if (span === palavraAtiva) {
        palavraAtiva = null;
        digitado = "";
      }

      vidas--;
      vidasElemento.textContent = vidas;

      if (vidas <= 0) fimDeJogo();
    }
  }, 20);

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
  focarInput();
});

/* =========================
   ⏱ SPAWN
========================= */
setInterval(() => {
  if (jogoAtivo) criarPalavra();
}, 2000);
