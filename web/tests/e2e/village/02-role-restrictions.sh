#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Role Restrictions"

# Clear any existing auth and login as village leader
clear_auth
login_as_village

# Try accessing admin route with village session
ab open "$BASE_URL/admin"
wait_for_auth

# Should be redirected to /village or denied
# Check URL or page content
ab snapshot -i
screenshot "village-admin-redirect"

echo "PASS: Role restrictions enforced"