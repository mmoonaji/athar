const CACHE_NAME = 'athar-pwa-cache-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/learn',
  '/journey',
  '/bookmarks',
  '/profile',
  '/manifest.json',
  '/favicon.ico'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy to update cache in background
        fetch(event.request).then((freshResponse) => {
          if (freshResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, freshResponse)
            })
          }
        }).catch(() => {})
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      }).catch(async () => {
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME)
          const fallback = await cache.match('/learn')
          return fallback || new Response('Offline', { status: 503 })
        }
        return new Response('Offline', { status: 503 })
      })
    })
  )
})
