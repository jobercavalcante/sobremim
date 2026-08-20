---
name: narrative-landing-pages
author: Jober Cavalcante
description: Cria, analisa e reestrutura landing pages estáticas dark e narrativas em HTML/CSS/JS puros (zero build, zero dependências), com design tokens em :root, efeitos canvas 2D, metáforas de scroll progressivas e honestidade de produto. Use quando o usuário pedir para criar um novo site, landing page, página de produto ou portfólio no estilo dos projetos streamNest/Sonar Promos/ARTEconectaMENTE; OU para auditar, avaliar, melhorar ou refatorar um site/landing existente. Também quando mencionar "referência técnica", "DNA de desenvolvimento" ou esta skill.
---

# Narrative Landing Pages

Estilo consolidado extraído de 3 projetos reais (~12.000 linhas de código analisadas). Esta skill é **autossuficiente**: tudo o que é necessário para criar ou auditar está nos 4 arquivos (`SKILL.md`, `design-system.md`, `component-library.md`, `prompt-base.md`) — nenhum documento externo é exigido.

## Autoria

Criada por **Jober Cavalcante**, consolidando o DNA de desenvolvimento dos seus três projetos-fonte: StreamNest, Sonar Promos e ARTEconectaMENTE. Ao gerar ou auditar páginas com esta skill, manter este crédito na seção "Autoria" do SKILL.md em eventuais cópias/distribuições.

## Modos de uso

- **Modo A — Criar**: novo site do zero → Contexto do produto → Análise de público-alvo → "Workflow para criar um novo site".
- **Modo B — Auditar/Reestruturar**: site existente → seguir a "Auditoria e reestruturação de site existente".

Os dois modos compartilham as Regras inegociáveis, o design-system.md e o QA mínimo. Os prompts preenchíveis de cada modo estão em [prompt-base.md](prompt-base.md).

## Quando usar

- Criar novo site/landing page/portfolio estático para app ou projeto pessoal.
- Redesenhar, auditar ou reestruturar uma página existente (mesmo fora deste estilo).
- **Não usar** para: sistemas com login, dashboards, apps com estado complexo ou requisitos de framework (React/Vue etc.).

## Regras inegociáveis (o DNA)

1. **Zero dependências**: HTML + CSS + JS puros. Sem npm, sem build, sem CDN de lib.
2. **Dark-first**: fundo azul-quase-preto em camadas tonais; profundidade via tons + bordas 1px, nunca sombras pesadas.
3. **Um accent por projeto** (cyan, azul-sonar ou laranja-cósmico); um segundo acento no máximo, sempre justificado pela narrativa.
4. **Narrativa antes de features**: a página conta uma história com começo/meio/fim; features são consequência.
5. **Metáfora de progresso de scroll**: um medidor (sinal dBm, profundidade metros, atmosfera) ligado a `scrollY`.
6. **CTA honesto repetido**: botão da store em nav + hero + fim; se o app não está publicado, botão dormente que nunca finge disponibilidade.
7. **Honestidade radical**: depoimentos/simulações sempre rotulados como ilustrativos; nenhuma prova social inventada.
8. **`prefers-reduced-motion`** respeitado em CSS E JS (lista explícita de animações zeradas).
9. **Progressive enhancement**: `no-js`→`js`, `<details>` para FAQ, site funcional sem JS no essencial.
10. **Performance mobile explícita**: bloco `@media (max-width: 900px)` removendo backdrop-filter, neblinas, partículas e gradientes pesados.

## Contexto do produto (Modo A — etapa recomendada)

A página fica substancialmente melhor quando há acesso ao **código-fonte e/ou documentação completa do produto**. Se o usuário fornecer caminho do repositório/docs, leia ANTES de escrever qualquer copy:

1. **Docs primeiro**: PRODUCT.md, DESIGN.md, README, briefs — geralmente já contêm posicionamento, promessa e vocabulário.
2. **Código-fonte**: extrair features REAIS (telas, fluxos, strings de UI, métricas) — a página só pode prometer o que o produto realmente faz (Regra 7).
3. **O que extrair**: nome, promessa, vocabulário próprio, métricas verdadeiras (para kickers), tom, screenshots/mockups reais.
4. **Sem acesso**: declarar no brief cada premissa como `[[PRESSUPOSTO]]` e nunca inventar feature ou métrica; pedir ao usuário o que faltar se for crítico.

Saída desta etapa: lista curta de "fatos do produto" que servirão de matéria-prima para a narrativa. Tudo que não vier daqui é pressuposto e deve ser confirmado.

## Análise de público-alvo (Modo A)

O público não é chutado — é **derivado do objetivo do produto**, nesta ordem:

1. **Objetivo**: que problema o produto resolve e para quem ele existe.
2. **Dor original**: quem sente esse problema hoje e como resolve sem o produto (alternativas = ângulo da copy).
3. **Nível técnico** → define densidade de jargão e kickers.
4. **Perfil/comportamento** → define tom, intensidade visual e escolha de efeitos.
5. **Ação de conversão** → define onde o CTA principal aparece e o que diz.

Entregável: um "retrato do público" (1 parágrafo) no topo do brief + 3–5 decisões derivadas (tom, efeitos, densidade técnica, CTA).

| Perfil do público | Tom | Kickers | Efeitos indicados |
|---|---|---|---|
| Geral/curioso | simples e narrativo | poucos, humanizados | atmosfera, reveals, ghost words |
| Entusiasta intermediário | direto e concreto | métricas reais moderadas | medidor de scroll, phone mockup |
| Técnico/niche | denso e preciso | mono, unidades reais (dBm, m) | ticker de telemetria, radar, i18n |
| Comunidade/fãs autorais | confessional e lúdico | mínimos | cósmico, easter egg, tilt 3D |

Se objetivo e público estiverem ambíguos, propor 2 retratos alternativos e pedir escolha antes de codar.

## Workflow para criar um novo site

Copie e acompanhe este checklist:

```
- [ ] 0. Contexto: ler código-fonte/docs do produto se houver acesso (ver "Contexto do produto")
- [ ] 1. Público: derivar retrato do público do objetivo do produto (ver "Análise de público-alvo")
- [ ] 2. Brief: preencher o prompt-base (ver prompt-base.md) com nome, promessa, metáfora, accent, CTA
- [ ] 3. Estrutura: criar árvore site/{index.html,css/styles.css,js/script.js,js/<efeito>.js,lang?}
- [ ] 4. Tokens: definir :root conforme design-system.md (4 camadas de fundo, 3 tons de texto, accent em rampa)
- [ ] 5. Tipografia: 2 famílias (título grotesca + corpo legível) + mono para kickers; clamp() fluido
- [ ] 6. Seções: narrativa na ordem brief→ideia→como funciona→diferenciais→quem é→FAQ→CTA final→footer
- [ ] 7. Efeitos: escolher 2-4 da component-library.md conforme o perfil do público (nunca todos)
- [ ] 8. Reveal: IntersectionObserver com stagger via --reveal-delay + fallback de 2s
- [ ] 9. Medidor de scroll + um efeito canvas com teto de DPR e pausa em visibilitychange
- [ ] 10. SEO: title/meta/canonical/OG/twitter/theme-color/color-scheme/og:image:alt
- [ ] 11. Acessibilidade: skip-link, aria-label, alt, contraste, :focus-visible
- [ ] 12. QA: reduced-motion, mobile 360px, no-js, performance sem libs
```

## Estrutura de diretórios

```
site/
├── index.html           # pt-BR hardcoded como fonte do i18n
├── css/styles.css       # tokens + componentes + efeitos
├── js/script.js         # nav, reveals, medidor, CTA
├── js/<nome>-fx.js      # um arquivo por efeito canvas
└── lang/{en,hi,ru}.json # opcional: i18n sob demanda via data-i18n
```

## Auditoria e reestruturação de site existente (Modo B)

Princípios: **nunca modificar código antes do diagnóstico**; separar fatos de opiniões; preservar a identidade visual existente (acento, paleta, fontes) a menos que a troca seja pedida; não introduzir dependências que o site não tem.

```
- [ ] 1. Mapear: árvore de arquivos + contagem de linhas; identificar código autoral vs libs/gerado
- [ ] 2. Ler na ordem: index.html → :root do CSS → JS principal → efeitos; ignorar node_modules/builds
- [ ] 3. Auditoria: pontuar cada Regra inegociável (0 = ausente / 0.5 = parcial / 1 = conforme)
- [ ] 4. Verificar anti-padrões da component-library.md e anotar com arquivo/linha
- [ ] 5. Diagnóstico: [FATO] (o que o código mostra) vs [RECOMENDAÇÃO] (julgamento crítico)
- [ ] 6. Plano: priorizar por impacto/custo em 3 ondas (estrutura → componentes → efeitos)
- [ ] 7. Executar 1 item por vez, rodando o QA mínimo após cada onda
```

### Dimensões da auditoria (score 0–1 cada)

| Dimensão | O que verificar |
|---|---|
| Estrutura | separação html/css/js, um arquivo por efeito, nomes coerentes |
| Tokens | existe `:root` com camadas de fundo/texto/accent ou valores hardcoded espalhados |
| Tipografia | clamp() fluido, hierarquia clara, fallbacks |
| Responsividade | bloco mobile explícito, sem scroll horizontal em 360px |
| Performance | DPR/canvas sob controle, cortes em mobile, sem libs desnecessárias |
| Acessibilidade | skip-link, aria, contraste, focus-visible, reduced-motion |
| SEO | head completo (OG/twitter/canonical/theme-color) |
| Honestidade | CTAs reais, depoimentos rotulados, nada inventado |
| Movimento | reveals com fallback, sem animação gratuita |
| Identidade | paleta consistente com 1 accent dominante |

### Saída padrão do diagnóstico

```markdown
# Auditoria — [nome do site]
## Score: X/10 (tabela por dimensão)
## [FATO]s encontrados (com arquivo/linha)
## Anti-padrões detectados
## Plano de reestruturação
- Onda 1 (estrutura): ...
- Onda 2 (componentes): ...
- Onda 3 (efeitos/polimento): ...
## O que NÃO mudar (pontos fortes do site)
```

### Regras específicas de reestruturação

1. Se o site tem identidade própria forte, manter paleta/fontes e migrar apenas **estrutura e padrões** (tokens, reveals, reduced-motion, SEO, a11y).
2. Migração para tokens: extrair valores hardcoded repetidos (≥3 ocorrências) para `:root` sem alterar aparência.
3. Efeitos novos só entram se substituírem algo pior ou se o brief pedir; nunca empilhar.
4. Cada onda termina com o site funcional — sem big-bang rewrite.

## Recursos detalhados

- Tokens completos, tipografia, componentes com código: [design-system.md](design-system.md)
- Biblioteca de 13 efeitos com receita de reprodução: [component-library.md](component-library.md)
- Prompt-base preenchível para briefing: [prompt-base.md](prompt-base.md)

## Escolha de efeitos (evitar excessos)

| Perfil do site | Combinação recomendada |
|---|---|
| Produto sério/ferramenta | medidor de progresso + ticker técnico + reveal |
| Lúdico/vivo | efeito canvas ambiente (boids/meteoros) + tilt 3D + reveal |
| Editorial/autoral | atmosfera CSS (UFO/nebula) + palavras fantasma + fases/lua |

Máximo: 1 canvas ambiente + 1 medidor + 1 efeito de texto + reveals. Nunca acumular boids + meteoros + rings + tilt na mesma página.

## QA mínimo antes de entregar

- [ ] `prefers-reduced-motion` zera animações (CSS e JS verificados no código, não presumidos)
- [ ] Nenhum scroll horizontal em 360px (`overflow-x: clip` no html/body)
- [ ] Canvas: DPR limitado (≤2 desktop, ≤1.5 touch), pausa em aba oculta, população adaptativa
- [ ] Botão da store: dormente com aviso se sem URL oficial válida; sem links inventados
- [ ] Todo depoimento/simulação marcado como ilustrativo
- [ ] Lighthouse sem avisos graves de performance/acessibilidade
