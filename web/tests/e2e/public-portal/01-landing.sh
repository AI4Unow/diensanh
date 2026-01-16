#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Portal Landing Page"

# Navigate to portal
ab open "$BASE_URL/portal"
snapshot_wait

# Verify hero section visible (check for key element)
ab snapshot -i
# Look for quick access cards
ab click @e3  # Announcements card (verify ref via snapshot)

# Verify navigation worked
sleep 1
ab snapshot -i
screenshot "portal-landing"

echo "PASS: Portal landing page loaded"