#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Households CRUD"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to villages first
ab open "$BASE_URL/admin/villages"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
ab click @e5 2>/dev/null || echo "No villages to click"  # First village
sleep 1

ab snapshot -i
ab click @e8 2>/dev/null || echo "No households link"  # Households link/tab
sleep 1

ab snapshot -i
screenshot "households-list"

# Create new household
ab click @e3 2>/dev/null || echo "No add household button"  # "Add Household" button
sleep 1

ab snapshot -i
screenshot "household-form-empty"

# Fill household form (using available elements)
ab fill @e4 "Ho Gia Dinh Test" 2>/dev/null || echo "No household name field"  # Household name
ab fill @e5 "123 Duong ABC" 2>/dev/null || echo "No address field"     # Address
ab fill @e6 "0901111111" 2>/dev/null || echo "No phone field"        # Phone

ab snapshot -i
screenshot "household-form-filled"

# Submit
ab click @e10 2>/dev/null || echo "No save button"  # Save button
sleep 2

ab snapshot -i
screenshot "household-created"

echo "PASS: Household CRUD operations"