const CACHE_NAME = 'vitrinecentro-vfinal-2';

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

// 1. Instalação: pré-carrega arquivos essenciais diretamente da rede e ativa imediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ARQUIVOS_ESSENCIAIS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' }))
        )
      );
    })
  );
  self.skipWaiting();
});

// 2. Ativação: remove todos os caches antigos e assume imediatamente o controle dos clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes
            .filter((nome) => nome !== CACHE_NAME)
            .map((nome) => caches.delete(nome))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Interceptação (Network-First): busca sempre na rede primeiro e usa o cache apenas offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((respostaRede) => {
        if (respostaRede && respostaRede.status === 200 && respostaRede.type === 'basic') {
          const copia = respostaRede.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        }
        return respostaRede;
      })
      .catch(() => {
        return caches.match(event.request).then((respostaCache) => {
          if (respostaCache) return respostaCache;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html').then((idx) => idx || caches.match('./'));
          }
          return undefined;
        });
      })
  );
});
