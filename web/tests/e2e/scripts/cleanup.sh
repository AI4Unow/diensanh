#!/bin/bash
# Clean up sessions and screenshots
SESSIONS_DIR="$(dirname $0)/../sessions"
SCREENSHOTS_DIR="$(dirname $0)/../screenshots"

echo "Cleaning up test artifacts..."

# Remove session files but keep .gitkeep
find "$SESSIONS_DIR" -name "*.json" -delete 2>/dev/null || true

# Optionally clean old screenshots (keep last 10)
if [ -d "$SCREENSHOTS_DIR" ]; then
  cd "$SCREENSHOTS_DIR"
  ls -t *.png 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
fi

echo "✓ Sessions and old screenshots cleaned"