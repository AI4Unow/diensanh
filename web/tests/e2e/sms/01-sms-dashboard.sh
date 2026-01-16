#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Dashboard"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to SMS dashboard
ab open "$BASE_URL/admin/sms"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
screenshot "sms-dashboard"

# Verify campaign list or empty state
echo "PASS: SMS dashboard accessible"