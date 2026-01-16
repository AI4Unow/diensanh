#!/bin/bash
# Accessibility & Performance Tests
# Tests: A11y tree, console errors, performance traces

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# ============================================================
# TEST: Accessibility Snapshot
# ============================================================
test_accessibility_snapshot() {
  log_section "Accessibility Snapshot"

  navigate_to "/portal"
  sleep 2

  log_info "Generating accessibility tree..."
  ab snapshot -i > "$SCREENSHOTS_DIR/a11y-portal.txt" 2>/dev/null
  if [ -s "$SCREENSHOTS_DIR/a11y-portal.txt" ]; then
    log_success "Portal a11y tree generated"
  else
    log_fail "Portal a11y tree empty"
  fi

  navigate_to "/portal/chatbot"
  sleep 2
  ab snapshot -i > "$SCREENSHOTS_DIR/a11y-chatbot.txt" 2>/dev/null
  if [ -s "$SCREENSHOTS_DIR/a11y-chatbot.txt" ]; then
    log_success "Chatbot a11y tree generated"
  else
    log_fail "Chatbot a11y tree empty"
  fi

  navigate_to "/login"
  sleep 2
  ab snapshot -i > "$SCREENSHOTS_DIR/a11y-login.txt" 2>/dev/null
  if [ -s "$SCREENSHOTS_DIR/a11y-login.txt" ]; then
    log_success "Login a11y tree generated"
  else
    log_fail "Login a11y tree empty"
  fi
}

# ============================================================
# TEST: Interactive Elements
# ============================================================
test_interactive_elements() {
  log_section "Interactive Elements Check"

  navigate_to "/portal"
  sleep 2

  # Count interactive elements
  log_info "Counting interactive elements on portal..."
  local snapshot=$(ab snapshot -i -c 2>/dev/null)
  local link_count=$(echo "$snapshot" | grep -c "link" || echo "0")
  local button_count=$(echo "$snapshot" | grep -c "button" || echo "0")

  log_info "Found ~$link_count links, ~$button_count buttons"
  log_success "Interactive elements scan complete"

  navigate_to "/portal/requests/new"
  sleep 2
  log_info "Checking form interactivity..."

  snapshot=$(ab snapshot -i -c 2>/dev/null)
  local input_count=$(echo "$snapshot" | grep -c "textbox\|combobox" || echo "0")
  log_info "Found ~$input_count form inputs"
  log_success "Form elements scan complete"
}

# ============================================================
# TEST: Console Errors
# ============================================================
test_console_errors() {
  log_section "Console Errors Check"

  # Clear console first
  ab console --clear 2>/dev/null || true

  navigate_to "/portal"
  sleep 3
  navigate_to "/portal/chatbot"
  sleep 2
  navigate_to "/login"
  sleep 2

  log_info "Checking for console errors..."
  local errors=$(ab errors 2>/dev/null || echo "")

  if [ -z "$errors" ] || [[ "$errors" == *"No errors"* ]]; then
    log_success "No console errors detected"
  else
    echo "$errors" > "$SCREENSHOTS_DIR/console-errors.txt"
    log_warn "Console errors found - saved to console-errors.txt"
  fi
}

# ============================================================
# TEST: Performance Trace
# ============================================================
test_performance_trace() {
  log_section "Performance Trace"

  log_info "Starting performance trace..."
  ab trace start "$SCREENSHOTS_DIR/perf-trace.json" 2>/dev/null || true

  navigate_to "/portal"
  sleep 2
  navigate_to "/portal/chatbot"
  sleep 2

  # Interact with chatbot
  fill_input "input[type='text']" "hello"
  click_element "button:last-of-type"
  sleep 2

  navigate_to "/portal/requests/new"
  sleep 2

  ab trace stop 2>/dev/null || true

  if [ -f "$SCREENSHOTS_DIR/perf-trace.json" ]; then
    log_success "Performance trace saved"
  else
    log_warn "Performance trace may not have saved"
  fi
}

# ============================================================
# TEST: Network Requests
# ============================================================
test_network_requests() {
  log_section "Network Requests"

  # Clear previous requests
  ab network requests --clear 2>/dev/null || true

  navigate_to "/portal"
  sleep 3

  log_info "Capturing network requests..."
  local requests=$(ab network requests 2>/dev/null || echo "")

  if [ -n "$requests" ]; then
    echo "$requests" > "$SCREENSHOTS_DIR/network-requests.txt"
    log_success "Network requests captured"
  else
    log_warn "No network requests captured"
  fi
}

# ============================================================
# RUN ALL A11Y/PERF TESTS
# ============================================================
run_a11y_perf_tests() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║          Accessibility & Performance Tests                   ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""

  init_browser
  test_accessibility_snapshot
  test_interactive_elements
  test_console_errors
  test_performance_trace
  test_network_requests
  print_summary
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  run_a11y_perf_tests
fi
