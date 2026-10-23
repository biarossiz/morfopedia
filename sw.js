/* Service worker: deixa o dicionário disponível off-line após o primeiro acesso. */
const CACHE = 'morfopedia-v2';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'icons.js', 'data.js',
  'icon.svg', 'epm.png', 'unifesp.png', 'manifest.webmanifest',
  'fraunces.woff2', 'fraunces-italic.woff2', 'montserrat.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit || caches.match('index.html'));
      return hit || net;
    })
  );
});
