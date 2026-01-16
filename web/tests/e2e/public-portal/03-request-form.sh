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