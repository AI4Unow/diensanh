# Authentication Bypass Solutions for E2E Testing Research Report

**Date:** 2026-01-16 19:00
**Researcher:** Authentication Testing Specialist
**Context:** Firebase Auth + Firestore E2E Testing with agent-browser

## Executive Summary

Research into authentication bypass solutions for E2E testing reveals multiple viable approaches to resolve session persistence failures and enable proper testing of protected routes. The current system requires both Firebase Auth user AND Firestore user document, creating a dual authentication barrier that needs specialized bypass strategies.

## Current Authentication System Analysis

### Architecture Overview
- **Frontend:** React + TypeScript + Vite with Firebase Auth
- **Authentication:** Firebase Phone Auth with reCAPTCHA verification
- **Authorization:** Role-based access control (commune_admin, village_leader, resident)
- **Data Layer:** Firestore user documents required for full authentication
- **Protected Routes:** ProtectedRoute wrapper with role-based access control

### Root Causes Identified
1. **Session Persistence Failure:** Empty session files in agent-browser
2. **Dual Authentication Requirement:** Firebase Auth + Firestore user document
3. **Strict Protected Route Logic:** No test bypass mechanisms
4. **Firebase Emulator Dependencies:** Not configured for E2E testing

## Research Findings

### 1. Firebase Auth E2E Testing Best Practices

#### Firebase Emulator Approach
- **connectAuthEmulator():** Connect to local Auth emulator for testing
- **appVerificationDisabledForTesting:** Disable reCAPTCHA for automated tests
- **Whitelisted Phone Numbers:** Use test phone numbers in Firebase Console

```typescript
// Firebase emulator configuration for testing
if (process.env.NODE_ENV === 'test') {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true
  });
}
```

#### Authentication State Mocking
- **Mock Firebase Auth User:** Create test user objects
- **Mock Firestore Documents:** Pre-populate test user data
- **Session Injection:** Directly set authentication state

### 2. Agent-Browser Session Management Solutions

#### Session Persistence Strategies
- **localStorage Injection:** Directly set Firebase auth tokens
- **Cookie Management:** Set authentication cookies programmatically
- **IndexedDB Manipulation:** Inject Firebase persistence data

#### Browser Context Management
- **Persistent Sessions:** Use named browser contexts
- **Session Restoration:** Save/restore authentication state
- **Cross-Test State:** Maintain auth between test runs

### 3. Authentication Bypass Patterns

#### Environment-Based Bypass
- **Test Mode Detection:** Check for E2E testing environment
- **Bypass Flags:** Use environment variables to skip auth
- **Mock Authentication Provider:** Replace auth context in tests

#### Route-Level Bypass
- **Test Route Variants:** Create test-only unprotected routes
- **Conditional Protection:** Disable protection in test mode
- **Mock User Injection:** Inject test users directly into context

### 4. Firebase Emulator Setup for E2E Tests

#### Emulator Configuration
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    }
  }
}
```

#### Test Data Seeding
- **Predefined Users:** Create test users with known credentials
- **Role-Based Test Data:** Users for each role type
- **Firestore Test Documents:** Pre-populate user documents

## Recommended Implementation Solutions

### Solution 1: Firebase Emulator + Test Mode (Recommended)

**Approach:** Use Firebase emulators with test-specific configuration

**Implementation Steps:**
1. Configure Firebase emulators for E2E testing
2. Create test environment detection in Firebase config
3. Implement test user seeding scripts
4. Modify auth context to support test mode

**Pros:**
- Most authentic testing environment
- Maintains Firebase Auth flow
- Supports all authentication features
- Easy to maintain

**Cons:**
- Requires emulator setup
- Additional configuration complexity

### Solution 2: Authentication Context Mocking

**Approach:** Mock the authentication context for E2E tests

**Implementation Steps:**
1. Create test-specific AuthProvider wrapper
2. Implement mock user injection
3. Add environment-based provider switching
4. Create test user fixtures

**Pros:**
- Fast test execution
- No external dependencies
- Full control over auth state
- Easy to implement

**Cons:**
- Doesn't test actual auth flow
- May miss auth-related bugs
- Requires maintenance of mocks

### Solution 3: Session Injection + Browser Storage

**Approach:** Directly inject authentication tokens into browser storage

**Implementation Steps:**
1. Create authentication token generation utility
2. Implement browser storage injection in test setup
3. Add session restoration helpers
4. Create role-based token fixtures

**Pros:**
- Works with existing Firebase setup
- Minimal code changes required
- Fast test execution
- Maintains session persistence

**Cons:**
- Bypasses authentication validation
- Requires token management
- May become outdated with Firebase changes

### Solution 4: Hybrid Approach (Most Robust)

**Approach:** Combine emulator testing with session injection fallback

**Implementation Steps:**
1. Primary: Use Firebase emulator for full auth testing
2. Fallback: Session injection for quick smoke tests
3. Environment-based switching
4. Comprehensive test user management

**Pros:**
- Best of both worlds
- Flexible testing strategies
- Comprehensive coverage
- Production-like testing

**Cons:**
- Most complex to implement
- Requires multiple configurations
- Higher maintenance overhead

## Practical Implementation Recommendations

### Immediate Actions (High Priority)

1. **Configure Firebase Emulators**
   - Set up auth and firestore emulators
   - Create emulator-specific Firebase config
   - Add test environment detection

2. **Create Test User Management**
   - Implement test user seeding scripts
   - Create role-based test fixtures
   - Add user document creation utilities

3. **Implement Test Mode Detection**
   - Add environment variable checks
   - Create test-specific auth configuration
   - Implement conditional auth flows

### Medium-Term Improvements

1. **Enhanced Session Management**
   - Implement session persistence utilities
   - Add cross-test state management
   - Create session restoration helpers

2. **Comprehensive Test Coverage**
   - Add authentication flow testing
   - Implement role-based access testing
   - Create protected route validation

### Long-Term Optimizations

1. **Advanced Testing Patterns**
   - Implement parallel test execution
   - Add performance testing for auth flows
   - Create comprehensive test reporting

2. **Maintenance Automation**
   - Automated test user cleanup
   - Session management automation
   - Test environment provisioning

## Technical Specifications

### Required Environment Variables
```bash
# E2E Testing Configuration
VITE_E2E_MODE=true
VITE_USE_EMULATORS=true
VITE_AUTH_EMULATOR_URL=http://localhost:9099
VITE_FIRESTORE_EMULATOR_URL=http://localhost:8080

# Test User Configuration
E2E_TEST_ADMIN_PHONE=+84912345678
E2E_TEST_VILLAGE_PHONE=+84912345679
E2E_TEST_RESIDENT_PHONE=+84912345680
```

### Test User Fixtures
```typescript
interface TestUser {
  uid: string;
  phone: string;
  role: UserRole;
  displayName: string;
  villageId?: string;
}

const TEST_USERS: TestUser[] = [
  {
    uid: 'test-admin-001',
    phone: '+84912345678',
    role: 'commune_admin',
    displayName: 'Test Admin'
  },
  {
    uid: 'test-village-001',
    phone: '+84912345679',
    role: 'village_leader',
    displayName: 'Test Village Leader',
    villageId: 'village-001'
  },
  {
    uid: 'test-resident-001',
    phone: '+84912345680',
    role: 'resident',
    displayName: 'Test Resident',
    villageId: 'village-001'
  }
];
```

## Success Metrics

### Authentication Testing Goals
- ✅ E2E tests can access all protected routes
- ✅ Role-based access control validation
- ✅ Session persistence across test runs
- ✅ Screenshot capture of authenticated pages
- ✅ Performance testing of auth flows

### Implementation Validation
- ✅ Firebase emulator integration working
- ✅ Test user seeding automated
- ✅ Session management reliable
- ✅ Cross-browser compatibility
- ✅ CI/CD pipeline integration

## Risk Assessment

### High Risk
- **Firebase API Changes:** Emulator compatibility issues
- **Session Management:** Browser storage limitations
- **Test Data Conflicts:** User document collisions

### Medium Risk
- **Performance Impact:** Emulator startup time
- **Maintenance Overhead:** Multiple auth configurations
- **Environment Complexity:** Configuration management

### Low Risk
- **Test Isolation:** Proper cleanup procedures
- **Documentation:** Clear implementation guides
- **Team Adoption:** Training requirements

## Next Steps

1. **Immediate Implementation:** Start with Solution 1 (Firebase Emulator)
2. **Proof of Concept:** Create minimal working example
3. **Integration Testing:** Validate with existing E2E suite
4. **Documentation:** Create implementation guides
5. **Team Review:** Get stakeholder approval
6. **Production Rollout:** Gradual implementation

## Conclusion

The research identifies Firebase emulator integration as the most robust solution for authentication bypass in E2E testing. This approach maintains authentication fidelity while enabling automated testing of protected routes. The hybrid approach provides flexibility for different testing scenarios and ensures comprehensive coverage.

**Recommended Priority:** Implement Solution 1 (Firebase Emulator) immediately, with Solution 3 (Session Injection) as a fallback for rapid testing scenarios.

---

**Files Referenced:**
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/contexts/auth-context.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/routes/index.tsx`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/src/config/firebase.ts`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/test-auth.sh`
- `/Users/nad/My Drive (duc.a.nguyen@gmail.com)/diensanh/web/tests/e2e/lib/test-utils.sh`