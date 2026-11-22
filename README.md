# IAI website redesign — Direction A (static prototype)

`site/` is a static multi-page prototype (231 pages) built from the live actuariesindia.org content.

Pipeline (run from repo root):
1. Crawl: pages saved from the original site (kept outside the repo).
2. `node scripts/crawl-menu.mjs <home.html>` — extracts the mega-menu hierarchy → `scripts/data/menu.json`
3. `node scripts/extract.mjs <crawlDir>` — extracts and cleans page content → `scripts/data/pages.json`
4. `node scripts/gen.mjs <home.html>` — generates every page in `site/`, rewrites links, audits them.

Preview: `python -m http.server 5173 --directory site`
Documents (PDFs) still link to the original site; images and logos are copied to `site/assets/img`.
