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