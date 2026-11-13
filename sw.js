const cachePrefix = 'universo-numeros:' + self.registration.scope + ':';
const cacheName = cachePrefix + '9';
const files = [
  './', './index.html', './dna.html', './formas.html', './laboratorio.js?v=9',
  './dna-model.js', './pwa.js', './fichas.js?v=7', './familia.css', './galeria.css', './titulos.css',
  './fonts/lmromancaps10-regular.otf', './identidade/logo.css',
  './identidade/escultura.webp', './identidade/favicon.png',
  './identidade/apple-touch-icon.png', './identidade/app-192.png',
  './identidade/app-512.png', './identidade/app-maskable-512.png', './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' ||
      !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(cacheName);
    return await cache.match(event.request, { ignoreSearch: true }) ||
      new Response('Este recurso ainda não está disponível offline.', { status: 503 });
  }));
});
