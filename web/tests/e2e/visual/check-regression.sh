#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

BASELINES_DIR="$(dirname $0)/baselines"
CURRENT_DIR="$(dirname $0)/current"
DIFF_DIR="$(dirname $0)/diffs"

mkdir -p "$CURRENT_DIR" "$DIFF_DIR"

echo "=== Visual Regression Check ==="

# Capture current screenshots
bash "$(dirname $0)/capture-current.sh"

# Compare using ImageMagick
compare_images() {
  local baseline="$1"
  local current="$2"
  local diff="$3"
  local name="$4"

  if [ ! -f "$baseline" ]; then
    echo "SKIP: No baseline for $name"
    return 0
  fi

  if [ ! -f "$current" ]; then
    echo "SKIP: No current screenshot for $name"
    return 0
  fi

  # Check if ImageMagick is available
  if ! command -v compare &> /dev/null; then
    echo "WARN: ImageMagick not installed, skipping comparison for $name"
    return 0
  fi

  # Generate diff image and get metric
  DIFF_METRIC=$(compare -metric AE "$baseline" "$current" "$diff" 2>&1 || true)

  if [ "$DIFF_METRIC" -gt 100 ]; then
    echo "FAIL: $name has $DIFF_METRIC pixel differences"
    return 1
  else
    echo "PASS: $name (diff: $DIFF_METRIC px)"
    return 0
  fi
}

FAILED=0

for baseline in "$BASELINES_DIR"/*.png; do
  if [ -f "$baseline" ]; then
    name=$(basename "$baseline" .png)
    current="$CURRENT_DIR/$name.png"
    diff="$DIFF_DIR/$name-diff.png"

    if ! compare_images "$baseline" "$current" "$diff" "$name"; then
      FAILED=$((FAILED + 1))
    fi
  fi
done

if [ $FAILED -gt 0 ]; then
  echo "=== $FAILED visual regressions detected ==="
  exit 1
else
  echo "=== All visual checks passed ==="
fi