---
name: "Jober Cavalcante — Decisões em Circuito"
description: "Uma identidade profissional que conecta sistemas contínuos a produtos ainda em validação."
colors:
  ink: "#01091F"
  ink-soft: "#021653"
  surface: "#061D46"
  surface-raised: "#0A2855"
  electric: "#1773F4"
  cyan: "#1AE3E7"
  cyan-strong: "#00BEC7"
  text: "#F2F5F7"
  muted: "#ABC3D9"
  dim: "#7897B6"
  sonar-gold: "#E5BD58"
  recanto-green: "#9BAE7F"
  arte-coral: "#EC907D"
  clear: "#00000000"
typography:
  display:
    fontFamily: "ui-rounded, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "ui-rounded, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  title:
    fontFamily: "ui-rounded, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "clamp(1rem, .96rem + .15vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, Cascadia Code, SFMono-Regular, Consolas, monospace"
    fontSize: ".78rem"
    fontWeight: 700
    lineHeight: 1.6
    letterSpacing: ".09em"
rounded:
  control: "8px"
  media: "12px"
spacing:
  xs: ".5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "3rem"
  section: "clamp(4rem, 9vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: ".65rem 1rem"
    height: "44px"
  button-case:
    backgroundColor: "{colors.clear}"
    textColor: "{colors.cyan}"
    rounded: "{rounded.control}"
    padding: ".65rem 1rem"
    height: "44px"
  navigation-link:
    backgroundColor: "{colors.clear}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    height: "44px"
---

# Design System: Jober Cavalcante — Decisões em Circuito

## Overview

**Creative North Star: “O Circuito que Só Fecha Quando Faz Sentido”**

Um campo navy profundo recebe sinais elétricos curtos e controlados. A composição é assimétrica, precisa e contínua: cada seção parece uma mudança de estado da mesma investigação, não um novo template. A marca deve parecer elétrica, investigativa e pragmática.

A interface rejeita espetáculo tecnológico e ornamentação sem função. Movimento explica progresso; imagens provam trabalho; divisores e iluminação tonal organizam profundidade. Conteúdo, navegação e contato permanecem completos antes de qualquer enhancement.

**Key Characteristics:**

- Navy em quatro profundidades, com ciano como único acento global dominante.
- Tipografia de sistema com escala fluida e contraste decidido entre títulos, corpo e estados.
- Uma linha condutora une processo, cases e contato.
- Art direction local dos cases sem contaminar a identidade pessoal.
- Mobile e movimento reduzido são estados completos, não versões degradadas.

## Colors

A paleta é fria e elétrica: o navy cria continuidade e o ciano aparece como sinal, ação e foco. Todos os valores normativos estão no frontmatter.

### Primary

- **Ciano de decisão** (`cyan`): links, foco, circuito e chamadas globais.
- **Azul elétrico** (`electric`): apoio luminoso e mudanças de escala, nunca um segundo CTA concorrente.

### Secondary

- **Ouro de match** (`sonar-gold`): apenas dentro do campo e do case Sonar Promos.
- **Verde de raiz** (`recanto-green`): apenas no case Recanto Beija-Flor.
- **Coral orbital** (`arte-coral`): apenas no case ARTEconectaMENTE.

### Neutral

- **Tinta abissal** (`ink`) e **navy de origem** (`ink-soft`): fundo e identidade de base.
- **Superfícies de profundidade** (`surface`, `surface-raised`): separação tonal curta.
- **Texto frio** (`text`), **texto secundário** (`muted`) e **telemetria discreta** (`dim`): hierarquia legível em fundo escuro.

### Named Rules

**The One Global Signal Rule.** O ciano é o único acento global; cores dos projetos nunca entram em navegação, hero ou contato.

**The No Purple SaaS Rule.** Roxo genérico, gradiente de texto e glow espalhado são proibidos.

## Typography

**Display Font:** pilha geométrica de sistema (`display`)

**Body Font:** pilha UI nativa (`body`)

**Label/Mono Font:** pilha monoespaçada de sistema (`label`)

**Character:** títulos compactos têm presença de placa técnica; o corpo permanece humano e respirado. Mono sinaliza estados e coordenadas editoriais, nunca substitui texto corrente.

### Hierarchy

- **Display** (`display`): somente a headline principal, limitada a 12ch e no máximo 6rem.
- **Headline** (`headline`): títulos de seção, com limite editorial de 18ch.
- **Title** (`title`): nomes de cases e agrupamentos técnicos.
- **Body** (`body`): leitura contínua limitada a 72ch.
- **Label** (`label`): kickers curtos e estados; caixa alta é exclusiva dessa camada.

### Named Rules

**The Problem First Rule.** A maior frase da página é uma ideia compreensível, nunca uma stack ou um cargo inflado.

**The Native Type Rule.** Nenhuma fonte remota, CDN ou arquivo sem licença verificável pode entrar na página.

## Elevation

O sistema é tonal e plano por padrão. Profundidade vem das quatro camadas navy, bordas de 1px e iluminação radial curta; sombras amplas e vidro fosco são proibidos. A única exceção é o `drop-shadow` curto do logo, que liga visualmente a marca ao azul elétrico sem criar um cartão flutuante.

### Named Rules

**The Tonal Depth Rule.** Se uma superfície precisa de sombra grande para se separar, a composição tonal está errada.

## Components

### Buttons

- **Shape:** retângulo suavemente curvo (`control`), nunca pílula.
- **Primary:** ciano sólido sobre tinta abissal (`button-primary`), usado uma vez no hero.
- **Hover / Focus:** inversão curta para texto frio e outline ciano de 3px com offset de 4px.
- **Case link:** fundo transparente e borda na cor local (`button-case`); a ação dormente de StreamNest mantém aparência inativa e cursor bloqueado.

### Cards / Containers

- **Corner Style:** somente mídia recebe o raio `media`; seções e cases não viram cartões arredondados.
- **Background:** o fundo contínuo permanece visível; bordas e iluminação local definem ambientes.
- **Shadow Strategy:** tonal e plano, conforme Elevation.
- **Border:** divisores de 1px; nenhum container combina borda com sombra ampla.
- **Internal Padding:** ritmo fluido, com seções usando `section`.

### Navigation

Navegação sticky, compacta e sem vidro. Links têm altura mínima de 44px; em mobile o painel continua visível até `.nav-ready` confirmar os handlers e só então responde a `.nav-open`.

### Decision Circuit

O circuito é SVG e permanece visível por padrão. `.circuit-ready` autoriza o progresso por `stroke-dashoffset`; reduced motion resolve imediatamente para uma representação estática completa.

### Reveal

Conteúdo é visível por padrão. `.reveal-ready` só é adicionada depois que observer e fallback estão ativos; `.is-visible` encerra a transição. Nunca usar `.js` como sinal de prontidão.

### Case Environment

Cada case usa imagem real e uma única cor contextual. Sonar pode conter Canvas limitado; StreamNest usa o ciano já global; Recanto e ARTE recebem iluminação local sem alterar a navegação ou os CTAs globais.

## Do's and Don'ts

### Do:

- **Do** começar cada decisão visual pelo problema ou pela evidência que ela ajuda a explicar.
- **Do** manter corpo em até 72ch, controles com no mínimo 44px e foco ciano de 3px.
- **Do** usar imagens locais reais, proporcionais e responsivas para provar os quatro cases.
- **Do** preservar conteúdo, navegação, circuito e contato visíveis antes de qualquer enhancement.
- **Do** desligar Canvas, blur, backdrop-filter, tilt e parallax em até 900px e em movimento reduzido quando aplicável.

### Don't:

- **Don't** usar terminal cenográfico, Matrix, uma landing SaaS roxa, um bento genérico, uma nuvem de logos ou skill bars.
- **Don't** aplicar glassmorphism global, grid decorativo, gradiente de texto, chuva de partículas ou efeitos simultâneos.
- **Don't** transformar seções em uma coleção de cartões arredondados ou combinar borda com sombra ampla.
- **Don't** inventar métricas, depoimentos, resultados, cargos, disponibilidade pública ou a alegação de “AI Expert”.
- **Don't** usar estética editorial por reflexo; o ritmo editorial existe para sustentar a narrativa de decisões.
- **Don't** repetir pequenos kickers em caixa alta como andaime visual fora das coordenadas já justificadas.
