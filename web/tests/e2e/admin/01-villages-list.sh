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