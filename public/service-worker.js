const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/images/icons/icon-192x192.png',
  '/assets/images/icons/icon-512x512.png',
  '/assets/js/index.js',
  '/db.js',
  '/manifest.json',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
];

const STATIC_CACHE = 'static-cache-v2';
const RUNTIME_CACHE = 'runtime-cache-v1';

self.addEventListener('install', (e) => {
  // Pre cache all static assets.
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
    // Tell the browser to activate this service worker immediately once it has finished installing.
    // .then(self.skipWaiting())
  );
  self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (e) => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Cache successful requests to the API.
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      caches
        .open(RUNTIME_CACHE)
        .then((cache) => {
          return fetch(e.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(e.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  // If the request is not for the API, serve static assets using "offline-first" approach.
  e.respondWith(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.match(e.request).then((response) => {
        return response || fetch(e.request);
      });
    })
  );
});
