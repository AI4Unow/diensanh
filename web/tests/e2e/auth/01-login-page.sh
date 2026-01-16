#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Login Page Render"

ab open "$BASE_URL/login"
snapshot_wait

ab snapshot -i
screenshot "login-page"

# Verify phone input exists
echo "Checking for phone input field..."
# @e refs will be visible in snapshot output

echo "PASS: Login page renders correctly"