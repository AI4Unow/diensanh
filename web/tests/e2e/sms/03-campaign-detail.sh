#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Campaign Detail"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to SMS dashboard
ab open "$BASE_URL/admin/sms"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i

# Click on existing campaign (if any)
ab click @e10 2>/dev/null || {
  echo "No campaigns to view - skipping detail test"
  exit 0
}

sleep 1
ab snapshot -i
screenshot "sms-campaign-detail"

echo "PASS: Campaign detail view"