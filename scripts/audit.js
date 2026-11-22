(() => {
const out = { url: location.pathname, vw: innerWidth };
const rgba = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
const bgOf = el => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] === 1) break; } let base = [255, 255, 255]; for (let i = layers.length - 1; i >= 0; i--) { const c = layers[i]; base = base.map((b, k) => c[k] * c[3] + b * (1 - c[3])); } return base; };
const Lm = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
const ratio = (a, b) => { const x = Lm(a), y = Lm(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const seen = new Map();
const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (w.nextNode()) {
  const n = w.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement;
  if (!el || el.closest('script,style,noscript')) continue; const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
  const fg = rgba(cs.color), bg = bgOf(el), fa = fg[3]; const fgc = fg.slice(0, 3).map((v, k) => v * fa + bg[k] * (1 - fa));
  const cr = ratio(fgc, bg), size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700, large = size >= 24 || (size >= 18.66 && bold), need = large ? 3 : 4.5;
  if (cr < need) { const key = cs.color + '|' + bg.join(',') + '|' + size; if (!seen.has(key)) seen.set(key, { ratio: +cr.toFixed(2), need, size, text: n.nodeValue.trim().slice(0, 36), sel: el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ')[0], n: 0 }); seen.get(key).n++; }
}
out.contrast = [...seen.values()].slice(0, 12);
const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => h.offsetParent !== null).map(h => +h.tagName[1]);
out.h1 = hs.filter(x => x === 1).length; out.headingSkips = hs.some((l, i) => i && l - hs[i - 1] > 1) ? hs.join('') : 'none';
const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; };
const tg = [...document.querySelectorAll('header a, header button, nav a, nav button, .side a, .btn, button, .filters button, .crumbs a, summary, input, footer a, .card, .list a')].filter(vis);
const small = tg.filter(e => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44; });
out.targets = { total: tg.length, under44: small.length, under24: tg.filter(e => { const r = e.getBoundingClientRect(); return r.height < 24 || r.width < 24; }).map(e => (e.tagName + ':' + (e.textContent || '').trim().slice(0, 18))).slice(0, 8) };
out.imgNoAlt = [...document.images].filter(i => !i.hasAttribute('alt')).length;
out.emptyAlt = [...document.images].filter(i => i.getAttribute('alt') === '' && i.closest('a') && !i.closest('a').textContent.trim()).length;
out.emptyLinks = [...document.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]:not([alt=""])')).length;
out.hashLinks = document.querySelectorAll('a[href="#"]').length;
out.iframeNoTitle = [...document.querySelectorAll('iframe')].filter(f => !f.title).length;
out.blankNoRel = [...document.querySelectorAll('a[target=_blank]')].filter(a => !/noopener/.test(a.rel)).length;
out.externalLinks = document.querySelectorAll('a[target=_blank]').length;
out.inputsNoLabel = [...document.querySelectorAll('input,select,textarea')].filter(i => !i.getAttribute('aria-label') && !i.labels?.length && !i.getAttribute('aria-labelledby')).length;
out.landmarks = { header: document.querySelectorAll('header').length, nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main').length, footer: document.querySelectorAll('footer').length };
out.lang = document.documentElement.lang; out.title = document.title;
const ids = [...document.querySelectorAll('[id]')].map(e => e.id); out.dupIds = ids.filter((x, i) => ids.indexOf(x) !== i).slice(0, 5);
out.hscroll = document.documentElement.scrollWidth > innerWidth;
out.dupLinkText = (() => { const m = {}; document.querySelectorAll('main a').forEach(a => { const t = a.textContent.trim().toLowerCase(); if (['read more', 'open', 'details', 'explore', 'open document', 'download', 'view link', 'learn more'].includes(t)) m[t] = (m[t] || 0) + 1; }); return m; })();
// focus visibility on first focusable elements
const foc = [...document.querySelectorAll('a[href],button,input,summary,[tabindex]')].filter(vis).slice(0, 60);
let noRing = [];
for (const e of foc) { e.focus({ preventScroll: true }); const cs = getComputedStyle(e); const ok = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'; if (!ok) noRing.push(e.tagName + ':' + (e.textContent || '').trim().slice(0, 16)); }
out.focusNoRing = noRing.slice(0, 8); out.focusChecked = foc.length;
document.activeElement && document.activeElement.blur();
out.tabStopsBeforeMain = (() => { const all = [...document.querySelectorAll('a[href],button,input,summary,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(vis); const main = document.getElementById('main'); let n = 0; for (const e of all) { if (main && (main.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING) && !main.contains(e) || main && main.contains(e)) break; n++; } return n; })();
out.sidebar = (() => { const s = document.querySelector('.side'); if (!s) return null; const r = s.getBoundingClientRect(); return { h: Math.round(r.height), sticky: getComputedStyle(s).position, links: s.querySelectorAll('a').length, viewportH: innerHeight, overflowsViewport: r.height > innerHeight - 140 }; })();
out.bytes = document.documentElement.outerHTML.length;
return JSON.stringify(out);
})()
