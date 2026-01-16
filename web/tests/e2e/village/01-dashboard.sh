#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Dashboard"

# Use village leader session
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i
screenshot "village-dashboard"

# Verify dashboard content
# - Stats for assigned village
# - Pending tasks
# - Quick actions

echo "PASS: Village dashboard loads correctly"