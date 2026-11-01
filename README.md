# Hao Li — Web CV

A public, static version of my curriculum vitae. Plain HTML, CSS, and a small
vanilla-JavaScript file — no framework, no bundler, no build step.

**Site URL (after enabling Pages):** <https://haoli-ku.github.io/Hao-Li-public-resume/>

> 中文修改指南（每个 block 在哪、怎么加内容、怎么改样式）：[EDITING.md](EDITING.md)

This repository contains the website only. The LaTeX source and the full
private working repository live separately; the compiled PDF is mirrored into
`assets/files/` so visitors can download it.

## Features

- Responsive academic layout with a sticky table of contents and scroll-spy navigation
- Light and dark theme (follows the system preference on first visit, remembers your choice)
- Searchable publication browser with tabs for journal articles, preprints, books,
  conference papers, and 51 talks; filters for year and first/corresponding author
- Print stylesheet that turns the page into a clean A4 CV (the Print button is in the header)
- Accessible: keyboard-navigable tabs, skip link, semantic headings, reduced-motion support
- SEO and social-sharing metadata, including a generated 1200 × 630 card

## Structure

```
Hao-Li-public-resume/
├── index.html                 # all page content
├── Makefile                   # serve · check · clean · deploy
├── tools/check_site.py        # link/anchor/asset validation
├── assets/
│   ├── css/style.css          # design system, layout, responsive + print styles
│   ├── js/app.js              # theme, navigation, scroll-spy, filters, counters
│   ├── files/
│   │   └── CV_HaoLi_EN.pdf    # downloadable CV
│   └── img/
│       ├── hao-li.jpg         # portrait
│       ├── favicon.svg
│       ├── apple-touch-icon.png
│       └── og-card.png        # social sharing card (1200 × 630)
├── .nojekyll                  # skip Jekyll on GitHub Pages
├── EDITING.md                 # 中文修改指南
└── README.md
```

## Quick start

```bash
make            # list all targets
make serve      # preview at http://localhost:8000
make check      # validate links, anchors and assets
make deploy     # commit and push; Pages republishes from main
```

`make serve` runs `python3 -m http.server` on port 8000; override it with
`make serve PORT=9000`.

## Updating the content

Everything is in `index.html`, organised in numbered `<section>` blocks. The
[中文修改指南](EDITING.md) lists every block, copy-paste templates for new
entries, and the CSS variables for layout changes.

### Updating the PDF

The downloadable PDF is `assets/files/CV_HaoLi_EN.pdf`. The LaTeX source is not
in this repository; it lives in the private `LI-Hao-Resume` repository.

If that repository is checked out next to this one (`../LI-Hao-Resume`), run:

```bash
make tex     # compiles the LaTeX source and copies the PDF here
```

Otherwise, put a compiled PDF at the repository root and run `make pdf`, or
point to it explicitly:

```bash
make pdf PDF_SRC=/path/to/CV_HaoLi_EN.pdf
```

The HTML itself is **not** generated from the LaTeX file — it is maintained
here directly.

## Publishing with GitHub Pages

This repository is public, so GitHub Pages is available on the Free plan. The
site is published directly from the `main` branch (no Actions workflow needed):

1. In the repository, open **Settings → Pages**.
2. Set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then save.
4. The site appears at <https://haoli-ku.github.io/Hao-Li-public-resume/>.

Every push to `main` republishes the site. The empty `.nojekyll` file makes
GitHub serve the files as-is instead of running Jekyll.

### Using a custom domain

1. Add a `CNAME` file containing the domain to this repository.
2. Point the domain's DNS records to GitHub Pages.
3. Update the absolute URLs in `index.html` (`<link rel="canonical">`,
   `og:url`, `og:image`, `twitter:image`, and `url` in the JSON-LD block).

## Content notes

- The cover letter and piano section are commented out in the LaTeX source and
  are intentionally not included here.
- Bibliometric figures are stated as of November 2026, as in the PDF.
- Fonts are loaded from Google Fonts (Inter and Source Serif 4) with local
  fallbacks, so the page still renders offline.

---

© 2026 Hao Li. All rights reserved.
