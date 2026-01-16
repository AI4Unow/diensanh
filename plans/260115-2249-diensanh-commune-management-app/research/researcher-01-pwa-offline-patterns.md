# PWA & Offline-First Architecture Research Report
**Project:** Diên Sanh Commune Management App
**Date:** 2026-01-15
**Researcher:** researcher-01

---

## Executive Summary
Offline-first PWA architecture for rural Vietnam commune app requires Firestore persistence, Vite PWA plugin with Workbox, optimistic UI patterns, and Background Sync API for reliable operation in low-connectivity environments.

---

## 1. Firestore Offline Persistence (IndexedDB)

### Configuration
```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB for rural devices
    tabManager: persistentMultipleTabManager()
  })
})
```

### Key Practices
- **Enable persistence explicitly** (unlike mobile SDKs, web requires activation)
- **Multi-tab sync:** `persistentMultipleTabManager()` ensures cache consistency across tabs
- **Cache size limits:** Critical for low-end devices (default unlimited growth causes performance degradation)
- **Auth persistence:** Firebase Auth uses `browserLocalPersistence` by default (check user sync on startup to avoid flicker)

---

## 2. Optimistic UI & Sync Patterns

### Metadata-Driven UI States
```typescript
onSnapshot(docRef, { includeMetadataChanges: true }, (snapshot) => {
  const data = snapshot.data()
  const fromCache = snapshot.metadata.fromCache
  const hasPendingWrites = snapshot.metadata.hasPendingWrites

  // Show indicators: "Offline Mode" | "Syncing..." | "✓ Synced"
  setUIStatus({
    mode: fromCache ? 'offline' : 'online',
    syncing: hasPendingWrites
  })
})
```

### Critical Rules
- **Never `await` writes for UI updates** (blocks until server acknowledges)
- **Update UI immediately** on user action, Firestore queues writes automatically
- **Use `writeBatch()` not transactions** (transactions fail offline, batches queue and retry)

### Conflict Resolution
- **Default:** Last-write-wins based on server arrival time
- **Complex scenarios:** Use version-tracked documents or distributed counters to prevent data loss during long offline periods

---

## 3. Vite PWA Plugin Configuration

### Recommended Strategy: `generateSW` (Auto-Generated)
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      devOptions: { enabled: true }, // Debug in dev mode (2026 standard)

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            // Static assets: Cache-First (instant load even offline)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            // Dynamic content: Stale-While-Revalidate
            urlPattern: /\/api\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-cache' }
          },
          {
            // Background Sync for POST operations (SMS queue)
            urlPattern: /\/api\/sms\/.*/,
            method: 'POST',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'sms-queue',
                options: { maxRetentionTime: 24 * 60 } // Retry for 24 hours
              }
            }
          }
        ],

        // Navigation preload (start fetch while SW boots)
        navigationPreload: true
      },

      manifest: {
        name: 'Diên Sanh - Quản Lý Xã',
        short_name: 'Diên Sanh',
        theme_color: '#4CAF50',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

---

## 4. Advanced: Custom Service Worker (`injectManifest`)

Use when needing:
- Push notifications
- Custom Background Sync logic
- Complex offline fallback pages

```typescript
// src/sw.ts
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SMS queue with retry logic
const bgSyncPlugin = new BackgroundSyncPlugin('sms-queue', {
  maxRetentionTime: 24 * 60, // 24 hours
  onSync: async ({ queue }) => {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request)
      } catch (error) {
        await queue.unshiftRequest(entry)
        throw error
      }
    }
  }
})

registerRoute(
  /\/api\/sms\/.*/,
  new NetworkFirst({
    cacheName: 'sms-api',
    plugins: [bgSyncPlugin]
  }),
  'POST'
)

self.skipWaiting()
```

---

## 5. React Integration Patterns

### Service Worker Registration
```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready for offline use')
  }
})
```

### Connectivity Indicators
```typescript
import { useEffect, useState } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

---

## 6. Architecture Summary for Rural Vietnam

| Layer | Technology | Strategy |
|-------|-----------|----------|
| **Data Store** | Firestore + IndexedDB | `persistentLocalCache` with 50MB limit |
| **Service Worker** | vite-plugin-pwa + Workbox | `generateSW` with Background Sync |
| **Static Assets** | HTML/CSS/JS/Images | Cache-First (instant offline load) |
| **Dynamic Data** | Firestore queries | Stale-While-Revalidate + metadata listeners |
| **Write Operations** | SMS queue, form submissions | `writeBatch()` + Background Sync queue |
| **Conflict Handling** | Last-write-wins | Version tracking for critical documents |
| **UI Feedback** | Network status + sync indicators | `navigator.onLine` + Firestore metadata |

---

## Unresolved Questions

1. **SMS provider integration:** Does the SMS API support webhook-based retry confirmations, or purely client-side queue?
2. **Offline query scope:** Which Firestore queries need pre-caching? (e.g., all households in village, or just current user's assigned households?)
3. **Data versioning:** Do village leaders need conflict resolution UI for concurrent edits from multiple devices?
4. **Cache eviction policy:** Should older household records auto-expire from IndexedDB after X days for storage management?
5. **Auth token refresh:** How to handle Firebase Auth token expiration during extended offline periods (>1 hour)?
