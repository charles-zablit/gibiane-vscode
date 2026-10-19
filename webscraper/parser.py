#!/usr/bin/env python3
"""Cast3M documentation scraper for Gibiane VS Code extension.

Fetches operator and procedure notices from www-cast3m.cea.fr and outputs
data.json compatible with gbBuiltins.ts in the VS Code extension.
"""

import argparse
import concurrent.futures
import html
import http.cookiejar
import json
import logging
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Set

BASE_URL = "https://www-cast3m.cea.fr"
INDEX_URL = f"{BASE_URL}/index.php?page=notices"
CHANGELANG_URL = f"{BASE_URL}/changelang.php?lang="
NOTICE_URL_TEMPLATE = f"{BASE_URL}/index.php?page=notices&notice="


class _SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Handles redirects safely, avoiding crashes on empty Location headers."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not newurl or newurl.strip() == "":
            return None
        try:
            return super().redirect_request(req, fp, code, msg, headers, newurl)
        except urllib.error.HTTPError:
            return None


class CastemScraper:
    """Scrapes notices from the Cast3M website."""

    def __init__(
        self,
        lang: str = "fr",
        user_agent: Optional[str] = None,
        timeout: int = 30,
    ):
        self.lang = lang
        self.timeout = timeout
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
            _SafeRedirectHandler(),
        )
        self.headers = {
            "User-Agent": user_agent or "Mozilla/5.0 (compatible; GibianeCastemScraper/1.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

    def fetch_html(self, url: str) -> str:
        """Fetch raw HTML content decoded as UTF-8."""
        req = urllib.request.Request(url, headers=self.headers)
        with self.opener.open(req, timeout=self.timeout) as resp:
            content = resp.read()
            return content.decode("utf-8", errors="replace")

    def init_session(self, lang: Optional[str] = None) -> None:
        """Initialize session language on the Cast3M server via changelang.php."""
        target_lang = lang or self.lang
        url = f"{CHANGELANG_URL}{target_lang}"
        req = urllib.request.Request(url, headers=self.headers)
        try:
            with self.opener.open(req, timeout=self.timeout) as resp:
                resp.read()
            logging.debug(f"Initialized Cast3M session language: {target_lang}")
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307):
                logging.debug(f"Initialized Cast3M session language via HTTP {e.code}: {target_lang}")
            else:
                logging.warning(f"Failed to set session language to {target_lang}: {e}")
        except Exception as e:
            logging.warning(f"Failed to set session language to {target_lang}: {e}")

    @staticmethod
    def extract_notice_list(html_text: str) -> List[Dict[str, str]]:
        """Extract notice names and URL parameters from the index HTML."""
        tables = re.findall(
            r'<table[^>]*class=["\']tabaffichage["\'][^>]*>(.*?)</table>',
            html_text,
            re.DOTALL,
        )
        search_blocks = tables if tables else [html_text]

        results: List[Dict[str, str]] = []
        seen: Set[str] = set()

        for block in search_blocks:
            matches = re.findall(
                r'<a\s+[^>]*href=["\'][^"\'#]*[?&]notice=([^"\'#\s&]+)["\'][^>]*>(.*?)</a>',
                block,
                re.DOTALL,
            )
            for notice_url, raw_name in matches:
                clean_name = html.unescape(re.sub(r'<[^>]+>', '', raw_name).strip())
                if clean_name and clean_name not in seen:
                    seen.add(clean_name)
                    results.append({
                        "name": clean_name,
                        "url": notice_url,
                        "documentation": "",
                    })
        return results

    @staticmethod
    def extract_documentation(html_text: str) -> str:
        """Extract text from the notice's <pre> tag, stripping inner HTML."""
        m = re.search(r'<pre[^>]*>(.*?)</pre>', html_text, re.DOTALL)
        if not m:
            return ""
        raw_pre = m.group(1)
        clean_text = html.unescape(re.sub(r'<[^>]+>', '', raw_pre))
        return clean_text.replace("\r\n", "\n")

    def get_documentation(self, notice_url: str) -> str:
        """Fetch and extract documentation for a single notice URL key."""
        url = f"{NOTICE_URL_TEMPLATE}{notice_url}"
        html_text = self.fetch_html(url)
        return self.extract_documentation(html_text)

    def scrape_all(
        self,
        limit: Optional[int] = None,
        max_workers: int = 2,
        delay: float = 0.05,
    ) -> List[Dict[str, str]]:
        """Scrape all notices with polite concurrency."""
        self.init_session(self.lang)
        logging.info(f"Fetching notices index from {INDEX_URL}...")
        index_html = self.fetch_html(INDEX_URL)
        notices = self.extract_notice_list(index_html)
        if limit:
            notices = notices[:limit]

        total = len(notices)
        logging.info(f"Found {total} notices to scrape (workers={max_workers}, delay={delay}s).")

        doc_results: Dict[str, str] = {}

        def fetch_doc(item: Dict[str, str]) -> tuple:
            notice_url = item["url"]
            name = item["name"]
            for attempt in range(2):
                if delay > 0:
                    time.sleep(delay)
                try:
                    doc = self.get_documentation(notice_url)
                    return notice_url, doc
                except Exception as e:
                    if attempt == 0:
                        logging.debug(f"Retrying {name} ({notice_url}) after error: {e}")
                        time.sleep(0.5)
                    else:
                        logging.error(f"Error fetching {name} ({notice_url}): {e}")
            return notice_url, ""

        if max_workers <= 1:
            for i, item in enumerate(notices, 1):
                url_key, doc = fetch_doc(item)
                doc_results[url_key] = doc
                if i % 50 == 0 or i == total:
                    logging.info(f"Progress: {i}/{total} notices scraped")
        else:
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                future_to_item = {executor.submit(fetch_doc, item): item for item in notices}
                for i, future in enumerate(concurrent.futures.as_completed(future_to_item), 1):
                    url_key, doc = future.result()
                    doc_results[url_key] = doc
                    if i % 50 == 0 or i == total:
                        logging.info(f"Progress: {i}/{total} notices scraped")

        # Maintain original index order
        for item in notices:
            item["documentation"] = doc_results.get(item["url"], "")

        return notices


def save_data(data: List[Dict[str, str]], output_path: str) -> None:
    """Atomically write scraped documentation to target JSON file."""
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    temp_file = output_file.with_suffix(f"{output_file.suffix}.tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    temp_file.replace(output_file)
    logging.info(f"Saved {len(data)} notices to {output_path}")


def get_default_language() -> str:
    """Read default language from package.json if present, else fallback to 'fr'."""
    candidates = [
        Path("package.json"),
        Path(__file__).resolve().parents[1] / "package.json",
    ]
    for pkg_path in candidates:
        if pkg_path.is_file():
            try:
                with open(pkg_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    props = data.get("contributes", {}).get("configuration", {}).get("properties", {})
                    # Check both possible key names
                    lang_conf = props.get("gibiane-vscode.language") or props.get("gibiane-vscode.lange")
                    if lang_conf and "default" in lang_conf:
                        return lang_conf["default"]
            except Exception:
                pass
    return "fr"


def main() -> None:
    """CLI entrypoint."""
    parser = argparse.ArgumentParser(
        description="Scrape Cast3M documentation notices for Gibiane VS Code extension."
    )
    parser.add_argument(
        "-o",
        "--output",
        default="data.json",
        help="Output path for scraped JSON data (default: data.json)",
    )
    parser.add_argument(
        "-l",
        "--lang",
        choices=["fr", "en"],
        default=get_default_language(),
        help="Documentation language: 'fr' or 'en' (default: from package.json or 'fr')",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of notices to scrape (useful for testing)",
    )
    parser.add_argument(
        "-w",
        "--workers",
        type=int,
        default=2,
        help="Number of concurrent download workers (default: 2, polite to server)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.05,
        help="Delay in seconds between requests per worker (default: 0.05)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose debug logging",
    )

    args = parser.parse_args()

    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

    scraper = CastemScraper(lang=args.lang)
    docs = scraper.scrape_all(
        limit=args.limit,
        max_workers=args.workers,
        delay=args.delay,
    )
    save_data(docs, args.output)


if __name__ == "__main__":
    main()
