---
phase: 7
title: "Visual Regression"
status: pending
priority: P3
effort: 1h
---

# Phase 7: Visual Regression

## Context Links

- [Agent-Browser Screenshot](./research/researcher-01-agent-browser-patterns.md#screenshotpdf-capture)

## Overview

Capture visual baselines for key pages to detect unintended UI changes. Uses screenshot comparison for regression detection.

## Strategy

1. Capture baseline screenshots (first run)
2. Compare against baselines on subsequent runs
3. Fail test if diff exceeds threshold

## Key Pages for Baselines

| Page | Route | Priority |
|------|-------|----------|
| Portal Home | `/portal` | P1 |
| Login | `/login` | P1 |
| Admin Dashboard | `/admin` | P1 |
| Village Dashboard | `/village` | P1 |
| Announcements | `/portal/announcements` | P2 |
| SMS Page | `/admin/sms` | P2 |
| Task List | `/admin/tasks` | P2 |

## Implementation

### Baseline Capture (`web/tests/e2e/visual/capture-baselines.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

BASELINES_DIR="$(dirname $0)/baselines"
mkdir -p "$BASELINES_DIR"

echo "=== Capturing Visual Baselines ==="

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
```

### Regression Check (`web/tests/e2e/visual/check-regression.sh`)
```bash
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
  name=$(basename "$baseline" .png)
  current="$CURRENT_DIR/$name.png"
  diff="$DIFF_DIR/$name-diff.png"

  if ! compare_images "$baseline" "$current" "$diff" "$name"; then
    FAILED=$((FAILED + 1))
  fi
done

if [ $FAILED -gt 0 ]; then
  echo "=== $FAILED visual regressions detected ==="
  exit 1
else
  echo "=== All visual checks passed ==="
fi
```

### Update Baselines (`web/tests/e2e/visual/update-baselines.sh`)
```bash
#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "=== Updating Visual Baselines ==="

# Capture new baselines
bash "$(dirname $0)/capture-baselines.sh"

echo "Baselines updated. Commit changes to lock new baselines."
```

## Directory Structure

```
web/tests/e2e/visual/
├── capture-baselines.sh    # Initial baseline capture
├── capture-current.sh      # Capture current state
├── check-regression.sh     # Compare and report
├── update-baselines.sh     # Update baselines
├── baselines/              # Committed baseline images
│   ├── portal-home.png
│   ├── login.png
│   └── ...
├── current/                # Current run (gitignored)
└── diffs/                  # Diff images (gitignored)
```

## Todo List

- [ ] Create capture-baselines.sh
- [ ] Create capture-current.sh (copy of capture with different output dir)
- [ ] Create check-regression.sh
- [ ] Create update-baselines.sh
- [ ] Install ImageMagick for comparison
- [ ] Add baselines/ to git, current/ and diffs/ to .gitignore
- [ ] Run initial baseline capture

## Success Criteria

- [ ] Baselines captured for all key pages
- [ ] Regression check runs and compares
- [ ] Diffs generated for visual differences
- [ ] Threshold configurable

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dynamic content changes | Medium | Use stable test data |
| Viewport size differences | High | Set consistent viewport |
| Font rendering differences | Medium | Accept small threshold |

## Dependencies

- ImageMagick (`compare` command)
- Consistent viewport size
- Stable test data

## Notes

- Set viewport before screenshots: `ab viewport 1280 720`
- Consider responsive breakpoints (mobile, tablet, desktop)
- Dynamic data (timestamps, counts) may cause false positives
