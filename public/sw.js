
// Service Worker com estratégia de cache e atualizações offline-first

const CACHE_NAME = "fastmoney-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/offline.html",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png"
];

// Instalar o Service Worker e pré-cachear os arquivos essenciais
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching assets");
      return cache.addAll(ASSETS);
    })
  );
  
  // Ativar imediatamente, sem esperar pelo fechamento das abas antigas
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log("[ServiceWorker] Clearing old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log("[ServiceWorker] Claiming clients");
      return self.clients.claim();
    })
  );
});

// Melhor estratégia para cache primeiro, depois rede
self.addEventListener("fetch", (event) => {
  // Ignorar solicitações que não começam com http/https
  if (!event.request.url.startsWith('http')) return;
  
  // Ignorar solicitações para APIs e extensões de navegador
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('chrome-extension') ||
      event.request.url.includes('supabase.co')) {
    return;
  }

  // Para navegação (páginas), vamos usar Network First com fallback para cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }

  // Para recursos estáticos, usamos Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Se temos no cache, começamos a tentar atualizar em segundo plano
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                const respToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, respToCache);
                  });
              }
            })
            .catch(() => console.log('[ServiceWorker] Fetch failed, serving from cache'));
          
          return cachedResponse;
        }

        // Se não temos no cache, buscamos da rede
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Fazemos uma cópia para o cache
            const respToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, respToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('[ServiceWorker] Fetch failed:', error);
            // Para imagens, podemos tentar retornar um placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/placeholder.svg');
            }
            return new Response('Network error', { 
              status: 408, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });
      })
  );
});

// Sincronizar em segundo plano quando a conexão for restaurada
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bills') {
    console.log('[ServiceWorker] Syncing bills');
    // Aqui você implementaria a lógica para sincronizar dados armazenados localmente
  }
});

// Lidar com notificações push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Você tem uma notificação',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Bill Craft', options)
    );
  }
});

// Quando uma notificação é clicada
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then((clientList) => {
      const url = event.notification.data.url;
      
      // Se já tem uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
