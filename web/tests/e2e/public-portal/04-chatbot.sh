#!/bin/bash
source "$(dirname $0)/../scripts/utils.sh"

echo "Test: Chatbot Interface"

ab open "$BASE_URL/portal/chatbot"
snapshot_wait

ab snapshot -i
screenshot "chatbot-initial"

# Type a message
ab fill @e3 "Xin chao, toi can ho tro"
ab click @e4  # Send button

sleep 3  # Wait for response
ab snapshot -i
screenshot "chatbot-response"

echo "PASS: Chatbot interaction works"