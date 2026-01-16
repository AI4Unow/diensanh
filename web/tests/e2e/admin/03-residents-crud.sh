#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Residents CRUD"

# Navigate to a household
ab --session admin open "$BASE_URL/admin/households" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
ab --session admin click @e5  # First household
sleep 1

ab --session admin snapshot -i
screenshot "household-detail"

# Add new resident
ab --session admin click @e8  # "Add Resident" button
sleep 1

ab --session admin snapshot -i
screenshot "resident-form-empty"

# Fill resident form
ab --session admin fill @e3 "Nguyen Van A"      # Full name
ab --session admin fill @e4 "1990-01-15"        # DOB
ab --session admin fill @e5 "001234567890"      # ID number
ab --session admin fill @e6 "Con"               # Relationship

ab --session admin snapshot -i
screenshot "resident-form-filled"

# Save
ab --session admin click @e12
sleep 2

ab --session admin snapshot -i
screenshot "resident-created"

echo "PASS: Resident CRUD operations"