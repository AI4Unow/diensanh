#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

BASELINES_DIR="$(dirname $0)/baselines"
mkdir -p "$BASELINES_DIR"

echo "=== Capturing Visual Baselines ==="

# Set consistent viewport
ab viewport 1280 720

# Public pages (no auth)
echo "Capturing: Portal Home"
ab open "$BASE_URL/portal"
sleep 2
ab screenshot "$BASELINES_DIR/portal-home.png"

echo "Capturing: Login"
ab open "$BASE_URL/login"
sleep 2
ab screenshot "$BASELINES_DIR/login.png"

echo "Capturing: Announcements"
ab open "$BASE_URL/portal/announcements"
sleep 2
ab screenshot "$BASELINES_DIR/announcements.png"

# Admin pages (with session)
echo "Capturing: Admin Dashboard"
ab --session admin open "$BASE_URL/admin" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$BASELINES_DIR/admin-dashboard.png"

echo "Capturing: Admin SMS"
ab --session admin open "$BASE_URL/admin/sms" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$BASELINES_DIR/admin-sms.png"

echo "Capturing: Admin Tasks"
ab --session admin open "$BASE_URL/admin/tasks" --state "$SESSIONS_DIR/admin-auth.json"
sleep 2
ab --session admin screenshot "$BASELINES_DIR/admin-tasks.png"

# Village pages (with session)
echo "Capturing: Village Dashboard"
ab --session village open "$BASE_URL/village" --state "$SESSIONS_DIR/village-auth.json"
sleep 2
ab --session village screenshot "$BASELINES_DIR/village-dashboard.png"

echo "=== Baselines captured in $BASELINES_DIR ==="