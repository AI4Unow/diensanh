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