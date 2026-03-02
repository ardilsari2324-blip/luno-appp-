/* Basit Service Worker — offline fallback */
const CACHE = "luno-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/login", "/terms", "/privacy"])));
  self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request).then((r) => r || caches.match("/"))
    )
  );
});
