'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function isWithinRoot(rootDir, candidate) {
  const relative = path.relative(rootDir, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

/**
 * Start a dependency-free static server for the local site directory.
 * The returned server intentionally serves only files below rootDir.
 */
async function startSiteServer({ rootDir = path.resolve(__dirname, '../../site'), host = '127.0.0.1', port = 0 } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  let canonicalRoot;
  try {
    canonicalRoot = await fs.realpath(absoluteRoot);
  } catch (error) {
    if (!error || error.code !== 'ENOENT') throw error;
    canonicalRoot = absoluteRoot;
  }

  const server = http.createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || host}`).pathname);
    } catch {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(absoluteRoot, relativePath);
    if (!isWithinRoot(absoluteRoot, filePath)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    let canonicalFilePath;
    try {
      canonicalFilePath = await fs.realpath(filePath);
    } catch (error) {
      const status = error && error.code === 'EISDIR' ? 403 : 404;
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(status === 404 ? 'Not found' : 'Forbidden');
      return;
    }

    if (!isWithinRoot(canonicalRoot, canonicalFilePath)) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    try {
      const file = await fs.readFile(canonicalFilePath);
      const contentType = CONTENT_TYPES[path.extname(canonicalFilePath).toLowerCase()] || 'application/octet-stream';
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Length': file.byteLength,
        'Content-Type': contentType,
      });
      if (request.method === 'HEAD') {
        response.end();
      } else {
        response.end(file);
      }
    } catch (error) {
      const status = error && error.code === 'EISDIR' ? 403 : 404;
      response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(status === 404 ? 'Not found' : 'Forbidden');
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  let closed = false;

  return {
    baseUrl: `http://${host}:${actualPort}`,
    rootDir: absoluteRoot,
    close: async () => {
      if (closed) return;
      closed = true;
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

module.exports = { startSiteServer };
