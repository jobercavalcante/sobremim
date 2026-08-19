'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'site', 'assets', 'ASSET-SOURCES.md');
const destinationRoot = path.join(repoRoot, 'site', 'assets');
const sourceRoots = [
  path.resolve('E:/projetos/jober/page/docs'),
  path.resolve('E:/projetos/streamNest'),
  path.resolve('E:/projetos/sonapromos'),
  path.resolve('E:/projetos/recanto-beijaflor'),
  path.resolve('E:/projetos/Daniiiii'),
];

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function parseManifest() {
  assert.ok(fs.existsSync(manifestPath), 'asset provenance manifest must exist');
  const rows = fs.readFileSync(manifestPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|') && !/^\|\s*-+/.test(line.trim()))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  assert.ok(rows.length > 1, 'asset manifest must contain a header and at least one asset row');
  const [header, ...assets] = rows;
  assert.deepEqual(header, ['Project', 'Source path', 'Destination path', 'Intended use', 'Third-party or personal imagery', 'Source dimensions']);
  return assets.map((cells) => {
    assert.equal(cells.length, header.length, `manifest row must have ${header.length} columns: ${cells.join(' | ')}`);
    return Object.fromEntries(header.map((name, index) => [name, cells[index]]));
  });
}

function rasterDimensions(filePath) {
  const bytes = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.png') {
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${filePath} must have a PNG signature`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (extension === '.jpg' || extension === '.jpeg') {
    assert.equal(bytes.readUInt16BE(0), 0xffd8, `${filePath} must have a JPEG signature`);
    let offset = 2;
    const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      while (bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset++];
      if (marker === 0xd8 || marker === 0xd9) continue;
      const length = bytes.readUInt16BE(offset);
      if (sofMarkers.has(marker)) return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      offset += length;
    }
    throw new Error(`${filePath} has no readable JPEG frame header`);
  }
  if (extension === '.webp') {
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${filePath} must have a RIFF signature`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${filePath} must have a WEBP signature`);
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const chunkType = bytes.toString('ascii', offset, offset + 4);
      const chunkSize = bytes.readUInt32LE(offset + 4);
      const data = offset + 8;
      if (chunkType === 'VP8X' && data + 10 <= bytes.length) {
        return {
          width: 1 + bytes[data + 4] + (bytes[data + 5] << 8) + (bytes[data + 6] << 16),
          height: 1 + bytes[data + 7] + (bytes[data + 8] << 8) + (bytes[data + 9] << 16),
        };
      }
      if (chunkType === 'VP8 ' && data + 10 <= bytes.length && bytes[data + 3] === 0x9d && bytes[data + 4] === 0x01 && bytes[data + 5] === 0x2a) {
        return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff };
      }
      if (chunkType === 'VP8L' && data + 5 <= bytes.length && bytes[data] === 0x2f) {
        const b1 = bytes[data + 1]; const b2 = bytes[data + 2]; const b3 = bytes[data + 3]; const b4 = bytes[data + 4];
        return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
      }
      offset = data + chunkSize + (chunkSize % 2);
    }
    throw new Error(`${filePath} has no readable WEBP frame header`);
  }
  if (extension === '.svg') {
    const source = fs.readFileSync(filePath, 'utf8');
    assert.match(source, /^\s*<svg(?:\s|>)/i, `${filePath} must contain an SVG root`);
    const viewBox = /\bviewBox\s*=\s*["']\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i.exec(source);
    assert.ok(viewBox, `${filePath} must expose a viewBox for deterministic sizing`);
    return { width: Number(viewBox[3]), height: Number(viewBox[4]) };
  }
  throw new Error(`Unsupported raster extension ${extension} for ${filePath}`);
}

function expectedDimensions(value) {
  const match = /^(\d+)\s*[×x]\s*(\d+)$/i.exec(value);
  assert.ok(match, `source dimensions must use WIDTH×HEIGHT notation: ${value}`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

const assets = parseManifest();
const responsiveAssets = [
  ['brand/jober-console-256w.webp', 'brand/logo-console.png', 512],
  ['brand/jober-console-512w.webp', 'brand/logo-console.png', 512],
  ['projects/streamnest/streamnest-library-640w.webp', 'projects/streamnest/streamnest-social-preview.png', 1200],
  ['projects/streamnest/streamnest-library-1200w.webp', 'projects/streamnest/streamnest-social-preview.png', 1200],
  ['projects/streamnest/streamnest-icon-320w.webp', 'projects/streamnest/icon.png', 1254],
  ['projects/streamnest/streamnest-icon-768w.webp', 'projects/streamnest/icon.png', 1254],
  ['projects/sonar-promos/sonar-promos-overview-640w.webp', 'projects/sonar-promos/sonar-promos-social-preview.png', 1200],
  ['projects/sonar-promos/sonar-promos-overview-1200w.webp', 'projects/sonar-promos/sonar-promos-social-preview.png', 1200],
  ['projects/sonar-promos/sonar-promos-alerts-320w.webp', 'projects/sonar-promos/sonar-dark.png', 620],
  ['projects/sonar-promos/sonar-promos-alerts-620w.webp', 'projects/sonar-promos/sonar-dark.png', 620],
  ['projects/sonar-promos/sonar-promos-summary-320w.webp', 'projects/sonar-promos/resumo-dark.png', 620],
  ['projects/sonar-promos/sonar-promos-summary-620w.webp', 'projects/sonar-promos/resumo-dark.png', 620],
  ['projects/sonar-promos/sonar-promos-feed-320w.webp', 'projects/sonar-promos/feed-dark.png', 620],
  ['projects/sonar-promos/sonar-promos-feed-620w.webp', 'projects/sonar-promos/feed-dark.png', 620],
  ['projects/recanto-beija-flor/recanto-beija-flor-logo-256w.webp', 'projects/recanto-beija-flor/logo.jpg', 512],
  ['projects/recanto-beija-flor/recanto-beija-flor-logo-512w.webp', 'projects/recanto-beija-flor/logo.jpg', 512],
  ['projects/arteconectamente/arteconectamente-share-640w.webp', 'projects/arteconectamente/og-share.webp', 1568],
  ['projects/arteconectamente/arteconectamente-share-1200w.webp', 'projects/arteconectamente/og-share.webp', 1568],
  ['projects/arteconectamente/arteconectamente-arte-375w.webp', 'projects/arteconectamente/arte-mente-alma.png', 750],
  ['projects/arteconectamente/arteconectamente-arte-750w.webp', 'projects/arteconectamente/arte-mente-alma.png', 750],
];

test('asset manifest uses only approved local user-owned sources', () => {
  const expectedProjects = new Set(['Personal identity', 'StreamNest', 'Sonar Promos', 'Recanto Beija-Flor', 'ARTEconectaMENTE']);
  assert.ok(assets.length >= 10, 'manifest must inventory the selected visual evidence, not just one logo');
  for (const asset of assets) {
    assert.ok(expectedProjects.has(asset.Project), `unexpected project in manifest: ${asset.Project}`);
    const source = path.resolve(asset['Source path']);
    assert.ok(sourceRoots.some((root) => within(root, source)), `source must remain under an approved local repository: ${asset['Source path']}`);
    assert.ok(fs.existsSync(source), `source asset must exist: ${asset['Source path']}`);
    assert.ok(path.basename(asset['Source path']) === path.basename(source), 'source column must preserve the original file name');
    assert.ok(asset['Intended use'], `intended use is required for ${asset['Source path']}`);
    assert.ok(asset['Third-party or personal imagery'], `imagery classification is required for ${asset['Source path']}`);
    const destination = path.resolve(destinationRoot, asset['Destination path']);
    assert.ok(within(destinationRoot, destination), `destination must remain under site/assets: ${asset['Destination path']}`);
  }
  assert.ok(assets.some((asset) => asset.Project === 'Personal identity'));
  assert.ok(assets.some((asset) => asset.Project === 'StreamNest'));
  assert.ok(assets.some((asset) => asset.Project === 'Sonar Promos'));
  assert.ok(assets.some((asset) => asset.Project === 'Recanto Beija-Flor'));
  assert.ok(assets.some((asset) => asset.Project === 'ARTEconectaMENTE'));
});

for (const asset of assets) {
  test(`source header and dimensions are valid for ${asset['Source path']}`, () => {
    const source = path.resolve(asset['Source path']);
    const dimensions = rasterDimensions(source);
    assert.deepEqual(dimensions, expectedDimensions(asset['Source dimensions']));
  });
}

for (const [derivedPath, originalPath, originalWidth] of responsiveAssets) {
  test(`responsive WebP derivative is valid and no wider than its source: ${derivedPath}`, () => {
    const derived = path.join(destinationRoot, derivedPath);
    const original = path.join(destinationRoot, originalPath);
    assert.ok(fs.existsSync(original), `fallback original must remain available: ${originalPath}`);
    assert.ok(fs.existsSync(derived), `responsive derivative is missing: ${derivedPath}`);
    assert.equal(path.extname(derived), '.webp', `responsive derivative must use WebP: ${derivedPath}`);
    const dimensions = rasterDimensions(derived);
    assert.ok(dimensions.width > 0 && dimensions.height > 0, `${derivedPath} must have positive dimensions`);
    assert.ok(dimensions.width <= originalWidth, `${derivedPath} must not upscale beyond ${originalPath}`);
    assert.ok(dimensions.width <= rasterDimensions(original).width, `${derivedPath} must not be wider than its actual fallback`);
  });
}

for (const asset of assets) {
  test(`copied asset exists and remains a valid raster for ${asset['Destination path']}`, () => {
    const destination = path.resolve(destinationRoot, asset['Destination path']);
    assert.ok(fs.existsSync(destination), `copy selected for the landing is missing: ${asset['Destination path']}`);
    const dimensions = rasterDimensions(destination);
    assert.ok(dimensions.width > 0 && dimensions.height > 0, `${asset['Destination path']} must have positive dimensions`);
  });
}
