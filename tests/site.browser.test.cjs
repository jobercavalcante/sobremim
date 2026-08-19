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

test('site contract is exposed by the real browser and local network only', async () => {
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  const page = await browser.newPage();
  const base = new URL(server.baseUrl);
  const blockedExternalRequests = [];
  const failedLocalResponses = [];

  page.on('request', (request) => {
    const type = request.resourceType();
    const url = new URL(request.url());
    if (['font', 'script', 'stylesheet'].includes(type) && ['http:', 'https:'].includes(url.protocol) && url.origin !== base.origin) {
      blockedExternalRequests.push(`${type}: ${request.url()}`);
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === base.origin && response.status() >= 400) {
      failedLocalResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    const indexResponse = await page.goto(`${server.baseUrl}/`, { waitUntil: 'load' });
    assert.equal(indexResponse && indexResponse.status(), 200, 'site/index.html must be served successfully');
    assert.deepEqual(blockedExternalRequests, [], 'scripts, stylesheets and fonts must be local');
    assert.deepEqual(failedLocalResponses, [], 'local document and assets must not return 4xx/5xx responses');

    assert.equal(await page.locator('h1').count(), 1, 'the page must expose exactly one h1');
    const main = page.locator('main#content');
    assert.equal(await main.count(), 1, 'main#content must be present exactly once');
    assert.ok(await main.isVisible(), 'main#content must be visible');

    const skipLink = page.locator('a[href="#content"]').first();
    assert.equal(await skipLink.count(), 1, 'a skip link targeting #content is required');
    await page.keyboard.press('Tab');
    assert.ok(await skipLink.isVisible(), 'the skip link must become visible when focused by keyboard');
    assert.equal(await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('href')), '#content');

    for (const caseName of ['Sonar Promos', 'StreamNest', 'Recanto Beija-Flor', 'ARTEconectaMENTE']) {
      const caseText = page.getByText(caseName, { exact: false }).first();
      assert.ok(await caseText.count() > 0, `public case ${caseName} must be present in the DOM`);
      assert.ok(await caseText.isVisible(), `public case ${caseName} must be visible`);
    }
    assert.ok(await page.getByText('em teste fechado', { exact: false }).count() > 0, 'Sonar must state its honest closed-test status');
    assert.ok(await page.getByText('pré-lançamento', { exact: false }).count() > 0, 'StreamNest must state its honest pre-launch status');

    assert.equal(await page.locator('a[href="mailto:jober.cavalcante@gmail.com"]').count(), 1, 'contact email destination must be present');
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
