"""Build and validate the static catalogue. Python 3.11+, no dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
from urllib.parse import urlsplit, unquote, urlencode
import json
import os
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.rows = set(), [], 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            if a["id"] in self.ids:
                raise ValueError(f"Duplicate ID: {a['id']}")
            self.ids.add(a["id"])
        if tag == "tr" and "entry" in a.get("class", "").split():
            self.rows += 1
        for key in ("href", "src"):
            if a.get(key):
                self.links.append(a[key])


def build():
    config = json.loads((ROOT / "site.json").read_text(encoding="utf-8"))
    repo = config.get("repository") or os.environ.get("GITHUB_REPOSITORY", "")
    if repo and not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
        raise ValueError("repository must be owner/repository")
    # Delete only this script's fixed generated output directory.
    if DIST.is_symlink() or DIST.resolve().parent != ROOT.resolve():
        raise ValueError("Unsafe build output path")
    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(ROOT / "static", DIST)
    entries = {p.stem: p.read_text(encoding="utf-8") for p in (ROOT / "content/entries").glob("*.html")}
    used = set()

    def insert(match):
        key = match.group(1)
        if key in used:
            raise ValueError(f"Entry included twice: {key}")
        used.add(key)
        text = entries[key]
        page = Page(text)
        if page.rows != 1 or key not in page.ids:
            raise ValueError(f"Invalid entry file: {key}")
        if repo:
            query = urlencode({"template": "correction.yml", "title": f"Correction: {key}", "entry": key})
            link = escape(f"https://github.com/{repo}/issues/new?{query}", quote=True)
            text = text.replace("</td>", f'<div class="entry-contribute"><a href="{link}" target="_blank" rel="noopener noreferrer">Suggest a correction</a></div></td>', 1)
        return text

    for name in ("index",):
        text = (ROOT / f"templates/{name}.html").read_text(encoding="utf-8")
        text = re.sub(r"<!--ENTRY:(entry-\d+)-->", insert, text)
        (DIST / f"{name}.html").write_text(text, encoding="utf-8")
    if used != entries.keys():
        raise ValueError(f"Unlisted entry files: {entries.keys() - used}")
    actions = '<p>The repository links will appear once this catalogue is deployed from GitHub.</p>'
    if repo:
        base = f"https://github.com/{repo}"
        actions = f'<p><a href="{base}/issues/new?template=correction.yml">Suggest a correction</a> · <a href="{base}/issues/new?template=new-part.yml">Propose a part</a> · <a href="{base}/blob/HEAD/CONTRIBUTING.md">Contribution guide</a> · <a href="{base}">GitHub repository</a></p>'
    contribute = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contribute — PSA catalogue</title><link rel="stylesheet" href="assets/catalogue.css"></head><body><main><header><h1>Contribute to the catalogue</h1></header><p>Help improve references, connector applications, wire sizes and photographs.</p>{actions}<h2>What to include</h2><ul><li>The part number or catalogue entry ID.</li><li>The proposed change and a manufacturer drawing, datasheet or clear photograph.</li><li>Contact gender, wire size, colour and keying where relevant.</li><li>The source and permission to share any new photograph.</li></ul><p>Suggestions are reviewed through GitHub issues and pull requests before publication. A GitHub account is needed to submit a contribution.</p><p><a href="index.html">Back to catalogue</a></p></main></body></html>'''
    (DIST / "contribute.html").write_text(contribute, encoding="utf-8")
    with (DIST / "assets/catalogue.css").open("a", encoding="utf-8") as f:
        f.write('\n.entry-contribute{margin-top:8px;font-size:11px}.collaboration-links{font-size:13px}@media print{.entry-contribute,.collaboration-links{display:none}}\n')
    pages = {p.name: Page(p.read_text(encoding="utf-8")) for p in DIST.glob("*.html")}
    for filename, page in pages.items():
        for link in page.links:
            u = urlsplit(link)
            if u.scheme or u.netloc:
                if u.scheme in ("file", "javascript"):
                    raise ValueError(f"Unsafe link in {filename}: {link}")
                continue
            target = (DIST / unquote(u.path or filename)).resolve()
            if not target.is_relative_to(DIST.resolve()) or not target.is_file():
                raise ValueError(f"Missing local resource in {filename}: {link}")
            if u.fragment and target.name in pages and unquote(u.fragment) not in pages[target.name].ids:
                raise ValueError(f"Missing anchor in {filename}: {link}")
    print(f"Built {pages['index.html'].rows} entries. Local assets, links, IDs and anchors validated.")
    print(f"Output: {DIST}")


if __name__ == "__main__":
    build()
