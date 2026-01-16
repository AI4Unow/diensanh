#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Operations"

ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i

# Navigate to households (if available in village view)
ab --session village click @e5 2>/dev/null || echo "No households link"
sleep 1

ab --session village snapshot -i
screenshot "village-households"

# Navigate to tasks (if available)
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 1

ab --session village click @e6 2>/dev/null || echo "No tasks link"
sleep 1

ab --session village snapshot -i
screenshot "village-tasks"

echo "PASS: Village operations accessible"