# E2E Test Screenshot Analysis Report

**Date:** 2026-01-16 18:55
**Issue:** All E2E test screenshots showing login page instead of intended protected pages
**Status:** Root causes identified, solutions proposed

## Executive Summary

The E2E tests are failing to access protected routes (admin dashboard, SMS interface, village dashboard) because:

1. **Session persistence failure** - Authentication state not properly saved/restored
2. **Missing authentication bypass** - No test-specific auth mechanisms
3. **Firebase emulator dependency** - Tests rely on Firebase Auth but may not be properly configured
4. **Race conditions** - Authentication state loading vs route protection timing

## Root Cause Analysis

### 1. Authentication Flow Issues

**File:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/contexts/auth-context.tsx`

The authentication context has a critical loading state that affects route protection:

```typescript
// Lines 32-72: Authentication state management
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setUser(firebaseUser)

    if (firebaseUser) {
      try {
        // Fetch user document from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserDoc({
            uid: firebaseUser.uid,
            phone: data.phone,
            displayName: data.displayName,
            role: data.role as UserRole,
            villageId: data.villageId,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          })
        } else {
          // User exists in Auth but not in Firestore
          setUserDoc(null)
        }
      } catch (err) {
        console.error('Error fetching user document:', err)
        setError('Không thể tải thông tin người dùng')
        setUserDoc(null)
      }
    } else {
      setUserDoc(null)
    }

    setLoading(false)
  })

  return () => unsubscribe()
}, [])
```

**Problem:** The auth context requires both Firebase Auth user AND Firestore user document. If either fails, user is redirected to login.

### 2. Protected Route Logic

**File:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/routes/index.tsx`

```typescript
// Lines 40-62: ProtectedRoute component
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userDoc, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && userDoc && !allowedRoles.includes(userDoc.role)) {
    if (userDoc.role === 'commune_admin') {
      return <Navigate to="/admin" replace />
    } else if (userDoc.role === 'village_leader') {
      return <Navigate to="/village" replace />
    } else {
      return <Navigate to="/portal" replace />
    }
  }

  return <>{children}</>
}
```

**Problem:** Strict authentication checks with no test bypass mechanism.

### 3. Session Management Issues

**Analysis of test scripts:**

**File:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/auth/03-admin-redirect.sh`

```bash
# Lines 6-29: Authentication flow
ADMIN_PHONE="0900000001"  # Test admin account
TEST_OTP="123456"

ab --session admin open "$BASE_URL/login"
snapshot_wait

ab --session admin snapshot -i
ab --session admin fill @e3 "$ADMIN_PHONE"
ab --session admin click @e4
sleep 2

ab --session admin snapshot -i
ab --session admin fill @e5 "$TEST_OTP"
ab --session admin click @e6
sleep 3

# Verify redirect to /admin
ab --session admin snapshot -i
screenshot "admin-dashboard"

# Save session for reuse
ab --session admin snapshot --save-state "$SESSIONS_DIR/admin-auth.json"
```

**Problem:** Session state is saved but directory is empty:
```
/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/sessions/
total 0
-rw-------   1 nad  staff    0 Jan 16 18:00 .gitkeep
```

### 4. Test Execution Flow Issues

**File:** `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/admin/05-dashboard.sh`

```bash
# Lines 6-16: Admin dashboard test
ab --session admin open "$BASE_URL/admin" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "admin-dashboard"
```

**Problem:** Tests try to load non-existent session state file, causing authentication failure.

## Technical Issues Identified

### 1. Firebase Emulator Configuration
- Tests use Firebase Auth emulator with test phone numbers
- Emulator may not be running or properly configured
- User documents may not exist in Firestore emulator

### 2. Agent-Browser Session Persistence
- Session state files not being created/saved properly
- `--save-state` and `--state` flags may not work as expected
- Browser sessions not persisting authentication cookies/tokens

### 3. Race Conditions
- Authentication state loading vs route protection timing
- Firebase Auth state change vs Firestore document fetch
- Page navigation happening before auth state is fully loaded

### 4. Missing Test Infrastructure
- No authentication bypass for testing
- No mock authentication providers
- No test-specific user seeding

## Proposed Solutions

### 1. Immediate Fixes

**A. Add Test Authentication Bypass**
Create environment-based auth bypass in `auth-context.tsx`:

```typescript
// Add test mode detection
const isTestMode = process.env.NODE_ENV === 'test' ||
                   window.location.search.includes('test-auth=true')

if (isTestMode) {
  // Bypass Firebase Auth for tests
  setUser({ uid: 'test-admin' } as User)
  setUserDoc({
    uid: 'test-admin',
    phone: '0900000001',
    displayName: 'Test Admin',
    role: 'commune_admin',
    villageId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  setLoading(false)
  return
}
```

**B. Fix Session State Management**
Update test scripts to properly handle session persistence:

```bash
# Create session directory if not exists
mkdir -p "$SESSIONS_DIR"

# Use test-auth bypass instead of Firebase Auth
ab --session admin open "$BASE_URL/admin?test-auth=true&role=commune_admin"
```

### 2. Long-term Solutions

**A. Implement Test Authentication Provider**
Create dedicated test auth context that mocks Firebase Auth.

**B. Add Firebase Emulator Setup**
Ensure Firebase emulators are running and seeded with test data.

**C. Improve Test Infrastructure**
- Add test user seeding scripts
- Implement proper session management
- Add authentication state verification

### 3. Verification Steps

1. Check if Firebase emulators are running
2. Verify test user documents exist in Firestore
3. Test session state persistence manually
4. Implement auth bypass and re-run tests

## Files Requiring Changes

1. `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/contexts/auth-context.tsx` - Add test bypass
2. `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/auth/03-admin-redirect.sh` - Fix session management
3. `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/admin/*.sh` - Update to use auth bypass
4. `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/sms/*.sh` - Update to use auth bypass
5. `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/village/*.sh` - Update to use auth bypass

## Unresolved Questions

1. Are Firebase emulators properly configured and running during tests?
2. Does agent-browser session persistence work correctly with Firebase Auth tokens?
3. Should we implement a dedicated test authentication system vs fixing Firebase emulator integration?
4. What is the expected test execution order for authentication setup?