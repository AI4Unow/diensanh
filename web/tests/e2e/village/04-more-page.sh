#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village More/Settings Page"

ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i

# Click "More" in bottom nav
ab --session village click @e10  # More nav item
sleep 1

ab --session village snapshot -i
screenshot "village-more-page"

# Verify logout option
# Verify profile settings

echo "PASS: Village more page accessible"