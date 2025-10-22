// Service Worker for Offline Capability
const CACHE_NAME = 'paygate-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests and exclude API calls
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip caching API requests to avoid cache conflicts
  if (event.request.url.includes('/api/')) {
    // For API requests, just fetch directly without caching
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.warn('Failed to cache response:', error);
            });

          return response;
        }).catch((error) => {
          console.warn('Fetch failed:', error);
          // Return a custom offline response for non-API requests
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          // For other requests, return network error
          throw error;
        });
      })
  );
});

// Activate event - clean up old caches
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
    })
  );
});

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = JSON.parse(event.data.text());
    const title = data.title || 'PayGate Notification';
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations here
      // For example, retry failed API calls
      performBackgroundSync()
    );
  }
});

// Background sync function
async function performBackgroundSync() {
  // Implement background sync logic here
  // This could include retrying failed requests, syncing local data, etc.
  console.log('Performing background sync');
}
