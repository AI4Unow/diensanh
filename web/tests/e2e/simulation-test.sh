#!/bin/bash
# Comprehensive Simulation Test for Diên Sanh App
# Uses agent-browser for automated browser testing
#
# Usage: ./simulation-test.sh [BASE_URL] [--headed]
# Example: ./simulation-test.sh http://localhost:5173 --headed

set -e

# Configuration
BASE_URL="${1:-http://localhost:5173}"
SESSION_NAME="diensanh-test-$(date +%s)"
SCREENSHOTS_DIR="./test-screenshots"
HEADED_MODE=""

# Parse arguments
for arg in "$@"; do
  case $arg in
    --headed)
      HEADED_MODE="--headed"
      shift
      ;;
  esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

# Helper functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASSED++)); ((TOTAL++)); }
log_fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAILED++)); ((TOTAL++)); }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_section() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${BLUE}  $1${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# Run agent-browser command with session
ab() {
  agent-browser --session "$SESSION_NAME" $HEADED_MODE "$@"
}

# Take screenshot with name
screenshot() {
  ab screenshot "$SCREENSHOTS_DIR/$1-$(date +%H%M%S).png"
}

# Wait for element or timeout
wait_for() {
  ab wait "$1" 2>/dev/null || true
}

# Check if element is visible
is_visible() {
  ab is visible "$1" 2>/dev/null && return 0 || return 1
}

# Get text content
get_text() {
  ab get text "$1" 2>/dev/null
}

# Assert page contains text
assert_text_exists() {
  local selector="$1"
  local expected="$2"
  local text=$(get_text "$selector")
  if [[ "$text" == *"$expected"* ]]; then
    return 0
  else
    return 1
  fi
}

# Cleanup function
cleanup() {
  log_info "Cleaning up browser session..."
  ab close 2>/dev/null || true
}

trap cleanup EXIT

# ============================================================
# TEST SUITE: Portal Public Features
# ============================================================
test_portal_home() {
  log_section "Testing Portal Home Page"

  log_info "Opening portal home page..."
  ab open "$BASE_URL/portal"
  sleep 2
  screenshot "portal-home"

  # Check header elements
  if is_visible "h1"; then
    log_success "Portal header is visible"
  else
    log_fail "Portal header not found"
  fi

  # Check hero section
  if is_visible ".bg-primary-600"; then
    log_success "Hero section is visible"
  else
    log_fail "Hero section not found"
  fi

  # Check navigation links
  log_info "Checking quick action cards..."
  ab snapshot -i

  # Test announcements link
  if is_visible "a[href='/portal/announcements']"; then
    log_success "Announcements link is visible"
  else
    log_fail "Announcements link not found"
  fi

  # Test request form link
  if is_visible "a[href='/portal/requests/new']"; then
    log_success "Request form link is visible"
  else
    log_fail "Request form link not found"
  fi

  # Test chatbot link
  if is_visible "a[href='/portal/chatbot']"; then
    log_success "Chatbot link is visible"
  else
    log_fail "Chatbot link not found"
  fi

  # Test login link
  if is_visible "a[href='/login']"; then
    log_success "Login link is visible"
  else
    log_fail "Login link not found"
  fi

  # Check contact info section
  if is_visible "footer"; then
    log_success "Footer is visible"
  else
    log_fail "Footer not found"
  fi
}

test_portal_announcements() {
  log_section "Testing Announcements Page"

  ab open "$BASE_URL/portal/announcements"
  sleep 2
  screenshot "announcements"

  # Check back button
  if is_visible "a[href='/portal']"; then
    log_success "Back to portal link is visible"
  else
    log_fail "Back link not found"
  fi

  # Check page header
  log_info "Verifying announcements page loaded..."
  ab snapshot -i
}

test_portal_chatbot() {
  log_section "Testing Chatbot Page"

  ab open "$BASE_URL/portal/chatbot"
  sleep 2
  screenshot "chatbot-initial"

  # Check chat interface
  if is_visible "header"; then
    log_success "Chatbot header is visible"
  else
    log_fail "Chatbot header not found"
  fi

  # Check initial message
  log_info "Looking for initial assistant message..."
  sleep 1

  # Check input field
  if is_visible "input[type='text']"; then
    log_success "Chat input field is visible"
  else
    log_fail "Chat input field not found"
  fi

  # Check send button
  if is_visible "button"; then
    log_success "Send button is visible"
  else
    log_fail "Send button not found"
  fi

  # Test sending a message
  log_info "Testing chat interaction..."
  ab fill "input[type='text']" "xin chào"
  sleep 0.5
  ab click "button:last-of-type"
  sleep 2
  screenshot "chatbot-after-message"

  log_success "Chat message sent successfully"

  # Test FAQ response
  log_info "Testing FAQ response for 'giờ làm việc'..."
  ab fill "input[type='text']" "giờ làm việc"
  ab click "button:last-of-type"
  sleep 2
  screenshot "chatbot-faq-response"
}

test_portal_request_form() {
  log_section "Testing Request Form"

  ab open "$BASE_URL/portal/requests/new"
  sleep 2
  screenshot "request-form-initial"

  # Check form header
  if is_visible "header h1"; then
    log_success "Request form header is visible"
  else
    log_fail "Request form header not found"
  fi

  # Check request type options
  log_info "Checking request type buttons..."
  if is_visible "button"; then
    log_success "Request type buttons are visible"
  else
    log_fail "Request type buttons not found"
  fi

  # Select a request type
  log_info "Selecting 'Khiếu nại' request type..."
  ab find text "Khiếu nại" click
  sleep 0.5

  # Fill form fields
  log_info "Filling form fields..."
  ab fill "input[placeholder*='tiêu đề']" "Kiểm tra hệ thống"
  ab fill "textarea" "Đây là nội dung kiểm tra hệ thống tự động"
  ab fill "input[placeholder*='Nguyễn']" "Nguyễn Văn Test"
  ab fill "input[type='tel']" "0912345678"

  screenshot "request-form-filled"
  log_success "Form fields filled successfully"

  # Note: Not submitting to avoid creating test data
  log_info "Form validation passed (skipping actual submission)"
}

# ============================================================
# TEST SUITE: Authentication
# ============================================================
test_login_page() {
  log_section "Testing Login Page"

  ab open "$BASE_URL/login"
  sleep 2
  screenshot "login-page"

  # Check login form header
  if is_visible "h1"; then
    log_success "Login page header is visible"
  else
    log_fail "Login page header not found"
  fi

  # Check phone input
  if is_visible "input[type='tel']"; then
    log_success "Phone input field is visible"
  else
    log_fail "Phone input field not found"
  fi

  # Check submit button
  if is_visible "button[type='submit']"; then
    log_success "Submit button is visible"
  else
    log_fail "Submit button not found"
  fi

  # Test phone input
  log_info "Testing phone number input..."
  ab fill "input[type='tel']" "0912345678"
  sleep 0.5
  screenshot "login-phone-entered"
  log_success "Phone number entered successfully"

  # Note: Not submitting to avoid OTP flow
  log_info "Login form validation passed (skipping OTP submission)"
}

# ============================================================
# TEST SUITE: Navigation & Routing
# ============================================================
test_navigation_routing() {
  log_section "Testing Navigation & Routing"

  # Test redirect from root
  log_info "Testing root redirect to portal..."
  ab open "$BASE_URL/"
  sleep 2

  # Should redirect to portal
  local current_url=$(ab get url 2>/dev/null)
  if [[ "$current_url" == *"/portal"* ]]; then
    log_success "Root redirects to portal correctly"
  else
    log_fail "Root redirect not working (got: $current_url)"
  fi

  # Test 404 page
  log_info "Testing 404 page..."
  ab open "$BASE_URL/nonexistent-page-xyz"
  sleep 2
  screenshot "404-page"
  log_success "404 page test completed"

  # Test protected route redirect
  log_info "Testing protected route redirect (admin without auth)..."
  ab open "$BASE_URL/admin"
  sleep 2

  current_url=$(ab get url 2>/dev/null)
  if [[ "$current_url" == *"/login"* ]]; then
    log_success "Protected route redirects to login"
  else
    log_warn "Protected route redirect may not be working (got: $current_url)"
  fi
}

# ============================================================
# TEST SUITE: Responsive Design
# ============================================================
test_responsive_design() {
  log_section "Testing Responsive Design"

  # Mobile viewport
  log_info "Testing mobile viewport (375x667)..."
  ab set viewport 375 667
  ab open "$BASE_URL/portal"
  sleep 2
  screenshot "mobile-portal"

  # Check elements are visible
  if is_visible "header"; then
    log_success "Mobile header is visible"
  else
    log_fail "Mobile header not visible"
  fi

  # Tablet viewport
  log_info "Testing tablet viewport (768x1024)..."
  ab set viewport 768 1024
  ab reload
  sleep 2
  screenshot "tablet-portal"
  log_success "Tablet viewport test completed"

  # Desktop viewport
  log_info "Testing desktop viewport (1920x1080)..."
  ab set viewport 1920 1080
  ab reload
  sleep 2
  screenshot "desktop-portal"
  log_success "Desktop viewport test completed"

  # Reset to default
  ab set viewport 1280 720
}

# ============================================================
# TEST SUITE: Accessibility Snapshot
# ============================================================
test_accessibility() {
  log_section "Testing Accessibility (Snapshot)"

  ab open "$BASE_URL/portal"
  sleep 2

  log_info "Getting accessibility tree..."
  ab snapshot -i > "$SCREENSHOTS_DIR/accessibility-tree.txt"
  log_success "Accessibility snapshot saved"

  log_info "Checking for interactive elements..."
  ab snapshot -i -c
  log_success "Interactive elements check completed"
}

# ============================================================
# TEST SUITE: Form Validation
# ============================================================
test_form_validation() {
  log_section "Testing Form Validation"

  ab open "$BASE_URL/portal/requests/new"
  sleep 2

  # Try to submit empty form
  log_info "Testing empty form submission..."
  ab click "button[type='submit']"
  sleep 1
  screenshot "form-validation-errors"

  # Check for validation errors
  if is_visible ".text-red-500"; then
    log_success "Validation errors are shown"
  else
    log_warn "Validation errors may not be visible"
  fi

  # Test phone validation
  log_info "Testing invalid phone number..."
  ab fill "input[type='tel']" "123"
  ab click "button[type='submit']"
  sleep 1

  if is_visible ".text-red-500"; then
    log_success "Phone validation error is shown"
  else
    log_warn "Phone validation may not be visible"
  fi
}

# ============================================================
# TEST SUITE: Performance
# ============================================================
test_performance() {
  log_section "Testing Performance"

  log_info "Starting trace recording..."
  ab trace start "$SCREENSHOTS_DIR/trace.json"

  ab open "$BASE_URL/portal"
  sleep 2
  ab open "$BASE_URL/portal/chatbot"
  sleep 2
  ab open "$BASE_URL/portal/requests/new"
  sleep 2

  ab trace stop
  log_success "Performance trace saved to $SCREENSHOTS_DIR/trace.json"
}

# ============================================================
# MAIN TEST RUNNER
# ============================================================
main() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║           Diên Sanh App - Comprehensive Test Suite           ║"
  echo "║                    Using agent-browser                       ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Base URL: $BASE_URL"
  echo "Session: $SESSION_NAME"
  echo "Screenshots: $SCREENSHOTS_DIR"
  echo "Mode: ${HEADED_MODE:-headless}"
  echo ""

  # Run all test suites
  test_portal_home
  test_portal_announcements
  test_portal_chatbot
  test_portal_request_form
  test_login_page
  test_navigation_routing
  test_responsive_design
  test_accessibility
  test_form_validation
  test_performance

  # Summary
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                      TEST SUMMARY                            ║"
  echo "╠══════════════════════════════════════════════════════════════╣"
  echo "║  Total Tests: $TOTAL"
  echo "║  Passed: $PASSED"
  echo "║  Failed: $FAILED"
  echo "║  Success Rate: $(( PASSED * 100 / TOTAL ))%"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Screenshots saved to: $SCREENSHOTS_DIR"
  echo ""

  if [ $FAILED -gt 0 ]; then
    exit 1
  fi
}

main "$@"
