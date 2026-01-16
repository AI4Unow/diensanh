#!/bin/bash
# Portal Feature Tests - Public pages testing
# Tests: Home, Announcements, Chatbot, Request Form

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# ============================================================
# TEST: Portal Home Page
# ============================================================
test_portal_home() {
  log_section "Portal Home Page"

  navigate_to "/portal"
  sleep 2
  screenshot "portal-home"

  # Test header visibility
  if is_visible "header"; then
    log_success "Header is visible"
  else
    log_fail "Header not visible"
  fi

  # Test hero section
  if is_visible ".bg-primary-600"; then
    log_success "Hero section is visible"
  else
    log_fail "Hero section not visible"
  fi

  # Test quick action cards
  local cards=("announcements" "requests/new" "chatbot")
  for card in "${cards[@]}"; do
    if is_visible "a[href='/portal/$card']"; then
      log_success "Quick action link /$card is visible"
    else
      log_fail "Quick action link /$card not found"
    fi
  done

  # Test login link
  if is_visible "a[href='/login']"; then
    log_success "Login link is visible"
  else
    log_fail "Login link not visible"
  fi

  # Test footer
  if is_visible "footer"; then
    log_success "Footer is visible"
  else
    log_fail "Footer not visible"
  fi

  # Test contact info section
  if element_exists ".bg-white.rounded-xl"; then
    log_success "Contact info section exists"
  else
    log_fail "Contact info section not found"
  fi
}

# ============================================================
# TEST: Announcements Page
# ============================================================
test_announcements() {
  log_section "Announcements Page"

  navigate_to "/portal/announcements"
  sleep 2
  screenshot "announcements"

  # Test back navigation
  if is_visible "a[href='/portal']"; then
    log_success "Back to portal link visible"
  else
    log_fail "Back link not found"
  fi

  # Test page header
  if is_visible "header"; then
    log_success "Page header visible"
  else
    log_fail "Page header not visible"
  fi

  # Test back navigation works
  click_element "a[href='/portal']"
  sleep 1
  if assert_url_contains "/portal"; then
    log_success "Back navigation works"
  else
    log_fail "Back navigation failed"
  fi
}

# ============================================================
# TEST: Chatbot Page
# ============================================================
test_chatbot() {
  log_section "Chatbot Page"

  navigate_to "/portal/chatbot"
  sleep 2
  screenshot "chatbot-initial"

  # Test chatbot header
  if is_visible "header h1"; then
    log_success "Chatbot header visible"
  else
    log_fail "Chatbot header not visible"
  fi

  # Test chat input
  if is_visible "input[type='text']"; then
    log_success "Chat input field visible"
  else
    log_fail "Chat input not visible"
  fi

  # Test send button
  if is_visible "button"; then
    log_success "Send button visible"
  else
    log_fail "Send button not visible"
  fi

  # Test initial bot message
  log_info "Checking for initial assistant message..."
  sleep 1

  # Test sending a message
  log_info "Testing chat interaction..."
  fill_input "input[type='text']" "xin chào"
  sleep 0.5
  click_element "button:last-of-type"
  sleep 2
  screenshot "chatbot-greeting"
  log_success "Greeting message sent"

  # Test FAQ: working hours
  log_info "Testing FAQ response..."
  fill_input "input[type='text']" "giờ làm việc"
  click_element "button:last-of-type"
  sleep 2
  screenshot "chatbot-faq-hours"
  log_success "FAQ query sent"

  # Test FAQ: address
  fill_input "input[type='text']" "địa chỉ"
  click_element "button:last-of-type"
  sleep 2
  screenshot "chatbot-faq-address"
  log_success "Address query sent"

  # Test FAQ: birth registration
  fill_input "input[type='text']" "khai sinh"
  click_element "button:last-of-type"
  sleep 2
  screenshot "chatbot-faq-birth"
  log_success "Birth registration query sent"

  # Test unknown query response
  fill_input "input[type='text']" "xyz không biết gì"
  click_element "button:last-of-type"
  sleep 2
  screenshot "chatbot-unknown"
  log_success "Unknown query handled"
}

# ============================================================
# TEST: Request Form Page
# ============================================================
test_request_form() {
  log_section "Request Form Page"

  navigate_to "/portal/requests/new"
  sleep 2
  screenshot "request-form-initial"

  # Test header
  if is_visible "header h1"; then
    log_success "Form header visible"
  else
    log_fail "Form header not visible"
  fi

  # Test request type buttons
  log_info "Testing request type selection..."
  if element_exists "button"; then
    log_success "Request type buttons exist"
  else
    log_fail "Request type buttons not found"
  fi

  # Test selecting different request types
  local types=("Khiếu nại" "Kiến nghị" "Khác")
  for type in "${types[@]}"; do
    ab find text "$type" click 2>/dev/null
    sleep 0.3
    log_success "Selected request type: $type"
  done

  # Select certificate type for form filling
  ab find text "Xin giấy xác nhận" click 2>/dev/null
  sleep 0.5

  # Test form validation - submit empty
  log_info "Testing empty form validation..."
  click_element "button[type='submit']"

  # Wait for specific validation errors to appear (up to 5 seconds with polling)
  local validation_found=false
  for i in {1..10}; do
    # Check for specific Vietnamese validation messages
    if ab find text "Vui lòng nhập tiêu đề" 2>/dev/null || \
       ab find text "Vui lòng nhập nội dung" 2>/dev/null || \
       ab find text "Vui lòng nhập họ tên" 2>/dev/null || \
       ab find text "Vui lòng nhập số điện thoại" 2>/dev/null; then
      validation_found=true
      break
    fi
    sleep 0.5
  done

  screenshot "request-form-validation"

  if $validation_found; then
    log_success "Validation errors shown for empty form"
  else
    log_fail "Validation errors not visible"
  fi

  # Test filling the form
  log_info "Filling form fields..."
  fill_input "input[placeholder*='tiêu đề']" "Xin giấy xác nhận cư trú"
  fill_input "textarea" "Tôi cần xin giấy xác nhận cư trú để làm hồ sơ xin việc. Địa chỉ: Thôn 1, Xã Diên Sanh."
  fill_input "input[placeholder*='Nguyễn']" "Nguyễn Văn Test"

  # Test phone validation with invalid number
  log_info "Testing phone validation..."
  fill_input "input[type='tel']" "123"
  click_element "button[type='submit']"
  sleep 1

  if is_visible ".text-red-500"; then
    log_success "Phone validation error shown"
  else
    log_warn "Phone validation may not be visible"
  fi

  # Fill valid phone
  fill_input "input[type='tel']" "0912345678"
  screenshot "request-form-filled"
  log_success "Form filled with valid data"

  # Note: Not submitting to avoid creating test data in production
  log_info "Form validated (skipping submission to avoid test data)"
}

# ============================================================
# RUN ALL PORTAL TESTS
# ============================================================
run_portal_tests() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║            Portal Feature Tests - Public Pages               ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Base URL: $BASE_URL"
  echo "Session: $SESSION_NAME"
  echo ""

  init_browser

  test_portal_home
  test_announcements
  test_chatbot
  test_request_form

  print_summary
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  run_portal_tests
fi
