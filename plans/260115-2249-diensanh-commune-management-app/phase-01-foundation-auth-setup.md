# Phase 01: Foundation & Auth Setup

## Context Links
- [Plan Overview](./plan.md)
- [PWA Research](./research/researcher-01-pwa-offline-patterns.md)
- Firebase Project: `diensanh-37701`

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 - Critical Path |
| Status | pending |
| Effort | 14h |
| Dependencies | Firebase project access |

Setup React+Vite+TypeScript project with Firebase Auth (phone OTP), basic routing, and project structure.

---

## Key Insights
- Firebase Auth phone OTP works offline after initial verification
- Use `browserLocalPersistence` for auth state
- Vietnamese phone format: +84 prefix required
- reCAPTCHA verifier needed for phone auth

---

## Requirements

### Functional
- FR1: User login via phone OTP
- FR2: Role-based access (commune_admin, village_leader, resident)
- FR3: Session persistence across browser restarts
- FR4: Logout functionality

### Non-Functional
- NFR1: Auth state loads <500ms
- NFR2: Works on 3G networks
- NFR3: Vietnamese language UI

---

## Architecture

```
web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── config/
│   │   └── firebase.ts           # Firebase init
│   ├── hooks/
│   │   ├── use-auth.ts           # Auth hook
│   │   └── use-network-status.ts # Online/offline
│   ├── contexts/
│   │   └── auth-context.tsx      # Auth provider
│   ├── components/
│   │   ├── ui/                   # Shared components
│   │   ├── layout/
│   │   │   ├── main-layout.tsx
│   │   │   └── sidebar.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       └── otp-verify.tsx
│   ├── pages/
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   └── not-found.tsx
│   ├── routes/
│   │   └── index.tsx             # Route config
│   ├── lib/
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

### Auth Flow
```
User enters phone → reCAPTCHA verify → OTP sent → User enters OTP →
Verify OTP → Fetch user role from Firestore → Redirect by role
```

---

## Related Code Files

### Create
- `web/` - New frontend directory
- All files in architecture above

### Modify
- `CLAUDE.md` - Add web/ project info

### Delete
- None

---

## Implementation Steps

### 1. Initialize Vite Project (1h)
```bash
cd /Users/nad/My\ Drive\ \(duc.a.nguyen@gmail.com\)/diensanh
npm create vite@latest web -- --template react-ts
cd web
npm install
```

### 2. Install Dependencies (1h)
```bash
# Core dependencies
npm install firebase react-router-dom zustand @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react clsx tailwind-merge

# shadcn/ui setup (Validated Decision)
npx shadcn@latest init
# Select: TypeScript, Default style, CSS variables, tailwind.config.js, @/components

# Install common shadcn components
npx shadcn@latest add button input label card dialog toast
npx shadcn@latest add form select textarea checkbox radio-group
npx shadcn@latest add table tabs avatar badge dropdown-menu
npx shadcn@latest add sheet sidebar navigation-menu

npx tailwindcss init -p
```

> **Note:** Use `ui-ux-pro-max` skill during implementation for design guidance.

### 3. Configure Firebase (1h)
Create `src/config/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
setPersistence(auth, browserLocalPersistence)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ cacheSizeBytes: 50 * 1024 * 1024 })
})
```

### 4. Setup TailwindCSS (0.5h)
Configure `tailwind.config.js` with Vietnamese-friendly fonts (Inter, Be Vietnam Pro).

### 5. Create Auth Context (2h)
Build `src/contexts/auth-context.tsx`:
- AuthProvider component
- useAuth hook
- Phone OTP verification flow
- Role fetching from Firestore `users/{uid}`

### 6. Build Login Page (2h)
Create `src/pages/login.tsx`:
- Phone input with +84 prefix
- reCAPTCHA container (invisible)
- OTP verification modal
- Loading states
- Error handling (Vietnamese messages)

### 7. Setup Routing (1.5h)
Create `src/routes/index.tsx`:
- Protected route wrapper
- Role-based redirects:
  - commune_admin → /admin/dashboard
  - village_leader → /village/dashboard
  - resident → /portal

### 8. Create Main Layout (1.5h)
Build `src/components/layout/`:
- Responsive sidebar (collapsible on mobile)
- Top navbar with user info
- Offline indicator banner
- Vietnamese labels

### 9. Environment Configuration (0.5h)
Create `.env.local`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=diensanh-37701.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=diensanh-37701
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 10. Test Auth Flow (1.5h)
- Test phone verification
- Test role-based routing
- Test session persistence
- Test offline auth state

---

## Todo List
- [ ] Initialize Vite project with React+TS
- [ ] Install and configure dependencies
- [ ] Setup Firebase config with persistence
- [ ] Configure TailwindCSS
- [ ] Create AuthContext and useAuth hook
- [ ] Build phone login form with OTP
- [ ] Setup react-router with protected routes
- [ ] Create main layout with sidebar
- [ ] Add network status indicator
- [ ] Test complete auth flow

---

## Success Criteria
- [ ] User can login with phone OTP
- [ ] Session persists across browser restarts
- [ ] Role-based routing works correctly
- [ ] Offline indicator shows when disconnected
- [ ] Vietnamese UI throughout
- [ ] No console errors in production build

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| reCAPTCHA blocked in Vietnam | High | Use invisible reCAPTCHA, test with VPN |
| SMS delivery delays | Medium | Show clear "waiting" UI, allow resend after 60s |
| Firebase quota limits | Low | Monitor usage, enable billing alerts |

---

## Security Considerations
- Never expose Firebase admin credentials in frontend
- Validate phone format before API call
- Rate limit OTP requests (Firebase handles this)
- Secure Firestore rules for user documents
- No sensitive data in localStorage

---

## Next Steps
After completion:
1. → Phase 02: Firestore Schema & Security Rules
2. Create test users for each role
3. Document auth flow for QA
