#!/bin/bash
# E2E Authentication Helpers
# Provides functions to authenticate users for testing protected routes

# Test user configurations
TEST_ADMIN_UID="test-admin-001"
TEST_ADMIN_PHONE="+84912345678"
TEST_ADMIN_ROLE="commune_admin"

TEST_VILLAGE_UID="test-village-001"
TEST_VILLAGE_PHONE="+84912345679"
TEST_VILLAGE_ROLE="village_leader"
TEST_VILLAGE_ID="village-001"

# Helper: Set test authentication in browser storage
set_test_auth() {
    local uid="$1"
    local role="$2"
    local phone="$3"
    local village_id="${4:-}"

    # Create Firebase Auth user object
    local auth_user="{
        \"uid\": \"$uid\",
        \"phoneNumber\": \"$phone\",
        \"providerData\": [{
            \"uid\": \"$phone\",
            \"phoneNumber\": \"$phone\",
            \"providerId\": \"phone\"
        }],
        \"stsTokenManager\": {
            \"accessToken\": \"test-token-$uid\",
            \"refreshToken\": \"test-refresh-$uid\",
            \"expirationTime\": $(( $(date +%s) * 1000 + 3600000 ))
        }
    }"

    # Create Firestore user document
    local user_doc="{
        \"uid\": \"$uid\",
        \"phone\": \"$phone\",
        \"displayName\": \"Test User $role\",
        \"role\": \"$role\",
        \"villageId\": \"$village_id\",
        \"createdAt\": $(date +%s)000,
        \"updatedAt\": $(date +%s)000
    }"

    # Set Firebase Auth user in localStorage
    ab eval "localStorage.setItem('firebase:authUser:[DEFAULT]', JSON.stringify($auth_user));"

    # Set user document in localStorage for quick access
    ab eval "localStorage.setItem('diensanh:userDoc', JSON.stringify($user_doc));"

    # Set test mode flag
    ab eval "localStorage.setItem('diensanh:testMode', 'true');"

    echo "✓ Set test authentication for $role ($uid)"
}

# Helper: Login as admin
login_as_admin() {
    echo "Authenticating as admin..."
    set_test_auth "$TEST_ADMIN_UID" "$TEST_ADMIN_ROLE" "$TEST_ADMIN_PHONE"
}

# Helper: Login as village leader
login_as_village() {
    echo "Authenticating as village leader..."
    set_test_auth "$TEST_VILLAGE_UID" "$TEST_VILLAGE_ROLE" "$TEST_VILLAGE_PHONE" "$TEST_VILLAGE_ID"
}

# Helper: Clear authentication
clear_auth() {
    ab eval "localStorage.removeItem('firebase:authUser:[DEFAULT]');"
    ab eval "localStorage.removeItem('diensanh:userDoc');"
    ab eval "localStorage.removeItem('diensanh:testMode');"
    echo "✓ Cleared authentication"
}

# Helper: Verify not on login page
verify_not_login_page() {
    local current_url=$(ab eval "window.location.pathname")
    if [[ "$current_url" == "/login" ]]; then
        echo "FAIL: Still on login page - authentication failed"
        ab screenshot "$SCREENSHOTS_DIR/auth-failure-$(date +%Y%m%d-%H%M%S).png"
        return 1
    fi
    echo "✓ Successfully authenticated - not on login page"
    return 0
}

# Helper: Wait for auth state to load
wait_for_auth() {
    echo "Waiting for authentication state to load..."
    sleep 2

    # Check if we're still loading
    local loading_state=$(ab eval "document.querySelector('[data-testid=\"loading\"]') !== null" 2>/dev/null || echo "false")
    if [[ "$loading_state" == "true" ]]; then
        echo "Waiting for loading to complete..."
        sleep 3
    fi
}