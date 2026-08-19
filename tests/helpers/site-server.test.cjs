'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { startSiteServer } = require('./site-server.cjs');

async function removeTemporaryRoot(rootDir) {
  await fs.rm(rootDir, { recursive: true, force: true });
}

test('static server rejects a Windows directory junction that escapes the site root', async () => {
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'personal-landing-server-'));
  const siteRoot = path.join(temporaryRoot, 'site');
  const outsideRoot = path.join(temporaryRoot, 'outside');
  const junctionPath = path.join(siteRoot, 'escape');
  let server;

  try {
    await fs.mkdir(siteRoot);
    await fs.mkdir(outsideRoot);
    await fs.writeFile(path.join(outsideRoot, 'secret.txt'), 'must-not-be-served', 'utf8');
    await fs.symlink(outsideRoot, junctionPath, 'junction');

    server = await startSiteServer({ rootDir: siteRoot });
    const response = await fetch(`${server.baseUrl}/escape/secret.txt`);
    assert.equal(response.status, 403, 'a junction target outside the canonical root must be forbidden');
    assert.equal(await response.text(), 'Forbidden');
  } finally {
    if (server) await server.close();
    await removeTemporaryRoot(temporaryRoot);
  }
});
