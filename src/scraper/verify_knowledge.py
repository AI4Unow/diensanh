"""
Script to verify data in Firestore knowledge_base.
"""

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os

SERVICE_ACCOUNT_FILE = "diensanh-45eb1-firebase-adminsdk-fbsvc-85b4534ba8.json"
COLLECTION_NAME = "knowledge_base"

def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def verify_data():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Error: Service account file '{SERVICE_ACCOUNT_FILE}' not found.")
        return

    print("Initializing Firebase...")
    db = initialize_firebase()
    
    docs = db.collection(COLLECTION_NAME).limit(5).stream()
    
    print("\n--- Verifying Knowledge Base Data ---")
    count = 0
    for doc in docs:
        count += 1
        data = doc.to_dict()
        print(f"\nDocument ID: {doc.id}")
        print(f"Title: {data.get('title')}")
        print(f"URL: {data.get('url')}")
        content_preview = data.get('content', '')[:100].replace('\n', ' ')
        print(f"Content Preview: {content_preview}...")
        
    if count == 0:
        print("\nNo documents found in 'knowledge_base'.")
    else:
        print(f"\nSuccessfully verified. Found {count} sample documents (limit 5).")

if __name__ == "__main__":
    verify_data()
