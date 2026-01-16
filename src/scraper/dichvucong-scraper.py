"""
Playwright-based scraper for thutuc.dichvucong.gov.vn (National Public Services Portal).
Extracts all commune-level public service procedures (thủ tục hành chính cấp xã).
Updated: Since 2025, provincial portals redirect to national portal.
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from playwright.async_api import async_playwright, Page, Browser


# National portal URLs
PORTAL_URL = "https://thutuc.dichvucong.gov.vn"
PROCEDURES_URL = f"{PORTAL_URL}/p/home/dvc-tthc-thu-tuc-hanh-chinh.html"

# Common commune-level procedure search terms
COMMUNE_SEARCH_TERMS = [
    "đăng ký khai sinh",
    "đăng ký kết hôn",
    "đăng ký khai tử",
    "hộ tịch",
    "chứng thực",
    "xác nhận",
    "tạm trú",
    "tạm vắng",
    "hộ khẩu",
    "cư trú",
    "giấy xác nhận tình trạng hôn nhân",
    "bảo trợ xã hội",
    "người có công",
    "chính sách xã hội",
    "đất đai",
    "xây dựng",
    "kinh doanh",
]


async def select_commune_level(page: Page) -> bool:
    """Select commune level filter using Select2 dropdown."""
    try:
        # Wait for page to load
        await asyncio.sleep(2)

        # Click on the Select2 container for level to open dropdown
        level_container = await page.query_selector("#select2-select-level-container")
        if not level_container:
            # Try parent container
            level_container = await page.query_selector("span[aria-labelledby='select2-select-level-container']")

        if level_container:
            await level_container.click()
            await asyncio.sleep(0.5)

            # Wait for dropdown to open and find "Cấp Xã" option
            # Select2 creates dropdown in body with class select2-results
            xa_option = await page.wait_for_selector("li.select2-results__option:has-text('Cấp Xã')", timeout=5000)
            if xa_option:
                await xa_option.click()
                print("Selected: Cấp Xã (Commune level)")
                await asyncio.sleep(2)
                await page.wait_for_load_state("networkidle", timeout=15000)
                return True

        # Fallback: Use JavaScript to set value directly
        print("Using JavaScript fallback for Select2...")
        await page.evaluate("""
            $('#select-level').val('3').trigger('change');
        """)
        await asyncio.sleep(2)
        await page.wait_for_load_state("networkidle", timeout=15000)
        print("Selected: Cấp Xã (Commune level) via JS")
        return True

    except Exception as e:
        print(f"Error selecting commune level: {e}")
        # Try JavaScript fallback
        try:
            await page.evaluate("$('#select-level').val('3').trigger('change');")
            await asyncio.sleep(2)
            print("Selected via JS fallback")
            return True
        except:
            return False


async def extract_procedures_from_table(page: Page) -> list[dict]:
    """Extract procedures from the table on current page."""
    procedures = []

    # Find table rows
    rows = await page.query_selector_all("table tbody tr")
    print(f"  Found {len(rows)} rows on this page")

    for row in rows:
        try:
            cells = await row.query_selector_all("td")
            if len(cells) >= 5:
                # Extract data from cells
                code = await cells[0].inner_text()

                # Get title and link
                title_link = await cells[1].query_selector("a")
                title = await title_link.inner_text() if title_link else await cells[1].inner_text()
                href = await title_link.get_attribute("href") if title_link else ""

                authority = await cells[2].inner_text()
                implementing = await cells[3].inner_text()
                field = await cells[4].inner_text()

                if title.strip():
                    procedures.append({
                        "code": code.strip(),
                        "title": title.strip(),
                        "url": href.strip() if href else "",
                        "authority": authority.strip(),
                        "implementing": implementing.strip(),
                        "field": field.strip(),
                        "scraped_at": datetime.now().isoformat()
                    })
        except Exception as e:
            print(f"  Error extracting row: {e}")
            continue

    return procedures


async def get_total_pages(page: Page) -> int:
    """Get total number of pages from pagination."""
    try:
        # Look for pagination info
        pagination = await page.query_selector(".pagination, .paging, nav[aria-label*='Page']")
        if pagination:
            # Find last page number
            page_links = await pagination.query_selector_all("a, button, li")
            max_page = 1
            for link in page_links:
                text = await link.inner_text()
                if text.isdigit():
                    max_page = max(max_page, int(text))
            return max_page

        # Alternative: look for page count text
        body_text = await page.inner_text("body")
        match = re.search(r'Trang \d+ / (\d+)', body_text)
        if match:
            return int(match.group(1))

        return 1
    except:
        return 1


async def navigate_to_page(page: Page, page_num: int) -> bool:
    """Navigate to a specific page number."""
    try:
        # Try clicking page number link
        page_link = await page.query_selector(f"a:has-text('{page_num}'), button:has-text('{page_num}')")
        if page_link:
            await page_link.click()
            await asyncio.sleep(1)
            await page.wait_for_load_state("networkidle", timeout=15000)
            return True

        # Try using pagination input if available
        page_input = await page.query_selector("input[type='number'][class*='page']")
        if page_input:
            await page_input.fill(str(page_num))
            await page.keyboard.press("Enter")
            await asyncio.sleep(1)
            await page.wait_for_load_state("networkidle", timeout=15000)
            return True

        return False
    except Exception as e:
        print(f"Error navigating to page {page_num}: {e}")
        return False


async def extract_procedure_detail(page: Page, url: str) -> dict:
    """Extract detailed information from a single procedure page."""
    if not url:
        return {}

    try:
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await asyncio.sleep(2)

        detail = {"url": url}

        # Get body text - most reliable for this page
        body_text = await page.inner_text('body')

        if body_text and len(body_text) > 100:
            # Parse sections from the text using regex
            sections = {
                "processing_time": r"(?:Thời hạn giải quyết|Thời gian)[:\s]*([^\n]+)",
                "fee": r"(?:Phí, lệ phí|Phí|Lệ phí)[:\s]*([^\n]+(?:\n[^\n]*Đồng)?)",
                "method": r"(?:Cách thức thực hiện|Hình thức nộp)[:\s]*([\s\S]+?)(?:Thành phần|Yêu cầu|Trình tự|$)",
                "legal_basis": r"(?:Căn cứ pháp lý)[:\s]*([\s\S]+?)(?:Yêu cầu|$)",
            }

            for field, pattern in sections.items():
                match = re.search(pattern, body_text, re.IGNORECASE)
                if match:
                    detail[field] = match.group(1).strip()[:1500]

            # Store cleaned full content
            # Remove navigation/header parts
            content_start = body_text.find("Chi tiết thủ tục")
            if content_start > 0:
                body_text = body_text[content_start:]

            # Remove footer parts
            content_end = body_text.find("Cơ quan chủ quản")
            if content_end > 0:
                body_text = body_text[:content_end]

            detail["full_content"] = body_text.strip()[:5000]

        return detail

    except Exception as e:
        print(f"    Error extracting detail: {e}")
        return {"url": url, "error": str(e)}


async def search_procedures(page: Page, search_term: str) -> list[dict]:
    """Search for procedures by term and extract results."""
    procedures = []

    try:
        # Find and fill search input
        search_input = await page.query_selector('input[type="text"], input[name*="search"], input[placeholder*="Tìm"]')
        if not search_input:
            print(f"  Search input not found")
            return []

        await search_input.fill(search_term)
        await asyncio.sleep(0.5)

        # Click search button
        search_btn = await page.query_selector('button:has-text("Tìm kiếm")')
        if search_btn:
            await search_btn.click()
            await asyncio.sleep(3)
            await page.wait_for_load_state('networkidle', timeout=30000)

        # Extract results from table
        rows = await page.query_selector_all('table tbody tr')

        for row in rows:
            try:
                cells = await row.query_selector_all('td')
                if len(cells) >= 5:
                    # The link is in the first cell (code column)
                    code_link = await cells[0].query_selector('a')
                    if not code_link:
                        continue

                    code = await code_link.inner_text()
                    href = await code_link.get_attribute('href')

                    # Title is plain text in second cell
                    title = await cells[1].inner_text()
                    authority = await cells[2].inner_text()
                    implementing = await cells[3].inner_text()
                    field = await cells[4].inner_text()

                    # Filter for commune-level (xã/phường) procedures
                    impl_lower = implementing.lower()
                    if 'xã' in impl_lower or 'phường' in impl_lower or 'thị trấn' in impl_lower or 'cấp xã' in impl_lower:
                        # Build full URL
                        full_url = href if href.startswith('http') else f"{PORTAL_URL}/p/home/{href}"

                        procedures.append({
                            'code': code.strip(),
                            'title': title.strip(),
                            'url': full_url,
                            'authority': authority.strip(),
                            'implementing': implementing.strip(),
                            'field': field.strip(),
                            'search_term': search_term,
                            'scraped_at': datetime.now().isoformat()
                        })
            except Exception as e:
                continue

        # Clear search for next query
        await search_input.fill('')

    except Exception as e:
        print(f"  Error searching for '{search_term}': {e}")

    return procedures


async def scrape_all_procedures(
    output_dir: str = "./data",
    max_details: int = 50,
    headless: bool = True
) -> dict:
    """
    Main scraping function.
    Searches for commune-level procedures and extracts details.
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    result = {
        "source": PORTAL_URL,
        "level": "Cấp Xã (Commune level)",
        "scraped_at": datetime.now().isoformat(),
        "procedures": [],
        "errors": []
    }

    # Track unique procedures by code
    seen_codes = set()

    async with async_playwright() as p:
        browser: Browser = await p.chromium.launch(
            headless=headless,
            args=["--ignore-certificate-errors"]
        )
        context = await browser.new_context(
            ignore_https_errors=True,
            locale="vi-VN"
        )
        page = await context.new_page()

        print(f"Loading {PROCEDURES_URL}...")

        try:
            await page.goto(PROCEDURES_URL, wait_until="networkidle", timeout=60000)
            await asyncio.sleep(3)

            # Search for each term
            for term in COMMUNE_SEARCH_TERMS:
                print(f"Searching: {term}...")
                procedures = await search_procedures(page, term)

                # Add unique procedures
                added = 0
                for proc in procedures:
                    if proc['code'] not in seen_codes:
                        seen_codes.add(proc['code'])
                        result['procedures'].append(proc)
                        added += 1

                print(f"  Found {len(procedures)}, added {added} new (total: {len(result['procedures'])})")
                await asyncio.sleep(1)

            print(f"\nTotal unique procedures: {len(result['procedures'])}")

            # Get details for procedures
            if result["procedures"] and max_details > 0:
                details_to_get = min(len(result["procedures"]), max_details)
                print(f"\nExtracting details for {details_to_get} procedures...")

                for i, proc in enumerate(result["procedures"][:details_to_get]):
                    if proc.get("url"):
                        print(f"  [{i+1}/{details_to_get}] {proc['title'][:40]}...")
                        detail = await extract_procedure_detail(page, proc["url"])
                        proc["detail"] = detail
                        await asyncio.sleep(0.5)

        except Exception as e:
            print(f"Scraping error: {e}")
            result["errors"].append(str(e))

        await browser.close()

    # Save results
    output_file = output_path / "dichvucong_procedures.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nSaved {len(result['procedures'])} procedures to {output_file}")
    return result


async def debug_page_structure(headless: bool = False) -> None:
    """Debug helper to understand the page structure."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=headless,
            args=["--ignore-certificate-errors"]
        )
        context = await browser.new_context(ignore_https_errors=True, locale="vi-VN")
        page = await context.new_page()

        print(f"Opening {PROCEDURES_URL}...")
        await page.goto(PROCEDURES_URL, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(2)

        # Select commune level
        await select_commune_level(page)
        await asyncio.sleep(2)

        # Get page content
        body_text = await page.inner_text("body")
        print("\n--- Page visible text (first 3000 chars) ---")
        print(body_text[:3000])

        # Check table structure
        rows = await page.query_selector_all("table tbody tr")
        print(f"\nFound {len(rows)} table rows")

        if rows:
            print("\nFirst row structure:")
            cells = await rows[0].query_selector_all("td")
            for i, cell in enumerate(cells):
                text = await cell.inner_text()
                print(f"  Cell {i}: {text[:60]}...")

        # Save HTML for inspection
        html = await page.content()
        with open("./data/debug_national_portal.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("\nSaved debug HTML to ./data/debug_national_portal.html")

        if not headless:
            print("\nBrowser is open. Press Enter to close...")
            input()

        await browser.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "debug":
        # Run in debug mode
        asyncio.run(debug_page_structure(headless=True))
    else:
        # Run full scrape
        asyncio.run(scrape_all_procedures(headless=True))
