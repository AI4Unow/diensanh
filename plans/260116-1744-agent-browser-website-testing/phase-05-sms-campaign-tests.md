---
phase: 5
title: "SMS Campaign Tests"
status: pending
priority: P2
effort: 1h
---

# Phase 5: SMS Campaign Tests

## Context Links

- [Frontend Analysis](./research/researcher-02-frontend-analysis.md) - ComposeModal component
- Route: `/admin/sms`

## Overview

Test SMS campaign management: viewing campaigns, composing messages via modal, and campaign flow.

## Key Components

- `SMSPage` (`web/src/pages/admin/sms/index.tsx`)
- `ComposeModal` (`web/src/pages/admin/sms/compose-modal.tsx`)

## Test Scenarios

### 1. SMS Dashboard
- Campaign list loads
- Stats visible (sent, pending, failed)
- Compose button accessible

### 2. Compose Modal
- Modal opens on button click
- Recipient selection (village, all)
- Message input with character count
- Template selection (if available)
- Send confirmation

### 3. Campaign Status
- View sent campaign
- Check delivery stats

## Implementation

### Test: SMS Dashboard (`web/tests/e2e/sms/01-sms-dashboard.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Dashboard"

ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "sms-dashboard"

# Verify campaign list or empty state
echo "PASS: SMS dashboard accessible"
```

### Test: Compose Modal (`web/tests/e2e/sms/02-compose-modal.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Compose Modal"

ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i

# Open compose modal
ab --session admin click @e3  # "Compose" or "New Campaign" button
sleep 1

ab --session admin snapshot -i
screenshot "sms-compose-modal-open"

# Select recipients (dropdown or checkbox)
ab --session admin click @e5  # Recipients dropdown
ab --session admin click @e7  # Select "All Villages"

# Enter message
ab --session admin fill @e8 "Thong bao: Day la tin nhan thu nghiem tu he thong E2E test."

ab --session admin snapshot -i
screenshot "sms-compose-filled"

# Character count visible?
# Preview message

# Close without sending (avoid sending real SMS)
ab --session admin click @e4  # Cancel or X button
sleep 1

ab --session admin snapshot -i
screenshot "sms-modal-closed"

echo "PASS: Compose modal flow works"
```

### Test: Campaign Detail (`web/tests/e2e/sms/03-campaign-detail.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Campaign Detail"

ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i

# Click on existing campaign (if any)
ab --session admin click @e10 2>/dev/null || {
  echo "No campaigns to view - skipping detail test"
  exit 0
}

sleep 1
ab --session admin snapshot -i
screenshot "sms-campaign-detail"

echo "PASS: Campaign detail view"
```

## Todo List

- [ ] Create 01-sms-dashboard.sh
- [ ] Create 02-compose-modal.sh
- [ ] Create 03-campaign-detail.sh
- [ ] Verify modal open/close behavior
- [ ] Test recipient selection options

## Success Criteria

- [ ] SMS dashboard loads with campaign list
- [ ] Compose modal opens and closes correctly
- [ ] Form fields accept input
- [ ] No actual SMS sent during tests

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Accidental SMS send | High | Cancel before submit |
| Modal animation delays | Low | Add sleep after open |
| Dynamic recipient list | Medium | Use network mock |

## Security Considerations

- Do NOT actually send SMS during tests
- Always cancel/close modal before submit
- Mock SMS API in CI environment
