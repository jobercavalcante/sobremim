'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { chromium } = require('playwright');
const { startSiteServer } = require('./helpers/site-server.cjs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function browserExecutable() {
  if (fs.existsSync(CHROME_PATH)) return CHROME_PATH;
  if (fs.existsSync(EDGE_PATH)) return EDGE_PATH;
  throw new Error(`No verified Chromium executable found at ${CHROME_PATH} or ${EDGE_PATH}`);
}

function metaContent(page, property) {
  return page.locator(`meta[property="${property}"]`).getAttribute('content');
}

async function scrollThroughPage(page) {
  const previousInlineScrollBehavior = await page.evaluate(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    return previous;
  });
  let stableEndChecks = 0;
  let previousLimit = -1;
  let settled = { top: 0, limit: 0 };
  const trace = [];
  try {
    for (let attempt = 0; attempt < 100 && stableEndChecks < 2; attempt += 1) {
      await page.evaluate(async () => {
        const step = Math.max(320, Math.floor(window.innerHeight * 0.72));
        const limit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        window.scrollTo(0, Math.min(window.scrollY + step, limit));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.waitForTimeout(100);
      settled = await page.evaluate(() => ({
        top: Math.round(window.scrollY),
        limit: Math.max(document.documentElement.scrollHeight - window.innerHeight, 0),
        workHeight: Math.round(document.querySelector('#work').getBoundingClientRect().height),
        imageHeights: Array.from(document.querySelectorAll('#work picture img'), (image) => Math.round(image.getBoundingClientRect().height)),
      }));
      const reachedEnd = settled.top >= settled.limit - 1;
      stableEndChecks = reachedEnd && settled.limit === previousLimit ? stableEndChecks + 1 : 0;
      previousLimit = settled.limit;
      if (attempt < 5 || attempt % 20 === 19 || reachedEnd) trace.push({ attempt: attempt + 1, ...settled });
    }
    assert.ok(stableEndChecks >= 2, `page scroll must settle at its dynamic end: ${JSON.stringify({ settled, trace })}`);
    await page.waitForTimeout(250);
  } finally {
    await page.evaluate((value) => { document.documentElement.style.scrollBehavior = value; }, previousInlineScrollBehavior);
  }
}

async function waitForCaseImages(page) {
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#work picture img')).every((image) => image.complete && image.naturalWidth > 0));
}

test('site contract is exposed by the real browser and local network only', async () => {
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  const page = await browser.newPage();
  const base = new URL(server.baseUrl);
  const blockedExternalRequests = [];
  const failedLocalResponses = [];
  const requestedLocalUrls = new Set();
  const consoleErrors = [];
  const requestFailures = [];

  page.on('request', (request) => {
    const type = request.resourceType();
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== base.origin) {
      blockedExternalRequests.push(`${type}: ${request.url()}`);
    }
    if (url.origin === base.origin) requestedLocalUrls.add(`${url.pathname}${url.search}`);
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === base.origin && response.status() >= 400) {
      failedLocalResponses.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', (request) => requestFailures.push(request.url()));

  try {
    const indexResponse = await page.goto(`${server.baseUrl}/`, { waitUntil: 'load' });
    await scrollThroughPage(page);
    await waitForCaseImages(page);
    assert.equal(indexResponse && indexResponse.status(), 200, 'site/index.html must be served successfully');
    assert.deepEqual(blockedExternalRequests, [], 'every runtime request must remain local after a full-page scroll');
    assert.deepEqual(failedLocalResponses, [], 'local document and assets must not return 4xx/5xx responses');
    assert.deepEqual(consoleErrors, [], 'full-page loading must not emit console errors');
    assert.deepEqual(requestFailures, [], 'full-page loading must not produce failed requests');
    assert.ok(requestedLocalUrls.has('/assets/projects/arteconectamente/arteconectamente-share-1200w.webp'), 'the full page must be scrolled before asserting its lazy case resources');

    assert.equal(await page.locator('h1').count(), 1, 'the page must expose exactly one h1');
    assert.equal(await page.locator('h1').innerText(), 'O problema vem antes da tecnologia.', 'the approved H1 copy must remain exact');
    const heroContact = page.locator('#hero a[href="mailto:jober.cavalcante@gmail.com"]');
    assert.equal(await heroContact.count(), 1, 'hero must expose the approved direct-contact CTA');
    assert.equal(await heroContact.innerText(), 'Falar comigo', 'hero direct-contact CTA must retain the approved copy');
    const main = page.locator('main#content');
    assert.equal(await main.count(), 1, 'main#content must be present exactly once');
    assert.ok(await main.isVisible(), 'main#content must be visible');

    for (const selector of ['nav', 'main', 'article', 'aside', 'footer']) {
      assert.ok(await page.locator(selector).count() > 0, `semantic ${selector} element is required`);
    }
    for (const id of ['hero', 'process', 'work', 'systems', 'journey', 'ai-workbench', 'contact']) {
      assert.equal(await page.locator(`#${id}`).count(), 1, `section #${id} must be stable and unique`);
    }
    for (const id of ['sonar-promos', 'streamnest', 'recanto-beija-flor', 'arteconectamente']) {
      assert.equal(await page.locator(`article#${id}`).count(), 1, `case article #${id} must be stable and unique`);
      assert.equal(await page.locator(`article#${id} strong`, { hasText: 'Problema.' }).count(), 1, `${id} must identify its factual problem`);
      assert.equal(await page.locator(`article#${id} strong`, { hasText: 'Decisão.' }).count(), 1, `${id} must identify its factual decision`);
      assert.ok(await page.locator(`article#${id} picture img`).count() > 0, `${id} must retain visual evidence`);
    }
    for (const hook of ['data-reveal', 'data-circuit-stage', 'data-case-theme', 'data-nav-toggle', 'data-nav-panel', 'data-sonar-field', 'data-circuit-path', 'data-scroll-progress']) {
      assert.ok(await page.locator(`[${hook}]`).count() > 0, `${hook} hook is required for the enhancement layer`);
    }
    assert.equal(await page.locator('article#streamnest a[aria-disabled="true"]').count(), 1, 'StreamNest must have one dormant Play CTA');
    assert.equal(await page.locator('article#streamnest a[aria-disabled="true"]').getAttribute('href'), null, 'dormant StreamNest Play CTA must not navigate');
    const dormantBox = await page.locator('article#streamnest [data-dormant-cta]').boundingBox();
    assert.ok(dormantBox && dormantBox.height <= 64, 'dormant StreamNest CTA must remain compact instead of stretching with its artwork');

    const rasterImages = page.locator('img[src$=".png"], img[src$=".jpg"], img[src$=".jpeg"], img[src$=".webp"]');
    assert.ok(await rasterImages.count() > 0, 'portfolio must use local raster evidence');
    for (let index = 0; index < await rasterImages.count(); index += 1) {
      const image = rasterImages.nth(index);
      assert.ok(await image.getAttribute('width'), 'raster images need an explicit width');
      assert.ok(await image.getAttribute('height'), 'raster images need an explicit height');
      const alt = await image.getAttribute('alt');
      assert.ok(alt && alt.trim().length > 4, 'raster images need meaningful alternative text');
    }
    const caseImages = page.locator('#work picture img');
    assert.ok(await caseImages.count() >= 7, 'case studies must retain their visual evidence images');
    for (let index = 0; index < await caseImages.count(); index += 1) {
      const image = caseImages.nth(index);
      assert.equal(await image.getAttribute('loading'), 'lazy', 'case imagery must defer loading until it approaches the viewport');
      assert.equal(await image.getAttribute('decoding'), 'async', 'case imagery must decode asynchronously');
    }

    assert.equal(await page.locator('#hero img').getAttribute('src'), '/assets/brand/logo-mark.svg', 'hero must use the faithful local vector mark');
    assert.equal(await page.locator('nav > a img').getAttribute('src'), '/assets/brand/logo-mark.svg', 'navigation must use the same local vector mark');
    assert.equal(await page.locator('link[rel="icon"]').getAttribute('href'), '/assets/brand/favicon.svg', 'favicon must remain a local vector asset');
    const vectorContract = await page.evaluate(async () => {
      const response = await fetch('/assets/brand/logo-mark.svg');
      const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      const root = document.documentElement;
      return {
        title: document.querySelector('title')?.textContent || '',
        description: document.querySelector('desc')?.textContent || '',
        paths: document.querySelectorAll('path').length,
        nodes: document.querySelectorAll('circle').length,
        gradients: document.querySelectorAll('linearGradient stop').length,
        colors: [...document.querySelectorAll('[stroke], stop')].map((element) => element.getAttribute('stroke') || element.getAttribute('stop-color')),
        viewBox: root.getAttribute('viewBox'),
      };
    });
    assert.equal(vectorContract.viewBox, '0 0 512 512', 'brand vector must retain a square source-independent viewBox');
    assert.ok(vectorContract.title && vectorContract.description, 'brand vector must expose a title and description');
    assert.ok(vectorContract.paths >= 5 && vectorContract.nodes >= 2 && vectorContract.gradients >= 2, 'brand vector must describe phone, code and two circuit nodes');
    for (const color of ['#1773F4', '#1AE3E7', '#F2F5F7']) assert.ok(vectorContract.colors.includes(color), `brand vector must preserve ${color} from the approved palette`);
    assert.equal((await page.content()).includes('Daniiiii'), false, 'internal repository name must not leak into public copy');

    const skipLink = page.locator('a[href="#content"]').first();
    assert.equal(await skipLink.count(), 1, 'a skip link targeting #content is required');
    await page.keyboard.press('Tab');
    assert.ok(await skipLink.isVisible(), 'the skip link must become visible when focused by keyboard');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('href')), '#content');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => location.hash), '#content', 'the keyboard skip link must navigate to main content');
    assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('main#content')), true, 'the keyboard skip link must transfer focus to main content');

    for (const caseName of ['Sonar Promos', 'StreamNest', 'Recanto Beija-Flor', 'ARTEconectaMENTE']) {
      const caseText = page.getByText(caseName, { exact: false }).first();
      assert.ok(await caseText.count() > 0, `public case ${caseName} must be present in the DOM`);
      assert.ok(await caseText.isVisible(), `public case ${caseName} must be visible`);
    }
    assert.ok(await page.getByText('em teste fechado', { exact: false }).count() > 0, 'Sonar must state its honest closed-test status');
    assert.ok(await page.getByText('pré-lançamento', { exact: false }).count() > 0, 'StreamNest must state its honest pre-launch status');

    assert.equal(await page.locator('#contact a[href="mailto:jober.cavalcante@gmail.com"]').count(), 1, 'contact section email destination must remain present');
    assert.equal(await page.locator('a[href="https://github.com/jobercavalcante"]').count(), 1, 'verified GitHub destination must be present');

    const navToggle = page.locator('[data-nav-toggle]').first();
    assert.equal(await navToggle.count(), 1, 'a mobile navigation control is required');
    assert.equal(await navToggle.evaluate((element) => element.tagName), 'BUTTON');
    assert.ok(await navToggle.getAttribute('aria-expanded') !== null, 'mobile navigation control must expose aria-expanded');

    const openGraph = {
      title: await metaContent(page, 'og:title'),
      description: await metaContent(page, 'og:description'),
      type: await metaContent(page, 'og:type'),
      image: await metaContent(page, 'og:image'),
    };
    for (const [field, value] of Object.entries(openGraph)) {
      assert.ok(value && value.trim(), `Open Graph ${field} must be parsed from a populated meta tag`);
    }
    assert.equal(openGraph.image, '/og-1200x630.png', 'Open Graph image must remain deployment-relative');

    const structuredData = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')));
    const person = structuredData.find((entry) => entry && entry['@type'] === 'Person');
    assert.ok(person, 'JSON-LD must include a Person entity');
    assert.equal(person.name, 'Jober Cavalcante');
    assert.equal(person.email, 'mailto:jober.cavalcante@gmail.com');
    assert.equal(person.url, 'https://github.com/jobercavalcante');
  } finally {
    await page.close();
    await browser.close();
    await server.close();
  }
});

test('visual design contract is resolved by Chromium and preserves static fallbacks', async () => {
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const mobile = await browser.newPage({ viewport: { width: 768, height: 1024 }, reducedMotion: 'no-preference' });
  const reduced = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' });
  const noJavaScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1024, height: 768 } });
  const staticPage = await noJavaScript.newPage();

  try {
    await Promise.all([desktop.goto(`${server.baseUrl}/`), mobile.goto(`${server.baseUrl}/`), reduced.goto(`${server.baseUrl}/`), staticPage.goto(`${server.baseUrl}/`)]);

    const rootContract = await desktop.locator('html').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        ink: style.getPropertyValue('--ink').trim(),
        inkSoft: style.getPropertyValue('--ink-soft').trim(),
        surface: style.getPropertyValue('--surface').trim(),
        surface2: style.getPropertyValue('--surface-2').trim(),
        electric: style.getPropertyValue('--electric').trim(),
        cyan: style.getPropertyValue('--cyan').trim(),
        cyanStrong: style.getPropertyValue('--cyan-strong').trim(),
        text: style.getPropertyValue('--text').trim(),
        muted: style.getPropertyValue('--muted').trim(),
        dim: style.getPropertyValue('--dim').trim(),
        overflowX: style.overflowX,
        fontFamily: style.fontFamily,
      };
    });
    assert.deepEqual(rootContract, {
      ink: '#01091F', inkSoft: '#021653', surface: '#061D46', surface2: '#0A2855',
      electric: '#1773F4', cyan: '#1AE3E7', cyanStrong: '#00BEC7', text: '#F2F5F7',
      muted: '#ABC3D9', dim: '#7897B6', overflowX: 'clip', fontFamily: 'system-ui, sans-serif',
    }, 'global palette, system typography and clipped horizontal overflow are design contracts');

    await desktop.keyboard.press('Tab');
    const focus = await desktop.locator('a[href="#content"]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle, boxShadow: style.boxShadow };
    });
    assert.ok(Number.parseFloat(focus.outlineWidth) > 0 || focus.boxShadow !== 'none', 'keyboard focus must have a visible indicator');

    const readinessStates = await mobile.locator('html').evaluate((root) => {
      if (window.JoberPersonalLanding) window.JoberPersonalLanding.destroy();
      const reveal = document.querySelector('[data-reveal]');
      const panel = document.querySelector('[data-nav-panel]');
      const path = document.querySelector('[data-circuit-path]');
      root.classList.remove('reveal-ready', 'nav-ready', 'nav-open', 'circuit-ready');
      root.style.removeProperty('--circuit-progress');
      path.style.removeProperty('stroke-dasharray');
      path.style.removeProperty('stroke-dashoffset');
      document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.remove('is-visible'));
      reveal.style.transition = 'none';
      const computed = () => ({
        reveal: { opacity: getComputedStyle(reveal).opacity, transform: getComputedStyle(reveal).transform },
        nav: getComputedStyle(panel).display,
        circuit: { dasharray: getComputedStyle(path).strokeDasharray, dashoffset: getComputedStyle(path).strokeDashoffset },
      });
      const defaults = computed();
      root.classList.add('reveal-ready', 'nav-ready', 'circuit-ready');
      root.style.setProperty('--circuit-progress', '0');
      reveal.classList.remove('is-visible');
      const pending = computed();
      reveal.classList.add('is-visible');
      root.classList.add('nav-open');
      root.style.setProperty('--circuit-progress', '1');
      const active = computed();
      return { defaults, pending, active };
    });
    assert.equal(readinessStates.defaults.reveal.opacity, '1', 'default reveal content remains opaque before enhancement');
    assert.equal(readinessStates.defaults.reveal.transform, 'none', 'default reveal content has no displaced transform');
    assert.equal(readinessStates.defaults.nav, 'grid', 'default mobile navigation remains usable before enhancement');
    assert.equal(readinessStates.defaults.circuit.dasharray, 'none', 'default circuit is fully drawn before enhancement');
    assert.match(readinessStates.defaults.circuit.dashoffset, /^0(?:px|%)?$/, 'default circuit starts with no concealed stroke');

    assert.equal(readinessStates.pending.reveal.opacity, '0', 'ready-but-unrevealed content is hidden only after enhancement mounts');
    assert.notEqual(readinessStates.pending.reveal.transform, 'none', 'ready-but-unrevealed content retains its entrance offset');
    assert.equal(readinessStates.pending.nav, 'none', 'ready mobile navigation is closed until explicitly opened');
    assert.match(readinessStates.pending.circuit.dasharray, /\d/, 'ready circuit receives a measurable stroke length');
    assert.doesNotMatch(readinessStates.pending.circuit.dashoffset, /^0(?:px|%)?$/, 'ready circuit conceals its stroke before progress begins');

    assert.equal(readinessStates.active.reveal.opacity, '1', 'active reveal content returns to full opacity');
    assert.equal(readinessStates.active.reveal.transform, 'none', 'active reveal content returns to its resting position');
    assert.equal(readinessStates.active.nav, 'grid', 'opened mobile navigation is visible');
    assert.match(readinessStates.active.circuit.dasharray, /\d/, 'active circuit keeps its measurable stroke length');
    assert.match(readinessStates.active.circuit.dashoffset, /^0(?:px|%)?$/, 'completed circuit exposes the full stroke');

    await desktop.locator('html').evaluate((element) => element.classList.add('reveal-ready'));
    const reveal = desktop.locator('[data-reveal]').first();
    assert.equal(await reveal.isVisible(), true, 'content remains visible while enhancement is awaiting its visible state');
    await reveal.evaluate((element) => element.classList.add('is-visible'));
    assert.equal(await reveal.isVisible(), true, 'revealed content remains visible when JavaScript enhancement marks it visible');
    assert.equal(await staticPage.locator('#process').isVisible(), true, 'content remains visible without JavaScript');
    assert.equal(await staticPage.locator('[data-nav-panel]').isVisible(), true, 'navigation remains operable without JavaScript');

    const reducedMotion = await reduced.locator('[data-reveal]').first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { duration: style.transitionDuration, animation: style.animationName };
    });
    assert.equal(reducedMotion.duration, '0s', 'reduced motion must remove reveal transitions');
    assert.equal(reducedMotion.animation, 'none', 'reduced motion must remove animations');

    const mobileContract = await mobile.locator('[data-sonar-field]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { display: style.display, backdropFilter: style.backdropFilter, transform: style.transform };
    });
    assert.equal(mobileContract.display, 'none', 'Sonar field must be disabled at 900px and below');
    assert.equal(mobileContract.backdropFilter, 'none', 'mobile Sonar field must not activate backdrop blur');
    assert.equal(mobileContract.transform, 'none', 'mobile Sonar field must not apply pointer parallax');
  } finally {
    await desktop.close();
    await mobile.close();
    await reduced.close();
    await staticPage.close();
    await noJavaScript.close();
    await browser.close();
    await server.close();
  }
});

test('narrative layout remains contained and readable at supported viewports', async () => {
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  const viewports = [
    { width: 360, height: 800 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1440, height: 1000 },
  ];

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      await page.goto(`${server.baseUrl}/`);
      await scrollThroughPage(page);
      await waitForCaseImages(page);
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize),
        headingSize: Number.parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      }));
      assert.ok(metrics.scrollWidth <= metrics.clientWidth, `${viewport.width}px layout must not horizontally overflow`);
      assert.ok(metrics.bodyFontSize >= 16, `${viewport.width}px body text must remain readable`);
      assert.ok(metrics.headingSize <= 96, `${viewport.width}px headline must remain at or below 6rem`);
      if (viewport.width === 1024) {
        const railLabel = await page.locator('[data-scroll-progress] span').evaluate((element) => getComputedStyle(element).display);
        assert.equal(railLabel, 'none', 'the intermediate desktop rail keeps progress without colliding with the H1 label');
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await server.close();
  }
});

test('progressive interaction controllers mount safely and preserve keyboard behavior', async () => {
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newPage({ viewport: { width: 768, height: 900 } });
  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const consoleErrors = [];
  const requestFailures = [];

  for (const page of [desktop, mobile, reduced]) {
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', (request) => requestFailures.push(request.url()));
  }

  try {
    await Promise.all([desktop.goto(`${server.baseUrl}/`, { waitUntil: 'load' }), mobile.goto(`${server.baseUrl}/`, { waitUntil: 'load' }), reduced.goto(`${server.baseUrl}/`, { waitUntil: 'load' })]);
    await desktop.waitForFunction(() => document.documentElement.classList.contains('nav-ready') && document.documentElement.classList.contains('reveal-ready') && document.documentElement.classList.contains('circuit-ready'));
    await desktop.waitForFunction(() => document.querySelectorAll('[data-nav-panel] a[aria-current="location"]').length === 1);
    assert.equal(await desktop.locator('[data-sonar-field] canvas').count(), 1, 'eligible desktop mounts one Sonar canvas');
    await desktop.setViewportSize({ width: 768, height: 900 });
    await desktop.waitForFunction(() => document.querySelectorAll('[data-sonar-field] canvas').length === 0);
    await desktop.setViewportSize({ width: 1440, height: 900 });
    await desktop.waitForFunction(() => document.querySelectorAll('[data-sonar-field] canvas').length === 1);
    const sonarLayout = await desktop.locator('[data-sonar-field]').evaluate(async (element) => {
      const before = element.getBoundingClientRect().height;
      await new Promise((resolve) => setTimeout(resolve, 400));
      const after = element.getBoundingClientRect().height;
      return { before, after };
    });
    assert.ok(Math.abs(sonarLayout.after - sonarLayout.before) < 1, `Sonar canvas must not make its container grow continuously: ${JSON.stringify(sonarLayout)}`);
    assert.equal(await mobile.locator('[data-sonar-field] canvas').count(), 0, 'mobile must not mount a Sonar canvas');
    assert.equal(await reduced.locator('[data-sonar-field] canvas').count(), 1, 'reduced motion draws a static Sonar frame');
    await desktop.waitForFunction(() => Array.from(document.querySelectorAll('[data-reveal]')).every((element) => element.classList.contains('is-visible')));

    const toggle = mobile.locator('[data-nav-toggle]');
    await toggle.focus();
    await mobile.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await mobile.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await mobile.evaluate(() => document.activeElement === document.querySelector('[data-nav-toggle]')), true, 'Escape restores focus to the mobile navigation control');

    const locationBefore = await desktop.evaluate(() => location.href);
    await desktop.locator('[data-dormant-cta]').focus();
    await desktop.keyboard.press('Enter');
    assert.equal(await desktop.evaluate(() => location.href), locationBefore, 'dormant Play CTA must not navigate');
    assert.equal(await desktop.locator('[data-play-status]').isVisible(), true, 'dormant Play CTA exposes accessible feedback');
    assert.deepEqual(consoleErrors, [], 'local enhancement scripts must not emit console errors');
    assert.deepEqual(requestFailures, [], 'local enhancement scripts must not fail network requests');
  } finally {
    await desktop.close();
    await mobile.close();
    await reduced.close();
    await browser.close();
    await server.close();
  }
});
