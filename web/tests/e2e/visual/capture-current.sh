#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

CURRENT_DIR="$(dirname $0)/current"
mkdir -p "$CURRENT_DIR"

echo "=== Capturing Current Screenshots ==="

# Set consistent viewport
ab viewport 1280 720

# Public pages (no auth)
echo "Capturing: Portal Home"
ab open "$BASE_URL/portal"
sleep 2
ab screenshot "$CURRENT_DIR/portal-home.png"

echo "Capturing: Login"
ab open "$BASE_URL/login"
sleep 2
ab screenshot "$CURRENT_DIR/login.png"

echo "Capturing: Announcements"
ab open "$BASE_URL/portal/announcements"
sleep 2
ab screenshot "$CURRENT_DIR/announcements.png"

# Admin pages (with session)
echo "Capturing: Admin Dashboard"
ab --session admin open "$BASE_URL/admin" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$CURRENT_DIR/admin-dashboard.png"

echo "Capturing: Admin SMS"
ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$CURRENT_DIR/admin-sms.png"

echo "Capturing: Admin Tasks"
ab --session admin open "$BASE_URL/admin/tasks" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$CURRENT_DIR/admin-tasks.png"

# Village pages (with session)
echo "Capturing: Village Dashboard"
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2
ab --session village screenshot "$CURRENT_DIR/village-dashboard.png"

echo "=== Current screenshots captured in $CURRENT_DIR ==="