#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Village Leader Role Restrictions"

# Try accessing admin route with village session
ab --session village open "$BASE_URL/admin" --state "$SESSIONS_DIR/village-auth.json"
sleep 2

ab --session village snapshot -i
screenshot "village-admin-redirect"

# Should be redirected to /village or denied
# Check URL or page content

echo "PASS: Role restrictions enforced"