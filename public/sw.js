
// Service Worker com estratégia de cache e atualizações offline-first

const CACHE_NAME = "bill-craft-v2";
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

// Estratégia Stale-while-revalidate para melhor desempenho
self.addEventListener("fetch", (event) => {
  // Ignorar solicitações que não começam com http/https
  if (!event.request.url.startsWith('http')) return;
  
  // Ignorar solicitações para APIs e extensões de navegador
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('chrome-extension') ||
      event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Usar cache se disponível, mas sempre tentar atualizar em segundo plano
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Verificar se recebemos uma resposta válida
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const respToCache = networkResponse.clone();
            
            // Atualizar o cache de forma assíncrona
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, respToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Se a rede falhar e for uma solicitação de página, exiba a página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          
          // Para outros recursos (imagens, scripts, etc.) que falharam, retorne um placeholder ou nulo
          return null;
        });

      return cachedResponse || fetchPromise;
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
