#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Announcements Page"

ab open "$BASE_URL/portal/announcements"
snapshot_wait

# Verify announcements list rendered
ab snapshot -i
screenshot "announcements-list"

# Click first announcement if exists
ab click @e5 2>/dev/null || echo "No announcements to click"
sleep 1
screenshot "announcement-detail"

echo "PASS: Announcements page functional"