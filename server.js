const express = require('express');
const path = require('path');

const ROOT_DIR = __dirname;
const PUBLIC_ROOT_FILES = new Set([
  'index.html',
  'manifest.json',
  'sw.js',
  'favicon.svg',
  'favicon.png',
  'icon-192.png',
  'icon-512.png',
]);

function createApp() {
  const app = express();

  app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
  app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
  app.use('/dados', express.static(path.join(ROOT_DIR, 'dados')));
  app.use('/assets', express.static(path.join(ROOT_DIR, 'public', 'assets')));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
  });

  app.get('/:file', (req, res, next) => {
    if (PUBLIC_ROOT_FILES.has(req.params.file)) {
      return res.sendFile(path.join(ROOT_DIR, req.params.file));
    }
    return next();
  });

  app.use((_req, res) => {
    res.status(404).send('Not found');
  });

  return app;
}

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = '0.0.0.0';
  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`VitrineCentro dev server running at http://${HOST}:${PORT}`);
  });
}

module.exports = { createApp };
