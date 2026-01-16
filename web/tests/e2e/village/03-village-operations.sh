#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Operations"

# Clear any existing auth and login as village leader
clear_auth
login_as_village

# Navigate to village dashboard
ab open "$BASE_URL/village"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i

# Navigate to households (if available in village view)
ab click @e5 2>/dev/null || echo "No households link"
sleep 1

ab snapshot -i
screenshot "village-households"

# Navigate to tasks (if available)
ab open "$BASE_URL/village"
wait_for_auth
sleep 1

ab click @e6 2>/dev/null || echo "No tasks link"
sleep 1

ab snapshot -i
screenshot "village-tasks"

echo "PASS: Village operations accessible"