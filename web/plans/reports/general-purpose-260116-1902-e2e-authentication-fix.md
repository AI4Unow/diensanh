# E2E Authentication Fix Implementation Plan

## Problem Analysis

### Root Cause
E2E tests fail to access protected routes because:
1. **Session Persistence Failure** - Session files empty, auth state not maintained
2. **Strict Authentication Requirements** - App requires both Firebase Auth user AND Firestore user document
3. **Protected Route Logic** - No test bypass, all protected routes redirect to `/login`
4. **Firebase Emulator Dependencies** - Not configured for testing environment

### Current Authentication Flow
From `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/contexts/auth-context.tsx`:
```typescript
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userDoc, loading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />  // ← BLOCKS E2E TESTS
  if (allowedRoles && userDoc && !allowedRoles.includes(userDoc.role)) {
    // Role-based redirects
  }
  return <>{children}</>
}
```

## Solution: Firebase Emulator + Test Mode (Recommended)

### Architecture
```
E2E Tests → Firebase Emulator → Test Auth State
- Mock users    - Local auth     - Admin user
- Test sessions - Test database  - Village user
```

### Implementation Phases

#### Phase 1: Firebase Emulator Setup
1. **Install Firebase CLI and emulator**
   - Add Firebase emulator to dev dependencies
   - Configure emulator for auth and firestore
   - Create emulator initialization script

2. **Create test user fixtures**
   - Admin user with `commune_admin` role
   - Village leader with `village_leader` role
   - Resident user with `resident` role

#### Phase 2: Authentication Utilities
3. **Create auth helper functions**
   - Login utility for different user roles
   - Session persistence management
   - Browser storage manipulation for Firebase tokens

4. **Implement session management**
   - Persistent auth state across navigation
   - Token refresh handling
   - Logout and cleanup utilities

#### Phase 3: Test Environment Configuration
5. **Modify Firebase config for test mode**
   - Detect test environment
   - Connect to emulator instead of production
   - Environment variable configuration

6. **Update E2E test scripts**
   - Authenticate before protected route access
   - Role-based test scenarios
   - Proper session handling

#### Phase 4: Protected Route Testing
7. **Update screenshot capture**
   - Verify authentication before screenshots
   - Assert not on login page
   - Capture actual protected content

8. **Add verification steps**
   - Check for protected page elements
   - Verify role-based content visibility
   - Test navigation between protected routes

## Files to Create/Modify

### New Files
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/setup/firebase-emulator.sh`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/fixtures/test-users.json`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/auth-helpers.sh`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/session-manager.sh`

### Files to Modify
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/config/firebase.ts`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/test-utils.sh`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/test-auth.sh`

## Implementation Steps

### Step 1: Firebase Emulator Configuration
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulator
firebase init emulators
```

### Step 2: Test User Fixtures
```json
{
  "users": [
    {
      "uid": "test-admin-001",
      "email": "admin@test.local",
      "phone": "+84912345678",
      "role": "commune_admin",
      "displayName": "Test Admin"
    },
    {
      "uid": "test-village-001",
      "email": "village@test.local",
      "phone": "+84987654321",
      "role": "village_leader",
      "displayName": "Test Village Leader"
    }
  ]
}
```

### Step 3: Authentication Helpers
```bash
# Login as admin user
login_as_admin() {
  local user_data='{"uid":"test-admin-001","role":"commune_admin"}'
  ab eval "
    localStorage.setItem('firebase:authUser:test', '$user_data');
    sessionStorage.setItem('firebase:authUser:test', '$user_data');
  "
}

# Verify authentication
verify_authenticated() {
  local auth_state=$(ab eval "localStorage.getItem('firebase:authUser:test')")
  [[ -n "$auth_state" ]] && return 0 || return 1
}
```

### Step 4: Updated Test Flow
```bash
test_admin_dashboard() {
  log_section "Admin Dashboard Screenshot"

  # Authenticate first
  login_as_admin
  sleep 1

  # Navigate to protected route
  navigate_to "/admin"
  sleep 3

  # Verify not on login page
  if assert_url_contains "/login"; then
    log_fail "Still on login page - authentication failed"
    return 1
  fi

  # Verify admin content
  if is_visible "[data-testid='admin-dashboard']"; then
    log_success "Admin dashboard loaded successfully"
    screenshot "admin-dashboard-authenticated"
  else
    log_fail "Admin dashboard content not visible"
  fi
}
```

## Success Criteria
- E2E tests successfully authenticate and access protected routes
- Screenshots capture actual protected page content (not login page)
- Admin dashboard screenshots show admin-specific content
- SMS page screenshots show SMS management interface
- Village dashboard screenshots show village-specific content
- Tests run reliably in both local and CI environments

## Risk Mitigation
- **Emulator Setup Complexity**: Provide detailed setup documentation
- **Session Persistence**: Implement retry logic for auth operations
- **Timing Issues**: Add explicit waits for auth state changes
- **CI/CD Integration**: Use lightweight emulator config for faster startup

## Security Considerations
- Test users only exist in emulator, not production
- Emulator data isolated from production Firebase
- No real credentials used in tests
- Clear separation between test and production configs

## Next Steps
1. Implement Firebase emulator setup
2. Create test user fixtures and auth utilities
3. Update E2E test scripts with authentication
4. Verify protected route screenshot capture
5. Test in CI/CD environment

## Unresolved Questions
- Should we implement fallback authentication mocking as backup?
- How to handle Firebase emulator in CI/CD pipeline efficiently?
- Need to verify agent-browser localStorage/sessionStorage manipulation works reliably?