const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./server');

async function withServer(fn) {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('serves index.html and core static assets', async () => {
  await withServer(async (baseUrl) => {
    const rootRes = await fetch(`${baseUrl}/`);
    assert.equal(rootRes.status, 200);
    const html = await rootRes.text();
    assert.match(html, /VitrineCentro/);

    for (const asset of [
      '/css/estilo.css',
      '/js/core.js',
      '/js/app.js',
      '/dados/dados.js',
      '/manifest.json',
      '/sw.js',
      '/favicon.png',
      '/icon-512.png',
    ]) {
      const res = await fetch(`${baseUrl}${asset}`);
      assert.equal(res.status, 200, `Expected 200 for ${asset}`);
    }
  });
});

test('does not expose server or package configuration files', async () => {
  await withServer(async (baseUrl) => {
    for (const blocked of ['/server.js', '/package.json', '/metadata.json']) {
      const res = await fetch(`${baseUrl}${blocked}`);
      assert.equal(res.status, 404, `Expected 404 for ${blocked}`);
    }
  });
});
