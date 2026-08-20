# QA integrada — Personal Landing

Data: 2026-08-20
Ambiente: Chromium local (Google Chrome), Playwright do runtime Codex, servidor estático de `tests/helpers/site-server.cjs`.

## Resultado

**Aprovado para revisão independente.** A validação foi executada na página entregue, não por inspeção de texto-fonte. Foram corrigidos oito defeitos/lacunas encontrados durante a QA: foco do salto de conteúdo, CTA direto no hero, CTA inativo do StreamNest esticado, lazy loading ausente, problema/decisão implícitos nos cases, vetor da marca divergente, colisão do rail em 1024px e crescimento contínuo do campo Sonar por retroalimentação entre Canvas e `ResizeObserver`.

## Regressões automatizadas

- Suíte completa: 57/57 testes aprovados; `tests/site.browser.test.cjs`: 4/4 testes aprovados. O contrato percorre toda a página antes de concluir a rede, coleta console e `requestfailed`, exige que toda requisição HTTP permaneça no servidor local e confirma o recurso lazy do caso ARTE.
- Cada case agora requer por teste um rótulo `Problema.`, um rótulo `Decisão.` e ao menos uma imagem; as sete imagens de case exigem `loading="lazy"` e `decoding="async"`.
- A marca de navegação e hero é o mesmo SVG local, semanticamente inspecionado com título, descrição, gradiente, telefone/código e dois nós. O favicon usa o mesmo vocabulário visual com cores explícitas; o PNG original permanece preservado como proveniência.
- O contrato também fixa o H1 aprovado, o CTA `Falar comigo`, o foco do skip link, o CTA compacto do StreamNest, navegação por Enter/Escape, no-JS, reduced motion, Canvas Sonar por breakpoint, metadados e JSON-LD.
- A estabilidade do campo Sonar é medida em navegador real após o remount desktop: sua altura não pode crescer com o Canvas. O Canvas fica fora do fluxo de layout, eliminando a retroalimentação do `ResizeObserver` sem desativar a composição.
- Os estados computados são verificados em Chromium para os três gates de aprimoramento: padrão utilizável; pending de reveal/nav/circuit; e estado ativo de conteúdo, menu e traço concluído. Asserções de traço aceitam a serialização equivalente de CSS, mas exigem semanticamente comprimento mensurável e offset não-zero/zero conforme o estado.

## Navegação, teclado e acessibilidade

- Skip link recebe foco no primeiro Tab, revela-se, leva a `#content` e transfere o foco ao `main` (`tabindex="-1"`).
- Menu mobile abre por Enter, fecha por Escape e devolve foco ao botão; possui `aria-expanded` e `aria-controls`.
- CTA Play do StreamNest não navega e comunica o estado por `role="status"`.
- Estrutura confirmada: 1 `header`, 1 `nav`, 1 `main`, 4 `article`, 1 `aside` e 1 `footer`; um único H1, H2/H3 em ordem narrativa; imagens com dimensões e texto alternativo significativo; links sem nome: 0.
- Todos os controles interativos recebem alvo mínimo de 44px e foco visível; a página não depende de JavaScript para conteúdo, navegação ou contato.
- Contraste calculado contra `#01091F`: texto `#F2F5F7` 18.09:1, texto secundário `#ABC3D9` 10.88:1, dim `#7897B6` 6.51:1, ciano `#1AE3E7` 12.44:1 e ciano forte `#00BEC7` 8.67:1. Todos excedem AA para texto normal quando usados sobre o fundo-base.

## Movimento e dispositivos

- `prefers-reduced-motion: reduce`: revelações sem transição/animação e circuito estático; Sonar reduzido desenha somente quadro estático.
- Até 900px: não há Canvas Sonar, backdrop blur ou parallax de ponteiro; menu é acionável e o layout passa a uma coluna.
- Viewports validados: 360×800, 768×1024, 1024×768 e 1440×1000; sem overflow horizontal, texto-base >=16px e H1 <=96px.

## Rede, SEO e tamanho

- Após rolagem incremental até o fim da página: zero requisições externas, zero respostas locais 4xx/5xx, zero `requestfailed` e zero erros no console.
- `title`, description, canonical relativo `/`, Open Graph, Twitter card e JSON-LD `Person` foram lidos no navegador; `robots.txt` é servido como artefato local. Nenhuma origem de deploy foi inventada. O aviso de não afiliação do StreamNest ao Telegram foi mantido como disclaimer defensivo e não como alegação de integração/parceria.
- Total de `site/`: 42 arquivos, 6.263.242 bytes. Rede, decodificação e capturas foram validadas mantendo `loading="lazy"` nas sete imagens dos cases.

## Evidência visual

As capturas são full-page, após rolagem incremental que carrega os assets lazy, confirma `complete && naturalWidth > 0`, aguarda `decode()` e torna todas as revelações visíveis. Para evitar artefatos conhecidos da captura full-page de Chromium com elementos `sticky`/`fixed`, a sessão de captura neutraliza somente a posição desses elementos; o conteúdo, CSS visual, assets, comportamento lazy e viewport são os entregues.

Reprodução: execute `.\tests\capture-qa.ps1` a partir da raiz do projeto. O capturador versionado usa o mesmo Chromium e runtime da suíte, cobre os quatro viewports, ativa `prefers-reduced-motion` e encerra os controladores temporais somente depois de carregar e decodificar o conteúdo, congelando o quadro capturado. O comportamento completo dos controladores continua coberto pelos testes de navegador.

| Viewport | Arquivo | Tamanho |
|---|---|---:|
| 360×800 | `screenshots/personal-landing-360x800.png` | 1.664.783 bytes |
| 768×1024 | `screenshots/personal-landing-768x1024.png` | 2.915.973 bytes |
| 1024×768 | `screenshots/personal-landing-1024x768.png` | 1.556.841 bytes |
| 1440×1000 | `screenshots/personal-landing-1440x1000.png` | 1.767.311 bytes |

Inspeção visual concluída nas quatro imagens: composição legível, CTA secundário presente, CTA StreamNest compacto em desktop, imagens carregadas e nenhum transbordamento horizontal. O rail lateral completo permanece visível em 1440px; em 1024px seu rótulo é ocultado, mantendo o progresso sem sobrepor o H1.

## Lighthouse

Não executado: as resoluções `Get-Command lighthouse`, `lighthouse.cmd`, `lhci` e `lhci.cmd` retornaram ausentes; também não foi localizado pacote `lighthouse` nos `node_modules` do runtime Codex, da raiz ou deste worktree. Nenhum pacote foi instalado, para preservar o requisito de zero dependências. A cobertura manual e de navegador acima substitui esta métrica nesta execução; a limitação deve ser considerada na revisão final.
