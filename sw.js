const CACHE_NAME = 'vitrine-centro-v1';
const ARQUIVOS_CACHE = [
  './',
  './index.html',
  './css/estilo.css',
  './js/app.js',
  './dados/dados.js'
];

// Instala o cache no navegador
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
});

// Serve os arquivos direto do cache se estiver offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((resposta) => {
      return resposta || fetch(e.request);
    })
  );
});