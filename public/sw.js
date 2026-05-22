const CACHE_NAME = 'completeapp-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      ).then(results => {
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('Some assets failed to cache during SW install:', failed);
        }
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategia Network First dla dokumentów (HTML) oraz plików JS/CSS z builda (z hashami)
  // Chcemy, aby przeglądarka zawsze sprawdzała najnowszą wersję skryptów,
  // bo przy nowym buildzie ich nazwy (hashe) się zmieniają.
  if (
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) ||
    url.pathname.startsWith('/build/assets/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Kopiujemy odpowiedź do cache tylko jeśli jest poprawna (200 OK)
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Jeśli sieć zawiedzie, spróbuj zwrócić z cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategia Cache First dla statycznych zasobów (obrazy, favicon itp.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
