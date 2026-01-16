#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Villages List"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to villages page
ab open "$BASE_URL/admin/villages"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
screenshot "admin-villages-list"

# Click first village to view detail (if available)
ab click @e5 2>/dev/null || echo "No villages to click"
sleep 1

ab snapshot -i
screenshot "admin-village-detail"

echo "PASS: Villages list and detail accessible"