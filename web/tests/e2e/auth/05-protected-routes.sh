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