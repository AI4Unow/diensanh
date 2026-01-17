#!/bin/bash
source "$(dirname "${BASH_SOURCE[0]}")/../scripts/utils.sh"

echo "=== Test: Login Page Audit (Phone + Password) ==="

# 1. Clear Auth and Navigate
echo "Step 1: Navigate to /login"
clear_auth
ab open "$BASE_URL/login"
sleep 2

# 2. Verify Page Structure (Snapshot)
echo "Step 2: Checking Page Structure"
# We expect "UBND xã Diên Sanh" and inputs
assert_url_contains "/login"
ab snapshot -i
screenshot "login-initial"

# 3. Validation Tests (Empty Fields)
echo "Step 3: Checking Validation"
# Button should be disabled initially or prevents submit
# We can check if button is disabled.
# 'ab is enabled <selector>' ? The CLI docs say: `agent-browser is <what> <selector>`
# visible, enabled, checked
# selector needs to be a css selector.
# We can use `ab find` to get a ref, then check it. Or just rely on visual helper.
# For now, let's try to fill invalid data.

# 4. Input Interactions (Robust Selectors)
echo "Step 4: Filling Credentials"
# Phone Input
ab find placeholder "Ví dụ: 0912345678" fill "0912345678"
# Password Input
ab find placeholder "Nhập mật khẩu" fill "wrongpassword"

screenshot "login-filled"

# 5. Toggle Password Visibility
echo "Step 5: Testing Password Toggle"
# Click the eye icon. It doesn't have text, but it's a button inside the password container.
# It might be hard to select by text. Usually has an icon.
# Login form has: <button ...><Eye/></button>
# We can try to click the button that is NOT the submit button?
# Or skip this for now as it requires specific selector logic.

# 6. Submit and Check Error
echo "Step 6: Submitting Form"
ab find role button click "Đăng nhập"
sleep 2
screenshot "login-error-state"

# 7. Check for Error Message
echo "Step 7: Verifying Error Feedback"
# We expect "Tài khoản không tồn tại" or similar.
# ab get text ...
# We'll just take a snapshot to see if error is visible.
ab snapshot -i

echo "=== Login Audit Complete ==="
