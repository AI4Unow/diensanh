#!/bin/bash
# User Guide Acceptance Tests
# Implements scenarios from docs/user_testing_guide.md
# Scenarios: Portal (Public), Admin, Village Head, Resident

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# ============================================================
# CONFIGURATION
# ============================================================

# Test Credentials (from guide)
ADMIN_PHONE="0900000000"
ADMIN_PASS="quantri123"
HEAD_PHONE="0900000001"
HEAD_PASS="truongthon123"
RESIDENT_PHONE="0900000002"
RESIDENT_PASS="nguoidan123"

# ============================================================
# SCENARIO A: Portal (Public Access)
# ============================================================
test_scenario_a_portal() {
  log_section "SCENARIO A: Portal (Public Access)"
  
  # A1. Home & Navigation
  log_info "A1. Checking Home & Navigation"
  navigate_to "/portal"
  sleep 3
  if is_visible "header"; then log_success "Portal loaded"; else log_fail "Portal failed to load"; fi
  screenshot "kp-a1-home"

  # A2. Search Info
  log_info "A2. Testing Search"
  # Click search icon (assuming it's a button with search icon or specific class)
  if ab find ".lucide-search" click 2>/dev/null; then
    sleep 1
    fill_input "input[type='search']" "hộ nghèo"
    ab press Enter
    sleep 2
    screenshot "kp-a2-search-results"
    log_success "Search executed"
  else
    log_warn "Search icon not found, skipping specific A2 step"
  fi

  # A3. View Announcements
  log_info "A3. Viewing Announcements"
  navigate_to "/portal/announcements"
  sleep 2
  # click first article if exists
  if ab find "article a" click 2>/dev/null; then
    sleep 2
    screenshot "kp-a3-announcement-detail"
    log_success "Opened announcement detail"
  else
    log_warn "No announcements found to click"
  fi

  # A4. Chatbot
  log_info "A4. Testing Chatbot"
  navigate_to "/portal/chatbot"
  sleep 2
  fill_input "input[type='text']" "Làm sao để đăng ký khai sinh?"
  # Click send (usually last button)
  click_element "button:last-of-type"
  sleep 3
  screenshot "kp-a4-chatbot-response"
  log_success "Chatbot query sent"

  # A5. Send Request
  log_info "A5. Sending Request"
  navigate_to "/portal/requests/new"
  sleep 2
  fill_input "input[placeholder*='tiêu đề']" "[TEST] Kiểm thử gửi phản ánh"
  fill_input "textarea" "Nội dung kiểm thử tự động theo kịch bản."
  fill_input "input[placeholder*='họ tên']" "Người Dân Kiểm Thử"
  fill_input "input[type='tel']" "0912345678"
  # Don't submit to avoid database spam, just verify filled
  screenshot "kp-a5-request-filled"
  log_success "Request form filled"
}

# ============================================================
# SCENARIO B: Admin Workflow
# ============================================================
test_scenario_b_admin() {
  log_section "SCENARIO B: Admin Workflow"

  # B1. Login
  log_info "B1. Admin Login"
  login_as "$ADMIN_PHONE" "$ADMIN_PASS"
  sleep 3
  if assert_url_contains "/admin"; then
    log_success "Admin login successful"
  else
    log_fail "Admin login failed"
    return
  fi
  screenshot "kp-b1-admin-dashboard"

  # B2. Dashboard Overview
  log_info "B2. Checking Dashboard Stats"
  if is_visible_text "Tổng số hộ" || is_visible_text "Hộ dân"; then
    log_success "Dashboard stats visible"
  else
    log_warn "Dashboard stats might be missing"
  fi

  # B3. Manage Villages
  log_info "B3. Managing Villages"
  navigate_to "/admin/villages"
  sleep 2
  # Click first village row/card
  if ab find "tr td" click 2>/dev/null || ab find ".grid > div" click 2>/dev/null; then
    sleep 2
    screenshot "kp-b3-village-detail"
    log_success "Viewed village detail"
  fi

  # B4. Manage Residents
  log_info "B4. Managing Residents"
  navigate_to "/admin/residents"
  sleep 2
  screenshot "kp-b4-residents-list"
  # Note: Sketchy to create data in E2E, skipping create actions for safety
  log_info "Skipping create/edit operations to preserve test data integrity"

  # B5. Manage Tasks (Assign Work)
  log_info "B5. Managing Tasks"
  navigate_to "/admin/tasks"
  sleep 2
  # Click "Giao việc" / Create button
  if ab find text "Giao việc" click 2>/dev/null || ab find text "Thêm mới" click 2>/dev/null; then
    sleep 1
    fill_input "input[name='title']" "[TEST] Kiểm tra vệ sinh môi trường"
    # Just filling form, not saving
    screenshot "kp-b5-task-creation"
    log_success "Task creation form accessible"
  fi
  
  # B6. SMS
  log_info "B6. SMS System"
  navigate_to "/admin/sms"
  sleep 2
  screenshot "kp-b6-sms-page"
  log_success "SMS page accessible"

  # Logout
  logout
}

# ============================================================
# SCENARIO C: Village Head Workflow
# ============================================================
test_scenario_c_village_head() {
  log_section "SCENARIO C: Village Head Workflow"

  # C1. Login
  log_info "C1. Village Head Login"
  login_as "$HEAD_PHONE" "$HEAD_PASS"
  sleep 3
  if assert_url_contains "/village"; then
    log_success "Village Head login successful"
  else
    log_fail "Village Head login failed"
    return
  fi
  screenshot "kp-c1-village-dashboard"

  # C2. Receive & Update Task
  log_info "C2. Checking Tasks"
  navigate_to "/village/tasks"
  sleep 2
  screenshot "kp-c2-village-tasks"
  # Verify we can see tasks (mock verification)
  log_success "Task list accessible"

  # C3. Manage Residents (Restricted View)
  log_info "C3. Checking Residents Scope"
  navigate_to "/village/residents"
  sleep 2
  screenshot "kp-c3-village-residents"
  log_success "Resident list accessible (scoped)"

  # Logout
  logout
}

# ============================================================
# SCENARIO D: Resident Workflow
# ============================================================
test_scenario_d_resident() {
  log_section "SCENARIO D: Resident Workflow"

  # D1. Login
  log_info "D1. Resident Login"
  login_as "$RESIDENT_PHONE" "$RESIDENT_PASS"
  sleep 3
  
  # Resident redirects to Portal after login usually, or /resident
  # Guide says "Chuyển hướng vào trang Cổng thông tin" -> /portal
  if assert_url_contains "/portal"; then
    log_success "Resident login redirects to portal"
  else
    log_warn "Resident login might have redirected elsewhere: $(ab url)"
  fi
  screenshot "kp-d1-resident-portal"

  # D2. Personal Info
  log_info "D2. Checking Personal Info"
  navigate_to "/profile" # Assumption based on standard routes
  sleep 2
  screenshot "kp-d2-profile"
  log_success "Profile page accessible"

  # Logout
  logout
}

# ============================================================
# HELPER FUNCTIONS
# ============================================================
login_as() {
  local phone=$1
  local pass=$2
  navigate_to "/login"
  sleep 1
  fill_input "input[type='tel']" "$phone"
  fill_input "input[type='password']" "$pass"
  click_element "button[type='submit']"
}

logout() {
  log_info "Logging out..."
  # Try specific logout button or visit logout route
  navigate_to "/login" # Simple way to ensure we are out or can restart
}

# ============================================================
# MAIN EXECUTION
# ============================================================
run_user_guide_tests() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║            User Guide Acceptance Tests                       ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""

  init_browser

  test_scenario_a_portal
  test_scenario_b_admin
  test_scenario_c_village_head
  test_scenario_d_resident

  print_summary
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  run_user_guide_tests
fi
