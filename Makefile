# ---------------------------------------------------------------------------
# Web CV — public site repository
#
#   make            show help
#   make serve      local preview at http://localhost:8000
#   make check      validate links, anchors and required files
#   make deploy     commit and push (GitHub Pages publishes from main)
# ---------------------------------------------------------------------------

SHELL := /bin/bash
PYTHON ?= python3
PORT ?= 8000

SITE := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
PRIVATE ?= $(SITE)/../LI-Hao-Resume
PDF_SRC ?= $(SITE)/CV_HaoLi_EN.pdf
PDF_ALT := $(PRIVATE)/CV_HaoLi_EN.pdf
PDF_DEST := assets/files/CV_HaoLi_EN.pdf
PRINT_PDF := CV_HaoLi_web_print.pdf
CHROME ?= /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
SITE_URL ?= http://localhost:$(PORT)
MSG ?= Update web CV

.DEFAULT_GOAL := help
.PHONY: help serve open build check pdf tex print clean rebuild package deploy status

help:
	@echo ""
	@echo "  Web CV — available targets"
	@echo ""
	@echo "  make serve      Local preview at $(SITE_URL)"
	@echo "  make open       Open the local site in a browser"
	@echo "  make build      Validate the site"
	@echo "  make check      Check HTML, links, anchors and assets"
	@echo "  make pdf        Copy a compiled PDF into assets/files"
	@echo "  make tex        Compile the private LaTeX source, then sync the PDF"
	@echo "  make print      Render an A4 print-to-PDF preview"
	@echo "  make clean      Remove caches and generated files"
	@echo "  make rebuild    clean + build"
	@echo "  make package    Create dist/web-cv.zip for drag-and-drop hosting"
	@echo "  make deploy     Commit and push (Pages publishes from main)"
	@echo "  make status     Show the git status"
	@echo ""

serve:
	$(PYTHON) -m http.server $(PORT) --bind 127.0.0.1

open:
	@open "$(SITE_URL)" 2>/dev/null || xdg-open "$(SITE_URL)" 2>/dev/null || echo "Open $(SITE_URL)"

check:
	@$(PYTHON) tools/check_site.py

build: check

pdf:
	@if [ -f "$(PDF_SRC)" ]; then src="$(PDF_SRC)"; \
	elif [ -f "$(PDF_ALT)" ]; then src="$(PDF_ALT)"; \
	else echo "!! No compiled PDF found. Put it at $(PDF_SRC) or run 'make tex'."; exit 1; fi; \
	cp "$$src" "$(PDF_DEST)"; \
	echo "✓ PDF synced from $$src"

tex:
	@if [ ! -d "$(PRIVATE)/CV_EN" ]; then \
		echo "!! LaTeX source not found at $(PRIVATE)/CV_EN"; \
		echo "   Set PRIVATE=/path/to/LI-Hao-Resume or copy the PDF and run 'make pdf'."; \
		exit 1; \
	fi
	@cd "$(PRIVATE)/CV_EN" && latexmk -pdf -interaction=nonstopmode -halt-on-error CV_HaoLi_EN.tex
	@cp "$(PRIVATE)/CV_HaoLi_EN.pdf" "$(PDF_SRC)"
	@cp "$(PRIVATE)/CV_HaoLi_EN.pdf" "$(PDF_DEST)"
	@echo "✓ LaTeX compiled and PDF synced"

print:
	@"$(CHROME)" --headless=new --no-sandbox --disable-gpu \
		--disable-crash-reporter --disable-breakpad --no-first-run \
		--user-data-dir="$${TMPDIR:-/tmp}/cv-print-profile" \
		--no-pdf-header-footer --virtual-time-budget=10000 \
		--print-to-pdf="$(PRINT_PDF)" "file://$(SITE)/index.html"
	@echo "✓ Print preview: $(PRINT_PDF)"

clean:
	@find . -name '.DS_Store' -delete
	@rm -rf __pycache__ tools/__pycache__ .cache dist
	@rm -f "$(PRINT_PDF)"
	@echo "✓ Cleaned caches and generated files"

rebuild: clean build

package: clean
	@mkdir -p dist
	@zip -qr dist/web-cv.zip index.html assets .nojekyll -x '*.DS_Store'
	@echo "✓ dist/web-cv.zip"

deploy: check
	@if ! git -C "$(SITE)" config user.email >/dev/null 2>&1; then \
		git -C "$(SITE)" config user.name "$$(git -C "$(SITE)" log -1 --format=%an)"; \
		git -C "$(SITE)" config user.email "$$(git -C "$(SITE)" log -1 --format=%ae)"; \
	fi
	@git -C "$(SITE)" add .
	@if git -C "$(SITE)" diff --cached --quiet; then \
		echo "Nothing to commit."; \
	else \
		git -C "$(SITE)" commit -m "$(MSG)"; \
	fi
	@git -C "$(SITE)" push
	@echo "✓ Pushed — GitHub Pages will republish from main"

status:
	@git -C "$(SITE)" status --short
