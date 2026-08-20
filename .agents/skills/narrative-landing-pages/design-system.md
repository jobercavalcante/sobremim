# Design System — tokens, tipografia e componentes

Todos os valores abaixo são o modelo consolidado dos 3 projetos. Para um novo projeto, **substitua apenas o accent** (e derivados) mantendo a estrutura de tokens.

## Tokens base (`:root`)

```css
:root {
  /* Fundos — 4 camadas tonais (nunca preto puro) */
  --ink: #06080f;
  --ink-soft: #0a101c;
  --surface: #0f1724;
  --surface-2: #152036;

  /* Accent em rampa: vibrante → saturado → escuro */
  --accent: #00e5ff;
  --accent-strong: #00b8d4;
  --accent-dark: #006570;

  /* Texto — 3 níveis */
  --text: #e8f4ff;
  --muted: #a8c3df;
  --dim: #8fabc7;

  /* Linhas translúcidas de accent */
  --line: rgba(0, 229, 255, .12);
  --line-strong: rgba(0, 229, 255, .25);

  --radius-sm: 12px;
  --radius: 16px;

  --font-title: "Space Grotesk", system-ui, sans-serif;
  --font-body:  "Manrope", system-ui, sans-serif;
  --font-mono:  "JetBrains Mono", ui-monospace, monospace;
}

html, body { overflow-x: clip; }  /* clip, não hidden */
```

### Acents já usados (escolher 1 por projeto)

| Projeto | Accent | Hex | Contexto |
|---|---|---|---|
| StreamNest | ciano broadcast | `#00e5ff` | transmissão, rádio |
| Sonar Promos | azul-sonar + ouro | `#68c5ff` / `#ffcf48` | oceano, recompensa |
| ARTEconectaMENTE | gradiente cósmico | `#ff6a00→#c21875→#7a3db8→#020266` | espaço, criatividade |

Regra: fundo sempre azul-marinho profundo (matiz 215–230°), nunca cinza neutro.

## Tipografia fluida

```css
h1 { font: 700 clamp(2.6rem, 6.5vw, 4.6rem)/1.05 var(--font-title); letter-spacing: -.03em; text-wrap: balance; }
h2 { font: 700 clamp(1.9rem, 4.5vw, 3.1rem)/1.1 var(--font-title); letter-spacing: -.02em; text-wrap: balance; }
h3 { font: 600 clamp(1.25rem, 2.5vw, 1.6rem)/1.25 var(--font-title); }
p  { font: 400 clamp(1rem, 1.2vw, 1.125rem)/1.7 var(--font-body); color: var(--muted); }

.kicker { font: 500 .78rem/1 var(--font-mono); letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }
```

- Opção offline: `@font-face` com variable fonts locais (Montserrat/OpenSans wght). Sempre com fallback `system-ui`.
- Kickers mono frequentemente carregam tags métricas da narrativa: `−92 dBm`, `−840 m`, `órbita baixa`.

## Layout

```css
.container { width: min(1140px, 100% - 2.5rem); margin-inline: auto; }
section { padding-block: clamp(4rem, 9vw, 7rem); position: relative; }
```

- Grid de cards: `repeat(auto-fit, minmax(260px, 1fr))`, gap `1.25rem`.
- Profundidade = camadas tonais + borda `1px solid var(--line)`. Sombra só em hover e sutil.

## Componentes

### Nav fixa com blur
```css
.nav { position: fixed; inset-inline: 0; top: 0; z-index: 50;
  background: rgba(6, 8, 15, .72); backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line); }
```
Comporta: logotipo, âncoras, seletor de idioma (opcional), CTA da store compacto. Menu mobile: transformar em drawer funcional — **nunca** `display:none` sem alternativa.

### Eyebrow com live-dot
```html
<p class="eyebrow"><span class="live-dot" aria-hidden="true"></span> TRANSMISSÃO ATIVA</p>
```
```css
.eyebrow { display: inline-flex; gap: .5rem; align-items: center;
  font: 500 .75rem/1 var(--font-mono); letter-spacing: .2em; color: var(--accent);
  padding: .5rem .9rem; border: 1px solid var(--line-strong); border-radius: 999px; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
  animation: pulse 2.2s ease-in-out infinite; }
```

### Section-head com kicker métrico
```html
<header class="section-head">
  <p class="kicker">−420 m · ZONA ABISSAL</p>
  <h2>Título da seção</h2>
  <p class="lead">Frase de apoio curta.</p>
</header>
```

### Palavras fantasma (ghost words)
```css
.ghost { position: absolute; font: 800 clamp(4.5rem, 14vw, 10rem)/1 var(--font-title);
  color: rgba(0, 229, 255, .06); user-select: none; pointer-events: none; white-space: nowrap; }
```
Posicionar atrás do hero ou entre seções, sempre `aria-hidden="true"`.

### Botão de store dormente (app não publicado)
```html
<a class="store-btn is-dormant" role="button" aria-disabled="true">
  <svg>…</svg> <span data-i18n="cta.store">Em breve no Google Play</span>
</a>
```
- Nunca `href` inventado. Clique dispara feedback honesto (notificação/toast + micro-animação).
- Quando houver URL oficial: validar estritamente o domínio da store **e** o package id esperado antes de ativar.

### Card padrão
```css
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
  padding: 1.5rem; transition: border-color .3s, transform .3s; }
.card:hover { border-color: var(--line-strong); transform: translateY(-4px); }
```

### FAQ com `<details>`
```html
<details class="faq-item"><summary>Pergunta?</summary><p>Resposta.</p></details>
```
Funciona sem JS (progressive enhancement).

## Esqueleto base do `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[[Nome]] — [[promessa curta]]</title>
  <meta name="description" content="[[150–160 caracteres]]">
  <link rel="canonical" href="[[url]]">
  <meta property="og:title" content="[[ ]]">
  <meta property="og:description" content="[[ ]]">
  <meta property="og:image" content="[[url-1200x630]]">
  <meta property="og:image:alt" content="[[ ]]">
  <meta property="og:type" content="website">
  <meta property="og:url" content="[[url]]">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#06080f">
  <meta name="color-scheme" content="dark">
  <link rel="icon" href="favicon.svg">
  <link rel="stylesheet" href="css/styles.css">
  <script>document.documentElement.classList.replace("no-js", "js");</script>
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <!-- camadas decorativas (todas aria-hidden): ghost words, rings/nebula/canvas -->
  <header class="nav">…</header>
  <main id="conteudo">
    <section class="hero" id="hero">…</section>
    <!-- narrativa: ideia → como funciona → diferenciais → quem é → FAQ -->
    <section class="cta-final">…</section>
  </main>
  <footer class="footer">…</footer>
  <!-- medidor de scroll fixo (aside) -->
  <script src="js/script.js" defer></script>
  <script src="js/[[efeito]]-fx.js" defer></script>
</body>
</html>
```

## Reveal on scroll (padrão recomendado: atributo `data-reveal`)

```css
[data-reveal] { opacity: 0; transform: translateY(24px);
  transition: opacity .7s ease, transform .7s ease;
  transition-delay: var(--reveal-delay, 0ms); }
[data-reveal].is-visible { opacity: 1; transform: none; }
```
```js
(() => {
  const els = document.querySelectorAll("[data-reveal]");
  els.forEach((el, i) => el.style.setProperty("--reveal-delay", `${(i % 4) * 70}ms`));
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-visible")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  els.forEach(el => io.observe(el));
  setTimeout(() => els.forEach(el => el.classList.add("is-visible")), 2000); // fallback
})();
```
Vantagens sobre lista de seletores em JS: markup declara o que revela, stagger por linha/grupo, unobserve após revelar.

## Reduced motion (copiar e adaptar a lista)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important; }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
}
```
No JS: checar `matchMedia("(prefers-reduced-motion: reduce)")` antes de iniciar canvas/efeitos e desenhar no máximo 1 frame estático.

## Performance mobile (bloco obrigatório ≤900px)

```css
@media (max-width: 900px) {
  .nav { backdrop-filter: none; }
  .rings, .nebula, body::before { display: none; } /* camadas pesadas */
  .ghost { font-size: clamp(3rem, 18vw, 5rem); }
}
```
Em JS: `pointer: coarse` ou `hardwareConcurrency <= 4` → reduzir população de partículas pela metade; DPR máximo 1.5 em touch.

## SEO (checklist do `<head>`)

title descritivo · meta description · canonical · `og:title/description/image/image:alt/type/url` (imagem 1200×630) · `twitter:card=summary_large_image` · `theme-color` = `--ink` · `color-scheme: dark` · `lang="pt-BR"` · favicon.

## Imagem OG (1200×630) — como gerar

### Regras visuais (mesmo DNA do site)

- Fundo `--ink`/`--ink-soft` com o accent do projeto em detalhe mínimo (ring, gradiente radial ≤15% de opacidade, ghost word a 6%).
- Nome do produto em `--font-title` (~80–96px, ls −0.03em) + promessa de 1 frase em `--muted` (~32px).
- Kicker mono da metáfora acima do título; margens generosas (≥80px); texto dentro da zona central segura (redes cortam bordas).
- Sem fotos, emojis ou sombras pesadas; nada de informação além de título + frase.

### Método recomendado: HTML/CSS puro (zero dependências)

1. Criar `site/og.html` reutilizando os tokens do site:

```html
<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><title>OG</title>
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { display: flex; flex-direction: column; justify-content: center; gap: 24px;
    padding: 80px; background:
      radial-gradient(60% 80% at 78% 18%, rgba(0, 229, 255, .14), transparent 60%),
      #06080f;
    font-family: "Space Grotesk", system-ui, sans-serif; color: #e8f4ff; }
  .kicker { font: 500 22px/1 "JetBrains Mono", ui-monospace, monospace;
    letter-spacing: .2em; text-transform: uppercase; color: #00e5ff; }
  h1 { font-size: 88px; line-height: 1.02; letter-spacing: -.03em; }
  p  { font: 400 32px/1.4 "Manrope", system-ui, sans-serif; color: #a8c3df; max-width: 820px; }
</style></head>
<body>
  <span class="kicker">[[kicker da metáfora]]</span>
  <h1>[[Nome do produto]]</h1>
  <p>[[promessa em 1 frase]]</p>
</body></html>
```

2. Abrir no navegador com viewport 1200×630 (DevTools → device/resolução fixa) e capturar a tela → salvar como `site/og-1200x630.png`.
3. Referenciar com URL absoluta no `og:image` e preencher `og:image:alt`.

### Alternativas

- **SVG**: desenhar a arte em SVG 1200×630 com as mesmas cores e capturar no navegador — bom para rings/radar geométricos.
- **Geração por IA**: usar apenas para o fundo atmosférico (dark, matiz 215–230°, accent), depois sobrepor a tipografia no método HTML acima — nunca aceitar texto renderizado pelo gerador (tipografia sai quebrada).

### Validação

1200×630 exato · PNG/JPG idealmente < 1 MB · `og:image` com URL absoluta · `og:image:alt` preenchido · testar preview (WhatsApp/Telegram/X) antes de publicar.

## Acessibilidade mínima

skip-link · `aria-label` em controles icônicos · `alt` real em imagens · contraste ≥ 4.5:1 no corpo · `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` · FAQ/details nativos · `aria-hidden` em decoração.
