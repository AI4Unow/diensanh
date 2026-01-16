---
phase: 1
title: "Setup & Infrastructure"
status: pending
priority: P1
effort: 1h
---

# Phase 1: Setup & Infrastructure

## Context Links

- [Agent-Browser Patterns](./research/researcher-01-agent-browser-patterns.md)
- [Frontend Analysis](./research/researcher-02-frontend-analysis.md)

## Overview

Setup test infrastructure including directory structure, helper scripts, and session management patterns.

## Key Insights

- Use `--session` flag for test isolation
- Save/restore auth state to skip repetitive logins
- Screenshot on failure for debugging

## Requirements

### Functional
- Test directory structure in `web/tests/e2e/`
- Shell scripts for common test flows
- Session management for role-based tests

### Non-Functional
- Tests runnable locally and in CI
- Clear output/logging

## Architecture

```
web/tests/e2e/
├── scripts/
│   ├── run-all.sh           # Master test runner
│   ├── utils.sh              # Shared functions
│   └── cleanup.sh            # Session cleanup
├── sessions/
│   ├── admin-auth.json       # Saved admin session
│   └── village-auth.json     # Saved village leader session
├── screenshots/
│   └── .gitkeep              # Test evidence
├── public-portal/
├── auth/
├── admin/
├── sms/
├── village/
└── visual/
```

## Implementation Steps

### 1. Create Directory Structure
```bash
mkdir -p web/tests/e2e/{scripts,sessions,screenshots,public-portal,auth,admin,sms,village,visual}
touch web/tests/e2e/screenshots/.gitkeep
touch web/tests/e2e/sessions/.gitkeep
```

### 2. Create Utility Script (`web/tests/e2e/scripts/utils.sh`)
```bash
#!/bin/bash
BASE_URL="${BASE_URL:-http://localhost:5173}"
SCREENSHOTS_DIR="$(dirname $0)/../screenshots"
SESSIONS_DIR="$(dirname $0)/../sessions"

# Helper: Run command with output
ab() {
  npx agent-browser "$@"
}

# Helper: Snapshot and wait
snapshot_wait() {
  ab snapshot -i
  sleep 1
}

# Helper: Screenshot with timestamp
screenshot() {
  local name="${1:-test}"
  ab screenshot "$SCREENSHOTS_DIR/${name}-$(date +%Y%m%d-%H%M%S).png"
}

# Helper: Assert URL contains
assert_url_contains() {
  local expected="$1"
  local current=$(ab eval "window.location.href")
  if [[ "$current" == *"$expected"* ]]; then
    echo "PASS: URL contains $expected"
  else
    echo "FAIL: Expected URL to contain $expected, got $current"
    exit 1
  fi
}
```

### 3. Create Master Runner (`web/tests/e2e/scripts/run-all.sh`)
```bash
#!/bin/bash
set -e
cd "$(dirname $0)/.."

echo "=== Agent-Browser E2E Tests ==="
echo "Base URL: ${BASE_URL:-http://localhost:5173}"

# Run test suites in order
for suite in public-portal auth admin sms village; do
  if [ -d "$suite" ]; then
    echo -e "\n--- Running $suite tests ---"
    for test in $suite/*.sh; do
      [ -f "$test" ] && bash "$test"
    done
  fi
done

echo -e "\n=== All tests passed ==="
```

### 4. Create Cleanup Script (`web/tests/e2e/scripts/cleanup.sh`)
```bash
#!/bin/bash
# Clean up sessions and screenshots
rm -f "$(dirname $0)/../sessions/"*.json
echo "Sessions cleaned"
```

## Todo List

- [ ] Create directory structure
- [ ] Write utils.sh with helper functions
- [ ] Write run-all.sh master runner
- [ ] Write cleanup.sh
- [ ] Test infrastructure locally
- [ ] Add .gitignore for sessions/*.json

## Success Criteria

- [ ] `bash web/tests/e2e/scripts/run-all.sh` executes without errors
- [ ] Utils sourced correctly in test scripts
- [ ] Screenshots directory accessible

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| agent-browser not installed | High | Add check in run-all.sh |
| Dev server not running | High | Add health check before tests |

## Next Steps

After infrastructure setup, proceed to Phase 2 (Public Portal Tests).
