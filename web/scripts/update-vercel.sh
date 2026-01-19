#!/bin/bash
set -e

# Define variables
API_KEY="AIzaSyD7X1EJmzjEeWx2kuLTTH-UbOAxT5YMOII"
AUTH_DOMAIN="diensanh-45eb1.firebaseapp.com"
PROJECT_ID="diensanh-45eb1"
STORAGE_BUCKET="diensanh-45eb1.firebasestorage.app"
MESSAGING_SENDER_ID="847174741608"
APP_ID="1:847174741608:web:86df47e099a0cc231f95dd"
ENCRYPTION_KEY="diensanh-dev-encryption-key-change-in-production"

echo "Updating Vercel Environment Variables for Production..."

# Function to update a variable
update_var() {
  local name=$1
  local value=$2
  
  echo "Processing $name..."
  # Try to remove existing variable (ignore failure if not exists)
  vercel env rm "$name" production -y >/dev/null 2>&1 || true
  
  # Add new variable
  echo -n "$value" | vercel env add "$name" production
}

update_var "VITE_FIREBASE_API_KEY" "$API_KEY"
update_var "VITE_FIREBASE_AUTH_DOMAIN" "$AUTH_DOMAIN"
update_var "VITE_FIREBASE_PROJECT_ID" "$PROJECT_ID"
update_var "VITE_FIREBASE_STORAGE_BUCKET" "$STORAGE_BUCKET"
update_var "VITE_FIREBASE_MESSAGING_SENDER_ID" "$MESSAGING_SENDER_ID"
update_var "VITE_FIREBASE_APP_ID" "$APP_ID"
update_var "VITE_ENCRYPTION_KEY" "$ENCRYPTION_KEY"

echo "Environment variables updated successfully!"
echo "Triggering new production deployment..."
vercel --prod
