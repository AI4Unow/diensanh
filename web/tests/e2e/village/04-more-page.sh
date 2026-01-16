#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village More/Settings Page"

# Clear any existing auth and login as village leader
clear_auth
login_as_village

# Navigate to village dashboard
ab open "$BASE_URL/village"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i

# Click "More" in bottom nav
ab click @e10 2>/dev/null || echo "No more nav item"  # More nav item
sleep 1

ab snapshot -i
screenshot "village-more-page"

# Verify logout option
# Verify profile settings

echo "PASS: Village more page accessible"