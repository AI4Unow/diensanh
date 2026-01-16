# E2E Authentication Fix Implementation Plan

## Overview
**Priority**: High
**Current Status**: Planning
**Brief Description**: Fix E2E screenshot issue where all screenshots show login page instead of protected pages due to authentication failures.

## Problem Analysis

### Root Cause
The E2E tests are failing to access protected routes because:
1. **Session Persistence Failure**: Session files are empty, authentication state not maintained
2. **Strict Authentication Requirements**: App requires both Firebase Auth user AND Firestore user document
3. **Protected Route Logic**: No test bypass mechanism, all protected routes redirect to `/login`
4. **Firebase Emulator Dependencies**: Not configured for testing environment

### Current Authentication Flow
```typescript
// From /Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/contexts/auth-context.tsx
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

## Key Insights
- Authentication context requires both Firebase Auth user and Firestore user document
- Protected routes immediately redirect unauthenticated users to `/login`
- Current E2E tests have no authentication bypass mechanism
- Session management in agent-browser is not working with Firebase Auth

## Requirements

### Functional Requirements
- E2E tests must access protected admin, SMS, and village pages
- Screenshots must capture actual protected page content, not login page
- Authentication state must persist across test navigation
- Tests must work in CI/CD environment without real Firebase dependencies

### Non-functional Requirements
- Solution must not compromise production security
- Minimal impact on existing codebase
- Fast test execution (no real Firebase calls in tests)
- Maintainable and debuggable test setup

## Architecture

### Solution 1: Firebase Emulator + Test Mode (Recommended)
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   E2E Tests     │───▶│ Firebase Emulator │───▶│ Test Auth State │
│                 │    │                  │    │                 │
│ - Mock users    │    │ - Local auth     │    │ - Admin user    │
│ - Test sessions │    │ - Test database  │    │ - Village user  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Interactions
1. **E2E Test Setup**: Initialize Firebase emulator with test users
2. **Authentication Service**: Connect to emulator instead of production Firebase
3. **Protected Routes**: Authenticate against emulator data
4. **Screenshot Capture**: Access protected pages with valid test authentication

### Data Flow
1. Test starts → Initialize Firebase emulator
2. Create test users in emulator (admin, village_leader)
3. Authenticate test session with emulator
4. Navigate to protected routes → Authentication succeeds
5. Capture screenshots of actual protected content

## Related Code Files

### Files to Modify
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/config/firebase.ts` - Add emulator configuration
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/test-utils.sh` - Add auth utilities
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/auth-helpers.sh` - New auth helper functions

### Files to Create
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/setup/firebase-emulator.sh` - Emulator setup script
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/fixtures/test-users.json` - Test user data
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/session-manager.sh` - Session management

## Implementation Steps

### Phase 1: Firebase Emulator Setup
1. Install Firebase CLI tools and emulator
2. Create emulator configuration for auth and firestore
3. Create test user fixtures (admin, village_leader roles)
4. Setup emulator initialization script

### Phase 2: Authentication Utilities
5. Create authentication helper functions for E2E tests
6. Implement session management for persistent auth state
7. Add browser storage manipulation for Firebase tokens
8. Create user login/logout utilities

### Phase 3: Test Environment Configuration
9. Modify Firebase config to detect test environment
10. Add emulator connection logic for E2E tests
11. Update test scripts to use emulator
12. Configure environment variables for test mode

### Phase 4: Protected Route Testing
13. Update E2E test scripts to authenticate before screenshots
14. Add role-based test scenarios (admin vs village_leader)
15. Implement proper session persistence across navigation
16. Add verification for successful authentication

### Phase 5: Screenshot Verification
17. Update screenshot capture to verify protected content
18. Add assertions to ensure not on login page
19. Create baseline screenshots for protected pages
20. Implement screenshot comparison for regression testing

## Todo List
- [ ] Install and configure Firebase emulator
- [ ] Create test user fixtures and data
- [ ] Implement authentication helper functions
- [ ] Setup emulator initialization scripts
- [ ] Modify Firebase config for test environment
- [ ] Update E2E test scripts with authentication
- [ ] Test admin dashboard screenshot capture
- [ ] Test SMS page screenshot capture
- [ ] Test village dashboard screenshot capture
- [ ] Verify session persistence across navigation
- [ ] Create fallback authentication mocking
- [ ] Add error handling and debugging
- [ ] Update CI/CD pipeline for emulator usage
- [ ] Document new testing procedures

## Success Criteria
- E2E tests successfully authenticate and access protected routes
- Screenshots capture actual protected page content (not login page)
- Admin dashboard screenshots show admin-specific content
- SMS page screenshots show SMS management interface
- Village dashboard screenshots show village-specific content
- Tests run reliably in both local and CI environments
- No security vulnerabilities introduced in production code

## Risk Assessment

### Potential Issues
- Firebase emulator setup complexity in CI/CD
- Session persistence across different browser contexts
- Timing issues with authentication state loading
- Emulator performance impact on test execution time

### Mitigation Strategies
- Provide detailed emulator setup documentation
- Implement retry logic for authentication operations
- Add explicit waits for authentication state changes
- Use lightweight emulator configuration for faster startup

## Security Considerations

### Auth/Authorization
- Test users only exist in emulator, not production
- Emulator data is isolated from production Firebase
- No real credentials or tokens used in tests
- Test environment clearly separated from production

### Data Protection
- Test data is synthetic and non-sensitive
- Emulator database is ephemeral and reset between test runs
- No production data accessed during testing
- Clear separation between test and production configurations

## Next Steps
1. Begin Phase 1: Firebase Emulator Setup
2. Create test user fixtures and emulator configuration
3. Implement authentication utilities for E2E tests
4. Update test scripts to use authenticated sessions
5. Verify protected route screenshot capture works correctly

## Dependencies
- Firebase CLI and emulator suite
- Agent-browser session management capabilities
- Test environment configuration
- CI/CD pipeline updates for emulator support