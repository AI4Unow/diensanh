"""
Script to ingest curated external knowledge from JSON into Firestore.
"""

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import hashlib
import os
from datetime import datetime

SERVICE_ACCOUNT_FILE = "diensanh-45eb1-firebase-adminsdk-fbsvc-85b4534ba8.json"
COLLECTION_NAME = "knowledge_base"
INPUT_FILE = "data/external_knowledge.json"

def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def generate_id(url: str) -> str:
    """Generate a deterministic ID from URL."""
    return hashlib.md5(url.encode()).hexdigest()

def ingest_external_data():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Error: Service account file '{SERVICE_ACCOUNT_FILE}' not found.")
        return
        
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file '{INPUT_FILE}' not found.")
        return

    print("Initializing Firebase...")
    db = initialize_firebase()
    
    print(f"Reading data from {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data_items = json.load(f)
        
    batch = db.batch()
    count = 0
    
    print("Ingesting items...")
    for item in data_items:
        doc_id = generate_id(item["url"])
        doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
        
        doc_data = {
            "url": item["url"],
            "title": item["title"],
            "description": item.get("description", ""),
            "content": item.get("content", ""),
            "page_name": item.get("page_name", "external"),
            "scraped_at": datetime.now(),
            "source": item.get("source", "external"),
            "type": "external_resource",
            "metadata": {
                "curated": True
            }
        }
        
        batch.set(doc_ref, doc_data, merge=True)
        count += 1
        print(f"  Prepared: {item['title']}")
        
    batch.commit()
    print(f"Success! Ingested {count} documents.")

if __name__ == "__main__":
    ingest_external_data()
