# QA harness

Repeatable checks for the prototype in `site/`.

| Check | How | Scope |
|-------|-----|-------|
| Static HTML | `node scripts/qa/static.mjs` | Every page: balanced tags, one `<h1>`, alt text, duplicate ids/titles, leaked placeholders, `rel="noopener"` |
| Internal links | printed at the end of `node scripts/gen.mjs …` | Every `href`/`src` pointing inside `site/` must exist; no `#` placeholder links |
| Reachability | clicks-from-home BFS (see audit notes) | Every page reachable; no orphans |
| Browser QA | open `site/_qa/runner.html`, run `runAll([1440, 375])` | Every page at desktop and mobile width (`qa.js`): landmarks, headings, names, contrast, target size, overflow, focus rule, menu hover/click/keyboard, mobile menu, sidebar toggle, table filters |
| External links | `powershell -File scripts/linkcheck.ps1 urls.txt out.tsv` | Every external URL (HEAD, GET fallback); 404s and unreachable hosts are written to `scripts/data/dead.txt` and rendered as plain text by the generator |

To run the browser QA:

1. `mkdir site/_qa && cp scripts/qa/qa.js scripts/qa/runner.html site/_qa/`
2. write `site/_qa/pages.json` (array of every `site/*.html` file name)
3. serve `site/` (`python -m http.server 5173 --directory site`) and open `/_qa/runner.html`
4. in the console: `await runAll([1440, 375])`, then inspect `__results`
5. delete `site/_qa/` afterwards
