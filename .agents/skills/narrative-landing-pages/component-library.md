# Biblioteca de ideias — 13 efeitos com receita de reprodução

Cada item: **Origem** (projeto-fonte) · **Problema que resolve** · **Como funciona** · **Quando usar** · **Como reproduzir**. Escolha no máximo 3–4 por página (ver tabela de combinações no SKILL.md).

---

## 1. Medidor de progresso de scroll (metáfora narrativa)
- **Origem**: StreamNest (medidor de sinal −92→−34 dBm → LOCK) e Sonar Promos (profundidade 0→−850 m).
- **Problema**: dar sensação de progresso e transformar scroll em narrativa, não só rolagem.
- **Como funciona**: handler de scroll passivo com throttle via `requestAnimationFrame`; progresso `p = scrollY / (docHeight − winHeight)` alimenta uma variável CSS ou texto de um widget fixo (barra lateral / HUD). O valor exibido é convertido na unidade da metáfora (dBm, metros, % de órbita).
- **Quando usar**: sempre que a página tiver jornada com começo/meio/fim. É o efeito-assinatura do DNA.
- **Como reproduzir**:
  1. Definir unidade e intervalo da metáfora (ex.: metros: 0→−850).
  2. Widget fixo à direita (desktop) com rótulo mono e barra vertical.
  3. `scroll` listener `{ passive: true }` + flag rAF; atualizar `textContent` e `height/transform` da barra.
  4. Estado final especial quando `p > 0.985` (ex.: "LOCK", "superfície").
  5. Ocultar em mobile ou simplificar para barra fina no topo.

## 2. Título com efeito scramble/decode
- **Origem**: StreamNest (`broadcast-fx.js`, trecho do h1).
- **Problema**: hero estático; dar vida ao título sem vídeo ou gif.
- **Como funciona**: os caracteres do alvo são trocados por glifos aleatórios (pool tipo `!<>-_\\/[]{}—=+*^?#`) e "resolvem" da esquerda para a direita em ~60–90 frames. Um `setTimeout` (1600 ms) garante que o texto final sempre apareça mesmo se o rAF falhar.
- **Quando usar**: uma única palavra/destaque no hero (dentro de `<em>`), nunca em texto corrido.
- **Como reproduzir**: guardar `textContent` original; loop rAF com progresso por caractere; checar `prefers-reduced-motion` antes e pular o efeito; `aria-label` com o texto real no elemento para leitores de tela.

## 3. Cardume boids (canvas ambiente adaptativo)
- **Origem**: Sonar Promos (`fish-school.js`, 1218 linhas).
- **Problema**: fundo vivo que não trave dispositivos fracos nem distraia do conteúdo.
- **Como funciona**: agentes com 3 forças (separação, alinhamento, coesão) + corrente suave; velocidade limitada (`FORCE_CAP = 0.12`). População-alvo por perfil: 78 desktop forte / 54 médio / 44 tablet / 26 mobile (`pointer: coarse`, `hardwareConcurrency ≤ 4`, largura). Se `fpsAverage < 34`, população cai para `target × 0.6`. DPR limitado (2 desktop / 1.5 touch). Pausa em `visibilitychange`. Obstáculos coletados de `[data-school-avoid]` com debounce de 140 ms — os peixes desviam de cards.
- **Quando usar**: páginas lúdicas/ambientais; quando o fundo deve "reagir" ao layout.
- **Como reproduzir**: canvas fullscreen `position:fixed; z-index:-1`; classe `Fish` com update/draw; medir FPS em janela móvel (30 frames); respeitar reduced-motion desenhando 1 frame estático; expor API mínima no `window` (ex.: `SonarSchool.leap()` para eventos pontuais).

## 4. Notificações simuladas estilo Material You
- **Origem**: Sonar Promos (`notify.js` + `notify.css`).
- **Problema**: demonstrar um app de notificações sem o app instalado.
- **Como funciona**: fila de notificações fictícias disparadas por visibilidade de seções (IntersectionObserver), com limites rígidos: `MAX_AUTO_PER_VISIT = 2`, `COOLDOWN_MS = 5000`, `DRIP_MS = 45000`; swipe-dismiss com `SWIPE_RATIO = 0.35`; toggle persistido em `localStorage`; param quando a aba está oculta ou após `IDLE_STOP` descartes.
- **Quando usar**: apenas quando a demo é o centro da narrativa — e sempre rotulada como simulação/ilustrativa.
- **Como reproduzir**: container fixo canto superior; card com ícone + título + corpo + hora; animar entrada com `transform/opacity`; arrastar = `pointerdown/move/up` transladando o card e removendo no threshold; todas as constantes de ritmo no topo do arquivo para ajuste fácil.

## 5. Escopo de sonar / radar (SVG + CSS)
- **Origem**: Sonar Promos (`sonar-scope.js`, hero).
- **Problema**: visual técnico impressionante sem canvas pesado no hero.
- **Como funciona**: círculos concêntricos em SVG + varredura cônica (`conic-gradient` girando via keyframe 6–10 s) + blips que piscam com `animation-delay` escalonado; o mouse pode influenciar rotação leve.
- **Quando usar**: hero de produtos "técnicos" (sinal, busca, scan, sonar, radar).
- **Como reproduzir**: container circular com `aspect-ratio: 1`; 4 rings em SVG; sweep em `::before` com `conic-gradient(from var(--a), transparent, accent 10deg, transparent 30deg)` animado; blips absolutos com `pulse` + delays.

## 6. Palavras fantasma (ghost words)
- **Origem**: StreamNest (hero e divisores de seção).
- **Problema**: preencher espaço com atmosfera tipográfica sem imagens.
- **Como funciona**: palavras gigantes (clamp 4.5–10 rem) em accent a ~6% de opacidade, absolutas atrás do conteúdo, `aria-hidden`, `user-select:none`, `pointer-events:none`.
- **Quando usar**: hero e transições entre seções; 1–3 por página.
- **Como reproduzir**: CSS no design-system.md; escolher palavras-tema da narrativa; reduzir drasticamente em ≤900px.

## 7. Ticker de telemetria
- **Origem**: StreamNest (faixa de status sob o hero).
- **Problema**: comunicar "sistema vivo" e dados de credibilidade técnica em pouco espaço.
- **Como funciona**: linha mono com itens separados por `·` ou `|` (latência, uptime, versão, região), atualizada por intervalo lento (2–5 s) com variação mínima nos números; marquee opcional via `animation: translateX` duplicando conteúdo.
- **Quando usar**: produtos técnicos; logo abaixo do hero.
- **Como reproduzir**: flex com gap, fonte mono, cor `--dim`; duplicar a lista para loop infinito; pausar em reduced-motion.

## 8. Phone mockup em CSS puro
- **Origem**: StreamNest (hero).
- **Problema**: mostrar o app sem screenshot/render 3D.
- **Como funciona**: div com proporção ~9:19, border-radius grande (2.2rem), borda 2–3px `--line-strong`, sombra sutil; tela interna reproduz UI do app em miniatura com divs; leve `rotateY/rotateX` estático opcional.
- **Quando usar**: hero de app mobile quando não há asset oficial.
- **Como reproduzir**: largura `clamp(220px, 26vw, 300px)`; `notch` em pseudo-elemento; conteúdo da tela com os mesmos tokens do site.

## 9. Atmosfera cósmica em CSS puro (UFO + nebula + meteoros)
- **Origem**: ARTEconectaMENTE (`styles.css` + `main.js`).
- **Problema**: identidade visual rica sem nenhuma imagem.
- **Como funciona**: fundo com múltiplos `radial-gradient` (nebulosas), estrelas em box-shadow ou gradients repetidos, UFO em divs/emoji descendo conforme o scroll via variável CSS (`--scroll-p` no `:root`), meteoros como spans com 9 variáveis CSS (posição, ângulo, duração) disparados em "chuvas" com cleanup em `animationend`. Lua construída com ~15 radial-gradients empilhados e fases via offset de sombra.
- **Quando usar**: sites editoriais/autorais com tema espacial ou onírico.
- **Como reproduzir**: tudo decorativo em camadas `position:fixed`/absolute com `z-index:-1` e `aria-hidden`; em mobile (≤900px) remover nebula/twinkle/backdrop-filter; meteoros: criar elemento, setar vars, `animationend → remove()`.

## 10. Tilt 3D + glow que segue o mouse
- **Origem**: ARTEconectaMENTE (cards e livro 3D).
- **Problema**: micro-interação de profundidade sem lib (vanilla-tilt).
- **Como funciona**: `pointermove` no card calcula `rotateX/rotateY` (±8°) via `transform: perspective(900px)`; posição do brilho alimenta `--mouse-x/--mouse-y` usadas num `radial-gradient` do overlay. Lerp (0.12) suaviza; reset em `pointerleave`.
- **Quando usar**: 1–2 elementos-destaque (card principal, livro, logo). Ignorar em `pointer: coarse`.
- **Como reproduzir**: guardar `raf` por elemento; nunca aplicar tilt em muitos elementos simultaneamente; desativar em touch e reduced-motion.

## 11. Botão de store dormente com validação estrita
- **Origem**: StreamNest e Sonar Promos.
- **Problema**: apps não publicados: o site não pode mentir nem quebrar.
- **Como funciona**: botão sem `href` ativo; clique dispara feedback honesto ("em breve" + notificação/animação). Quando a URL existir, validar: `origin === "https://play.google.com"`, pathname `/store/apps/details` e `searchParams.get("id")` igual ao package id esperado. Só então o botão vira link real.
- **Quando usar**: todo CTA de app pré-lançamento.
- **Como reproduzir**: função `getOfficialStoreUrl()` centralizada; estado `is-dormant` visível mas não enganoso; preferência salva em `localStorage` se o usuário pedir aviso de lançamento.

## 12. i18n sem build (`data-i18n`)
- **Origem**: StreamNest (PT/EN/HI/RU).
- **Problema**: multi-idioma sem framework/bundler.
- **Como funciona**: HTML-fonte em pt-BR; cada nó traduzível recebe `data-i18n` (texto), `data-i18n-html` (marcação) ou `data-i18n-aria`. Ao trocar idioma: capturar o PT original do DOM antes de mutar, `fetch("lang/en.json")` sob demanda, aplicar dicionário, persistir escolha (`localStorage`). Fallback de idiomas raros → en.
- **Quando usar**: site com audiência internacional real; senão manter pt-BR único.
- **Como reproduzir**: script dedicado `i18n.js`; dicionários JSON planos `{ "chave": "texto" }`; seletor de idioma na nav com persistência; nunca traduzir por máquina sem revisão no mínimo em EN.

## 13. Easter egg com flag explícita
- **Origem**: ARTEconectaMENTE (`abductionEnabled = false`, abdução no footer).
- **Problema**: divertir sem virar bug ou distrair.
- **Como funciona**: interação secreta (ex.: clique triplo no UFO) protegida por constante booleana no topo do JS; quando `false`, o handler existe mas não executa — documentado por comentário.
- **Quando usar**: um por site, sempre em área não crítica (footer), nunca em fluxo de conversão.
- **Como reproduzir**: `const FEATURE_EASTER_EGG = false;` no topo; animação curta com reversão automática; respeitar reduced-motion.

---

## Anti-padrões observados (não reproduzir)

1. Menu mobile `display:none` sem hamburger funcional (ARTEconectaMENTE).
2. Estilos inline `style=""` espalhados em vez de classes/utilitários.
3. SEO fraco (sem OG/canonical) — presente só nos projetos maduros.
4. Acúmulo de efeitos pesados simultâneos (escolher, não empilhar).
5. `overflow-x: hidden` no body (usar `clip`).
6. Reveal com lista de seletores hardcoded em JS (preferir `data-reveal`).
7. Sombras grandes para profundidade (preferir camadas tonais).
8. Depoimento/social proof sem rótulo ilustrativo.
