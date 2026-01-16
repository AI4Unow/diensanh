"""
Scraper for diensanh.quangtri.gov.vn main site (Liferay CMS).
Uses requests/BeautifulSoup for static content extraction.
"""

import json
import re
import ssl
import urllib3
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, unquote

import httpx
from bs4 import BeautifulSoup

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://diensanh.quangtri.gov.vn"

# Key pages to scrape
PAGES_TO_SCRAPE = [
    {"path": "/", "name": "home", "title": "Trang chủ"},
    {"path": "/gi%E1%BB%9Bi-thi%E1%BB%86u", "name": "introduction", "title": "Giới thiệu"},
    {"path": "/t%E1%BB%95-ch%E1%BB%A9c-h%C3%A0nh-ch%C3%ADnh", "name": "organization", "title": "Tổ chức hành chính"},
    {"path": "/h%E1%BB%86-th%E1%BB%90ng-v%C4%82n-b%E1%BA%A2n", "name": "documents", "title": "Hệ thống văn bản"},
    {"path": "/th%C3%B4ng-tin-tuy%C3%AAn-truy%E1%BB%81n", "name": "news", "title": "Thông tin tuyên truyền"},
    {"path": "/li%C3%8An-h%E1%BB%86", "name": "contact", "title": "Liên hệ"},
    {"path": "/dai-hoi-dang", "name": "party_congress", "title": "Đại hội Đảng"},
]


def create_client() -> httpx.Client:
    """Create HTTP client with SSL verification disabled."""
    return httpx.Client(
        verify=False,
        timeout=30.0,
        follow_redirects=True,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        }
    )


def clean_text(text: str) -> str:
    """Clean extracted text by removing excessive whitespace."""
    if not text:
        return ""
    # Replace multiple whitespace with single space
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    return text.strip()


def extract_main_content(soup: BeautifulSoup) -> str:
    """Extract main content from Liferay page, excluding navigation/footer."""
    content_parts = []

    # Remove unwanted elements
    for selector in ["nav", "header", "footer", ".navigation", ".menu", "script", "style", ".sidebar"]:
        for el in soup.select(selector):
            el.decompose()

    # Target content areas common in Liferay
    content_selectors = [
        ".journal-content-article",
        ".portlet-body",
        ".asset-content",
        "article",
        ".content",
        "main",
        "#main-content",
    ]

    for selector in content_selectors:
        elements = soup.select(selector)
        for el in elements:
            text = clean_text(el.get_text())
            if len(text) > 50:  # Skip tiny fragments
                content_parts.append(text)

    # If no specific content found, get body text
    if not content_parts:
        body = soup.find("body")
        if body:
            content_parts.append(clean_text(body.get_text()))

    # Deduplicate while preserving order
    seen = set()
    unique_parts = []
    for part in content_parts:
        if part not in seen and len(part) > 50:
            seen.add(part)
            unique_parts.append(part)

    return "\n\n".join(unique_parts)


def extract_links(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """Extract all internal links from the page."""
    links = []
    seen_urls = set()

    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        text = clean_text(a.get_text())

        if not href or not text:
            continue

        # Skip anchors, javascript, external links
        if href.startswith("#") or href.startswith("javascript:"):
            continue

        # Convert to absolute URL
        full_url = urljoin(base_url, href)

        # Only keep internal links
        if not full_url.startswith(BASE_URL):
            continue

        if full_url in seen_urls:
            continue

        seen_urls.add(full_url)
        links.append({"url": full_url, "text": text})

    return links


def scrape_page(client: httpx.Client, url: str) -> dict:
    """Scrape a single page and extract content."""
    try:
        response = client.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # Get title
        title_el = soup.find("title")
        title = clean_text(title_el.get_text()) if title_el else ""

        # Get meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content", "") if meta_desc else ""

        # Get main content
        content = extract_main_content(soup)

        # Get links for further crawling
        links = extract_links(soup, url)

        return {
            "url": url,
            "title": title,
            "description": description,
            "content": content,
            "links": links,
            "scraped_at": datetime.now().isoformat(),
            "status": "success"
        }

    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "scraped_at": datetime.now().isoformat(),
            "status": "error"
        }


def scrape_main_site(output_dir: str = "./data", crawl_depth: int = 1) -> dict:
    """
    Scrape all key pages from the main site.

    Args:
        output_dir: Directory to save scraped data
        crawl_depth: How many levels deep to follow links (0 = only key pages)
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    result = {
        "source": BASE_URL,
        "scraped_at": datetime.now().isoformat(),
        "pages": [],
        "errors": []
    }

    client = create_client()
    scraped_urls = set()

    print(f"Scraping main site: {BASE_URL}")

    # Scrape key pages
    for page_info in PAGES_TO_SCRAPE:
        url = urljoin(BASE_URL, page_info["path"])
        print(f"  Scraping: {page_info['title']} ({unquote(page_info['path'])})")

        page_data = scrape_page(client, url)
        page_data["page_name"] = page_info["name"]
        page_data["expected_title"] = page_info["title"]
        result["pages"].append(page_data)
        scraped_urls.add(url)

        if page_data["status"] == "error":
            result["errors"].append(f"{page_info['title']}: {page_data.get('error')}")

    # Optional: Crawl linked pages (depth 1)
    if crawl_depth > 0:
        additional_urls = set()
        for page in result["pages"]:
            for link in page.get("links", []):
                link_url = link["url"]
                if link_url not in scraped_urls:
                    additional_urls.add(link_url)

        print(f"\n  Found {len(additional_urls)} additional pages to crawl...")
        for i, url in enumerate(list(additional_urls)[:20]):  # Limit to 20
            print(f"    [{i+1}/20] {unquote(url)[:60]}...")
            page_data = scrape_page(client, url)
            page_data["page_name"] = "crawled"
            result["pages"].append(page_data)
            scraped_urls.add(url)

    client.close()

    # Save results
    output_file = output_path / "diensanh_pages.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(result['pages'])} pages to {output_file}")
    print(f"Errors: {len(result['errors'])}")

    return result


if __name__ == "__main__":
    scrape_main_site()
