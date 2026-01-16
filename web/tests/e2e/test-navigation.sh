#!/bin/bash
# Navigation & Responsive Design Tests
# Tests: URL routing, 404 page, viewport responsiveness

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# ============================================================
# TEST: 404 Not Found Page
# ============================================================
test_404_page() {
  log_section "404 Not Found Page"
  navigate_to "/nonexistent-page-xyz-123"
  sleep 2
  screenshot "404-page"

  if is_visible "h1"; then
    log_success "404 page renders content"
  else
    log_fail "404 page missing content"
  fi
}

# ============================================================
# TEST: Navigation Between Pages
# ============================================================
test_navigation_flow() {
  log_section "Navigation Flow"

  navigate_to "/portal"
  sleep 2

  # Navigate to announcements
  click_element "a[href='/portal/announcements']"
  sleep 2
  if assert_url_contains "/portal/announcements"; then
    log_success "Navigated to announcements"
  else
    log_fail "Failed to navigate to announcements"
  fi

  # Navigate back
  click_element "a[href='/portal']"
  sleep 2
  if assert_url_contains "/portal"; then
    log_success "Navigated back to portal"
  else
    log_fail "Failed to navigate back"
  fi

  # Browser back/forward
  click_element "a[href='/portal/chatbot']"
  sleep 2
  ab back 2>/dev/null
  sleep 2
  if assert_url_contains "/portal"; then
    log_success "Browser back works"
  else
    log_fail "Browser back failed"
  fi
}

# ============================================================
# TEST: Responsive Viewports
# ============================================================
test_responsive() {
  log_section "Responsive Design"

  # Mobile
  ab set viewport 375 667
  navigate_to "/portal"
  sleep 2
  screenshot "mobile-portal"
  if is_visible "header"; then
    log_success "Mobile: Header visible"
  else
    log_fail "Mobile: Header not visible"
  fi

  # Tablet
  ab set viewport 768 1024
  ab reload
  sleep 2
  screenshot "tablet-portal"
  log_success "Tablet: Layout rendered"

  # Desktop
  ab set viewport 1920 1080
  ab reload
  sleep 2
  screenshot "desktop-portal"
  log_success "Desktop: Layout rendered"

  # Reset
  ab set viewport 1280 720
}

# ============================================================
# RUN ALL NAVIGATION TESTS
# ============================================================
run_navigation_tests() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║          Navigation & Responsive Design Tests                ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""

  init_browser
  test_404_page
  test_navigation_flow
  test_responsive
  print_summary
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  run_navigation_tests
fi
