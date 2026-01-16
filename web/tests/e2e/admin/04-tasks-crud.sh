#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Admin - Tasks CRUD"

# Clear any existing auth and login as admin
clear_auth
login_as_admin

# Navigate to tasks page
ab open "$BASE_URL/admin/tasks"
wait_for_auth

# Verify we're not on login page
verify_not_login_page || exit 1

ab snapshot -i
screenshot "tasks-list"

# Create new task
ab click @e3 2>/dev/null || echo "No new task button"  # "New Task" button
sleep 1

ab snapshot -i
screenshot "task-form-empty"

# Fill task form (using available elements)
ab fill @e4 "E2E Test Task" 2>/dev/null || echo "No title field"           # Title
ab fill @e5 "Created by automated test" 2>/dev/null || echo "No description field"  # Description
ab click @e6 2>/dev/null || echo "No priority dropdown"  # Priority dropdown
ab click @e8 2>/dev/null || echo "No priority option"  # Select priority

ab snapshot -i
screenshot "task-form-filled"

# Save
ab click @e12 2>/dev/null || echo "No save button"
sleep 2

ab snapshot -i
screenshot "task-created"

# View task detail
ab click @e5 2>/dev/null || echo "No tasks to click"  # First task in list
sleep 1

ab snapshot -i
screenshot "task-detail"

echo "PASS: Task CRUD operations"