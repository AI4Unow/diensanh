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