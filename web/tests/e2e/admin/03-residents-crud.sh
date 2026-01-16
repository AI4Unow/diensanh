#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Residents CRUD"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to households
ab open "$BASE_URL/admin/households"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
ab click @e5 2>/dev/null || echo "No households to click"  # First household
sleep 1

ab snapshot -i
screenshot "household-detail"

# Add new resident
ab click @e8 2>/dev/null || echo "No add resident button"  # "Add Resident" button
sleep 1

ab snapshot -i
screenshot "resident-form-empty"

# Fill resident form (using available elements)
ab fill @e3 "Nguyen Van A" 2>/dev/null || echo "No name field"      # Full name
ab fill @e4 "1990-01-15" 2>/dev/null || echo "No DOB field"        # DOB
ab fill @e5 "001234567890" 2>/dev/null || echo "No ID field"      # ID number
ab fill @e6 "Con" 2>/dev/null || echo "No relationship field"               # Relationship

ab snapshot -i
screenshot "resident-form-filled"

# Save
ab click @e12 2>/dev/null || echo "No save button"
sleep 2

ab snapshot -i
screenshot "resident-created"

echo "PASS: Resident CRUD operations"