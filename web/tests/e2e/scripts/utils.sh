#!/bin/bash
BASE_URL="${BASE_URL:-http://localhost:5173}"
SCREENSHOTS_DIR="$(dirname "${BASH_SOURCE[0]}")/../screenshots"
SESSIONS_DIR="$(dirname "${BASH_SOURCE[0]}")/../sessions"

# Source authentication helpers
source "$(dirname "${BASH_SOURCE[0]}")/../lib/auth-helpers.sh"

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

# Helper: Check if dev server is running
check_dev_server() {
  if ! curl -s "$BASE_URL" > /dev/null; then
    echo "ERROR: Dev server not running at $BASE_URL"
    echo "Please run: npm run dev"
    exit 1
  fi
}

# Helper: Check if agent-browser is installed
check_agent_browser() {
  if ! command -v npx &> /dev/null; then
    echo "ERROR: npx not available"
    echo "Please install Node.js and npm"
    exit 1
  fi

  # Test agent-browser with a simple command
  if ! npx agent-browser --help &> /dev/null; then
    echo "ERROR: agent-browser not installed"
    echo "Please run: npm install -g agent-browser"
    exit 1
  fi
}