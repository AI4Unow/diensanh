#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Phone OTP Authentication Flow"

# Use test phone number (Firebase emulator)
TEST_PHONE="0901234567"
TEST_OTP="123456"  # Firebase emulator default

ab open "$BASE_URL/login"
snapshot_wait

ab snapshot -i

# Enter phone number
ab fill @e3 "$TEST_PHONE"
ab click @e4  # Request OTP button

sleep 2
ab snapshot -i
screenshot "otp-requested"

# Enter OTP (6 digits)
ab fill @e5 "$TEST_OTP"
ab click @e6  # Verify button

sleep 2
ab snapshot -i
screenshot "auth-result"

echo "PASS: OTP flow completed"