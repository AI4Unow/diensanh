# Frontend Structure Analysis

**Project**: Diễn Sanh Commune Management PWA
**Stack**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
**State**: Zustand | **Data**: TanStack Query | **Auth**: Firebase Phone OTP

---

## 1. Routing Architecture

**File**: `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/routes/index.tsx`

### Role-Based Access Control
- **Public**: `/portal/*` (no auth required)
- **Commune Admin**: `/admin/*` (role: `commune_admin`)
- **Village Leader**: `/village/*` (role: `village_leader`)
- **Protected Routes**: `ProtectedRoute` component enforces role-based redirects

### Authentication Flow
1. User lands on `/login` → `LoginForm` component (Phone OTP)
2. `useAuth` hook checks user + userDoc from Firebase
3. Auto-redirect based on role:
   - `commune_admin` → `/admin`
   - `village_leader` → `/village`
   - `public` → `/portal`

**Key Components**:
- `AuthProvider` context wraps entire app
- `useAuth` hook provides `{ user, userDoc, loading }`
- Lazy-loaded routes with `Suspense` + `PageLoader`

---

## 2. Pages & Routes (23 total)

### Public Portal (No Auth)
| Route | Page | Purpose |
|-------|------|---------|
| `/portal` | `PortalHomePage` | Public landing page |
| `/portal/announcements` | `AnnouncementsPage` | View commune announcements |
| `/portal/requests/new` | `RequestFormPage` | Submit public service requests |
| `/portal/chatbot` | `ChatbotPage` | AI assistant for public queries |

### Commune Admin Routes
| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | `AdminDashboardPage` | Admin dashboard |
| `/admin/villages` | `VillagesPage` | List all villages |
| `/admin/villages/:villageId` | `VillageDetailPage` | Village details |
| `/admin/villages/:villageId/households` | `HouseholdsPage` | Households in village |
| `/admin/villages/:villageId/households/new` | `HouseholdFormPage` | Create household |
| `/admin/villages/:villageId/households/:householdId` | `HouseholdDetailPage` | Household details |
| `/admin/villages/:villageId/households/:householdId/edit` | `HouseholdFormPage` | Edit household |
| `/admin/villages/:villageId/households/:householdId/residents/new` | `ResidentFormPage` | Add resident |
| `/admin/villages/:villageId/households/:householdId/residents/:residentId/edit` | `ResidentFormPage` | Edit resident |
| `/admin/households` | `HouseholdsPage` | All households (no village filter) |
| `/admin/sms` | `SMSPage` | SMS campaign management |
| `/admin/tasks` | `TasksPage` | Task list |
| `/admin/tasks/new` | `TaskFormPage` | Create task |
| `/admin/tasks/:taskId` | `TaskDetailPage` | Task details |
| `/admin/tasks/:taskId/edit` | `TaskFormPage` | Edit task |

### Village Leader Routes
| Route | Page | Purpose |
|-------|------|---------|
| `/village` | `VillageDashboardPage` | Village leader dashboard |
| `/village/*` | `VillageDashboardPage` | Fallback for village routes |

### Utility
| Route | Page | Purpose |
|-------|------|---------|
| `/login` | `LoginPage` | Phone OTP authentication |
| `/` | Redirect → `/portal` | Default landing |
| `*` | `NotFoundPage` | 404 handler |

---

## 3. Key Interactive Components (Critical Test Targets)

### Forms
1. **`LoginForm`** (`web/src/components/auth/login-form.tsx`)
   - Phone number input + OTP verification
   - Firebase Auth integration

2. **`HouseholdFormPage`** (Create/Edit)
   - Household registration
   - Used at `/admin/villages/:villageId/households/new` and `edit`

3. **`ResidentFormPage`** (Create/Edit)
   - Resident information
   - Used at nested household routes

4. **`TaskFormPage`** (Create/Edit)
   - Task creation/editing
   - Used at `/admin/tasks/new` and `/admin/tasks/:taskId/edit`

5. **`RequestFormPage`**
   - Public service request submission
   - No auth required

### Data Tables/Lists
- **`VillagesPage`**: Village list with navigation
- **`HouseholdsPage`**: Household list with filters
- **`TasksPage`**: Task list with status filters
- **`AnnouncementsPage`**: Public announcements

### Modals
- **`ComposeModal`** (`web/src/pages/admin/sms/compose-modal.tsx`)
  - SMS composition interface

### Navigation
- Role-based bottom nav (admin vs village vs public)
- Check `web/src/components/layout/*` for nav components

---

## 4. Data Fetching Patterns

**TanStack Query Config**:
```tsx
queryClient: {
  staleTime: 5 minutes,
  retry: 1
}
```

**Expected Patterns**:
- `useQuery` for data fetching
- `useMutation` for create/update/delete
- Likely using Firebase Firestore hooks or custom fetch functions

**Files to Check**:
- `web/src/hooks/use-*.tsx` (custom hooks)
- `web/src/lib/firebase.ts` or `web/src/lib/api.ts` (API layer)

---

## 5. Testing Coverage

**Current Status**: ❌ **NO TEST FILES FOUND**

**Search Results**:
- `**/*.test.*` → No matches
- No Jest/Vitest config detected in glob

**Missing Tests**:
- Unit tests for components
- Integration tests for auth flows
- E2E tests for critical user journeys

---

## 6. Critical Test Scenarios

### Authentication
1. ✅ Phone OTP login flow
2. ✅ Role-based redirect (admin/village/public)
3. ✅ Protected route enforcement
4. ✅ Session persistence

### Admin Flows
1. ✅ Village CRUD operations
2. ✅ Household creation/editing
3. ✅ Resident management within households
4. ✅ Task creation/assignment
5. ✅ SMS campaign composition

### Public Portal
1. ✅ View announcements without login
2. ✅ Submit service requests anonymously
3. ✅ Chatbot interaction

### Data Integrity
1. ✅ Form validation (phone numbers, required fields)
2. ✅ Network error handling
3. ✅ Loading states
4. ✅ Query retry logic

---

## Unresolved Questions

1. **Component Library**: Are shadcn/ui components tested separately?
2. **API Mocking**: Is there a mock Firestore setup for tests?
3. **E2E Framework**: Playwright/Cypress installed but not configured?
4. **State Management**: Where is Zustand used? (Not seen in routes/auth)
5. **Form Library**: Using react-hook-form or custom validation?
