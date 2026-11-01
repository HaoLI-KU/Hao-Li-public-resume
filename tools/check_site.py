#!/usr/bin/env python3
"""Sanity checks for the static web CV.

Run from anywhere:  python3 tools/check_site.py
or via the Makefile: make check
"""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}

REQUIRED = [
    "index.html",
    "assets/css/style.css",
    "assets/js/app.js",
    "assets/files/CV_HaoLi_EN.pdf",
    "assets/img/hao-li.jpg",
    "assets/img/favicon.svg",
    "assets/img/apple-touch-icon.png",
    "assets/img/og-card.png",
    ".nojekyll",
]


class Collector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, tuple[int, int]]] = []
        self.ids: list[str] = []
        self.refs: list[str] = []
        self.spy: list[str] = []
        self.alts: list[str | None] = []
        self.errors: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        data = dict(attrs)
        if data.get("id"):
            self.ids.append(data["id"])
        for key in ("href", "src"):
            if data.get(key):
                self.refs.append(data[key])
        if data.get("data-spy"):
            self.spy.append(data["data-spy"])
        if tag == "img":
            self.alts.append(data.get("alt"))
        if tag not in VOID:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"unexpected </{tag}> at {self.getpos()}")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    for rel in REQUIRED:
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"missing file: {rel}")
        elif path.stat().st_size == 0 and rel != ".nojekyll":
            errors.append(f"empty file: {rel}")

    index = ROOT / "index.html"
    if not index.is_file():
        print("✗ index.html not found")
        return 1

    html = index.read_text(encoding="utf-8")
    parser = Collector()
    parser.feed(html)
    parser.close()

    seen: set[str] = set()
    duplicates: set[str] = set()
    for item in parser.ids:
        if item in seen:
            duplicates.add(item)
        seen.add(item)

    errors.extend(parser.errors)
    errors.extend(f"unclosed <{tag}> at {pos}" for tag, pos in parser.stack)
    errors.extend(f"duplicate id: {item}" for item in sorted(duplicates))

    # Local files referenced by href/src must exist.
    for ref in sorted(set(parser.refs)):
        if ref.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
            continue
        if not (ROOT / ref).exists():
            errors.append(f"missing local asset: {ref}")

    # Same-page anchors must resolve.
    for ref in sorted(set(parser.refs)):
        if ref.startswith("#") and len(ref) > 1 and ref[1:] not in seen:
            errors.append(f"broken anchor: {ref}")

    # Navigation data-spy targets must exist.
    section_ids = set(re.findall(r'<section[^>]*\bid="([^"]+)"', html))
    for spy in sorted(set(parser.spy)):
        if spy not in seen:
            errors.append(f"data-spy target not found: {spy}")
        elif spy not in section_ids:
            warnings.append(f"data-spy target is not a section: {spy}")

    for alt in parser.alts:
        if alt is None:
            errors.append("image without alt attribute")

    # Head essentials.
    for pattern, label in [
        (r'<meta name="viewport"', "viewport meta"),
        (r'<meta name="description"', "description meta"),
        (r'<link rel="canonical"', "canonical link"),
        (r'property="og:image"', "og:image"),
        (r'<title>.+</title>', "page title"),
    ]:
        if not re.search(pattern, html):
            warnings.append(f"missing {label}")

    if errors:
        print(f"✗ {len(errors)} problem(s) found:\n")
        for item in errors:
            print(f"  - {item}")
        return 1

    print(f"✓ {len(parser.ids)} ids, {len(set(parser.refs))} unique links, "
          f"{len(section_ids)} sections — all local links and anchors resolve")
    if warnings:
        print(f"  {len(warnings)} warning(s):")
        for item in warnings:
            print(f"  - {item}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
