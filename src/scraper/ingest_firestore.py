"""
Script to scrape diensanh.quangtri.gov.vn and ingest data into Firebase Firestore.
"""

import hashlib
import os
import sys
from datetime import datetime
from pathlib import Path

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Add the current directory to path to import local modules
sys.path.append(os.getcwd())

# Import the existing scraper logic
# We need to manually import it because of the hyphen in filename or structure
import importlib.util
spec = importlib.util.spec_from_file_location("mainsite_scraper", "src/scraper/mainsite-scraper.py")
mainsite_scraper = importlib.util.module_from_spec(spec)
sys.modules["mainsite_scraper"] = mainsite_scraper
spec.loader.exec_module(mainsite_scraper)

scrape_main_site = mainsite_scraper.scrape_main_site


DATABASE_ID = "diensanh-45eb1" # Explicitly set based on knowledge item
COLLECTION_NAME = "knowledge_base"
SERVICE_ACCOUNT_FILE = "diensanh-45eb1-firebase-adminsdk-fbsvc-85b4534ba8.json"


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        firebase_admin.initialize_app(cred)
    return firestore.client()


def generate_id(url: str) -> str:
    """Generate a deterministic ID from URL."""
    return hashlib.md5(url.encode()).hexdigest()


def ingest_data(db, data):
    """Ingest scraped data into Firestore."""
    batch = db.batch()
    count = 0
    total_pages = 0
    
    print(f"Igesting data from {data['source']}...")
    
    for page in data["pages"]:
        if page.get("status") == "error":
            print(f"Skipping error page: {page['url']}")
            continue
            
        doc_id = generate_id(page["url"])
        doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
        
        # Prepare document data
        doc_data = {
            "url": page["url"],
            "title": page["title"],
            "description": page.get("description", ""),
            "content": page.get("content", ""),
            "page_name": page.get("page_name", ""),
            "scraped_at": datetime.fromisoformat(page["scraped_at"]),
            "source": "diensanh.quangtri.gov.vn",
            "type": "web_page",
            "metadata": {
                "original_status": page["status"]
            }
        }
        
        batch.set(doc_ref, doc_data, merge=True)
        count += 1
        total_pages += 1
        
        if count >= 400:  # Firestore batch limit is 500
            batch.commit()
            print(f"  Committed batch of {count} documents.")
            batch = db.batch()
            count = 0

    if count > 0:
        batch.commit()
        print(f"  Committed final batch of {count} documents.")
        
    print(f"Ingestion complete. Processed {total_pages} pages.")


def main():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Error: Service account file '{SERVICE_ACCOUNT_FILE}' not found.")
        return

    print("Initializing Firebase...")
    db = initialize_firebase()

    print("Starting scrape...")
    # Scrape with depth 2 to get more content
    scraped_data = scrape_main_site(output_dir="./data", crawl_depth=2)
    
    print("Starting ingestion...")
    ingest_data(db, scraped_data)
    print("Done!")


if __name__ == "__main__":
    main()
