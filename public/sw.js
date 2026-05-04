const CACHE_NAME = 'play2learn-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/fonts/LutfeyArabicDEMO.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate for assets
  if (event.request.destination === 'font' || event.request.destination === 'image' || event.request.destination === 'style' || event.request.destination === 'script') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchedResponse = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchedResponse;
        });
      })
    );
  }
});
