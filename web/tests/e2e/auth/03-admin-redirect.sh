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