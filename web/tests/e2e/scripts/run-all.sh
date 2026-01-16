#!/bin/bash
set -e
cd "$(dirname $0)/.."

# Source utilities
source scripts/utils.sh

echo "=== Agent-Browser E2E Tests ==="
echo "Base URL: ${BASE_URL:-http://localhost:5173}"

# Pre-flight checks
check_agent_browser
check_dev_server

echo "✓ Pre-flight checks passed"

# Run test suites in order
for suite in public-portal auth admin sms village; do
  if [ -d "$suite" ]; then
    echo -e "\n--- Running $suite tests ---"
    for test in $suite/*.sh; do
      if [ -f "$test" ]; then
        echo "Running: $(basename $test)"
        bash "$test"
      fi
    done
  else
    echo "⚠ Suite $suite not found, skipping"
  fi
done

echo -e "\n=== All tests passed ==="