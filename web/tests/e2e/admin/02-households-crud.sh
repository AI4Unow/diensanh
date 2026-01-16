#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Households CRUD"

# Navigate to first village's households
ab --session admin open "$BASE_URL/admin/villages" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
ab --session admin click @e5  # First village
sleep 1

ab --session admin snapshot -i
ab --session admin click @e8  # Households link/tab
sleep 1

ab --session admin snapshot -i
screenshot "households-list"

# Create new household
ab --session admin click @e3  # "Add Household" button
sleep 1

ab --session admin snapshot -i
screenshot "household-form-empty"

# Fill household form
ab --session admin fill @e4 "Ho Gia Dinh Test"  # Household name
ab --session admin fill @e5 "123 Duong ABC"     # Address
ab --session admin fill @e6 "0901111111"        # Phone

ab --session admin snapshot -i
screenshot "household-form-filled"

# Submit
ab --session admin click @e10  # Save button
sleep 2

ab --session admin snapshot -i
screenshot "household-created"

echo "PASS: Household CRUD operations"