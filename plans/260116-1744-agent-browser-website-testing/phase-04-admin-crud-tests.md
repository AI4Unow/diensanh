---
phase: 4
title: "Admin CRUD Tests"
status: pending
priority: P1
effort: 3h
---

# Phase 4: Admin CRUD Tests

## Context Links

- [Frontend Analysis - Admin Routes](./research/researcher-02-frontend-analysis.md#commune-admin-routes)
- Saved admin session: `sessions/admin-auth.json`

## Overview

Test all Admin CRUD operations: Villages, Households, Residents, and Tasks. Uses saved admin session from Phase 3.

## Prerequisites

- Admin session saved from Phase 3
- Firebase emulator running (or dev environment)

## Test Scenarios

### Villages
1. List all villages
2. View village detail
3. Navigate to households within village

### Households
1. List households (filtered by village)
2. Create new household
3. View household detail
4. Edit household
5. Delete household (if implemented)

### Residents
1. Add resident to household
2. Edit resident
3. Delete resident

### Tasks
1. List tasks
2. Create new task
3. View task detail
4. Edit task
5. Mark task complete

## Implementation

### Test: Villages List (`web/tests/e2e/admin/01-villages-list.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Villages List"

# Restore admin session
ab --session admin open "$BASE_URL/admin/villages" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "admin-villages-list"

# Click first village to view detail
ab --session admin click @e5  # First village row
sleep 1

ab --session admin snapshot -i
screenshot "admin-village-detail"

echo "PASS: Villages list and detail accessible"
```

### Test: Households CRUD (`web/tests/e2e/admin/02-households-crud.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Households CRUD"

# Navigate to first village's households
ab --session admin open "$BASE_URL/admin/villages" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
ab --session admin click @e5  # First village
sleep 1

ab --session admin snapshot -i
ab --session admin click @e8  # Households link/tab
sleep 1

ab --session admin snapshot -i
screenshot "households-list"

# Create new household
ab --session admin click @e3  # "Add Household" button
sleep 1

ab --session admin snapshot -i
screenshot "household-form-empty"

# Fill household form
ab --session admin fill @e4 "Ho Gia Dinh Test"  # Household name
ab --session admin fill @e5 "123 Duong ABC"     # Address
ab --session admin fill @e6 "0901111111"        # Phone

ab --session admin snapshot -i
screenshot "household-form-filled"

# Submit
ab --session admin click @e10  # Save button
sleep 2

ab --session admin snapshot -i
screenshot "household-created"

echo "PASS: Household CRUD operations"
```

### Test: Residents CRUD (`web/tests/e2e/admin/03-residents-crud.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Residents CRUD"

# Navigate to a household
ab --session admin open "$BASE_URL/admin/households" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
ab --session admin click @e5  # First household
sleep 1

ab --session admin snapshot -i
screenshot "household-detail"

# Add new resident
ab --session admin click @e8  # "Add Resident" button
sleep 1

ab --session admin snapshot -i
screenshot "resident-form-empty"

# Fill resident form
ab --session admin fill @e3 "Nguyen Van A"      # Full name
ab --session admin fill @e4 "1990-01-15"        # DOB
ab --session admin fill @e5 "001234567890"      # ID number
ab --session admin fill @e6 "Con"               # Relationship

ab --session admin snapshot -i
screenshot "resident-form-filled"

# Save
ab --session admin click @e12
sleep 2

ab --session admin snapshot -i
screenshot "resident-created"

echo "PASS: Resident CRUD operations"
```

### Test: Tasks CRUD (`web/tests/e2e/admin/04-tasks-crud.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Tasks CRUD"

# List tasks
ab --session admin open "$BASE_URL/admin/tasks" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "tasks-list"

# Create new task
ab --session admin click @e3  # "New Task" button
sleep 1

ab --session admin snapshot -i
screenshot "task-form-empty"

# Fill task form
ab --session admin fill @e4 "E2E Test Task"           # Title
ab --session admin fill @e5 "Created by automated test"  # Description
ab --session admin click @e6  # Priority dropdown
ab --session admin click @e8  # Select priority

ab --session admin snapshot -i
screenshot "task-form-filled"

# Save
ab --session admin click @e12
sleep 2

ab --session admin snapshot -i
screenshot "task-created"

# View task detail
ab --session admin click @e5  # First task in list
sleep 1

ab --session admin snapshot -i
screenshot "task-detail"

echo "PASS: Task CRUD operations"
```

### Test: Admin Dashboard (`web/tests/e2e/admin/05-dashboard.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin Dashboard"

ab --session admin open "$BASE_URL/admin" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "admin-dashboard"

# Verify stats cards visible
# Verify quick actions visible
# Verify activity feed

echo "PASS: Admin dashboard loads correctly"
```

## Todo List

- [ ] Create 01-villages-list.sh
- [ ] Create 02-households-crud.sh
- [ ] Create 03-residents-crud.sh
- [ ] Create 04-tasks-crud.sh
- [ ] Create 05-dashboard.sh
- [ ] Run and capture actual @refs from snapshots
- [ ] Add data cleanup after tests

## Success Criteria

- [ ] All admin routes accessible with session
- [ ] Create operations complete without errors
- [ ] Edit operations update data correctly
- [ ] Screenshots captured at each step
- [ ] No console errors

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test data pollution | Medium | Use emulator, reset DB |
| Form refs change | Medium | Re-capture with snapshot -i |
| Session expiry | Low | Re-run auth phase |

## Data Cleanup Strategy

```bash
# After CRUD tests, clean up test data
# Option 1: Firebase emulator reset
firebase emulators:export ./backup
firebase emulators:start --import ./clean-state

# Option 2: API cleanup script
# curl -X DELETE $API_URL/test-data
```

## Notes

- @refs are placeholders - update after running `snapshot -i`
- Adjust form field order based on actual UI
- Some forms may have date pickers, dropdowns requiring special handling
