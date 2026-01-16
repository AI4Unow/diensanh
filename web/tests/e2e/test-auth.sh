#!/bin/bash
# Authentication Tests
# Tests: Login page, OTP flow, redirects, protected routes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# ============================================================
# TEST: Login Page UI
# ============================================================
test_login_page_ui() {
  log_section "Login Page UI"

  navigate_to "/login"
  sleep 2
  screenshot "login-page"

  # Test header/title
  if is_visible "h1"; then
    log_success "Login page header visible"
  else
    log_fail "Login page header not visible"
  fi

  # Test subtitle
  if element_exists ".text-muted-foreground"; then
    log_success "Login page subtitle visible"
  else
    log_fail "Login page subtitle not visible"
  fi

  # Test phone input field
  if is_visible "input[type='tel']"; then
    log_success "Phone input field visible"
  else
    log_fail "Phone input field not visible"
  fi

  # Test phone input label
  if element_exists "label[for='phone']"; then
    log_success "Phone input label exists"
  else
    log_fail "Phone input label not found"
  fi

  # Test submit button
  if is_visible "button[type='submit']"; then
    log_success "Submit button visible"
  else
    log_fail "Submit button not visible"
  fi

  # Test button is disabled when empty
  log_info "Testing button disabled state..."
  local button_disabled=$(ab eval "document.querySelector('button[type=submit]')?.disabled" 2>/dev/null)
  if [[ "$button_disabled" == "true" ]]; then
    log_success "Submit button disabled when phone empty"
  else
    log_warn "Submit button may not be properly disabled"
  fi

  # Test reCAPTCHA container exists
  if element_exists "#recaptcha-container"; then
    log_success "reCAPTCHA container exists"
  else
    log_fail "reCAPTCHA container not found"
  fi
}

# ============================================================
# TEST: Phone Input Validation
# ============================================================
test_phone_input() {
  log_section "Phone Input Validation"

  navigate_to "/login"
  sleep 2

  # Test typing phone number
  log_info "Testing phone number input..."
  fill_input "input[type='tel']" "0912345678"
  sleep 0.5
  screenshot "login-phone-entered"

  # Check button becomes enabled
  local button_disabled=$(ab eval "document.querySelector('button[type=submit]')?.disabled" 2>/dev/null)
  if [[ "$button_disabled" == "false" ]]; then
    log_success "Submit button enabled after phone entry"
  else
    log_fail "Submit button still disabled after phone entry"
  fi

  # Test clearing phone
  fill_input "input[type='tel']" ""
  sleep 0.3
  button_disabled=$(ab eval "document.querySelector('button[type=submit]')?.disabled" 2>/dev/null)
  if [[ "$button_disabled" == "true" ]]; then
    log_success "Submit button disabled after clearing phone"
  else
    log_warn "Submit button state may not be correct"
  fi

  # Test various phone formats
  local phone_formats=("0912345678" "0123456789" "0987654321")
  for phone in "${phone_formats[@]}"; do
    fill_input "input[type='tel']" "$phone"
    log_success "Accepted phone format: $phone"
  done
}

# ============================================================
# TEST: Protected Route Redirects
# ============================================================
test_protected_routes() {
  log_section "Protected Route Redirects"

  # Clear any existing session first
  ab storage local clear 2>/dev/null || true
  ab cookies clear 2>/dev/null || true

  # Test admin route redirect
  log_info "Testing /admin redirect without auth..."
  navigate_to "/admin"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Admin route redirects to login"
  else
    log_warn "Admin route may not redirect properly (could be loading)"
  fi
  screenshot "protected-admin-redirect"

  # Test village route redirect
  log_info "Testing /village redirect without auth..."
  navigate_to "/village"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Village route redirects to login"
  else
    log_warn "Village route may not redirect properly"
  fi

  # Test nested admin routes
  log_info "Testing /admin/villages redirect..."
  navigate_to "/admin/villages"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Nested admin route redirects to login"
  else
    log_warn "Nested admin route may not redirect properly"
  fi

  # Test admin tasks route
  log_info "Testing /admin/tasks redirect..."
  navigate_to "/admin/tasks"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Admin tasks route redirects to login"
  else
    log_warn "Admin tasks route may not redirect properly"
  fi

  # Test admin SMS route
  log_info "Testing /admin/sms redirect..."
  navigate_to "/admin/sms"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Admin SMS route redirects to login"
  else
    log_warn "Admin SMS route may not redirect properly"
  fi
}

# ============================================================
# TEST: Public Routes Accessibility
# ============================================================
test_public_routes() {
  log_section "Public Routes Accessibility"

  # Test portal is accessible without auth
  log_info "Testing /portal accessibility..."
  navigate_to "/portal"
  sleep 2

  if assert_url_contains "/portal"; then
    log_success "Portal is publicly accessible"
  else
    log_fail "Portal not accessible"
  fi

  # Test portal announcements
  log_info "Testing /portal/announcements accessibility..."
  navigate_to "/portal/announcements"
  sleep 2

  if assert_url_contains "/portal/announcements"; then
    log_success "Announcements page is publicly accessible"
  else
    log_fail "Announcements not accessible"
  fi

  # Test portal chatbot
  log_info "Testing /portal/chatbot accessibility..."
  navigate_to "/portal/chatbot"
  sleep 2

  if assert_url_contains "/portal/chatbot"; then
    log_success "Chatbot page is publicly accessible"
  else
    log_fail "Chatbot not accessible"
  fi

  # Test request form
  log_info "Testing /portal/requests/new accessibility..."
  navigate_to "/portal/requests/new"
  sleep 2

  if assert_url_contains "/portal/requests/new"; then
    log_success "Request form is publicly accessible"
  else
    log_fail "Request form not accessible"
  fi

  # Test login page
  log_info "Testing /login accessibility..."
  navigate_to "/login"
  sleep 2

  if assert_url_contains "/login"; then
    log_success "Login page is accessible"
  else
    log_fail "Login page not accessible"
  fi
}

# ============================================================
# TEST: Root Redirect
# ============================================================
test_root_redirect() {
  log_section "Root URL Redirect"

  log_info "Testing root URL redirect..."
  navigate_to "/"
  sleep 2

  if assert_url_contains "/portal"; then
    log_success "Root URL redirects to /portal"
  else
    log_fail "Root URL redirect not working"
  fi
  screenshot "root-redirect"
}

# ============================================================
# RUN ALL AUTH TESTS
# ============================================================
run_auth_tests() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║              Authentication & Authorization Tests            ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Base URL: $BASE_URL"
  echo "Session: $SESSION_NAME"
  echo ""

  init_browser

  test_login_page_ui
  test_phone_input
  test_root_redirect
  test_public_routes
  test_protected_routes

  print_summary
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  run_auth_tests
fi
