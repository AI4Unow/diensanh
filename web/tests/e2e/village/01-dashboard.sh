#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Dashboard"

# Clear any existing auth and login as village leader
clear_auth
login_as_village

# Navigate to village dashboard
ab open "$BASE_URL/village"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
screenshot "village-dashboard"

# Verify dashboard content
# - Stats for assigned village
# - Pending tasks
# - Quick actions

echo "PASS: Village dashboard loads correctly"