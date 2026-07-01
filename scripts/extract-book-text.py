#!/usr/bin/env python3
"""
Extracts and reflows text from the book PDFs in books/ into books/extracted/.

The PDFs in books/ export text with one word (or a couple of words) per
line via pypdf's default extraction — this script joins each page's text
back into normal paragraphs so the result is readable and easy to work
with (e.g. for feeding to an LLM to build a condensed knowledge base).

books/ (including books/extracted/) is gitignored — this repo is public,
and the source manuscripts / their extracted text should stay local-only.
Only condensed, non-verbatim summaries (worker/content-notes/) get committed.

Usage:
    pip install pypdf
    python3 scripts/extract-book-text.py
"""

import re
from pathlib import Path

import pypdf

REPO_ROOT = Path(__file__).resolve().parent.parent
BOOKS_DIR = REPO_ROOT / "books"
OUTPUT_DIR = BOOKS_DIR / "extracted"

PDFS = {
    "compiled.txt": "Compiled Book - 3rd Edit 7-23.docx.pdf",
    "schooldays.txt": "SchoolDays - 11-14-24.docx.pdf",
    "sunblast.txt": "Sunblast - Edit Dec 2024.docx.pdf",
}


def reflow(raw_text: str) -> str:
    """Join per-page text into normal paragraphs, keeping page markers."""
    parts = re.split(r"(===== PAGE \d+ =====)", raw_text)
    out = []
    for part in parts:
        if part.startswith("===== PAGE"):
            out.append("\n\n" + part + "\n")
        else:
            out.append(re.sub(r"\s+", " ", part).strip())
    return "\n".join(out)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for out_name, pdf_name in PDFS.items():
        pdf_path = BOOKS_DIR / pdf_name
        if not pdf_path.exists():
            print(f"Skipping {pdf_name} — not found in {BOOKS_DIR}")
            continue

        reader = pypdf.PdfReader(str(pdf_path))
        raw_pages = []
        for i, page in enumerate(reader.pages):
            raw_pages.append(f"\n\n===== PAGE {i + 1} =====\n\n{page.extract_text() or ''}")
        raw_text = "".join(raw_pages)

        out_path = OUTPUT_DIR / out_name
        out_path.write_text(reflow(raw_text))
        print(f"{pdf_name} ({len(reader.pages)} pages) -> {out_path}")


if __name__ == "__main__":
    main()
