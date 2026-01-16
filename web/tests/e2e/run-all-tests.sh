#!/bin/bash
# ============================================================
# Diên Sanh App - Comprehensive E2E Test Runner
# Uses agent-browser for automated browser testing
# ============================================================
#
# Usage:
#   ./run-all-tests.sh [BASE_URL] [OPTIONS]
#
# Options:
#   --headed        Run in headed mode (show browser)
#   --portal        Run only portal tests
#   --auth          Run only auth tests
#   --navigation    Run only navigation tests
#   --a11y          Run only accessibility/performance tests
#   --quick         Run quick smoke tests only
#   --help          Show this help
#
# Examples:
#   ./run-all-tests.sh                              # Run all tests against localhost:5173
#   ./run-all-tests.sh http://localhost:3000        # Run against different port
#   ./run-all-tests.sh --headed                     # Run with visible browser
#   ./run-all-tests.sh --portal --auth              # Run specific test suites
#
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default configuration
export BASE_URL="${1:-http://localhost:5173}"
export SESSION_NAME="diensanh-e2e-$(date +%s)"
export SCREENSHOTS_DIR="$SCRIPT_DIR/test-screenshots"
export HEADED_MODE=""

# Test suite flags
RUN_PORTAL=false
RUN_AUTH=false
RUN_NAVIGATION=false
RUN_A11Y=false
RUN_QUICK=false
RUN_ALL=true

# Parse arguments
shift || true  # Skip first arg (URL) if present
while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      export HEADED_MODE="--headed"
      ;;
    --portal)
      RUN_PORTAL=true
      RUN_ALL=false
      ;;
    --auth)
      RUN_AUTH=true
      RUN_ALL=false
      ;;
    --navigation)
      RUN_NAVIGATION=true
      RUN_ALL=false
      ;;
    --a11y)
      RUN_A11Y=true
      RUN_ALL=false
      ;;
    --quick)
      RUN_QUICK=true
      RUN_ALL=false
      ;;
    --help|-h)
      head -35 "$0" | tail -30
      exit 0
      ;;
    http*)
      export BASE_URL="$1"
      ;;
  esac
  shift
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Print banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}║      🏘️  Diên Sanh App - E2E Test Suite                       ║${NC}"
echo -e "${CYAN}║          Comprehensive Browser Automation Tests              ║${NC}"
echo -e "${CYAN}║                                                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Base URL:    ${GREEN}$BASE_URL${NC}"
echo -e "  Session:     ${GREEN}$SESSION_NAME${NC}"
echo -e "  Screenshots: ${GREEN}$SCREENSHOTS_DIR${NC}"
echo -e "  Mode:        ${GREEN}${HEADED_MODE:-headless}${NC}"
echo ""

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Check if agent-browser is installed
if ! command -v agent-browser &> /dev/null; then
  echo -e "${RED}Error: agent-browser is not installed${NC}"
  echo "Install with: npm install -g agent-browser"
  exit 1
fi

# Check if dev server is running
check_server() {
  echo -e "${BLUE}Checking if server is running...${NC}"
  if curl -s --head "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}Server is running at $BASE_URL${NC}"
    return 0
  else
    echo -e "${YELLOW}Warning: Server may not be running at $BASE_URL${NC}"
    echo -e "${YELLOW}Tests may fail. Start server with: npm run dev${NC}"
    return 1
  fi
}

# Track overall results
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

# Run a test suite
run_suite() {
  local suite_name="$1"
  local suite_script="$2"

  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  Running: $suite_name${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  ((TOTAL_SUITES++))

  if bash "$suite_script"; then
    echo -e "${GREEN}✓ $suite_name passed${NC}"
    ((PASSED_SUITES++))
  else
    echo -e "${RED}✗ $suite_name failed${NC}"
    ((FAILED_SUITES++))
  fi
}

# Quick smoke test
run_quick_tests() {
  echo -e "${BLUE}Running quick smoke tests...${NC}"

  source "$SCRIPT_DIR/lib/test-utils.sh"
  init_browser

  # Quick portal check
  navigate_to "/portal"
  sleep 2
  if is_visible "header"; then
    log_success "Portal loads correctly"
  else
    log_fail "Portal failed to load"
  fi

  # Quick login check
  navigate_to "/login"
  sleep 2
  if is_visible "input[type='tel']"; then
    log_success "Login page loads correctly"
  else
    log_fail "Login page failed to load"
  fi

  # Quick chatbot check
  navigate_to "/portal/chatbot"
  sleep 2
  if is_visible "input[type='text']"; then
    log_success "Chatbot loads correctly"
  else
    log_fail "Chatbot failed to load"
  fi

  screenshot "smoke-test-final"
  print_summary
  cleanup_browser
}

# Main execution
main() {
  check_server || true

  if $RUN_QUICK; then
    run_quick_tests
    exit $?
  fi

  if $RUN_ALL || $RUN_PORTAL; then
    run_suite "Portal Features" "$SCRIPT_DIR/test-portal.sh"
  fi

  if $RUN_ALL || $RUN_AUTH; then
    run_suite "Authentication" "$SCRIPT_DIR/test-auth.sh"
  fi

  if $RUN_ALL || $RUN_NAVIGATION; then
    run_suite "Navigation & Responsive" "$SCRIPT_DIR/test-navigation.sh"
  fi

  if $RUN_ALL || $RUN_A11Y; then
    run_suite "Accessibility & Performance" "$SCRIPT_DIR/test-a11y-perf.sh"
  fi

  # Final summary
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║                    FINAL TEST SUMMARY                        ║${NC}"
  echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║${NC}  Test Suites Run:    ${GREEN}$TOTAL_SUITES${NC}"
  echo -e "${CYAN}║${NC}  Suites Passed:      ${GREEN}$PASSED_SUITES${NC}"
  echo -e "${CYAN}║${NC}  Suites Failed:      ${RED}$FAILED_SUITES${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${BLUE}Screenshots saved to: $SCREENSHOTS_DIR${NC}"
  echo ""

  if [ $FAILED_SUITES -gt 0 ]; then
    echo -e "${RED}Some test suites failed!${NC}"
    exit 1
  else
    echo -e "${GREEN}All test suites passed!${NC}"
    exit 0
  fi
}

main
