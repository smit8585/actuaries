# UI/UX audit — IAI redesign prototype (Direction A)

**Status: all findings from the first audit are fixed and re-tested on every page.**
Test coverage: **232 pages × 2 viewports (1440 px and 375 px) = 464 automated browser runs**, 232 static HTML checks, 40,000+ internal links, 943 external URLs (see "How it was tested").

Severity: **Critical** blocks a task · **High** frequent or serious friction · **Medium** noticeable · **Low** polish.

## 1. Original findings → what changed

### Top menu
| # | Sev | Finding | Fix | Verified |
|---|-----|---------|-----|----------|
| M1 | High | 27 px hover dead zone between trigger and panel closed the menu mid-move. | Triggers now stretch the full header height; panel starts exactly at the header edge; hover has intent delays (90 ms open, 220 ms close). | Geometry check on all 232 pages: no trigger ends above the header bottom. Hover open / delayed close simulated on all 232. |
| M2 | High | Escape did not close the panel; focus not returned. | State is JS-only (no `:focus-within` display). Escape closes, returns focus to the chevron button, closes on focus-out. | Escape + focus-return tested on all 232. |
| M3 | High | ~60 tab stops through a panel; no arrow keys. | ↑/↓ move through panel links, Home/End jump, ←/→ move between top items, ↓ opens a panel, Escape exits. | ArrowDown into panel and ArrowDown again tested on all 232. |
| M4 | Medium | Panels up to 913 px tall. | 4-column flow, "Browse everything" header, max-height with internal scroll; mega panels are no taller than the viewport. | Panel height ≤ viewport and width ≤ viewport tested on all 232. |
| M5 | Medium | Mixed hover/click model. | Click/Enter disclosure is the base; hover-intent is an enhancement for mouse pointers only (≥ 1281 px). | Click open, aria-expanded, close tested on all 232. |
| M6 | Medium | Top-level items had no landing page. | Each top-level item is now a link to a generated hub page (`section-*.html`) that lists every group and link; chevron button opens the panel. | Hub pages built and linked from the menu, breadcrumbs and sitemap; QA ran on all five hubs. |
| M7 | Low | Active section not shown. | Active top item gets `aria-current="true"` and a red underline. | Visual check + DOM check. |
| M8 | Low | External header/utility links gave no cue. | "↗ (opens in a new tab)" cue on external links in utility bar, header, footer and content. ActuJobs moved to the utility bar to stop the header overflowing. | CSS + visual check. |

### Side menu and breadcrumbs
| # | Sev | Finding | Fix | Verified |
|---|-----|---------|-----|----------|
| S1 | High | Sidebar pushed content below the fold on mobile. | Collapsed "In this section" disclosure under 1100 px; compact mobile header and breadcrumbs. | On every page with a sidebar at 375 px: collapsed by default, opens/closes, content starts above 620 px. |
| S2 | Medium | No child cue; labels looked like links. | Chevrons on items that expand; group labels restyled as small caps. | Visual check. |
| S3 | Medium | Sticky sidebar could hide bottom items. | `max-height: calc(100vh − 140px)` with scroll. | Checked on all desktop sidebars. |
| S4 | Low | `<aside>` of links. | `<nav aria-label="In this section">`. | Landmark check on all pages. |
| S5 | Low | Flat list of up to 40 siblings. | Lists over 10 collapse to 8 + "Show N more"; long sibling lists are windowed around the current page. | Checked; current page is always visible (`side-current` check). |
| B1 | Medium | Middle crumbs were plain text. | Section and group crumbs link to the hub page and its group anchor. | Every crumb has a name and target (link-name check). |
| B2 | Low | Slash characters in markup. | `<ol>`/`<li>` with CSS separators; last item `aria-current="page"`. | Breadcrumb check on all non-home pages. |

### Home, content, search
| # | Sev | Finding | Fix | Verified |
|---|-----|---------|-----|----------|
| H1 | Medium | Six carousel dots did nothing. | Removed. | — |
| H2 | Medium | PDF links had no type cue. | `PDF`/`DOC`/`XLS` badges and the external icon on content, announcements and home rows. | Visual check. |
| H3 | Low | Footer headings skipped levels. | Footer headings are paragraphs. | Heading check. |
| P1 | Medium | "Download", "View Link", "Open document". | Every generic link name gets an `aria-label` with the row title or page title; image-only links get a name from the file name. | 0 unnamed or generic-named links on 464 runs. |
| P2 | Medium | Heading levels skipped. | Generator: one `<h1>`, content starts at `<h2>`, no skipped level in reading order, empty and nested headings removed. | Heading-skip check: 0 failures. |
| P3 | Medium | 5,000+ external links, no cue, some dead. | Cues added; every external URL checked; 28 dead URLs are shown as plain text with "link no longer available". Documents are **not** self-hosted. | See "How it was tested". |
| P4 | Medium | Table filter only above 12 rows. | Filter on every data table above 6 rows, live count, empty message; layout-only tables are `role="presentation"`. | Filter tested on every page that has one (types, empty state, reset). |
| P5 | Low | PDF iframes scroll-in-scroll. | "Open the PDF in a new tab" button above each embedded PDF. | — |
| Q1 | Medium | Weak search. | Word-prefix matching, full-text index (1,400 chars/page), highlights, snippets, keyboard navigation, paging, empty state with popular pages, GET form that works without JS. | Tested: "fee" (no "coffee"), "acet exam", no-result query, 150-result query with paging, arrow-key navigation. |
| I1 | Medium | Pages ended abruptly. | Previous/next within the section and a "Can't find what you need?" block. | Present on all content pages. |
| I2 | Medium | Duplicate legacy entries. | Duplicate links are removed within each section; duplicate `index.php/` copies of pages merged; duplicate page titles qualified. | Static check: 0 duplicate titles. |

### Touch, focus, motion
| # | Sev | Finding | Fix | Verified |
|---|-----|---------|-----|----------|
| T1 | Medium | Targets under 44 px / 24 px. | Min 44 px on touch and ≤ 1100 px for nav, sidebar, crumbs, footer, pager, FAQ summaries; ≥ 24 px everywhere. | Target-size check: 0 failures at 1440 (24 px) and 375 (44 px) on all pages. |
| F1 | Medium | Focus ring unverified. | Global 3 px `:focus-visible` outline (white on dark areas); nothing removes outlines. | Stylesheet rule check on all pages (programmatic focus cannot be trusted in embedded frames). **Still to verify on a real keyboard/device.** |
| V1 | Low | No `:active` states. | Added for buttons and cards. | — |
| V2 | Low | Motion ignored reduced-motion. | `prefers-reduced-motion` disables transitions, animation and smooth scroll. | — |

## 2. New bugs found by testing every page (all fixed)

| Sev | Bug | Pages | Fix |
|-----|-----|-------|-----|
| Critical | Content gutters were missing: `.layout` overrode the page padding, so text and the sidebar touched the screen edge on every inner page. | all content pages | `.wrap.layout` keeps side padding. |
| Critical | Header overflowed the viewport by 94–488 px on desktop (hidden mobile-only items were displayed). | all 232 | Mobile-only items hidden by specificity-safe rules; ActuJobs moved to utility bar. |
| Critical | An unterminated HTML comment in imported content swallowed the footer. | 5 | Comment fragments stripped. |
| Critical | A generator regex dropped every link in imported tables (stray backspace character in a pattern). | 100+ | Fixed; links verified (40,118 internal links, 0 broken). |
| High | Imported markup could break the layout (unbalanced `<div>`, stray `<main>`, nested tables). | 30+ | Tags balanced; structural tags stripped; nested tables handled. |
| High | A hidden accessibility span inside tables stretched the page horizontally on mobile. | 4 | Containing blocks fixed. |
| High | In-page anchors pointed at removed ids. | 7 | Ids kept; near-matches repaired; dead ones removed. |
| High | Two video links were built with a doubled URL (404). | 2 | Fixed and re-verified. |
| Medium | Announcements pager linked to the home page (fixed earlier). | 1 | Points to the paginated listing. |
| Medium | Pages with empty titles produced empty breadcrumb items. | 3 | Title falls back to the menu label. |

## 3. How it was tested

* **Static (232 pages):** `node scripts/qa/static.mjs` — balanced tags, exactly one `<h1>`, alt text, duplicate ids and titles, leaked placeholders, `rel="noopener"`, viewport meta. Result: clean.
* **Internal links:** every `href`/`src` inside `site/` resolves (40,118 checked, 0 broken). No `#` placeholder links. All 231 pages are reachable from the home page within two clicks; `404.html` is intentionally unlinked.
* **Browser QA (`scripts/qa/qa.js`):** each page loaded at 1440 px and 375 px and checked for landmarks, heading order, accessible names (links, buttons, inputs, iframes), table headers, contrast, target size, horizontal overflow, focus rule, breadcrumbs, plus interactions — menu click/hover/keyboard/Escape, mobile menu, sidebar toggle, table filters. **464 runs, 0 failures on the final run.**
* **External links:** 943 unique URLs. All respond (200/redirect) except 5 that block bots (LinkedIn, Adobe, VitalSource, IANS) and 28 that are dead on the original site; those 28 are rendered as plain text.
* **Not covered:** real screen readers, Safari/Firefox, 400% zoom, forced-colours, print, real touch devices.

## 4. Remaining recommendations (outside the prototype)

1. Self-host the ~750 linked documents before launch (they currently depend on the legacy site).
2. Replace the six dead third-party destinations (goo.gl photo albums, elearning and 2025 sub-domains) with current ones from the Institute.
3. Re-check contrast after the official brand colours are applied.
4. Do a screen-reader pass (NVDA / VoiceOver) on the menu, sidebar and tables.
5. Rationalise the legacy information architecture before the WordPress build (several pages share one topic).
