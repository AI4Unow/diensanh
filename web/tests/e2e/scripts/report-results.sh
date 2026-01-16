#!/bin/bash
# Generate Markdown report for PR comment

SCREENSHOTS_DIR="${1:-./screenshots}"
OUTPUT="${2:-./test-report.md}"

echo "# E2E Test Results" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Run at: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Count screenshots
TOTAL=$(ls -1 "$SCREENSHOTS_DIR"/*.png 2>/dev/null | wc -l)
echo "## Summary" >> "$OUTPUT"
echo "- Screenshots captured: $TOTAL" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Screenshots" >> "$OUTPUT"
for img in "$SCREENSHOTS_DIR"/*.png; do
  [ -f "$img" ] || continue
  name=$(basename "$img")
  echo "- \`$name\`" >> "$OUTPUT"
done

echo "" >> "$OUTPUT"
echo "Download artifacts for full screenshots." >> "$OUTPUT"