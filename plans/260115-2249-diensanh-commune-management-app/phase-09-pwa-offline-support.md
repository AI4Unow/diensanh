# Phase 09: PWA & Offline Support

## Context Links
- [Plan Overview](./plan.md)
- [PWA Research](./research/researcher-01-pwa-offline-patterns.md)

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 12h |
| Dependencies | Phase 01-08 complete |

Full PWA implementation with offline support, background sync, and install prompt for rural Vietnam connectivity.

---

## Key Insights
- Firestore `persistentLocalCache` enables IndexedDB storage (50MB limit)
- vite-plugin-pwa with Workbox handles service worker
- Background Sync API queues SMS and form submissions
- `hasPendingWrites` metadata shows sync status
- Navigation preload improves cold start

---

## Requirements

### Functional
- FR1: App installable on mobile/desktop
- FR2: Works offline (cached data and UI)
- FR3: Offline form submissions queue and sync
- FR4: Clear offline/syncing indicators
- FR5: Update prompt for new versions

### Non-Functional
- NFR1: First load <3s on 3G
- NFR2: Offline load <1s
- NFR3: 50MB cache limit
- NFR4: Works on Android 7+ / iOS 12+

---

## Architecture

### PWA Configuration
```
vite.config.ts                 # PWA plugin config
src/
├── sw.ts                      # Custom service worker (if needed)
├── components/
│   ├── pwa/
│   │   ├── install-prompt.tsx     # Install banner
│   │   ├── update-prompt.tsx      # New version alert
│   │   ├── offline-indicator.tsx  # Network status
│   │   └── sync-status.tsx        # Pending writes
public/
├── manifest.json              # Web app manifest
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── offline.html               # Offline fallback
└── favicon.ico
```

### Caching Strategies
| Resource Type | Strategy | Reason |
|---------------|----------|--------|
| App shell (HTML/JS/CSS) | Cache First | Instant offline load |
| Images/fonts | Cache First + 365d expiry | Rarely change |
| Firestore data | Stale-While-Revalidate | Show cached, fetch fresh |
| API calls (GET) | Network First | Need fresh data |
| API calls (POST) | Network Only + Background Sync | Queue for retry |

---

## Related Code Files

### Create
- `public/manifest.json`
- `public/offline.html`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/apple-touch-icon.png`
- `src/components/pwa/install-prompt.tsx`
- `src/components/pwa/update-prompt.tsx`
- `src/components/pwa/offline-indicator.tsx`
- `src/components/pwa/sync-status.tsx`
- `src/hooks/use-network-status.ts`
- `src/hooks/use-pending-writes.ts`

### Modify
- `vite.config.ts` - Add VitePWA plugin config
- `src/main.tsx` - Register service worker
- `src/config/firebase.ts` - Enable persistence
- `src/layouts/admin-layout.tsx` - Add offline indicator
- `index.html` - Add manifest link, theme-color

---

## Implementation Steps

### 1. Configure VitePWA Plugin (2h)
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      devOptions: { enabled: true },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        navigationPreload: true,

        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          // Static assets
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          // API GET requests
          {
            urlPattern: /\/api\/.*$/,
            method: 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10
            }
          },
          // API POST with Background Sync
          {
            urlPattern: /\/api\/sms\/.*/,
            method: 'POST',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'sms-queue',
                options: { maxRetentionTime: 24 * 60 }
              }
            }
          },
          {
            urlPattern: /\/api\/requests/,
            method: 'POST',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'requests-queue',
                options: { maxRetentionTime: 24 * 60 }
              }
            }
          }
        ]
      },

      manifest: {
        name: 'Diên Sanh - Quản Lý Xã',
        short_name: 'Diên Sanh',
        description: 'Ứng dụng quản lý UBND xã Diên Sanh',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
```

### 2. Create Web App Manifest (0.5h)
Already generated by VitePWA plugin.

### 3. Create App Icons (1h)
Generate icons for all sizes:
- 192x192 (Android)
- 512x512 (Android splash)
- 180x180 (iOS apple-touch-icon)
- favicon.ico

### 4. Update index.html (0.5h)
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#16a34a" />
  <meta name="description" content="Cổng thông tin UBND xã Diên Sanh" />

  <!-- iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Diên Sanh" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <title>UBND Xã Diên Sanh</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### 5. Register Service Worker (1h)
```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update prompt
    if (confirm('Phiên bản mới có sẵn. Tải lại?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready for offline use')
  },
  onRegisteredSW(swUrl, r) {
    // Check for updates every hour
    r && setInterval(() => r.update(), 60 * 60 * 1000)
  }
})
```

### 6. Create useNetworkStatus Hook (0.5h)
```typescript
// src/hooks/use-network-status.ts
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

### 7. Create OfflineIndicator Component (1h)
```typescript
// src/components/pwa/offline-indicator.tsx
export function OfflineIndicator() {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
      <WifiOff className="inline h-4 w-4 mr-2" />
      Bạn đang offline. Một số tính năng có thể bị giới hạn.
    </div>
  )
}
```

### 8. Create usePendingWrites Hook (1h)
```typescript
// src/hooks/use-pending-writes.ts
export function usePendingWrites() {
  const [hasPendingWrites, setHasPendingWrites] = useState(false)
  const { db } = useFirestore()

  useEffect(() => {
    // Listen to multiple collections for pending writes
    const collections = ['requests', 'households']

    const unsubscribes = collections.map(collName => {
      return onSnapshot(
        collection(db, collName),
        { includeMetadataChanges: true },
        (snapshot) => {
          const pending = snapshot.metadata.hasPendingWrites
          setHasPendingWrites(prev => prev || pending)
        }
      )
    })

    return () => unsubscribes.forEach(unsub => unsub())
  }, [db])

  return hasPendingWrites
}
```

### 9. Create SyncStatus Component (1h)
```typescript
// src/components/pwa/sync-status.tsx
export function SyncStatus() {
  const isOnline = useNetworkStatus()
  const hasPendingWrites = usePendingWrites()

  if (!hasPendingWrites) return null

  return (
    <div className={cn(
      'fixed bottom-4 left-4 px-4 py-2 rounded-full shadow-lg flex items-center gap-2',
      isOnline ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
    )}>
      {isOnline ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Đang đồng bộ...</span>
        </>
      ) : (
        <>
          <Cloud className="h-4 w-4" />
          <span className="text-sm">Chờ kết nối</span>
        </>
      )}
    </div>
  )
}
```

### 10. Create InstallPrompt Component (1.5h)
```typescript
// src/components/pwa/install-prompt.tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show after 30 seconds if not installed
      setTimeout(() => setShowPrompt(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-xl border p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Cài đặt ứng dụng</h3>
          <p className="text-sm text-gray-500">
            Truy cập nhanh hơn, hoạt động offline
          </p>
        </div>
        <button onClick={() => setShowPrompt(false)}>
          <X className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setShowPrompt(false)} className="flex-1">
          Để sau
        </Button>
        <Button onClick={handleInstall} className="flex-1">
          Cài đặt
        </Button>
      </div>
    </div>
  )
}
```

### 11. Create UpdatePrompt Component (1h)
```typescript
// src/components/pwa/update-prompt.tsx
export function UpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null)

  useEffect(() => {
    registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onRegistered(r) {
        // Store update function
      }
    })
  }, [])

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 bg-primary text-white rounded-lg shadow-xl p-4 z-50">
      <p className="text-sm mb-3">Phiên bản mới có sẵn!</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setNeedRefresh(false)}>
          Để sau
        </Button>
        <Button variant="default" size="sm" onClick={() => updateSW?.(true)}>
          Cập nhật
        </Button>
      </div>
    </div>
  )
}
```

### 12. Update Firestore Config (0.5h)
```typescript
// src/config/firebase.ts
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB
    tabManager: persistentMultipleTabManager()
  })
})
```

### 13. Test Offline Functionality (1.5h)
- Test with Chrome DevTools offline mode
- Test on real device with airplane mode
- Verify data syncs when back online

---

## Todo List
- [ ] Install vite-plugin-pwa
- [ ] Configure VitePWA in vite.config.ts
- [ ] Create app icons (192, 512, apple-touch)
- [ ] Update index.html with meta tags
- [ ] Register service worker in main.tsx
- [ ] Create useNetworkStatus hook
- [ ] Create OfflineIndicator component
- [ ] Create usePendingWrites hook
- [ ] Create SyncStatus component
- [ ] Create InstallPrompt component
- [ ] Create UpdatePrompt component
- [ ] Update Firestore config for persistence
- [ ] Add PWA components to layouts
- [ ] Test install on Android/iOS
- [ ] Test offline mode
- [ ] Test background sync
- [ ] Test update flow

---

## Success Criteria
- [ ] App installable on Android/iOS
- [ ] Lighthouse PWA score > 90
- [ ] Offline page loads with cached data
- [ ] Offline writes sync when back online
- [ ] Install prompt shows on mobile
- [ ] Update prompt works correctly
- [ ] Network status indicator accurate

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS PWA limitations | Medium | Test on iOS, document limitations |
| Cache size overflow | Medium | Set 50MB limit, evict old data |
| Service worker update issues | Low | Force update button, clear cache |

---

## Security Considerations
- Service worker scope limited to app
- No sensitive data in cache
- HTTPS required for PWA

---

## Next Steps
After completion:
1. → Phase 10: Testing & Deployment
2. Test on various devices
3. Monitor cache usage
