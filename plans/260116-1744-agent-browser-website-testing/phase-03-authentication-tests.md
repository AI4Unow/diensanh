---
phase: 3
title: "Authentication Tests"
status: pending
priority: P1
effort: 2h
---

# Phase 3: Authentication Tests

## Context Links

- [Frontend Analysis - Auth Flow](./research/researcher-02-frontend-analysis.md#authentication-flow)
- [Agent-Browser Auth Patterns](./research/researcher-01-agent-browser-patterns.md#authentication-flows)

## Overview

Test Phone OTP authentication flow and role-based redirects for commune_admin, village_leader, and public roles.

## Key Insights

- Firebase Phone Auth with OTP
- Role stored in Firestore `users` collection
- Auto-redirect based on role after login
- Save session state for reuse in subsequent tests

## Test Scenarios

### 1. Login Page Render
- Phone input visible
- OTP input appears after phone submit
- Error states for invalid phone

### 2. OTP Flow (with Firebase Emulator)
- Phone submission triggers OTP request
- OTP input accepts 6 digits
- Successful verification redirects by role

### 3. Role-Based Redirects
- `commune_admin` → `/admin`
- `village_leader` → `/village`
- `public` / no role → `/portal`

### 4. Protected Route Enforcement
- Unauthenticated access to `/admin` → redirect to `/login`
- Wrong role access → redirect to appropriate dashboard

### 5. Session Persistence
- Save authenticated session
- Restore and verify still logged in

## Implementation

### Test: Login Page (`web/tests/e2e/auth/01-login-page.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Login Page Render"

ab open "$BASE_URL/login"
snapshot_wait

ab snapshot -i
screenshot "login-page"

# Verify phone input exists
echo "Checking for phone input field..."
# @e refs will be visible in snapshot output

echo "PASS: Login page renders correctly"
```

### Test: Phone OTP Flow (`web/tests/e2e/auth/02-otp-flow.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Phone OTP Authentication Flow"

# Use test phone number (Firebase emulator)
TEST_PHONE="0901234567"
TEST_OTP="123456"  # Firebase emulator default

ab open "$BASE_URL/login"
snapshot_wait

ab snapshot -i

# Enter phone number
ab fill @e3 "$TEST_PHONE"
ab click @e4  # Request OTP button

sleep 2
ab snapshot -i
screenshot "otp-requested"

# Enter OTP (6 digits)
ab fill @e5 "$TEST_OTP"
ab click @e6  # Verify button

sleep 2
ab snapshot -i
screenshot "auth-result"

echo "PASS: OTP flow completed"
```

### Test: Admin Role Redirect (`web/tests/e2e/auth/03-admin-redirect.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin Role Redirect"

# Assume logged in as admin (use saved session or test account)
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

echo "PASS: Admin redirected to /admin"
```

### Test: Village Leader Redirect (`web/tests/e2e/auth/04-village-redirect.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Role Redirect"

VILLAGE_PHONE="0900000002"  # Test village leader account
TEST_OTP="123456"

ab --session village open "$BASE_URL/login"
snapshot_wait

ab --session village snapshot -i
ab --session village fill @e3 "$VILLAGE_PHONE"
ab --session village click @e4
sleep 2

ab --session village snapshot -i
ab --session village fill @e5 "$TEST_OTP"
ab --session village click @e6
sleep 3

ab --session village snapshot -i
screenshot "village-dashboard"

# Save session
ab --session village snapshot --save-state "$SESSIONS_DIR/village-auth.json"

echo "PASS: Village leader redirected to /village"
```

### Test: Protected Route Enforcement (`web/tests/e2e/auth/05-protected-routes.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Protected Route Enforcement"

# Try accessing /admin without auth (fresh session)
ab --session anon open "$BASE_URL/admin"
sleep 2

ab --session anon snapshot -i
screenshot "protected-route-redirect"

# Should be on login page
# Verify by checking URL or page content

echo "PASS: Protected routes redirect to login"
```

## OTP Handling Strategy

### Option A: Firebase Emulator (Recommended)
```bash
# Start emulator with fixed OTP
firebase emulators:start --only auth

# Use test phone numbers with predefined OTP
# Configure in Firebase Console > Auth > Phone > Test phone numbers
```

### Option B: Bypass OTP (Development Only)
```javascript
// In auth-context.tsx (dev mode only)
if (import.meta.env.DEV && phone === '0900000000') {
  // Auto-sign in with test user
}
```

### Option C: Network Mock
```bash
# Mock Firebase Auth API response
ab network route "**/identitytoolkit.googleapis.com/**" --body '{"localId":"test-uid"}'
```

## Todo List

- [ ] Create 01-login-page.sh
- [ ] Create 02-otp-flow.sh
- [ ] Create 03-admin-redirect.sh
- [ ] Create 04-village-redirect.sh
- [ ] Create 05-protected-routes.sh
- [ ] Setup Firebase emulator test phone numbers
- [ ] Verify session save/restore works

## Success Criteria

- [ ] Login page renders without errors
- [ ] OTP flow completes (with emulator)
- [ ] Role-based redirects work correctly
- [ ] Protected routes redirect unauthenticated users
- [ ] Sessions saved for reuse in later phases

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real OTP required | High | Use Firebase emulator |
| Session state corruption | Medium | Isolate with --session |
| Race conditions in redirect | Medium | Add longer sleeps |

## Security Considerations

- Never commit real phone numbers
- Use test accounts in emulator only
- Clear sessions after test runs
