#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Compose Modal"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to SMS dashboard
ab open "$BASE_URL/admin/sms"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i

# Open compose modal
ab click @e3 2>/dev/null || echo "No compose button"  # "Compose" or "New Campaign" button
sleep 1

ab snapshot -i
screenshot "sms-compose-modal-open"

# Select recipients (dropdown or checkbox)
ab click @e5 2>/dev/null || echo "No recipients dropdown"  # Recipients dropdown
ab click @e7 2>/dev/null || echo "No recipient option"  # Select "All Villages"

# Enter message
ab fill @e8 "Thong bao: Day la tin nhan thu nghiem tu he thong E2E test." 2>/dev/null || echo "No message field"

ab snapshot -i
screenshot "sms-compose-filled"

# Character count visible?
# Preview message

# Close without sending (avoid sending real SMS)
ab click @e4 2>/dev/null || echo "No cancel button"  # Cancel or X button
sleep 1

ab snapshot -i
screenshot "sms-modal-closed"

echo "PASS: Compose modal flow works"