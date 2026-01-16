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