# Personal Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, static, narrative personal landing page for Jober Cavalcante that connects his professional identity, decision process, trajectory, specializations, and four verified portfolio cases.

**Architecture:** A semantic HTML document remains fully useful without JavaScript. CSS owns the dark layered design system and responsive case environments; three focused vanilla JavaScript files own general progressive enhancement, the SVG circuit, and the bounded Sonar signal field. Node built-in tests validate pure JavaScript and binary assets; browser-facing contracts exercise the served page through workspace-provided Playwright and a verified local Chrome/Edge executable, without adding project dependencies.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, SVG, Canvas 2D, Node.js built-in `node:test`, PowerShell, workspace-provided Playwright, and local Chrome/Edge for behavioral tests and screenshots.

**Spec:** `docs/superpowers/specs/2026-08-19-personal-landing-design.md`

## Global Constraints

- Use HTML, CSS and JavaScript only; no package manager, build step, framework, library, CDN or external font request.
- Use `#1AE3E7` as the only dominant global accent; project-local colors must remain bounded to their case sections.
- Never invent metrics, testimonials, availability, outcomes, users, downloads or client claims.
- Keep Sonar Promos labeled `em teste fechado` and StreamNest labeled `pré-lançamento` with a dormant Play CTA.
- Include StreamNest, Sonar Promos, Recanto Beija-Flor and ARTEconectaMENTE; do not label the public case as `Daniiiii`.
- Essential content, anchor navigation and contact must work without JavaScript.
- CSS and JavaScript must both honor `prefers-reduced-motion`.
- At widths at or below 900 px, remove Canvas, backdrop filters, pointer tilt, parallax and heavy atmospheric layers.
- Do not stage or modify unrelated user files in `.agents/skills/`, `docs/master-prompt.md`, `docs/sobre-mim.md` or the four source repositories.

---

### Task 1: Establish test contracts and asset inventory

**Files:**

- Create: `tests/helpers/site-server.cjs`
- Create: `tests/site.browser.test.cjs`
- Create: `tests/asset.test.cjs`
- Create: `tests/run-tests.ps1`
- Create: `site/assets/ASSET-SOURCES.md`

**Interfaces:**

- Consumes: approved design spec and read-only source repositories.
- Produces: executable static-site contracts and an asset provenance manifest used by every later task.

- [ ] **Step 1: Build the real-browser test harness and write the failing site contract**

Create a small static server helper and a PowerShell runner that selects the bundled Node/Playwright runtime without installing anything into the project. In `site.browser.test.cjs`, launch Chromium, serve `site/`, and assert through locators and DOM properties that the final page exposes exactly one `h1`, a visible skip link on focus, `main#content`, all four public case names, the two honest product statuses, working email/GitHub destinations, a mobile navigation control, parsed Open Graph fields and JSON-LD. Observe requests and fail on any external script, stylesheet or font request.

- [ ] **Step 2: Run the site contract and verify the expected failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs`

Expected: FAIL because `site/index.html` does not exist.

- [ ] **Step 3: Inventory source assets without modifying source repositories**

Record each selected source path, project, intended use and whether it contains third-party or personal imagery. Prefer UI screenshots and project-owned logos. Exclude confidential screens, credentials and unverified health claims. The manifest must state that each copied file is derived from a local user-owned project and preserve the original file name in the source column.

- [ ] **Step 4: Write the asset contract**

Use filesystem and binary-header checks for the provenance manifest and raster dimensions. Use the real browser test to observe every requested local `src`, stylesheet `url()` and script response and fail on 4xx/5xx responses. Verified external page/profile links are navigation destinations, never runtime assets. Add the exact `og-1200x630.png` dimension assertion in Task 6, when that output becomes part of the task contract.

- [ ] **Step 5: Run the focused tests**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs,tests/asset.test.cjs`

Expected: contract tests fail only for files deliberately produced by later tasks; syntax and test harness pass.

- [ ] **Step 6: Commit the contracts and manifest**

```powershell
git add -- tests/helpers/site-server.cjs tests/site.browser.test.cjs tests/asset.test.cjs tests/run-tests.ps1 site/assets/ASSET-SOURCES.md
git commit -m "test: define contratos da landing pessoal"
```

### Task 2: Build brand assets and semantic narrative

**Files:**

- Create: `site/index.html`
- Create: `site/assets/brand/logo-mark.svg`
- Copy: `site/assets/brand/logo-console.png`
- Create: `site/assets/brand/favicon.svg`
- Copy/optimize: `site/assets/projects/sonar-promos/*`
- Copy/optimize: `site/assets/projects/streamnest/*`
- Copy/optimize: `site/assets/projects/recanto-beija-flor/*`
- Copy/optimize: `site/assets/projects/arteconectamente/*`
- Modify: `site/assets/ASSET-SOURCES.md`
- Modify: `tests/site.browser.test.cjs`

**Interfaces:**

- Consumes: IDs and copy contracts from the spec and Task 1.
- Produces: stable section IDs `hero`, `process`, `work`, `systems`, `journey`, `ai-workbench`, and `contact`; case IDs `sonar-promos`, `streamnest`, `recanto-beija-flor`, `arteconectamente`; hooks `data-reveal`, `data-circuit-stage`, `data-case-theme`, `data-nav-toggle`, `data-nav-panel`, `data-sonar-field`, `data-circuit-path`, and `data-scroll-progress`.

- [ ] **Step 1: Expand the failing content tests**

Assert the exact section IDs and data hooks, semantic elements (`nav`, `main`, `article`, `aside`, `footer`), one dormant StreamNest link with `aria-disabled="true"` and no `href`, explicit `width`/`height` on raster images, meaningful `alt`, and no `Daniiiii` string.

- [ ] **Step 2: Run the content tests and confirm failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs`

Expected: FAIL because the semantic document and hooks are absent.

- [ ] **Step 3: Create the vector brand system**

Trace the existing mark into clean SVG paths using the measured palette. Keep `viewBox="0 0 512 512"`, transparent background in `logo-mark.svg`, a title/description for standalone use, and a single-color-compatible `favicon.svg`. Do not overwrite `docs/logo-console.png`; copy it as fallback.

- [ ] **Step 4: Copy only verified portfolio assets**

Use explicit source and destination paths from the manifest. Optimize copies in place only after preserving provenance. Produce responsive WebP/PNG files whose names include project and view, such as `sonar-alerts.webp` and `streamnest-library.webp`; do not embed external URLs as image sources.

- [ ] **Step 5: Implement the semantic HTML**

Use `lang="pt-BR"`, `class="no-js"`, a small inline class replacement, skip link, fixed navigation, hero, process nodes, continuity/invention bifurcation, four editorial case articles, three systems contexts, condensed trajectory, AI workbench, contact and footer. Copy must remain within the factual boundaries in the spec. Do not reference CSS or JavaScript files owned by later tasks before those files exist; Tasks 3–5 add their own local references with their implementations.

```html
<article class="case case--sonar" id="sonar-promos" data-case-theme="sonar">
  <p class="kicker">Produto Android · em teste fechado</p>
  <h3>Sonar Promos</h3>
  <p>Monitora fontes escolhidas da conta Telegram e transforma volume de mensagens em alertas por palavras-chave.</p>
</article>
```

- [ ] **Step 6: Add metadata and structured data**

Set a unique title/description, relative canonical `/`, local OG image `/og-1200x630.png`, Twitter card, theme color and JSON-LD `Person` with name, job title phrased as Senior Full Stack Developer, email and verified GitHub URL. Do not add an invented employer URL or domain.

- [ ] **Step 7: Run and pass content and asset tests**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs,tests/asset.test.cjs`

Expected: PASS with no skipped checks; the OG-dimension assertion is introduced in Task 6.

- [ ] **Step 8: Inspect the diff and commit**

```powershell
git diff -- site/index.html site/assets tests/site.browser.test.cjs
git add -- site/index.html site/assets tests/site.browser.test.cjs
git commit -m "feat: estrutura narrativa e cases do portfólio"
```

### Task 3: Implement the dark narrative design system

**Files:**

- Create: `site/css/styles.css`
- Modify: `site/index.html`
- Modify: `site/assets/ASSET-SOURCES.md`
- Modify: `tests/site.browser.test.cjs`

**Interfaces:**

- Consumes: HTML classes and data hooks from Task 2.
- Produces: tokens, layout, component, case-theme and breakpoint contracts; CSS custom properties `--scroll-progress`, `--circuit-progress`, `--pointer-x`, `--pointer-y`; state classes `.is-visible`, `.is-current`, `.nav-open`, `.is-static`; enhancement gates `.reveal-ready`, `.nav-ready` and `.circuit-ready`.

- [ ] **Step 1: Add failing visual behavior contracts**

In Chromium, inspect resolved custom properties and computed styles instead of matching CSS source text. Assert the exact palette values, clipped horizontal overflow, the effective system font stacks with zero external font requests, a visible keyboard focus indicator, revealed content with JavaScript, visible content without JavaScript, zero-duration/non-animated states under `prefers-reduced-motion`, and at 900 px or below a hidden Sonar canvas with no active backdrop filter, parallax or pointer transform.

- [ ] **Step 2: Run the CSS contract and confirm failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs`

Expected: FAIL because `site/css/styles.css` is absent.

- [ ] **Step 3: Implement tokens, system font stacks and global layout**

Link the new local stylesheet from `site/index.html`. Define all approved palette, typography, spacing, radius, border and easing tokens. Use a system-first geometric heading stack and readable UI/body stack because no locally licensed Space Grotesk or Manrope files were found; never request a web font. Use four navy layers and short radial illumination. Implement fluid typography with `clamp()`, a 1140 px container and section spacing from 4 to 8 rem.

- [ ] **Step 4: Implement navigation, hero and process components**

Create a fixed nav, functional mobile drawer styles, hero split composition, logo/circuit stage, buttons, process nodes, branch labels and scroll HUD. Ensure controls are at least 44 px and all focus states are visible.

- [ ] **Step 5: Implement editorial case environments**

Keep navy as the shared base. Sonar may use bounded gold blips; StreamNest uses ciano broadcast; Recanto uses muted forest/earth lighting; ARTEconectaMENTE uses a narrow orbital coral/violet trace. Prevent local colors from entering navigation, hero or contact.

- [ ] **Step 6: Implement systems, journey, AI and contact sections**

Use editorial columns and separators instead of a generic card grid. Connect stack terms to explanatory copy. Complete the circuit visually in contact.

- [ ] **Step 7: Implement responsive, no-js and reduced-motion states**

At 900 px, remove Canvas, blur and pointer-only transforms; convert the circuit to a vertical guide; turn the HUD into a top progress bar; keep navigation operable. At 600 px, reduce ghost words and media height. Content, navigation and the static circuit are visible and operable by default. Hide or animate them only beneath `.reveal-ready`, `.nav-ready` and `.circuit-ready`, which later tasks add after their controllers are mounted. `.no-js` must expose all content and retain anchor navigation; `.js` alone is never an enhancement-readiness signal.

- [ ] **Step 8: Run tests and inspect four viewport sizes**

Run: `.\tests\run-tests.ps1 -TestFiles tests/site.browser.test.cjs,tests/asset.test.cjs`

Then render at 360 × 800, 768 × 1024, 1024 × 768 and 1440 × 1000. Verify no horizontal overflow, readable text and complete focus rings.

- [ ] **Step 9: Commit the visual system**

```powershell
git add -- site/css/styles.css site/index.html site/assets/ASSET-SOURCES.md tests/site.browser.test.cjs
git commit -m "feat: aplica identidade visual narrativa"
```

### Task 4: Implement and test the circuit engine

**Files:**

- Create: `site/js/circuit-path.js`
- Create: `tests/circuit-path.test.cjs`
- Modify: `site/index.html`

**Interfaces:**

- Consumes: `[data-circuit-path]`, `[data-circuit-stage]`, `[data-scroll-progress]` and CSS properties from Task 3.
- Produces: UMD API `JoberCircuit.clamp(value, min, max)`, `JoberCircuit.progress(scrollY, viewportHeight, documentHeight)`, `JoberCircuit.stageIndex(progress, thresholds)`, and browser controller `JoberCircuit.mount(options)` returning `{ update, destroy }`.

- [ ] **Step 1: Write failing pure-function tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const circuit = require('../site/js/circuit-path.js');

test('progress is clamped across the scroll range', () => {
  assert.equal(circuit.progress(-20, 800, 2400), 0);
  assert.equal(circuit.progress(800, 800, 2400), 0.5);
  assert.equal(circuit.progress(4000, 800, 2400), 1);
});
```

- [ ] **Step 2: Run the circuit test and confirm failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/circuit-path.test.cjs`

Expected: FAIL because the module is absent.

- [ ] **Step 3: Implement the UMD pure API**

Return deterministic values for clamps, document progress and stage thresholds. Do not read the DOM inside pure functions.

- [ ] **Step 4: Implement the browser controller**

Measure the SVG path once after load and on debounced resize. Update `strokeDashoffset`, `--scroll-progress`, progress text and `.is-current` stage in a passive scroll listener throttled through one animation frame. Add `.circuit-ready` only after the controller has mounted and established a valid static or animated state; remove it in `destroy()`. On reduced motion, draw the final static path and avoid registering the scroll animation.

- [ ] **Step 5: Add lifecycle safety**

`destroy()` must remove scroll, resize and media-query listeners and cancel a pending animation frame. Hidden tabs must not schedule repeated work.

- [ ] **Step 6: Run and pass circuit tests**

Run: `.\tests\run-tests.ps1 -TestFiles tests/circuit-path.test.cjs`

Expected: PASS.

- [ ] **Step 7: Commit the circuit**

```powershell
git add -- site/js/circuit-path.js tests/circuit-path.test.cjs site/index.html
git commit -m "feat: conecta narrativa ao progresso do scroll"
```

### Task 5: Implement progressive enhancement and the bounded Sonar field

**Files:**

- Create: `site/js/main.js`
- Create: `site/js/sonar-field.js`
- Create: `tests/sonar-field.test.cjs`
- Modify: `site/index.html`
- Modify: `tests/site.browser.test.cjs`

**Interfaces:**

- Consumes: navigation/reveal hooks and `JoberCircuit.mount()`.
- Produces: `JoberSonar.profile({ width, coarse, hardwareConcurrency, reducedMotion })`, `JoberSonar.createSignal(seed, bounds)`, `JoberSonar.mount(canvas)` and general UI behaviors for nav, reveals, active section, dormant CTA and external links.

- [ ] **Step 1: Write failing Sonar profile tests**

Assert zero animated signals for reduced motion, zero at widths at or below 900 px, 12 for low-power desktop and no more than 24 for strong desktop. Assert DPR caps of 2 desktop and 1.5 coarse pointer.

- [ ] **Step 2: Run and confirm the expected failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/sonar-field.test.cjs`

Expected: FAIL because the module is absent.

- [ ] **Step 3: Add failing browser interaction contracts**

In real Chromium at desktop and mobile widths, assert that the local scripts mount without console or network errors; readiness classes appear only with their handlers/controllers; the mobile navigation toggles `aria-expanded`, closes on Escape and restores focus; reveals reach a visible state; the circuit controller mounts; the dormant Play action provides non-navigating feedback; and the Sonar canvas is mounted only on eligible desktop while mobile and reduced motion remain static. Keep the existing JavaScript-disabled anchor and contact checks.

- [ ] **Step 4: Implement main progressive enhancement**

Implement mobile nav open/close, Escape handling and focus restoration; `IntersectionObserver` reveals with a two-second fallback; active nav state; external-link safety; dormant Play feedback; and mounting of circuit/Sonar APIs only when available. Add `.nav-ready` only after navigation handlers are installed and `.reveal-ready` only after the observer and its fallback are installed. Remove readiness classes during teardown when applicable. Every essential anchor remains valid without this file.

- [ ] **Step 5: Implement bounded Sonar Canvas**

Use deterministic seeded signals moving across the case canvas. One signal receives the gold match state when it enters a scan band. Keep population bounded by `profile()`, cap DPR, pause on `visibilitychange`, observe container resize and stop when the section is offscreen. Reduced motion draws one static frame.

- [ ] **Step 6: Prevent continuous work outside its section**

Use `IntersectionObserver` to start and stop the Canvas. Cancel animation frames in `destroy()` and when hidden. Do not expose pointer interaction on coarse devices.

- [ ] **Step 7: Run all automated tests**

Run: `.\tests\run-tests.ps1`

Expected: PASS.

- [ ] **Step 8: Perform keyboard and no-js checks**

With JavaScript disabled, follow every nav anchor and both contact links. With JavaScript enabled, open and close mobile navigation using keyboard only, press Escape, tab through all interactive elements and verify focus never disappears.

- [ ] **Step 9: Commit interactions**

```powershell
git add -- site/js site/index.html tests/sonar-field.test.cjs tests/site.browser.test.cjs
git commit -m "feat: adiciona interações progressivas e sonar adaptativo"
```

### Task 6: Create share assets and crawler files

**Files:**

- Create: `site/og.html`
- Create: `site/og-1200x630.png`
- Create: `site/robots.txt`
- Modify: `tests/asset.test.cjs`

**Interfaces:**

- Consumes: final brand tokens and headline.
- Produces: exact 1200 × 630 local preview image and deployment-agnostic crawler metadata without an invented host.

- [ ] **Step 1: Enable the failing OG dimension assertion**

Remove the temporary existence guard and assert PNG signature plus IHDR width 1200 and height 630 using `Buffer.readUInt32BE` at offsets 16 and 20.

- [ ] **Step 2: Run the asset contract and confirm failure**

Run: `.\tests\run-tests.ps1 -TestFiles tests/asset.test.cjs`

Expected: FAIL because the PNG does not exist.

- [ ] **Step 3: Build the deterministic OG composition**

Create a fixed 1200 × 630 HTML composition using local fonts, navy layers, the vector mark, one circuit trace, `Jober Cavalcante` and `O problema vem antes da tecnologia.` Capture it with a local headless browser. Do not use generated text inside an AI image.

- [ ] **Step 4: Add crawler rules without fictional deployment data**

Allow crawling in `robots.txt` and do not include a sitemap directive. Keep canonical `/` in HTML. Record in QA that `sitemap.xml` is deliberately deferred because the sitemap protocol requires an absolute public origin and no deployment domain was supplied.

- [ ] **Step 5: Run and pass asset tests**

Run: `.\tests\run-tests.ps1 -TestFiles tests/asset.test.cjs`

Expected: PASS, including exact OG dimensions.

- [ ] **Step 6: Commit share assets**

```powershell
git add -- site/og.html site/og-1200x630.png site/robots.txt tests/asset.test.cjs
git commit -m "feat: adiciona metadados e imagem de compartilhamento"
```

### Task 7: Complete cross-browser QA and evidence

**Files:**

- Create: `docs/qa/personal-landing-qa.md`
- Modify only when a verified defect is found: `site/**`, `tests/**`
- Modify: `.agents/execution/personal-landing/progress.md`

**Interfaces:**

- Consumes: complete site and all automated tests.
- Produces: reproducible QA evidence, final screenshots, defect fixes and completion data for independent final review.

- [ ] **Step 1: Run all static tests from a clean process**

Run: `.\tests\run-tests.ps1`

Expected: PASS with zero skipped tests.

- [ ] **Step 2: Serve locally and check console/network**

Run: `python -m http.server 4173 --directory site`

Open `http://127.0.0.1:4173/`. Verify zero console errors, zero failed local assets and zero third-party script/font/style requests.

- [ ] **Step 3: Capture viewport evidence**

Capture full-page screenshots at 360 × 800, 768 × 1024, 1024 × 768 and 1440 × 1000. Inspect hero clarity, case identity, image crops, horizontal overflow, navigation and contact.

- [ ] **Step 4: Verify reduced motion and no-js**

Emulate reduced motion and confirm no pulsing, scrolling circuit animation, Canvas loop or reveal delay. Disable JavaScript and confirm all content, case links, anchor navigation and contact remain visible and usable.

- [ ] **Step 5: Run accessibility, performance and SEO audits**

Run Lighthouse locally when the installed browser/runtime supports it. Target no serious accessibility issue, no broken SEO metadata, and performance without a red-category regression. If Lighthouse is unavailable, record the exact missing executable and complete manual keyboard, headings, landmarks, contrast and asset-size checks.

- [ ] **Step 6: Fix only evidence-backed defects and rerun affected checks**

For each fix, record file, symptom, evidence and retest in the QA report. Do not add new visual concepts during QA.

- [ ] **Step 7: Inspect final diff and repository status**

Run: `git diff --check` and `git status --short`.

Confirm only the site, tests, spec, plan, QA and execution ledger are changed or committed; user source documents and source repositories remain untouched.

- [ ] **Step 8: Commit QA evidence and verified fixes**

```powershell
git add -- docs/qa/personal-landing-qa.md .agents/execution/personal-landing/progress.md site tests
git commit -m "test: valida experiência final da landing"
```

- [ ] **Step 9: Prepare the final-review bundle**

Provide the original request, approved spec, implementation plan, ledger, complete diff/stat, commit list, automated test output, visual evidence, known limitations and any Lighthouse limitation to a fresh final reviewer. Completion requires `APPROVED`.
