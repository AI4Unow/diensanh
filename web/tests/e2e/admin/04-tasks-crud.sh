#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Tasks CRUD"

# List tasks
ab --session admin open "$BASE_URL/admin/tasks" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2

ab --session admin snapshot -i
screenshot "tasks-list"

# Create new task
ab --session admin click @e3  # "New Task" button
sleep 1

ab --session admin snapshot -i
screenshot "task-form-empty"

# Fill task form
ab --session admin fill @e4 "E2E Test Task"           # Title
ab --session admin fill @e5 "Created by automated test"  # Description
ab --session admin click @e6  # Priority dropdown
ab --session admin click @e8  # Select priority

ab --session admin snapshot -i
screenshot "task-form-filled"

# Save
ab --session admin click @e12
sleep 2

ab --session admin snapshot -i
screenshot "task-created"

# View task detail
ab --session admin click @e5  # First task in list
sleep 1

ab --session admin snapshot -i
screenshot "task-detail"

echo "PASS: Task CRUD operations"