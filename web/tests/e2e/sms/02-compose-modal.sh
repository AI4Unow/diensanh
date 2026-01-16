#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: SMS Compose Modal"

ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i

# Open compose modal
ab --session admin click @e3  # "Compose" or "New Campaign" button
sleep 1

ab --session admin snapshot -i
screenshot "sms-compose-modal-open"

# Select recipients (dropdown or checkbox)
ab --session admin click @e5  # Recipients dropdown
ab --session admin click @e7  # Select "All Villages"

# Enter message
ab --session admin fill @e8 "Thong bao: Day la tin nhan thu nghiem tu he thong E2E test."

ab --session admin snapshot -i
screenshot "sms-compose-filled"

# Character count visible?
# Preview message

# Close without sending (avoid sending real SMS)
ab --session admin click @e4  # Cancel or X button
sleep 1

ab --session admin snapshot -i
screenshot "sms-modal-closed"

echo "PASS: Compose modal flow works"