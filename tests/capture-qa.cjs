'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { startSiteServer } = require('./helpers/site-server.cjs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const VIEWPORTS = [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
];
const SCREENSHOT_FILENAMES = VIEWPORTS.map(({ width, height }) => `personal-landing-${width}x${height}.png`);

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) throw new Error(`Missing versioned QA hash manifest: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.schemaVersion !== 1 || !manifest.files || typeof manifest.files !== 'object') {
    throw new Error(`Invalid QA hash manifest schema: ${manifestPath}`);
  }
  const filenames = Object.keys(manifest.files).sort();
  if (JSON.stringify(filenames) !== JSON.stringify([...SCREENSHOT_FILENAMES].sort())) {
    throw new Error(`QA hash manifest must list exactly: ${SCREENSHOT_FILENAMES.join(', ')}`);
  }
  for (const [filename, hash] of Object.entries(manifest.files)) {
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error(`Invalid SHA-256 for ${filename} in ${manifestPath}`);
  }
  return manifest;
}

function verifyHashes(results, outputDirectory, manifestPath) {
  const manifest = readManifest(manifestPath);
  for (const result of results) {
    const expected = manifest.files[result.filename];
    if (result.sha256 !== expected) {
      throw new Error(`Regenerated QA screenshot hash mismatch for ${result.filename}: expected ${expected}, got ${result.sha256}`);
    }
    const trackedPath = path.join(outputDirectory, result.filename);
    if (!fs.existsSync(trackedPath)) throw new Error(`Tracked QA screenshot is missing: ${trackedPath}`);
    const trackedHash = sha256(fs.readFileSync(trackedPath));
    if (trackedHash !== expected) {
      throw new Error(`Tracked QA screenshot hash mismatch for ${result.filename}: expected ${expected}, got ${trackedHash}`);
    }
    process.stdout.write(`verified ${result.filename}: sha256=${result.sha256}\n`);
  }
}

function browserExecutable() {
  if (fs.existsSync(CHROME_PATH)) return CHROME_PATH;
  if (fs.existsSync(EDGE_PATH)) return EDGE_PATH;
  throw new Error(`No verified Chromium executable found at ${CHROME_PATH} or ${EDGE_PATH}`);
}

async function scrollToStableEnd(page) {
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  let previousLimit = -1;
  let stableEndChecks = 0;
  let metrics = { top: 0, limit: 0 };

  for (let attempt = 0; attempt < 100 && stableEndChecks < 2; attempt += 1) {
    metrics = await page.evaluate(async () => {
      const step = Math.max(320, Math.floor(window.innerHeight * 0.72));
      const limit = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      window.scrollTo(0, Math.min(window.scrollY + step, limit));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { top: Math.round(window.scrollY), limit };
    });
    await page.waitForTimeout(100);
    const reachedEnd = metrics.top >= metrics.limit - 1;
    stableEndChecks = reachedEnd && metrics.limit === previousLimit ? stableEndChecks + 1 : 0;
    previousLimit = metrics.limit;
  }

  if (stableEndChecks < 2) throw new Error(`Page did not settle at its dynamic end: ${JSON.stringify(metrics)}`);
}

async function captureViewport(browser, baseUrl, viewport, outputDirectory, writeArtifact) {
  const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await scrollToStableEnd(page);
    await page.waitForFunction(() => Array.from(document.querySelectorAll('#work picture img'))
      .every((image) => image.loading === 'lazy' && image.complete && image.naturalWidth > 0));
    await page.locator('#work picture img').evaluateAll(async (images) => {
      await Promise.all(images.map(async (image) => {
        try { await image.decode(); } catch {}
      }));
    });
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-reveal]'))
      .every((element) => element.classList.contains('is-visible')));
    await page.evaluate(() => {
      if (window.JoberPersonalLanding) window.JoberPersonalLanding.destroy();
      document.documentElement.classList.add('nav-ready');
      document.documentElement.classList.remove('nav-open', 'reveal-ready', 'circuit-ready');
    });

    const progressTop = viewport.width > 900 ? '320px' : '0';
    await page.addStyleTag({ content: `
      html { scroll-behavior: auto !important; }
      header { position: static !important; }
      body > a[href="#content"], [data-scroll-progress] { position: absolute !important; }
      [data-scroll-progress] { top: ${progressTop} !important; }
      [data-reveal] { transition: none !important; }
    ` });
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--circuit-progress', '1');
      document.documentElement.style.setProperty('--scroll-progress', '0');
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(100);

    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const session = await page.context().newCDPSession(page);
    const screenshot = await session.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: viewport.width, height: pageHeight, scale: 1 },
    });
    const filename = `personal-landing-${viewport.width}x${viewport.height}.png`;
    const outputPath = path.join(outputDirectory, filename);
    const bytes = Buffer.from(screenshot.data, 'base64');
    const hash = sha256(bytes);
    if (writeArtifact) fs.writeFileSync(outputPath, bytes);
    process.stdout.write(`${filename}: ${viewport.width}x${pageHeight}, lazy images decoded, sha256=${hash}${writeArtifact ? '' : ' (memory only)'}\n`);
    return { filename, sha256: hash };
  } finally {
    await page.close();
  }
}

async function main() {
  const verify = process.argv.slice(2).includes('--verify');
  const repositoryRoot = path.resolve(__dirname, '..');
  const outputDirectory = path.join(repositoryRoot, 'docs', 'qa', 'screenshots');
  const manifestPath = path.join(outputDirectory, 'sha256.json');
  if (!verify) fs.mkdirSync(outputDirectory, { recursive: true });
  const server = await startSiteServer();
  const browser = await chromium.launch({ executablePath: browserExecutable(), headless: true });
  try {
    const results = [];
    for (const viewport of VIEWPORTS) results.push(await captureViewport(browser, server.baseUrl, viewport, outputDirectory, !verify));
    if (verify) verifyHashes(results, outputDirectory, manifestPath);
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
