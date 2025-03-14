
// This is the service worker with the Offline-first caching

const CACHE = "bill-craft-v1";
const precacheFiles = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  // Add other important files here
];

// The install handler takes care of precaching the resources we always need
self.addEventListener("install", event => {
  console.log("Service worker installation");
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(precacheFiles))
  );
});

// The activate handler cleans up old caches
self.addEventListener("activate", event => {
  console.log("Service worker activation");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// The fetch handler serves responses from a cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, show a generic fallback
        return caches.match('/offline.html');
      })
  );
});
