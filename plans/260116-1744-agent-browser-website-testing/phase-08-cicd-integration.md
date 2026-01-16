---
phase: 8
title: "CI/CD Integration"
status: pending
priority: P2
effort: 1h
---

# Phase 8: CI/CD Integration

## Context Links

- [Agent-Browser Patterns](./research/researcher-01-agent-browser-patterns.md#integration-best-practices)
- Project: Vercel (frontend), Firebase (backend)

## Overview

Integrate agent-browser E2E tests into CI/CD pipeline for automated testing on PRs and deployments.

## CI/CD Strategy

1. Run tests on PR (preview deployments)
2. Run tests after production deploy
3. Store screenshots as artifacts
4. Report failures via PR comments

## Implementation

### GitHub Actions Workflow (`.github/workflows/e2e-tests.yml`)
```yaml
name: E2E Tests

on:
  pull_request:
    paths:
      - 'web/**'
  push:
    branches: [main]
    paths:
      - 'web/**'

env:
  BASE_URL: ${{ github.event_name == 'pull_request' && format('https://{0}.vercel.app', github.event.pull_request.head.sha) || 'https://diensanh.vercel.app' }}

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json

      - name: Install dependencies
        run: |
          npm install -g agent-browser
          sudo apt-get update
          sudo apt-get install -y imagemagick

      - name: Wait for deployment
        if: github.event_name == 'pull_request'
        run: |
          echo "Waiting for Vercel preview deployment..."
          sleep 60  # Adjust based on deploy time
          curl -sf "$BASE_URL" || (echo "Deployment not ready" && exit 1)

      - name: Start Firebase emulators
        run: |
          npm install -g firebase-tools
          firebase emulators:start --only auth &
          sleep 10

      - name: Run E2E tests
        run: |
          cd web/tests/e2e
          bash scripts/run-all.sh
        env:
          BASE_URL: ${{ env.BASE_URL }}

      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-screenshots
          path: web/tests/e2e/screenshots/
          retention-days: 7

      - name: Upload visual diffs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: web/tests/e2e/visual/diffs/
          retention-days: 7
```

### Local Testing Script (`web/tests/e2e/scripts/run-local.sh`)
```bash
#!/bin/bash
set -e

echo "=== E2E Tests - Local Run ==="

# Check prerequisites
command -v npx >/dev/null || { echo "npm/npx required"; exit 1; }

# Check dev server running
if ! curl -sf "http://localhost:5173" >/dev/null 2>&1; then
  echo "Starting dev server..."
  cd "$(dirname $0)/../../.." # web directory
  npm run dev &
  DEV_PID=$!
  sleep 5
  trap "kill $DEV_PID 2>/dev/null" EXIT
fi

# Run tests
export BASE_URL="${BASE_URL:-http://localhost:5173}"
bash "$(dirname $0)/run-all.sh"

echo "=== Local tests complete ==="
```

### PR Comment Reporter (`web/tests/e2e/scripts/report-results.sh`)
```bash
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
```

### Package.json Scripts

Add to `web/package.json`:
```json
{
  "scripts": {
    "test:e2e": "bash tests/e2e/scripts/run-all.sh",
    "test:e2e:local": "bash tests/e2e/scripts/run-local.sh",
    "test:visual": "bash tests/e2e/visual/check-regression.sh",
    "test:visual:update": "bash tests/e2e/visual/update-baselines.sh"
  }
}
```

## Todo List

- [ ] Create `.github/workflows/e2e-tests.yml`
- [ ] Create `run-local.sh` script
- [ ] Create `report-results.sh` script
- [ ] Add npm scripts to package.json
- [ ] Configure Vercel preview URL pattern
- [ ] Test workflow on PR

## Success Criteria

- [ ] Tests run automatically on PRs
- [ ] Screenshots uploaded as artifacts
- [ ] Failures block PR merge
- [ ] Local run script works

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Preview URL timing | Medium | Add wait/retry logic |
| Emulator setup fails | Medium | Cache Firebase tools |
| Flaky tests | High | Add retries, increase timeouts |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Target URL for tests | http://localhost:5173 |
| `FIREBASE_EMULATOR_HOST` | Firebase emulator | localhost:9099 |

## Vercel Integration Notes

- Preview URLs: `https://{commit-sha}.vercel.app` or `https://{branch-name}.vercel.app`
- May need to enable "Deployment Protection Bypass" for tests
- Consider using Vercel's deployment status API for proper wait

## Notes

- GitHub Actions has headless Chrome pre-installed
- agent-browser uses Chromium internally
- Adjust timeouts based on actual test duration
- Consider parallel test execution for faster runs
