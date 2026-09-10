// Buku Ajaib - Service Worker with Stale-While-Revalidate & Static Precaching
const CACHE_NAME = 'buku-ajaib-v1.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

// Install Event: Precaching static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell & static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-critical precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && !key.startsWith('workbox-')) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate strategy for optimal offline availability & instant loading
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Avoid intercepting chrome-extension or external analytics
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Try to serve from cache immediately (Stale)
      const cachedResponse = await cache.match(request);

      // 2. Background fetch to revalidate and update cache
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // If response is valid, update the cache clone
          if (networkResponse && networkResponse.status === 200) {
            // Only cache same-origin or google fonts / cdn resources
            if (url.origin === self.location.origin || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
          }
          return networkResponse;
        })
        .catch((error) => {
          console.warn('[SW] Network fetch failed, relying on cache:', request.url);
          // If offline and request is navigation (HTML page), return cached root
          if (request.mode === 'navigate') {
            return cache.match('/') || cache.match('/index.html');
          }
          // If we had a cached copy, it has already been or will be returned
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        });

      // Return cached response instantly if available; otherwise await network
      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for SKIP_WAITING from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
