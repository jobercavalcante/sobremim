# Prompt-base — preenchíveis para os dois modos

Copie o prompt do modo desejado, preencha os campos `[[ ]]` e use com qualquer modelo/assistente. A skill e seus arquivos de referência (design-system.md, component-library.md) devem estar disponíveis no contexto.

---

## Modo A — Criar novo site

```text
Crie uma landing page estática seguindo a skill "narrative-landing-pages"
(design-system.md + component-library.md). Regras: HTML/CSS/JS puros, zero
dependências, zero build, dark-first, 1 accent, honestidade total.

FASE 0 — CONTEXTO DO PRODUTO (antes de escrever qualquer copy)
- Materiais disponíveis do produto: [[repo/docs em [[caminho]] | PRODUCT.md | nada]]
- Se houver acesso: leia docs e código-fonte e liste os "fatos do produto"
  (features reais, vocabulário, métricas verdadeiras, tom). A página só pode
  prometer o que o produto realmente faz.
- Se não houver acesso: marque toda premissa como [[PRESSUPOSTO]] e me
  pergunte o que for crítico.

FASE 1 — ANÁLISE DE PÚBLICO (derivada do objetivo)
- Objetivo do produto (problema que resolve e para quem): [[ ]]
- Dor original (como o público resolve isso hoje sem o produto): [[ ]]
- A partir desses dois, escreva o "retrato do público" (1 parágrafo) e
  derive: tom, nível técnico dos kickers, efeitos e CTA — usando a tabela
  de perfis do SKILL.md. Se ambíguo, proponha 2 retratos e me deixe escolher.

FASE 2 — BRIEF
- Nome do produto/projeto: [[ ]]
- Promessa central (1 frase): [[ ]]
- Metáfora narrativa da página: [[ex.: transmissão de rádio, mergulho, órbita, jardim…]]
- Accent principal (hex ou família): [[ ]]
- Acento secundário (opcional, justificado): [[ ]]
- Status do app/produto: [[publicado com URL oficial | pré-lançamento → botão dormente]]
- URL oficial da store (se existir): [[ ]]
- Idiomas: [[pt-BR | + en | + outros]]
- Seções obrigatórias: [[ ]]
- Efeitos desejados (máx. 3-4 da component-library, conforme o público): [[ ]]
- Tom do texto: [[derivado do retrato do público | técnico | lúdico | editorial | confessional]]

FASE 3 — ENTREGA
1. Estrutura site/{index.html, css/styles.css, js/script.js, js/<efeito>-fx.js}
2. Tokens :root completos conforme design-system.md (adaptar accent)
3. Narrativa com começo/meio/fim + medidor de scroll na metáfora definida
4. Reveals com data-reveal + stagger; reduced-motion em CSS e JS
5. SEO completo (OG/twitter/canonical/theme-color) + a11y mínima
6. Imagem OG 1200×630 gerada conforme "Imagem OG" do design-system.md
   (og.html com os mesmos tokens → captura no navegador)
7. Bloco mobile ≤900px removendo efeitos pesados
8. QA mínimo da skill executado e reportado

NÃO: inventar prova social, features, métricas ou links de store falsos,
libs externas, frameworks, sombras pesadas, mais de 1 accent dominante.
```

---

## Modo B — Auditar / reestruturar site existente

```text
Audite e reestruture o site em [[caminho/pasta]] seguindo a skill
"narrative-landing-pages", Modo B.

FASE 1 — DIAGNÓSTICO (sem modificar nenhum arquivo)
1. Mapeie a árvore de arquivos e conte linhas; separe código autoral de
   libs/gerado. Ignore node_modules, builds e caches.
2. Leia na ordem: index.html → :root do CSS → JS principal → efeitos.
3. Pontue as 10 dimensões da auditoria (0/0.5/1) e liste anti-padrões
   com arquivo/linha.
4. Entregue o relatório no formato "Saída padrão do diagnóstico" do
   SKILL.md, separando [FATO] de [RECOMENDAÇÃO].

FASE 2 — REESTRUTURAÇÃO (após minha aprovação do plano)
- Ondas: 1) estrutura/tokens  2) componentes/responsividade/a11y/SEO
  3) movimento/efeitos.
- Preservar identidade visual atual (paleta/fontes/accent), a menos que
  eu peça para migrar ao estilo dark narrativo completo: [[sim | não]]
- Extrair valores hardcoded repetidos para :root sem alterar aparência.
- Nada de dependências novas; nenhum big-bang rewrite; cada onda termina
  com o site funcional e QA mínimo rodado.

LIMITES
- Não apagar conteúdo existente sem listar o que será removido antes.
- Não tocar em arquivos fora de [[caminho/pasta]].
- Reportar cada alteração com antes/depois resumido.
```

---

## Dicas de preenchimento

- **Contexto do produto**: quanto mais acesso você der (repo, PRODUCT.md, screenshots do app), menos `[[PRESSUPOSTO]]` o modelo precisa assumir — e mais fiel fica a copy.
- **Público**: não preencha "Público" de cabeça; forneça o objetivo e a dor e deixe o modelo derivar o retrato usando a tabela de perfis do SKILL.md.
- **Metáfora**: é o coração do estilo — se não souber, peça ao modelo 3 sugestões derivadas do produto antes de fechar o brief.
- **Efeitos**: escolha por perfil de público (tabela no SKILL.md) e combinações por tipo de site; menos é mais.
- **Modo B em site de estilo diferente**: a auditoria continua válida (SEO, a11y, performance, estrutura são universais); só a dimensão "Identidade" deve ser julgada pela consistência interna do site, não pela paleta azul-marinho.
