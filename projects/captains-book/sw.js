/* Captain's Book app-shell cache ONLY. Never caches or uploads user PNGs. */
const CACHE = 'captains-book-shell-v1';
const SHELL = [
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('captains-book-shell-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestURL = new URL(event.request.url);
  if (requestURL.origin !== self.location.origin) return;
  const indexURL = new URL('./index.html', self.registration.scope).href;
  const shellURLs = new Set(SHELL.map(item => new URL(item, self.registration.scope).href));
  if (event.request.mode === 'navigate' && requestURL.href.startsWith(self.registration.scope)) {
    event.respondWith(caches.match(indexURL).then(hit => hit || fetch(indexURL)));
    return;
  }
  if (shellURLs.has(requestURL.href)) {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
  }
});
