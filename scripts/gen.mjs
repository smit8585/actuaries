// Full-site generator. Run from repo root: node scripts/gen.mjs <path to crawled home.html>
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { slugOf, fileOf, ORIGIN, FILE_RE, dec, textOf } from './lib/util.mjs';
import { arr, ico, shell, head, foot, esc, PORTAL, SITE_B } from './lib/layout.mjs';
import { cpSync, copyFileSync } from 'node:fs';

const OUT = SITE_B ? 'site-b' : 'site';
if (SITE_B) { mkdirSync(OUT, { recursive: true }); cpSync('site/assets', join(OUT, 'assets'), { recursive: true }); copyFileSync('scripts/themes/b.css', join(OUT, 'assets/theme-b.css')); }
const pages = JSON.parse(readFileSync('scripts/data/pages.json', 'utf8'));
const menu = JSON.parse(readFileSync('scripts/data/menu.json', 'utf8'));
for (const k of Object.keys(pages)) { if (!k.startsWith('index.php__')) continue; const base = k.slice(11); if (!pages[base]) { pages[base] = pages[k]; pages[base].slug = base; } delete pages[k]; }
const imgmap = Object.fromEntries(readFileSync('scripts/data/imgmap.tsv', 'utf8').split(/\r?\n/).filter(Boolean).map(l => l.split('\t')));
const homeHtml = readFileSync(process.argv[2], 'utf8');
for (const f of readdirSync(OUT)) if (f.endsWith('.html')) rmSync(join(OUT, f));

const ALIAS = { 'index.php__disclaimer-new': 'disclaimer-new', 'Announcement-Archive': 'announcement' };
const GENERATED = { sitemap: 'sitemap.html', search: 'search.html' };
const fileFor = s => GENERATED[s] || fileOf(s);
const has = s => !!pages[s] || !!GENERATED[s];
const MANUAL = { 'node__3345': 'learning-training' };

/* ---------- link resolution ---------- */
// links known to be dead on the legacy site (from scripts/linkcheck.ps1) are rendered as plain text, never as links
const normUrl = u => dec(u).replace(/^http:\/\/(www\.)?actuariesindia\.org/i, 'https://www.actuariesindia.org').replace(/^https:\/\/actuariesindia\.org/i, 'https://www.actuariesindia.org').split('#')[0];
const DEAD = new Set(existsSync('scripts/data/dead.txt') ? readFileSync('scripts/data/dead.txt', 'utf8').split(/\r?\n/).filter(Boolean).map(normUrl) : []);
const ORIG = {}; // slug -> original absolute URL (for pager links on listing pages)
function resolve(raw, cur) {
  let h = dec((raw || '').trim());
  if (!h || h === '#' || /^javascript:/i.test(h)) return null;
  if (h.startsWith('?') && cur) { const base = (ORIG[cur] || 'https://www.actuariesindia.org/' + cur.split('__')[0].replace(/_/g, '/')).split('?')[0]; return { href: base + h, ext: true }; }
  if (/^(mailto:|tel:)/i.test(h) || h.startsWith('#')) return { href: h, ext: false };
  if (h.startsWith('./')) h = h.slice(1);
  if (!/^[a-z][a-z0-9+.-]*:/i.test(h) && !h.startsWith('/')) h = '/' + h;
  const hash = h.includes('#') ? '#' + h.split('#')[1] : '';
  const base = h.split('#')[0];
  let s = slugOf(base);
  if (s && s.startsWith('index.php__')) s = s.slice(11);
  if (s && ALIAS[s]) s = ALIAS[s];
  if (s && has(s)) { if (!ORIG[s]) ORIG[s] = normUrl(base.startsWith('/') ? 'https://www.actuariesindia.org' + base : base); return { href: fileFor(s) + hash, ext: false, slug: s }; }
  let out;
  if (ORIGIN.test(base) || base.startsWith('/')) out = 'https://www.actuariesindia.org' + (base.startsWith('/') ? base : new URL(base).pathname + new URL(base).search) + hash;
  else out = h;
  if (DEAD.has(normUrl(out))) return { dead: true, href: null };
  return { href: out, ext: true };
}

/* ---------- content processing ---------- */
const GEN = /^(download|view link|open document|view|open|read more|click here|here|more|details|link|register|login|view all|learn more)$/i;
function labelGeneric(h, p) {
  h = h.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (m) => {
    const first = textOf((m.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/) || [, ''])[1]).slice(0, 90);
    return m.replace(/<a ([^>]*)>([\s\S]*?)<\/a>/g, (mm, a, t) => { const tx = textOf(t); return GEN.test(tx) && first && !/aria-label/.test(a) ? `<a ${a} aria-label="${(tx + ': ' + first).replace(/"/g, '&quot;')}">${t}</a>` : mm; });
  });
  h = h.replace(/<a ([^>]*)>([\s\S]*?)<\/a>/g, (mm, a, t) => { const tx = textOf(t); return GEN.test(tx) && !/aria-label/.test(a) ? `<a ${a} aria-label="${(tx + ' – ' + p.title).replace(/"/g, '&quot;')}">${t}</a>` : mm; });
  return h;
}

// in-page links must point at an element that exists: repair near matches, otherwise drop the link
function fixAnchors(h) {
  const ids = new Set([...h.matchAll(/\s(?:id|name)="([^"]+)"/g)].map(m => m[1]));
  return h.replace(/<a ([^>]*?)href="#([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (m, a, id, z, inner) => {
    if (ids.has(id) || id === 'main') return m;
    const near = [...ids].find(x => id.endsWith(x) || x.endsWith(id) || id.replace(/^[a-z]+-/, '') === x);
    if (near) return `<a ${a}href="#${near}"${z}>${inner}</a>`;
    return inner;
  });
}

// close/remove unbalanced container tags so imported markup can never swallow the footer or break the layout
function balance(h) {
  const TAGS = ['div', 'table', 'ul', 'ol', 'nav', 'details', 'tbody', 'thead', 'tr', 'td', 'th', 'section', 'figure'];
  const re = new RegExp('<(/?)(' + TAGS.join('|') + ')\\b[^>]*>', 'gi');
  const stack = []; let out = '', last = 0, m;
  while ((m = re.exec(h))) {
    const close = m[1] === '/', tag = m[2].toLowerCase(); out += h.slice(last, m.index); last = re.lastIndex;
    if (!close) { stack.push(tag); out += m[0]; }
    else { const i = stack.lastIndexOf(tag); if (i < 0) continue; while (stack.length - 1 > i) out += '</' + stack.pop() + '>'; stack.pop(); out += m[0]; }
  }
  out += h.slice(last);
  while (stack.length) out += '</' + stack.pop() + '>';
  return out;
}

function processContent(p) {
  let h = p.html.replace(/<!--|-->|<!\[CDATA\[|\]\]>|<!DOCTYPE[^>]*>/gi, '').replace(/<h([1-6])[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/h>/gi, '').replace(/<p>\s*<a href="#main">Skip to content<\/a>\s*<\/p>/gi, '').replace(/<\/?(main|footer|header|html|body|head|aside)\b[^>]*>/gi, '');
  // normalise heading levels: page title is the only h1; content starts at h2 with no skipped levels
  const lv = [...new Set([...h.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]))].sort();
  h = h.replace(/<h([1-6])[^>]*>\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*<\/h>/g, '<h$1>$2</h$1>');
  if (lv.length) { const mp = {}; lv.forEach((l, i) => { mp[l] = Math.min(2 + i, 6); }); h = h.replace(/<(\/?)h([1-6])(?=[\s>])/g, (m, s, l) => `<${s}h${mp[l]}`); }
  { // never skip a level in reading order (h1 → h2 → h3…)
    let prev = 1; const stack = [];
    h = h.replace(/<(\/?)h([1-6])(?=[\s>])/g, (m, c, l) => { l = +l; if (!c) { const n = Math.min(l, prev + 1); stack.push(n); prev = n; return `<h${n}`; } return `</h${stack.length ? stack.pop() : l}`; });
  }
  h = h.replace(/<th>/g, '<th scope="col">').replace(/<nav(?![^>]*aria-label)([^>]*)>/g, '<nav aria-label="Section navigation"$1>');
  h = h.replace(/__ORGCHART__/,`The interactive organisation chart is hosted on the Institute’s current site. <a href="https://www.actuariesindia.org/organisation-chart-1" target="_blank" rel="noopener">Open the organisation chart</a>.`);
  h = h.replace(/<(source|video|embed)([^>]*?)src="([^"]*)"([^>]*)>/g, (m, t, a, src, z) => { const r = resolve(/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('/') ? src : '/' + src); return '<' + t + a + 'src="' + (r ? r.href : src) + '"' + z + '>'; });
  h = h.replace(/<a ([^>]*?)href="([^"]*)"([^>]*)>/g, (m, a, href, z) => {
    const r = resolve(href, p.slug);
    if (r && r.dead) return '<span class="dead-a">';
    if (!r) return '<span class="nolink-a">';
    const ft = (r.href.match(/\.(pdf|docx?|xlsx?|pptx?|zip)(?:[?#]|$)/i) || [])[1];
    return `<a href="${r.href}"${r.ext ? ' target="_blank" rel="noopener"' : ''}${ft ? ` data-ft="${ft.toUpperCase().replace(/^DOCX$/, 'DOC').replace(/^XLSX$/, 'XLS').replace(/^PPTX$/, 'PPT')}"` : ''}>`;
  });
  // unmatched closing tags for nolink anchors are harmless; fix by pairing: replace "<span class=\"nolink-a\">…</a>" with span close
  h = h.replace(/<span class="nolink-a">([\s\S]*?)<\/a>/g, '$1');
  h = h.replace(/<span class="dead-a">([\s\S]*?)<\/a>/g, '<span class="dead" title="This link no longer works on the Institute’s current site">$1<span class="sr"> (link no longer available)</span></span>');
  h = h.replace(/<a(?![^>]*\shref=)[^>]*>([\s\S]*?)<\/a>/g, '$1');
  h = h.replace(/<img ([^>]*?)src="([^"]*)"([^>]*?)\/?>/g, (m, a, src, z) => {
    const name = imgmap[dec(src)];
    if (!name || !existsSync(join(OUT, 'assets/img/content', name))) return '';
    const alt = (m.match(/alt="([^"]*)"/) || [, ''])[1];
    return `<img src="assets/img/content/${name}" alt="${alt}" loading="lazy">`;
  });
  h = h.replace(/<iframe ([^>]*?)src="([^"]*)"[^>]*>(<\/iframe>)?/g, (m, a, src) => {
    const s = dec(src); const abs = /^https?:/.test(s) ? s : 'https://www.actuariesindia.org' + (s.startsWith('/') ? s : '/' + s);
    const isPdf = /\.pdf(?:[?#]|$)/i.test(abs);
    const t = /youtube/.test(abs) ? 'Video player' : /maps/.test(abs) ? 'Map: Institute of Actuaries of India office' : isPdf ? `${p.title} (PDF document)` : `${p.title} (embedded content)`;
    const open = isPdf ? `<p class="embed-actions"><a class="btn ghost sm" href="${abs.split('#')[0]}" target="_blank" rel="noopener" data-ft="PDF">Open the PDF in a new tab</a></p>` : '';
    return `${open}<div class="embed"><iframe src="${abs}" loading="lazy" title="${t.replace(/"/g, '&quot;')}"></iframe></div>`;
  });
  for (let pass = 0; pass < 6; pass++) {
    const before = h;
    h = h.replace(/<table(?![^>]*data-w)([^>]*)>((?:(?!<table(?![^>]*data-w))[\s\S])*?)<\/table>/g, (m, a, inner) => {
      const rows = (inner.match(/<tr/g) || []).length;
      const dataTable = /<th[\s>]/.test(inner);
      const filter = dataTable && rows > 6 ? `<div class="tfilter"><input type="search" placeholder="Filter this table…" aria-label="Filter this table"></div><p class="tcount" role="status" aria-live="polite"></p>` : '';
      return `<div class="tablewrap${dataTable ? '' : ' layout-table'}">${filter}<table data-w${dataTable ? '' : ' role="presentation"'}>${inner}</table></div>`;
    });
    if (h === before) break;
  }
  // drop a leading paragraph that just repeats the page title
  h = h.replace(/^\s*(<div>\s*)*<p>([^<]{0,90})<\/p>/, (m, d, t) => (textOf(t).toLowerCase() === p.title.toLowerCase() ? '' : m));
  h = h.replace(/<div>\s*<\/div>/g, '');
  h = h.replace(/(<a [^>]*>)\s*<img [^>]*fileicon[^>]*>\s*<\/a>/g, '$1Download</a>');
  h = h.replace(/(<a [^>]*>)\s*<\/a>/g, '$1Open document</a>');
  h = h.replace(/<a ([^>]*href="([^"]*)"[^>]*)>((?:(?!<\/a>)[\s\S])*)<\/a>/g, (m, a, href, inner) => {
    if (textOf(inner) || /aria-label/.test(a) || /<img[^>]*alt="[^"]+"/.test(inner)) return m;
    const nm = decodeURIComponent(href.split('?')[0].split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '').replace(/[-_+]+/g, ' ').trim();
    return `<a ${a} aria-label="${(nm ? 'Open ' + nm : 'Open link').replace(/"/g, '&quot;').slice(0, 110)}">${inner}</a>`;
  });
  h = h.replace(/<\/iframe><\/div>\s*<\/iframe>/g, '</iframe></div>');
  const seenIds = new Set(['main', 'nav', 'menu-btn', 'sidelist', 'q', 'count', 'results', 'empty']);
  h = h.replace(/\sid="([^"]+)"/g, (m, id) => { if (seenIds.has(id)) return ''; seenIds.add(id); return m; });
  h = h.replace(/(<\/a>)\s*[0-9]+(?:\.[0-9]+)?\s?(?:KB|MB|GB)\b/gi, '$1'); // drop file sizes shown next to document links
  h = fixAnchors(h);
  // listing pagers: heading becomes screen-reader only, labels become "1 2 3 … Next › Last »"
  h = h.replace(/<nav aria-label="Section navigation">\s*<h2[^>]*>Pagination<\/h2>[\s\S]*?<\/nav>/g, blk => blk.replace(/<h2[^>]*>Pagination<\/h2>/, '<h2 class="pager-h">Pagination</h2>').replace(/<a ([^>]*)>\s*([\s\S]*?)<\/a>/g, (m, a, t) => {
    t = t.replace(/\s+/g, ' ').trim(); const full = t; let cur = false;
    if (/^Current page/.test(t)) { cur = true; t = t.replace(/^Current page /, ''); }
    else if (/^Page /.test(t)) t = t.replace(/^Page /, '');
    else if (/^Next page/.test(t)) t = 'Next ›';
    else if (/^Previous page/.test(t)) t = '‹ Previous';
    else if (/^Last page/.test(t)) t = 'Last »';
    else if (/^First page/.test(t)) t = '« First';
    a = a.replace(/\saria-label="[^"]*"/, ''); return `<a ${a} aria-label="${full.replace(/"/g, '&quot;')}"${cur ? ' aria-current="page"' : ''}>${t}</a>`;
  }));
  return balance(labelGeneric(h, p));
}

/* ---------- menu: dedupe legacy duplicates, index, parents ---------- */
const linkTarget = l => { const r = resolve(l.href); return r && !r.dead ? r : null; };
const slugify = s => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
for (const top of menu) {
  const seen = new Set();
  const keep = l => { const r = linkTarget(l); const k = r && (r.slug || r.href); if (k && seen.has(k)) return false; if (k) seen.add(k); l.children = l.children.filter(keep); return true; };
  top.groups.forEach(g => { g.links = g.links.filter(keep); });
  top.groups = top.groups.filter(g => g.links.length);
}
const tops = menu.filter(t => t.groups.length);
const hubFile = t => `section-${slugify(t.name)}.html`;
const hubLead = { About: 'The Institute, how it is governed, and the laws and policies it works under.', 'Become an Actuary': 'What the profession is, how to become a student member, and the education that follows.', 'Actuarial Studies': 'The Olympiad, the ACET entrance exam and the actuarial examinations.', Members: 'Services, careers, professionalism and standards for members.', Events: 'Seminars, conferences and outreach activities.' };
const menuIndex = {}; // slug -> {top, group, link, parent}
for (const top of tops) for (const g of top.groups) {
  const reg = (l, parent) => { const r = linkTarget(l); if (r && r.slug && !menuIndex[r.slug]) menuIndex[r.slug] = { top, group: g, link: l, parent }; l.children.forEach(c => reg(c, l)); };
  g.links.forEach(l => reg(l, null));
}
for (const [sl, m] of Object.entries(menuIndex)) if (pages[sl] && !String(pages[sl].title).trim()) pages[sl].title = m.link.text;
for (const pg of Object.values(pages)) if (!String(pg.title).trim()) pg.title = pg.slug.replace(/__/g, ' ').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase());
const topNames = new Set(menu.map(t => t.name));
{ // make page titles unique: qualify duplicates with their section, parent page or year
  const by = {}; for (const pg of Object.values(pages)) (by[pg.title] = by[pg.title] || []).push(pg);
  for (const [t, arr_] of Object.entries(by)) {
    if (arr_.length < 2 && !topNames.has(t)) continue;
    arr_.forEach((pg, i) => { const mi = menuIndex[pg.slug]; const yr = (pg.slug.match(/(20\d\d)/) || [])[1]; const ctx = (mi && (mi.group.title || mi.top.name)) || ''; pg.title = topNames.has(t) ? t + ' listing' : (ctx && ctx !== t ? `${t} (${ctx})` : yr ? `${t} ${yr}` : `${t} (${i + 1})`); });
  }
  const by2 = {}; for (const pg of Object.values(pages)) (by2[pg.title] = by2[pg.title] || []).push(pg);
  for (const arr_ of Object.values(by2)) if (arr_.length > 1) arr_.forEach((pg, i) => { pg.title += ` (${i + 1})`; });
}
const parent = {}; // slug -> slug (pages not in the menu)
const order = [...Object.keys(menuIndex), ...Object.keys(pages)];
for (const src of order) {
  const p = pages[src]; if (!p) continue;
  for (const m of p.html.matchAll(/href="([^"]+)"/g)) {
    const r = resolve(m[1]); if (!r || !r.slug || r.slug === src || r.slug === 'home') continue;
    if (!menuIndex[r.slug] && !parent[r.slug] && pages[r.slug] && (menuIndex[src] || parent[src])) parent[r.slug] = src;
  }
}
const ancestors = s => { const a = []; let c = parent[s]; let n = 0; while (c && n++ < 5) { a.unshift(c); c = parent[c]; } return a; };
const rootOf = s => { if (menuIndex[s]) return s; const a = ancestors(s); return a.length && menuIndex[a[0]] ? a[0] : null; };
const flatten = (links, out = []) => { for (const l of links) { const r = linkTarget(l); if (r && r.slug) out.push({ text: l.text, href: r.href, slug: r.slug }); flatten(l.children, out); } return out; };

function sideAndCrumbs(slug) {
  const root = rootOf(slug); if (!root) return { side: null, crumbs: [], prev: null, next: null };
  const mi = menuIndex[root];
  const crumbs = [[mi.top.name, hubFile(mi.top)]];
  if (mi.group.title && mi.group.title !== mi.top.name) crumbs.push([mi.group.title, hubFile(mi.top) + '#g-' + slugify(mi.group.title)]);
  if (mi.parent) { const r = linkTarget(mi.parent); crumbs.push([mi.parent.text, r && r.slug ? fileFor(r.slug) : null]); }
  const chain = ancestors(slug);
  for (const a of chain) crumbs.push([pages[a].title, fileFor(a)]);
  if (slug !== root && !chain.includes(root)) crumbs.push([pages[root].title, fileFor(root)]);
  const cur = slug;
  const mapLink = l => {
    const r = linkTarget(l);
    const isCur = r && r.slug === cur;
    const kids = l.children.map(mapLink);
    const open = isCur || kids.some(k => k.current || (k.children || []).some(c => c.current)) || (r && r.slug && (ancestors(cur).includes(r.slug)));
    let children = open ? kids : [];
    if (r && r.slug && (isCur || ancestors(cur).includes(r.slug)) && !kids.length) {
      let sibs = Object.keys(parent).filter(k => parent[k] === r.slug);
      if (sibs.length > 60) { const ci = Math.max(0, sibs.indexOf(cur)); const st = Math.min(Math.max(0, ci - 30), sibs.length - 60); sibs = sibs.slice(st, st + 60); }
      children = sibs.map(k => ({ text: pages[k].title, href: fileFor(k), current: k === cur }));
    }
    return { text: l.text, href: r ? r.href : '', current: !!isCur, children };
  };
  const side = mi.group.links.map(mapLink);
  // previous / next within the group (menu pages) or among siblings (deeper pages)
  let flat = flatten(mi.group.links), prev = null, next = null;
  const i = flat.findIndex(f => f.slug === slug);
  if (i >= 0) { prev = flat[i - 1] || null; next = flat[i + 1] || null; }
  else if (parent[slug]) { const sibs = Object.keys(parent).filter(k => parent[k] === parent[slug]); const j = sibs.indexOf(slug); if (sibs.length > 1) { prev = sibs[j - 1] ? { text: pages[sibs[j - 1]].title, href: fileFor(sibs[j - 1]) } : null; next = sibs[j + 1] ? { text: pages[sibs[j + 1]].title, href: fileFor(sibs[j + 1]) } : null; } }
  return { side, sideTitle: mi.group.title || mi.top.name, crumbs, prev, next, top: mi.top.name };
}

/* ---------- mega menu (per page, so the active section can be marked) ---------- */
const chev = `<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
const linkHtml = l => {
  const r = linkTarget(l);
  const a = r ? `<a href="${r.href}"${r.ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.text)}</a>` : `<span class="lbl">${esc(l.text)}</span>`;
  const kids = l.children.length ? `<ul>${l.children.map(c => `<li>${linkHtml(c)}</li>`).join('')}</ul>` : '';
  return a + kids;
};
const navCache = {};
const navFor = (curTop = '', curCareer = false) => navCache[curTop + curCareer] ||= `<ul class="navlist">${tops.map((t, i) => `<li class="has-mega${t.name === curTop ? ' current' : ''}"><a class="top" href="${hubFile(t)}"${t.name === curTop ? ' aria-current="true"' : ''}>${esc(t.name)}</a><button class="chevbtn" type="button" aria-expanded="false" aria-controls="mega-${i}" aria-label="${esc(t.name)} submenu">${chev}</button><div class="mega" id="mega-${i}"><div class="mega-head"><a href="${hubFile(t)}">Browse everything in ${esc(t.name)} ${arr}</a></div><div class="mega-in">${t.groups.map(g => `<div class="mg">${g.title ? `<p class="mg-h">${esc(g.title)}</p>` : ''}<ul>${g.links.map(l => `<li>${linkHtml(l)}</li>`).join('')}</ul></div>`).join('')}</div></div></li>`).join('')}<li><a class="top" href="career.html"${curCareer ? ' aria-current="page"' : ''}>Career</a></li><li class="only-s"><a href="search.html">Search</a></li><li class="only-s"><a href="contact-us.html">Contact us</a></li><li class="only-xs"><a href="annual-membership.html">Annual Membership</a></li><li class="only-xs"><a href="${PORTAL.acetSignup}" target="_blank" rel="noopener">ACET Sign Up</a></li><li class="only-xs"><a href="${PORTAL.acetLogin}" target="_blank" rel="noopener">ACET Login</a></li><li class="only-xs"><a href="${PORTAL.login}" target="_blank" rel="noopener">Member Login</a></li><li class="only-xs"><a href="${PORTAL.jobs}" target="_blank" rel="noopener">ActuJobs</a></li></ul>`;
const navHtml = navFor();

/* ---------- generate content pages ---------- */
let count = 0;
const write = (file, html) => { writeFileSync(join(OUT, file), html); count++; };
const kidsOf = s => {
  const k = []; const m = menuIndex[s];
  if (m) m.link.children.forEach(c => { const r = linkTarget(c); k.push([c.text, r ? r.href : null]); });
  for (const c of Object.keys(parent)) if (parent[c] === s) k.push([pages[c].title, fileFor(c)]);
  return k.filter(([, h]) => h);
};
const searchIndex = [];
for (const slug of Object.keys(pages)) {
  if (slug === 'home' || slug === 'sitemap') continue;
  const p = pages[slug];
  let body = processContent(p);
  const plain = textOf(body);
  const kids = kidsOf(slug);
  if (plain.length < 80 && !/<iframe|<img|embed/.test(body)) {
    const note = kids.length
      ? `<h2 class="sr">In this section</h2><div class="grid g3">${kids.map(([t, h]) => `<a class="card" href="${h}"><h3>${esc(t)}</h3><span class="go">Open ${arr}</span></a>`).join('')}</div>`
      : `<div class="note">This page is published by the Institute as a document or interactive notice. <a class="link" href="https://www.actuariesindia.org/${slug.replace(/__/g, '/')}" target="_blank" rel="noopener">Open it on the Institute’s website ${arr}</a></div>`;
    body = body + note;
  } else if (kids.length && plain.length < 400) {
    body += `<h2>In this section</h2><div class="grid g3">${kids.map(([t, h]) => `<a class="card" href="${h}"><h3>${esc(t)}</h3><span class="go">Open ${arr}</span></a>`).join('')}</div>`;
  }
  const sc = sideAndCrumbs(slug);
  write(fileFor(slug), shell({ title: p.title, crumbs: sc.crumbs, side: sc.side, sideTitle: sc.sideTitle, body, navHtml: navFor(sc.top || '', slug === 'career'), prev: sc.prev, next: sc.next }));
  searchIndex.push([p.title, fileFor(slug), plain.slice(0, 1400)]);
}

/* ---------- section hub pages ---------- */
const CUSTOM = {
  'about-iai': 'A statutory body established by an Act of Parliament to regulate the profession of actuaries in India.',
  'the_council': 'Who governs the Institute: 12 elected Fellow members and 2 government nominees.',
  'annual-report': 'The Institute’s annual reports on its work and finances.',
  'what-actuary': 'Actuaries make financial sense of the future by valuing uncertainty and risk.',
  'who-can-become-actuary': 'Strong maths, statistics, analytics and finance skills — and the commitment to pass every exam.',
  'student': 'How student membership works for candidates who enrol for the Institute’s examinations.',
  'about-acet': 'The entrance test for candidates who plan to enrol as student members and take the actuarial examinations.',
  'examination-dates-1': 'Registration, exam and result dates for the current ACET session.',
  'syllabus': 'The subjects and topics covered in the Institute’s examinations.',
  'annual-membership': 'Renew your membership every 1 April to keep your status active.',
  'fellow': 'Routes to Fellowship: the IAI examination route and mutual recognition agreements.',
  'verification-iai-member': 'Verify the credentials of an IAI member.',
  'upcoming-events': 'Seminars, webinars and conferences coming up at the Institute.',
  'events-past': 'Seminars, webinars and conferences held in previous years.',
  '47th-india-fellowship-seminar': 'The seminar required for admission as a Fellow Member — 10 December 2026.',
  'associate': 'Eligibility and the online Change of Category process for Associate membership.',
  'cera-chartered-enterprise-risk-actuary-qualification': 'The global enterprise risk qualification the Institute is accredited to award.',
  'direct-entry': 'Qualifications that allow direct admission as a student member without ACET.',
  'exam-fees': 'Examination fees per subject for India and SAARC countries.',
};
const blurb = slug => {
  if (CUSTOM[slug.toLowerCase()]) return CUSTOM[slug.toLowerCase()];
  const p = pages[slug]; if (!p) return '';
  const paras = [...p.html.matchAll(/<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/g)].map(m => textOf(m[1])).filter(t => t.length >= 45 && !/^(skip to|home\b)/i.test(t));
  let t = paras.find(x => /^[A-Z]/.test(x) && !/^[^ ]{0,25}\(/.test(x) && !/^(Members\(|Please|Note|This is to inform)/.test(x)) || ''; if (!t || t.length < 30) return '';
  if (t.length > 150) t = t.slice(0, 150).replace(/\s+\S*$/, '') + '…';
  return t;
};
const FEATURED = {
  About: ['about-iai', 'the_council', 'annual-report'],
  'Become an Actuary': ['what-actuary', 'who-can-become-actuary', 'student'],
  'Actuarial Studies': ['about-acet', 'examination-dates-1', 'syllabus'],
  Members: ['annual-membership', 'fellow', 'verification-iai-member'],
  Events: ['upcoming-events', 'events-past', '47th-india-fellowship-seminar'],
};
const caseKey = k => Object.keys(pages).find(x => x.toLowerCase() === k.toLowerCase());
for (const t of tops) {
  const all = []; const walk = l => { const r = linkTarget(l); if (r) all.push({ text: l.text, href: r.href, slug: r.slug }); l.children.forEach(walk); };
  t.groups.forEach(g => g.links.forEach(walk));
  const local = all.filter(x => x.slug);
  let feat = (FEATURED[t.name] || []).map(k => caseKey(k)).filter(Boolean).map(k => local.find(x => x.slug === k)).filter(Boolean);
  if (feat.length < 3) feat = [...feat, ...local.filter(x => !feat.includes(x) && blurb(x.slug))].slice(0, 3);
  const featHtml = `<section class="hub-feature" aria-label="Featured in ${esc(t.name)}"><div class="hub-feat-grid">${feat.map((f, i) => `<a class="hub-feat${i === 0 ? ' lead' : ''}" href="${f.href}"><span class="k">${i === 0 ? 'Start here' : 'Popular'}</span><h2>${esc(f.text)}</h2><p>${esc(blurb(f.slug))}</p><span class="go">Open ${arr}</span></a>`).join('')}</div></section>`;
  const rowFor = l => { const r = linkTarget(l); const href = r ? r.href : null; const e = href && /^https?:/.test(href); const bl = r && r.slug ? blurb(r.slug) : '';
    const kids = l.children.map(c => { const rc = linkTarget(c); return rc ? `<li><a href="${rc.href}"${/^https?:/.test(rc.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(c.text)}</a></li>` : `<li><span>${esc(c.text)}</span></li>`; }).join('');
    return `<div class="hub-row">${href ? `<a class="hub-link" href="${href}"${e ? ' target="_blank" rel="noopener"' : ''}><span class="t">${esc(l.text)}</span>${bl ? `<span class="d">${esc(bl)}</span>` : ''}${arr}</a>` : `<p class="hub-label">${esc(l.text)}</p>`}${kids ? `<ul class="hub-kids">${kids}</ul>` : ''}</div>`; };
  const groups = t.groups.map(g => `<section id="g-${slugify(g.title || t.name)}" class="hub-group"><div class="hub-gh"><h2>${esc(g.title || t.name)}</h2><p>${g.links.length} ${g.links.length === 1 ? 'page' : 'pages'}</p></div><div class="hub-rows">${g.links.map(rowFor).join('')}</div></section>`).join('');
  const nav = `<nav class="hub-jump" aria-label="Jump to a group">${t.groups.map(g => `<a href="#g-${slugify(g.title || t.name)}">${esc(g.title || t.name)}</a>`).join('')}</nav>`;
  const body = featHtml + (t.groups.length > 1 ? nav : '') + groups;
  write(hubFile(t), shell({ title: t.name, crumbs: [], lead: hubLead[t.name] || '', body, navHtml: navFor(t.name), side: null, hub: true }));
  searchIndex.push([t.name, hubFile(t), (hubLead[t.name] || '') + ' ' + t.groups.map(g => g.title).join(' ')]);
}

/* ---------- sitemap + search + 404 ---------- */
const mapLinks = l => { const r = linkTarget(l); return `<li>${r ? `<a href="${r.href}"${r.ext ? ' target="_blank" rel="noopener"' : ''}>${esc(l.text)}</a>` : `<span class="lbl">${esc(l.text)}</span>`}${l.children.length ? `<ul>${l.children.map(mapLinks).join('')}</ul>` : ''}</li>`; };
const alpha = Object.values(pages).filter(p => p.slug !== 'home' && p.slug !== 'sitemap').sort((a, b) => a.title.localeCompare(b.title));
const smBody = `<div class="sitemap">${tops.map(t => `<section><h2><a href="${hubFile(t)}">${esc(t.name)}</a></h2>${t.groups.map(g => `<h3>${esc(g.title)}</h3><ul>${g.links.map(mapLinks).join('')}</ul>`).join('')}</section>`).join('')}<section><h2>All pages A–Z</h2><ul class="cols">${alpha.map(p => `<li><a href="${fileFor(p.slug)}">${esc(p.title)}</a></li>`).join('')}</ul></section></div>`;
write('sitemap.html', shell({ title: 'Sitemap', crumbs: [], body: smBody, navHtml, help: false }));
searchIndex.push(['Sitemap', 'sitemap.html', 'Every page on the site']);
writeFileSync(join(OUT, 'assets', 'search-index.js'), 'window.SEARCH_INDEX=' + JSON.stringify(searchIndex) + ';');
const POPULAR = [['ACET entrance exam', 'about-acet.html'], ['Examination dates', 'examination-dates-1.html'], ['Exam fees', 'exam-fees.html'], ['Syllabus', 'syllabus.html'], ['Annual membership', 'annual-membership.html'], ['Announcements', 'announcement.html'], ['Contact us', 'contact-us.html']].filter(([, f]) => existsSync(join(OUT, f)));
const popular = `<ul class="popular">${POPULAR.map(([t, f]) => `<li><a href="${f}">${t}</a></li>`).join('')}</ul>`;
const searchBody = `<form class="searchbox" role="search" action="search.html" method="get"><label for="q" class="sr">Search the site</label><input id="q" name="q" type="search" placeholder="Search exams, syllabus, announcements, members…" autocomplete="off"><button class="btn primary sm" type="submit">Search</button></form>
<p id="count" class="mute" role="status" aria-live="polite"></p><div id="results" class="results"></div><div id="empty" class="popular-box"><p class="fh2">Popular pages</p>${popular}</div>
<script src="assets/search-index.js"></script><script src="assets/search.js"></script>`;
write('search.html', shell({ title: 'Search', crumbs: [], body: searchBody, navHtml, help: false }));
write('404.html', shell({ title: 'Page not found', crumbs: [], lead: 'The page you were looking for does not exist or has moved.', body: `<form class="searchbox" role="search" action="search.html" method="get"><label for="q" class="sr">Search the site</label><input id="q" name="q" type="search" placeholder="Search the site…"><button class="btn primary sm" type="submit">Search</button></form><p class="fh2">Try one of these</p>${popular}<p><a class="link" href="sitemap.html">Browse the full sitemap ${arr}</a></p>`, navHtml, help: false }));

/* ---------- home page ---------- */
const findHref = (title) => {
  const key = title.slice(0, 22).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '(?:&|&amp;)');
  const m = homeHtml.match(new RegExp(`<a[^>]*href="([^"]+)"[^>]*>(?:\\s|<[^>]+>)*[^<]*${key}`, 'i'));
  return m ? dec(m[1]) : null;
};
const abs = h => !h ? 'announcement.html' : (h.startsWith('/') ? 'https://www.actuariesindia.org' + h : h);
const L = (path) => { const r = resolve(path); return r ? r.href : '#'; };
const Lx = (path) => { const r = resolve(path); return r && r.ext ? ` target="_blank" rel="noopener"` : ''; };
const ANN = [['exam', 'Exam', 'Timetable – May 2027 Actuarial Examination'], ['notice', 'Notice', 'Expression of Interest (EOI)_Empanelment of Academicians Professional Experts'], ['tender', 'Tender', 'RFP for Event Management Agency for 26th GCA and AGFA 2027'], ['training', 'Training', 'Online Coaching (Pre-recorded Videos) for May 2027 Exam'], ['result', 'Result', 'Professional Exam Nov 2026 – Result Pass list'], ['exam', 'Exam', 'Mock Exam for ACET Dec 2026']];
const hrefFor = { 'Timetable – May 2027 Actuarial Examination': L('/examination-dates-1') };
const annRow = ([c, l, t]) => { const h = hrefFor[t] || abs(findHref(t) || findHref(t.replace('_', ' ')) ); const ext = /^https?:/.test(h); return `<a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''} data-cat="${c}"><span class="t t-${c}">${l}</span><div>${t.replace('_', ' ')}</div>${arr}</a>`; };
const EV = [['26–27', 'Nov', '21st CILA', '21st Current Issues Seminar in Life Assurance', '/21st-current-issues-seminar-life-assurance-21st-cila-26th-27th-november-2026-0'], ['10', 'Dec', '47th IFS', '47th India Fellowship Seminar', '/47th-india-fellowship-seminar'], ['', '', '19th CIHCI', '19th Current Issues in Health and Care Insurance', '/19th-current-issues-health-and-care-insurance'], ['', '', 'Webinar', '19th Webinar on Data Science and Analytics', '/19th-webinar-data-science-and-analytics-0']];
let grid = '', cv = '';
for (let y = 0; y <= 600; y += 40) grid += `<line x1="0" y1="${y}" x2="540" y2="${y}" stroke="#fff" stroke-opacity=".06"/>`;
for (let x = 0; x <= 540; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="600" stroke="#fff" stroke-opacity=".06"/>`;
for (let i = 0; i < 7; i++) { const t = 70 + i * 24; cv += `<path d="M-30 340 C 110 340,150 ${t},270 ${t} S 430 340,570 340" stroke="#8FB3E6" stroke-opacity="${0.12 + i * 0.09}" stroke-width="${i === 6 ? 2.5 : 1.2}" fill="none"/>`; }
const heroArt = `<svg class="art" viewBox="0 0 540 600" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${grid}${cv}<line x1="270" y1="214" x2="270" y2="340" stroke="#B5121B" stroke-width="2" stroke-dasharray="4 5"/><circle cx="270" cy="214" r="6" fill="#B5121B"/></svg>`;
const rings = `<svg viewBox="0 0 432 220" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" fill="none">${[...Array(9)].map((_, j) => `<circle cx="${380 - j * 26}" cy="${200 + j * 4}" r="${40 + j * 22}" stroke="#fff" stroke-opacity="${0.05 + j * 0.012}"/>`).join('')}</svg>`;
const GCA = 'https://actuariesindia.org/sites/default/files/2026-10/26th_GCA_EOI.pdf';
const TICK = [
  ['Registration Announcement – Professionalism MCQ Examination', abs(findHref('Registration Announcement'))],
  ['21st CILA · 26–27 Nov 2026', L(EV[0][4])],
  ['47th India Fellowship Seminar · 10 Dec 2026', L(EV[1][4])],
  ['Mock Exams for November 2026', abs(findHref('Mock Exams for November'))],
  ['Actuarial Apprenticeship 2026 | The Oriental Insurance Company Limited', abs(findHref('Actuarial Apprenticeship'))],
  ['19th Current Issues in Health and Care Insurance', L(EV[2][4])],
  ['Training (Pre-Recorded videos) – May 2027', abs(findHref('Training (Pre-Recorded'))],
];
const tickSet = hidden => `<div class="set"${hidden ? ' aria-hidden="true"' : ''}>${TICK.map(([t, h]) => `<a href="${h}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ''}${hidden ? ' tabindex="-1"' : ''}>${t}</a><i aria-hidden="true">◆</i>`).join('')}</div>`;
const home = `
<div class="ticker"><div class="wrap"><span class="chip">Latest updates</span><div class="items" role="region" aria-label="Latest updates"><div class="track">${tickSet(false)}${tickSet(true)}</div></div><a class="link" href="announcement.html" aria-label="View all latest updates">View all ${arr}</a></div></div>

<section class="hero"><div class="wrap"><div>
<div class="eyebrow">The profession’s statutory body · Est. 2006</div>
<h1>Shaping the <em>future</em> of India’s actuarial profession.</h1>
<p class="lead">The Institute of Actuaries of India educates, examines and regulates the nation’s actuaries — setting the standards that keep insurance, pensions and financial systems trustworthy.</p>
<div class="ctas"><a class="btn primary" href="${L('/what-actuary')}">Become an Actuary ${arr}</a><a class="btn ghost" href="${L('/about-acet')}">Explore ACET exam</a></div></div>
<aside class="panel" aria-label="Featured">${heroArt}<span class="tag">Featured</span><h2>Call for Abstracts</h2><p>26th Global Conference of Actuaries. Research papers and professional presentations — share your idea with the profession.</p><a class="btn white sm" style="align-self:flex-start" href="${GCA}" target="_blank" rel="noopener">Submit your abstract ${arr}</a></aside></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sec-head"><div><div class="eyebrow plain">Start here</div><h2>Whoever you are, find your way in.</h2></div></div>
<div class="grid g4">
<a class="card dark" href="${L('/what-actuary')}">${ico('cap')}<h3>Aspiring actuary</h3><p>Explore the profession, the ACET entrance exam and how to apply.</p><span class="go">Explore ${arr}</span></a>
<a class="card" href="${L('/student')}">${ico('book')}<h3>Student</h3><p>Syllabus, exam dates, results, study material and prizes.</p><span class="go">Explore ${arr}</span></a>
<a class="card" href="${L('/annual-membership')}">${ico('user')}<h3>Member</h3><p>Renew membership, forms, CPD, verification and library.</p><span class="go">Explore ${arr}</span></a>
<a class="card" href="${L('/placement-cell')}">${ico('brief')}<h3>Employer &amp; public</h3><p>Verify an actuary, find talent through the Placement Cell.</p><span class="go">Explore ${arr}</span></a>
</div></div></section>

<section class="paper"><div class="wrap news-grid"><div>
<div class="sec-head" style="margin-bottom:20px"><h2>Announcements</h2><a class="link" href="announcement.html" aria-label="View all announcements">View all ${arr}</a></div>
<div class="list">${ANN.map(annRow).join('')}</div></div>
<div><div class="sec-head" style="margin-bottom:20px"><h2>Upcoming events</h2></div><div class="events">
${EV.map((e, i) => `<a class="event${i === 0 ? ' feat' : ''}" href="${L(e[4])}"><div class="d">${e[0] ? `<b>${e[0]}</b><small>${e[1]}</small>` : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`}</div><div><div class="k">${e[2]}</div><div class="n">${e[3]}</div></div></a>`).join('')}
</div></div></div></section>

<section class="navy"><div class="wrap"><div class="sec-head"><div><div class="eyebrow plain" style="color:#E8707A">The qualification path</div><h2>From first-year student to <em style="color:#9DB8E3">Fellow</em> of the Institute.</h2></div><a class="btn white sm" href="${L('/education-policy-2026')}">View education curriculum ${arr}</a></div>
<div class="steps">
<a class="step" href="${L('/student')}"><div class="num">01 ${arr}</div><h3>Student</h3><p>Enrol through the ACET entrance exam or direct entry and begin the examinations.</p></a>
<a class="step" href="${L('/associate')}"><div class="num">02 ${arr}</div><h3>Associate</h3><p>Complete the prescribed examinations and requirements for Associateship.</p></a>
<a class="step" href="${L('/fellow')}"><div class="num">03 ${arr}</div><h3>Fellow</h3><p>Advance through the higher subjects to qualify as a Fellow Member.</p></a>
<a class="step" href="${L('/cera-chartered-enterprise-risk-actuary-qualification')}"><div class="num">04 ${arr}</div><h3>CERA · MRA</h3><p>Specialist credentials, including Chartered Enterprise Risk Actuary.</p></a>
</div></div></section>

<section><div class="wrap"><div class="sec-head"><h2>Keep learning, keep informed</h2></div><div class="grid g3">
<a class="card res" href="${L('/magazine')}"><div class="im" style="background:#13366B">${rings}<span>theactuaryindia</span></div><div class="body"><h3>Digital magazine</h3><p>The Institute’s digital magazine — articles, interviews and perspectives from across the profession.</p><span class="go">Read more ${arr}</span></div></a>
<a class="card res" href="${L('/node/3345')}"><div class="im" style="background:#8A1119">${rings}<span>Learning</span></div><div class="body"><h3>Training &amp; learning</h3><p>Pre-recorded training videos, online coaching and study material for every stage of the journey.</p><span class="go">Read more ${arr}</span></div></a>
<a class="card res" href="${L('/Testimonial')}"><div class="im" style="background:#1E5A5A">${rings}<span>Actuaries speak</span></div><div class="body"><h3>Voices of members</h3><p>Hear from members and meet some of the people who built careers in actuarial science.</p><span class="go">Read more ${arr}</span></div></a>
</div></div></section>

<section class="paper"><div class="wrap about"><div><div class="eyebrow">About the Institute</div><h2 style="font-size:clamp(34px,4vw,50px);margin:22px 0">A statutory body for a profession built on <em>trust</em>.</h2><a class="link" href="${L('/about-iai')}">Read more about IAI ${arr}</a></div>
<div><p class="txt">The Institute of Actuaries of India is a statutory body established under The Actuaries Act, 2006 (35 of 2006) for the regulation of the profession of actuaries in India. The provisions of the Act came into force on 10 November 2006, by notification of the Government of India, Ministry of Finance, Department of Economic Affairs.</p>
<div class="facts"><div><b>2006</b><span>The Actuaries Act, in force from 10 Nov 2006</span></div><div><b>12 + 2</b><span>Elected fellow members plus government nominees on the Council</span></div><div><b>1944</b><span>Actuarial Society of India established</span></div></div>
<div class="vmv"><a href="${L('/vision-mission')}"><b>Vision</b><span>Where the Institute is headed</span></a><a href="${L('/vision-mission')}"><b>Mission</b><span>What the Institute does</span></a><a href="${L('/vision-mission')}"><b>Values</b><span>How the Institute acts</span></a></div></div></div></section>

<div class="partners"><div class="wrap"><p>Employers and partners across the actuarial community</p><div class="row logos">${[['allianz', 'Allianz'], ['gicre', 'GIC Re'], ['lic', 'LIC'], ['milliman', 'Milliman'], ['wtw', 'WTW'], ['tataaia', 'Tata AIA'], ['rbi', 'RBI'], ['pfrda', 'PFRDA'], ['oriental', 'The Oriental Insurance'], ['uiic', 'United India Insurance']].map(([f, n]) => `<a href="${L('/placement-cell')}" aria-label="${n}"><img src="assets/img/partner-${f}.png" alt="${n}" loading="lazy"></a>`).join('')}</div></div></div>`;
const homeB = SITE_B ? (await import('./themes/b-home.mjs')).default({ L, annRow, ANN, EV, GCA, tickSet, arr, ico, PORTAL, abs, findHref }) : '';
write('index.html', head('Home', navHtml) + `<main id="main">${SITE_B ? homeB : home}</main>` + foot);

/* ---------- link audit ---------- */
const files = new Set(readdirSync(OUT));
let bad = 0, totalLinks = 0, ext = 0;
for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const html = readFileSync(join(OUT, f), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) { ext++; continue; }
    if (u.includes("'+") || u.startsWith('b/') || u.startsWith('../')) continue; // design switcher links resolve only in the combined deploy
    totalLinks++;
    const path = u.split('#')[0].split('?')[0];
    if (!path) continue;
    const ok = files.has(path) || (path.startsWith('assets/') && (() => { try { readFileSync(join(OUT, path)); return true; } catch { return false; } })());
    if (!ok) { bad++; if (bad < 25) console.log('BROKEN', f, '->', u); }
  }
  if (/href="#"/.test(html)) console.log('placeholder # link in', f);
}
console.log(`pages written: ${count}; local links checked: ${totalLinks}; broken: ${bad}; external: ${ext}`);
