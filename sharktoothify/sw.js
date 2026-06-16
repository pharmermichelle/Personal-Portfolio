/* SharkToothify service worker — app shell cached for offline beach use.
 * Data APIs (NOAA / NWS / Stripe / your Worker / Anthropic) are NEVER cached. */
const VERSION = "stfy-v1";
const SHELL = [
  "/",
  "/index.html",
  "/SharkToothIdentifier.jsx",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];
const NEVER_CACHE = [
  "api.tidesandcurrents.noaa.gov",
  "api.weather.gov",
  "api.anthropic.com",
  "api.stripe.com",
  "api.zippopotam.us",
  "nominatim.openstreetmap.org",
  "myshopify.com",
  "workers.dev",
  "sharktoothify.us/v1"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (e.request.method !== "GET") return;
  if (NEVER_CACHE.some((h) => url.includes(h))) return; // live data: straight to network
  // App shell & static assets: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res && res.ok && (url.startsWith(self.location.origin) || url.includes("fonts.g") || url.includes("unpkg.com"))) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
