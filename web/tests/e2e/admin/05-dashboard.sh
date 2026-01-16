#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin Dashboard"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to admin dashboard
ab open "$BASE_URL/admin"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
screenshot "admin-dashboard"

# Verify stats cards visible
# Verify quick actions visible
# Verify activity feed

echo "PASS: Admin dashboard loads correctly"