const CACHE_NAME = 'vitrinecentro-v13';

const ARQUIVOS_ESSENCIAIS = [
  './',
  './index.html',
  './css/estilo.css',
  './js/core.js',
  './js/app.js',
  './dados/dados.js',
  './manifest.json',
  './favicon.svg',
  './favicon.png',
  './icon-192.png',
  './icon-512.png'
];

// 1. Instalação: baixa todos os arquivos essenciais imediatamente para funcionar offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_ESSENCIAIS);
    })
  );
  self.skipWaiting();
});

// 2. Ativação: apaga caches antigos de versões anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => {
      return Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptação de requisições: entrega do cache ou busca na rede e salva
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      const buscaRede = fetch(event.request)
        .then((respostaRede) => {
          if (respostaRede && respostaRede.status === 200) {
            const copia = respostaRede.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          }
          return respostaRede;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return respostaCache;
        });

      return respostaCache || buscaRede;
    })
  );
});
