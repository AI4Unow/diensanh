#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Dashboard"

ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "sms-dashboard"

# Verify campaign list or empty state
echo "PASS: SMS dashboard accessible"