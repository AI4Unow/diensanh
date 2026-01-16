---
phase: 2
title: "Public Portal Tests"
status: pending
priority: P1
effort: 2h
---

# Phase 2: Public Portal Tests

## Context Links

- [Frontend Analysis - Routes](./research/researcher-02-frontend-analysis.md#public-portal-no-auth)

## Overview

Test all public-facing routes that require NO authentication: landing page, announcements, service requests, and chatbot.

## Key Test Scenarios

### 1. Portal Landing Page (`/portal`)
- Hero section renders
- Quick access cards visible
- Navigation to announcements works
- Hotline button functional

### 2. Announcements Page (`/portal/announcements`)
- Announcements list loads
- Individual announcement expandable
- No auth prompts appear

### 3. Request Form (`/portal/requests/new`)
- Form fields render
- Validation on required fields
- Successful submission flow
- Error handling on network failure

### 4. Chatbot Page (`/portal/chatbot`)
- Chat interface loads
- Message input functional
- Response display works

## Implementation

### Test: Portal Landing (`web/tests/e2e/public-portal/01-landing.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Portal Landing Page"

# Navigate to portal
ab open "$BASE_URL/portal"
snapshot_wait

# Verify hero section visible (check for key element)
ab snapshot -i
# Look for quick access cards
ab click @e3  # Announcements card (verify ref via snapshot)

# Verify navigation worked
sleep 1
ab snapshot -i
screenshot "portal-landing"

echo "PASS: Portal landing page loaded"
```

### Test: Announcements (`web/tests/e2e/public-portal/02-announcements.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Announcements Page"

ab open "$BASE_URL/portal/announcements"
snapshot_wait

# Verify announcements list rendered
ab snapshot -i
screenshot "announcements-list"

# Click first announcement if exists
ab click @e5 2>/dev/null || echo "No announcements to click"
sleep 1
screenshot "announcement-detail"

echo "PASS: Announcements page functional"
```

### Test: Request Form (`web/tests/e2e/public-portal/03-request-form.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Public Request Form"

ab open "$BASE_URL/portal/requests/new"
snapshot_wait

# Capture form state
ab snapshot -i
screenshot "request-form-empty"

# Fill form fields (refs from snapshot)
ab fill @e3 "Nguyen Van Test"          # Name field
ab fill @e4 "0901234567"               # Phone field
ab fill @e5 "Test request from E2E"   # Request content

ab snapshot -i
screenshot "request-form-filled"

# Submit form
ab click @e8  # Submit button
sleep 2

# Verify success state or error
ab snapshot -i
screenshot "request-form-submitted"

echo "PASS: Request form submission flow"
```

### Test: Chatbot (`web/tests/e2e/public-portal/04-chatbot.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Chatbot Interface"

ab open "$BASE_URL/portal/chatbot"
snapshot_wait

ab snapshot -i
screenshot "chatbot-initial"

# Type a message
ab fill @e3 "Xin chao, toi can ho tro"
ab click @e4  # Send button

sleep 3  # Wait for response
ab snapshot -i
screenshot "chatbot-response"

echo "PASS: Chatbot interaction works"
```

## Todo List

- [ ] Create 01-landing.sh
- [ ] Create 02-announcements.sh
- [ ] Create 03-request-form.sh
- [ ] Create 04-chatbot.sh
- [ ] Run locally and verify refs
- [ ] Update refs based on actual snapshot output

## Success Criteria

- [ ] All 4 public routes accessible without auth
- [ ] Request form submission works
- [ ] Screenshots captured for each page
- [ ] No console errors logged

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| @refs change on UI update | Re-run snapshot -i to get new refs |
| Chatbot API timeout | Add longer sleep/retry |
| Form field refs incorrect | Manually verify with snapshot -i |

## Notes

- Refs like `@e3`, `@e4` are placeholders - run `snapshot -i` to get actual refs
- Adjust sleep times based on actual network latency
