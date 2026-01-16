/// <reference lib="webworker" />

const CACHE_NAME = 'diensanh-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
]

// Install event - cache essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  // Activate immediately
  ;(self as unknown as ServiceWorkerGlobalScope).skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control of all pages immediately
  ;(self as unknown as ServiceWorkerGlobalScope).clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) return

  // Skip Firebase/API requests
  if (request.url.includes('firebaseio.com') ||
      request.url.includes('googleapis.com') ||
      request.url.includes('firebase')) {
    return
  }

  event.respondWith(
    // Try network first
    fetch(request)
      .then((response) => {
        // Clone response for caching
        const responseClone = response.clone()

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }

        return response
      })
      .catch(async () => {
        // Network failed, try cache
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          return cachedResponse
        }

        // For navigation requests, show offline page
        if (request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL)
          if (offlineResponse) {
            return offlineResponse
          }
        }

        // Return a basic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        })
      })
  )
})

// Handle messages from the app
self.addEventListener('message', (event: MessageEvent) => {
  if (event.data === 'skipWaiting') {
    ;(self as unknown as ServiceWorkerGlobalScope).skipWaiting()
  }
})

export {}
