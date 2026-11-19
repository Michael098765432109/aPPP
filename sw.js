const CACHE_VERSION = "para-alexandra-v1";
const CACHE_NAME = `${CACHE_VERSION}-static`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./logo.png",
  "./icons/favicon-16.png",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/hub.css",
  "./assets/js/hub.js",
  "./assets/audio/hasta-ese-entonces.mp3",
  "./apps/cartas/index.html",
  "./apps/cartas/assets/css/cartas.css",
  "./apps/cartas/assets/js/cartas.js",
  "./apps/musica/index.html",
  "./apps/musica/assets/css/musica.css",
  "./apps/musica/assets/js/musica.js",
  "./apps/galeria/index.html",
  "./apps/galeria/assets/css/galeria.css",
  "./apps/galeria/assets/js/galeria.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
