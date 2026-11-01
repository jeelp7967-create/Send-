// SENND Progressive Web App - Service Worker
// Version: 1.0.0 (PWABuilder & W3C Compliant)

const CACHE_NAME = 'sennd-cache-v1.0.0';
const RUNTIME_CACHE = 'sennd-runtime-v1.0.0';

// Essential core shell assets for instant offline boot
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg',
  '/icons/scan-shortcut.png',
  '/icons/create-shortcut.png'
];

// Third-party CDN libraries used by SENND
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// Install Event: Precache app shell with resilient error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precache local core shell first
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[SENND SW] Core precache issue:', err);
      }

      // Try caching CDN assets gracefully
      for (const cdnUrl of CDN_ASSETS) {
        try {
          const response = await fetch(cdnUrl, { mode: 'cors' });
          if (response && response.ok) {
            await cache.put(cdnUrl, response);
          }
        } catch (cdnErr) {
          // CDN fetch failed or offline during install, safe to proceed
          console.warn('[SENND SW] Optional CDN precache skipped:', cdnUrl, cdnErr);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches and claim existing clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            console.log('[SENND SW] Removing obsolete cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event Strategy:
// 1. Navigation (HTML): Network-first with cache fallback (ensures fresh updates + offline support)
// 2. Static Assets (CSS, JS, Fonts, Images, Icons): Stale-While-Revalidate
// 3. API endpoints: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Ignore browser extensions, chrome-extension://, live reload websockets
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests (Page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return caches.match('/');
        })
    );
    return;
  }

  // 2. API requests (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return offline JSON
            return new Response(JSON.stringify({ 
              status: 'offline', 
              message: 'You are currently offline. Cached data may be displayed.', 
              data: [] 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // 3. Static assets, CDN scripts, fonts, images: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            const targetCache = url.origin === self.location.origin ? CACHE_NAME : RUNTIME_CACHE;
            caches.open(targetCache).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, cache is already returned if available
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for SKIP_WAITING from client update prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
