#!/bin/bash
# Test Utilities for agent-browser E2E tests
# Common functions and helpers

# Colors for output
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export NC='\033[0m' # No Color

# Test counters (shared via temp file for subshell compatibility)
COUNTER_FILE="/tmp/e2e-test-counters-$$"
echo "0 0 0" > "$COUNTER_FILE"

# Configuration
export BASE_URL="${BASE_URL:-http://localhost:5173}"
export SESSION_NAME="${SESSION_NAME:-diensanh-e2e-$(date +%s)}"
export SCREENSHOTS_DIR="${SCREENSHOTS_DIR:-./test-screenshots}"
export HEADED_MODE="${HEADED_MODE:-}"

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
  local counts=$(cat "$COUNTER_FILE")
  local passed=$(echo $counts | cut -d' ' -f1)
  local failed=$(echo $counts | cut -d' ' -f2)
  local total=$(echo $counts | cut -d' ' -f3)
  echo "$((passed+1)) $failed $((total+1))" > "$COUNTER_FILE"
}
log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  local counts=$(cat "$COUNTER_FILE")
  local passed=$(echo $counts | cut -d' ' -f1)
  local failed=$(echo $counts | cut -d' ' -f2)
  local total=$(echo $counts | cut -d' ' -f3)
  echo "$passed $((failed+1)) $((total+1))" > "$COUNTER_FILE"
}
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_section() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Run agent-browser command with session
ab() {
  agent-browser --session "$SESSION_NAME" $HEADED_MODE "$@"
}

# Take screenshot with descriptive name
screenshot() {
  local name="$1"
  local timestamp=$(date +%H%M%S)
  ab screenshot "$SCREENSHOTS_DIR/${name}-${timestamp}.png" 2>/dev/null
}

# Wait for element with timeout
wait_for() {
  local selector="$1"
  local timeout="${2:-5000}"
  ab wait "$selector" --timeout "$timeout" 2>/dev/null || true
}

# Check if element is visible
is_visible() {
  ab is visible "$1" 2>/dev/null && return 0 || return 1
}

# Check if element exists
element_exists() {
  local count=$(ab get count "$1" 2>/dev/null || echo "0")
  [ "$count" -gt 0 ] && return 0 || return 1
}

# Get text content from element
get_text() {
  ab get text "$1" 2>/dev/null
}

# Get current URL
get_url() {
  ab get url 2>/dev/null
}

# Fill input field (clear first)
fill_input() {
  local selector="$1"
  local value="$2"
  ab fill "$selector" "$value" 2>/dev/null
}

# Click element
click_element() {
  ab click "$1" 2>/dev/null
}

# Navigate to URL
navigate_to() {
  local path="$1"
  ab open "${BASE_URL}${path}" 2>/dev/null
  sleep 1
}

# Assert URL contains path
assert_url_contains() {
  local expected="$1"
  local current_url=$(get_url)
  if [[ "$current_url" == *"$expected"* ]]; then
    return 0
  else
    return 1
  fi
}

# Assert element has text
assert_has_text() {
  local selector="$1"
  local expected="$2"
  local text=$(get_text "$selector")
  if [[ "$text" == *"$expected"* ]]; then
    return 0
  else
    return 1
  fi
}

# Get test summary
get_test_summary() {
  local counts=$(cat "$COUNTER_FILE")
  local passed=$(echo $counts | cut -d' ' -f1)
  local failed=$(echo $counts | cut -d' ' -f2)
  local total=$(echo $counts | cut -d' ' -f3)
  echo "Total: $total | Passed: $passed | Failed: $failed"
}

# Print final summary
print_summary() {
  local counts=$(cat "$COUNTER_FILE")
  local passed=$(echo $counts | cut -d' ' -f1)
  local failed=$(echo $counts | cut -d' ' -f2)
  local total=$(echo $counts | cut -d' ' -f3)

  if [ "$total" -eq 0 ]; then
    total=1  # Prevent division by zero
  fi

  local rate=$((passed * 100 / total))

  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                      TEST SUMMARY                            ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║  Total Tests: $total"
  echo "║  Passed: $passed"
  echo "║  Failed: $failed"
  echo "║  Success Rate: ${rate}%"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Screenshots saved to: $SCREENSHOTS_DIR"

  # Cleanup
  rm -f "$COUNTER_FILE"

  return $failed
}

# Initialize browser session
init_browser() {
  log_info "Initializing browser session: $SESSION_NAME"
  ab set viewport 1280 720 2>/dev/null || true
}

# Cleanup browser session
cleanup_browser() {
  log_info "Closing browser session..."
  ab close 2>/dev/null || true
}

# Trap for cleanup
trap cleanup_browser EXIT
