#!/usr/bin/env python3
"""Unit tests for Cast3M documentation scraper (parser.py)."""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from unittest.mock import MagicMock, patch
from parser import CastemScraper, get_default_language, save_data


class TestCastemScraper(unittest.TestCase):
    def setUp(self):
        self.scraper = CastemScraper(lang="fr")

    def test_extract_notice_list_normal_and_special(self):
        sample_html = """
        <html>
        <body>
        <table class="tabaffichage">
            <tr>
                <td><a name="@"> @</a></td>
                <td><a href="index.php?page=notices&notice=%40A1DDL"> @A1DDL </a></td>
                <td><a href="index.php?page=notices&notice=ABS"> ABS </a></td>
                <td><a href="index.php?page=notices&notice=AAA6"> &lt; </a></td>
                <td><a href="#debut"> Top of page</a></td>
            </tr>
        </table>
        </body>
        </html>
        """
        notices = self.scraper.extract_notice_list(sample_html)
        self.assertEqual(len(notices), 3)

        # Verify items
        self.assertEqual(notices[0], {"name": "@A1DDL", "url": "%40A1DDL", "documentation": ""})
        self.assertEqual(notices[1], {"name": "ABS", "url": "ABS", "documentation": ""})
        self.assertEqual(notices[2], {"name": "<", "url": "AAA6", "documentation": ""})

    def test_extract_notice_list_deduplication(self):
        sample_html = """
        <table class="tabaffichage">
            <tr>
                <td><a href="index.php?page=notices&notice=ABS"> ABS </a></td>
                <td><a href="index.php?page=notices&notice=ABS"> ABS </a></td>
            </tr>
        </table>
        """
        notices = self.scraper.extract_notice_list(sample_html)
        self.assertEqual(len(notices), 1)
        self.assertEqual(notices[0]["name"], "ABS")

    def test_extract_documentation_clean_and_unescape(self):
        sample_html = """
        <html>
        <body>
        <pre>$$$$ <a href="index.php?page=notices&notice=ABS">ABS</a>  NOTICE  PASCAL
Operateur ABS &amp; &lt;autre&gt;
Objet :
L'opérateur ABSOLU calcule la valeur &quot;absolue&quot; d'OBJET1.</pre>
        </body>
        </html>
        """
        doc = self.scraper.extract_documentation(sample_html)
        self.assertIn("$$$$ ABS  NOTICE  PASCAL", doc)
        self.assertIn("Operateur ABS & <autre>", doc)
        self.assertIn('L\'opérateur ABSOLU calcule la valeur "absolue" d\'OBJET1.', doc)
        self.assertNotIn("<a href=", doc)

    def test_extract_documentation_crlf_normalization(self):
        sample_html = "<pre>Line 1\r\nLine 2\r\nLine 3</pre>"
        doc = self.scraper.extract_documentation(sample_html)
        self.assertEqual(doc, "Line 1\nLine 2\nLine 3")
        self.assertNotIn("\r\n", doc)

    def test_extract_documentation_empty(self):
        sample_html = "<html><body>No pre block here</body></html>"
        doc = self.scraper.extract_documentation(sample_html)
        self.assertEqual(doc, "")

    def test_save_data_atomic(self):
        data = [
            {"name": "ABS", "url": "ABS", "documentation": "Test documentation with accents: élève"},
            {"name": "<", "url": "AAA6", "documentation": "Operator <"}
        ]
        with tempfile.TemporaryDirectory() as tmpdir:
            out_file = Path(tmpdir) / "output.json"
            save_data(data, str(out_file))

            self.assertTrue(out_file.is_file())
            # Ensure temporary file was cleaned up
            self.assertFalse(out_file.with_suffix(".json.tmp").exists())

            with open(out_file, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            self.assertEqual(loaded, data)
            self.assertIn("élève", loaded[0]["documentation"])

    def test_get_default_language_fallback(self):
        with patch("pathlib.Path.is_file", return_value=False):
            lang = get_default_language()
            self.assertEqual(lang, "fr")

    def test_get_default_language_from_package_json(self):
        mock_package = {
            "contributes": {
                "configuration": {
                    "properties": {
                        "gibiane-vscode.language": {
                            "default": "en"
                        }
                    }
                }
            }
        }
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
            json.dump(mock_package, f)
            tmp_path = f.name

        try:
            with patch("parser.Path.is_file", side_effect=lambda: True):
                with patch("builtins.open", unittest.mock.mock_open(read_data=json.dumps(mock_package))):
                    lang = get_default_language()
                    self.assertEqual(lang, "en")
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    @patch("urllib.request.OpenerDirector.open")
    def test_init_session_and_fetch_mocked(self, mock_open):
        mock_resp = MagicMock()
        mock_resp.read.return_value = b"<html>OK</html>"
        mock_open.return_value.__enter__.return_value = mock_resp

        scraper = CastemScraper(lang="en")
        scraper.init_session("en")

        self.assertTrue(mock_open.called)
        first_call_req = mock_open.call_args_list[0][0][0]
        self.assertIn("changelang.php?lang=en", first_call_req.full_url)

    @patch.object(CastemScraper, "init_session")
    @patch.object(CastemScraper, "fetch_html")
    def test_scrape_all_retry_and_keying(self, mock_fetch, mock_init):
        index_html = """
        <table class="tabaffichage">
            <tr>
                <td><a href="index.php?page=notices&notice=N1"> Notice 1 </a></td>
                <td><a href="index.php?page=notices&notice=N2"> Notice 2 </a></td>
            </tr>
        </table>
        """
        mock_fetch.side_effect = [
            index_html,
            # First attempt for N1 raises exception, second attempt succeeds:
            Exception("Transient timeout"),
            "<pre>Doc for Notice 1</pre>",
            # Attempt for N2 succeeds:
            "<pre>Doc for Notice 2</pre>",
        ]

        scraper = CastemScraper(lang="fr")
        docs = scraper.scrape_all(delay=0, max_workers=1)

        self.assertEqual(len(docs), 2)
        self.assertEqual(docs[0]["name"], "Notice 1")
        self.assertEqual(docs[0]["url"], "N1")
        self.assertEqual(docs[0]["documentation"], "Doc for Notice 1")
        self.assertEqual(docs[1]["name"], "Notice 2")
        self.assertEqual(docs[1]["url"], "N2")
        self.assertEqual(docs[1]["documentation"], "Doc for Notice 2")


if __name__ == "__main__":
    unittest.main()
