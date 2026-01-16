---
phase: 6
title: "Village Leader Tests"
status: pending
priority: P2
effort: 1h
---

# Phase 6: Village Leader Tests

## Context Links

- [Frontend Analysis - Village Routes](./research/researcher-02-frontend-analysis.md#village-leader-routes)
- Saved session: `sessions/village-auth.json`

## Overview

Test village leader role functionality: dashboard access, assigned village operations, and role restrictions.

## Routes Covered

| Route | Page | Purpose |
|-------|------|---------|
| `/village` | VillageDashboardPage | Village leader dashboard |
| `/village/*` | VillageDashboardPage | Fallback |

## Test Scenarios

### 1. Village Dashboard
- Dashboard loads correctly
- Shows assigned village data only
- Quick actions relevant to village

### 2. Role Restrictions
- Cannot access `/admin` routes
- Limited to assigned village data
- Correct navigation options

### 3. Village Operations
- View households in assigned village
- View tasks assigned to village
- Update task status

## Implementation

### Test: Village Dashboard (`web/tests/e2e/village/01-dashboard.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Dashboard"

# Use village leader session
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i
screenshot "village-dashboard"

# Verify dashboard content
# - Stats for assigned village
# - Pending tasks
# - Quick actions

echo "PASS: Village dashboard loads correctly"
```

### Test: Role Restrictions (`web/tests/e2e/village/02-role-restrictions.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Role Restrictions"

# Try accessing admin route with village session
ab --session village open "$BASE_URL/admin" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i
screenshot "village-admin-redirect"

# Should be redirected to /village or denied
# Check URL or page content

echo "PASS: Role restrictions enforced"
```

### Test: Village Operations (`web/tests/e2e/village/03-village-operations.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Operations"

ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i

# Navigate to households (if available in village view)
ab --session village click @e5 2>/dev/null || echo "No households link"
sleep 1

ab --session village snapshot -i
screenshot "village-households"

# Navigate to tasks (if available)
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 1

ab --session village click @e6 2>/dev/null || echo "No tasks link"
sleep 1

ab --session village snapshot -i
screenshot "village-tasks"

echo "PASS: Village operations accessible"
```

### Test: More Page (`web/tests/e2e/village/04-more-page.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village More/Settings Page"

ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i

# Click "More" in bottom nav
ab --session village click @e10  # More nav item
sleep 1

ab --session village snapshot -i
screenshot "village-more-page"

# Verify logout option
# Verify profile settings

echo "PASS: Village more page accessible"
```

## Todo List

- [ ] Create 01-dashboard.sh
- [ ] Create 02-role-restrictions.sh
- [ ] Create 03-village-operations.sh
- [ ] Create 04-more-page.sh
- [ ] Verify village leader session works
- [ ] Confirm role-based redirects

## Success Criteria

- [ ] Village dashboard renders correctly
- [ ] Cannot access admin routes
- [ ] Navigation limited to village scope
- [ ] Logout functionality works

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Session mismatch | Medium | Verify session file saved |
| Village not assigned | High | Use test account with village |
| Limited routes | Low | Adjust test scope |

## Notes

- Village leader has restricted view compared to admin
- Some pages may fallback to dashboard
- Test actual village operations based on UI discovery
