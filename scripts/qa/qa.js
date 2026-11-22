/* In-browser QA checks. QA(win, width) -> { fails: {check: detail}, info: {...} } */
window.QA = async function (win, W) {
  const d = win.document, gcs = e => win.getComputedStyle(e);
  const fails = {}, info = {};
  const fail = (k, v) => { (fails[k] = fails[k] || []).push(v); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const vis = e => { const r = e.getBoundingClientRect(), c = gcs(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const txt = e => (e.textContent || '').replace(/\s+/g, ' ').trim();
  const mobile = W < 700;

  /* ---------- structure ---------- */
  if (d.documentElement.lang !== 'en') fail('lang', d.documentElement.lang);
  if (!d.title || d.title.length < 8) fail('title', d.title);
  const cnt = s => d.querySelectorAll(s).length;
  if (cnt('main') !== 1) fail('landmark-main', cnt('main'));
  if (cnt('footer') !== 1) fail('landmark-footer', cnt('footer'));
  if (cnt('header') !== 1) fail('landmark-header', cnt('header'));
  const navs = [...d.querySelectorAll('nav')]; if (navs.length > 1 && navs.some(n => !n.getAttribute('aria-label'))) fail('nav-unlabelled', navs.length);
  if (cnt('h1') !== 1) fail('h1-count', cnt('h1'));
  const hs = [...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(h => +h.tagName[1]);
  hs.forEach((l, i) => { if (i && l - hs[i - 1] > 1) fail('heading-skip', hs.slice(Math.max(0, i - 2), i + 1).join('>')); });
  const ids = [...d.querySelectorAll('[id]')].map(e => e.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) fail('dup-id', dup[0]);
  if (!d.querySelector('a.skip')) fail('skip-link', 'missing');
  const mainTxt = txt(d.querySelector('main') || d.body);
  if (mainTxt.length < 140 && !d.querySelector('main iframe, main img, main video')) fail('thin-page', mainTxt.length);
  const isHome = /index\.html$|\/$/.test(win.location.pathname); const crumbs = d.querySelector('.crumbs ol'); if (isHome) {} else if (!crumbs) fail('breadcrumb', 'missing'); else if (!crumbs.querySelector('[aria-current=page]')) fail('breadcrumb-current', 'missing');

  /* ---------- images, frames, links ---------- */
  [...d.images].forEach(i => { if (!i.hasAttribute('alt')) fail('img-alt', i.getAttribute('src')); if (i.complete && i.naturalWidth === 0 && i.src) fail('img-broken', i.getAttribute('src')); });
  [...d.querySelectorAll('iframe')].forEach(f => { if (!f.title) fail('iframe-title', f.src); });
  const GEN = /^(download|view link|open document|view|open|read more|click here|here|more|details|link|register|login|view all|learn more)$/i;
  [...d.querySelectorAll('a')].forEach(a => {
    const name = (a.getAttribute('aria-label') || txt(a) || (a.querySelector('img[alt]') || {}).alt || '').trim();
    if (!name) fail('link-name', a.getAttribute('href'));
    else if (GEN.test(txt(a)) && !a.getAttribute('aria-label')) fail('link-generic', txt(a));
    if (a.target === '_blank' && !/noopener/.test(a.rel)) fail('blank-rel', a.getAttribute('href'));
    const h = a.getAttribute('href'); if (h === '#' || h === '' || h === null) fail('dead-link', h);
    if (h && h.startsWith('#') && h.length > 1 && !d.getElementById(h.slice(1))) fail('anchor-missing', h);
  });
  [...d.querySelectorAll('button')].forEach(b => { if (!(b.getAttribute('aria-label') || txt(b))) fail('button-name', b.className); });
  [...d.querySelectorAll('input,select,textarea')].forEach(i => { if (!(i.getAttribute('aria-label') || (i.labels && i.labels.length))) fail('input-label', i.name || i.type); });
  [...d.querySelectorAll('table')].forEach(t => {
    if (!t.querySelector('th') && t.getAttribute('role') !== 'presentation') fail('table-th', 'no headers');
    const rows = t.querySelectorAll('tbody tr').length; const wrap = t.closest('.tablewrap'); if (t.getAttribute('role') === 'presentation') return;
    if (!wrap) fail('table-wrap', 'no wrapper'); else if (rows > 6 && !wrap.querySelector('.tfilter input')) fail('table-filter', rows);
  });

  /* ---------- layout / overflow ---------- */
  const de = d.documentElement;
  if (de.scrollWidth > W + 1) {
    const off = [...d.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > W + 1 && vis(e) && !e.closest('.mega') && !(e.closest('nav.primary') && !d.getElementById('nav').classList.contains('open'))).slice(0, 3).map(e => e.tagName + '.' + String(e.className).split(' ')[0] + '<' + (e.parentElement ? e.parentElement.tagName + '.' + String(e.parentElement.className).split(' ')[0] : '') + ' ' + Math.round(e.getBoundingClientRect().right));
    fail('h-overflow', `${de.scrollWidth}>${W} ${off.join(',')}`);
  }

  /* ---------- contrast ---------- */
  const rgba = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const bgOf = el => { const L = []; for (let e = el; e; e = e.parentElement) { const c = rgba(gcs(e).backgroundColor); if (c[3] > 0) L.push(c); if (c[3] === 1) break; } let b = [255, 255, 255]; for (let i = L.length - 1; i >= 0; i--) { const c = L[i]; b = b.map((v, k) => c[k] * c[3] + v * (1 - c[3])); } return b; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const seen = new Set(); const tw = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) {
    const n = tw.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || el.closest('script,style,noscript') || !vis(el)) continue;
    const cs = gcs(el), fg = rgba(cs.color), bg = bgOf(el), fa = fg[3]; const fgc = fg.slice(0, 3).map((v, k) => v * fa + bg[k] * (1 - fa));
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700, need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5, cr = ratio(fgc, bg);
    if (cr < need) { const k = cs.color + bg + size; if (!seen.has(k)) { seen.add(k); fail('contrast', `${cr.toFixed(2)}<${need} "${n.nodeValue.trim().slice(0, 24)}"`); } }
  }

  /* ---------- target size ---------- */
  const tsel = 'header a, header button, nav a, nav button, .side a, .side button, footer a, .btn, button, summary, input, .crumbs a, .pn a, .popular a';
  [...d.querySelectorAll(tsel)].filter(vis).forEach(e => {
    const r = e.getBoundingClientRect(), min = (mobile && !e.closest('.mega')) ? 44 : 24;
    if (e.closest('.skip')) return;
    if (r.height < min - 0.5 || r.width < min - 0.5) fail(mobile ? 'target-44' : 'target-24', `${e.tagName}:${txt(e).slice(0, 18)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  });

  /* ---------- focus visibility: a global :focus-visible outline rule must exist and nothing may remove outlines ---------- */
  { let ok = false, killed = null; for (const ss of d.styleSheets) { let rules; try { rules = ss.cssRules; } catch (e) { continue; } for (const r of rules) { if (r.selectorText && /(^|,)\s*:focus-visible/.test(r.selectorText) && r.style.outlineStyle && r.style.outlineStyle !== 'none' || (r.selectorText === ':focus-visible' && r.style.outline)) ok = true; if (r.selectorText && /:focus/.test(r.selectorText) && /outline\s*:\s*(none|0)/.test(r.cssText) && !/outline-offset/.test(r.cssText)) killed = r.selectorText; } } if (!ok) fail('focus-rule', 'no :focus-visible outline rule'); if (killed) fail('focus-removed', killed); }

  /* ---------- header / menu behaviour ---------- */
  const hdr = d.querySelector('header.site'), nav = d.getElementById('nav');
  const fire = (el, type, opts) => el.dispatchEvent(new win.PointerEvent(type, Object.assign({ bubbles: true, pointerType: 'mouse' }, opts)));
  const key = (el, k) => el.dispatchEvent(new win.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const lis = [...d.querySelectorAll('#nav .has-mega')];
  if (lis.length !== 5) fail('menu-count', lis.length);
  if (W >= 1300) {
    // geometry: no hover dead zone
    const hb = hdr.getBoundingClientRect().bottom;
    lis.forEach(li => { const r = li.getBoundingClientRect(); if (r.bottom < hb - 1) fail('menu-dead-zone', `${txt(li.querySelector('.top'))}: ${Math.round(hb - r.bottom)}px`); });
    // click open/close, aria, escape + focus return
    const li0 = lis[3], btn = li0.querySelector('.chevbtn'), panel = li0.querySelector('.mega');
    btn.click(); await sleep(20);
    if (gcs(panel).display === 'none' || btn.getAttribute('aria-expanded') !== 'true') fail('menu-click-open', 'panel not shown');
    const pr = panel.getBoundingClientRect(); if (pr.height > win.innerHeight + 2) fail('menu-too-tall', Math.round(pr.height)); if (pr.right > W + 1) fail('menu-wide', Math.round(pr.right));
    const link = panel.querySelector('.mega-in a'); link.focus(); key(link, 'Escape'); await sleep(20);
    if (gcs(panel).display !== 'none') fail('menu-escape', 'still visible'); else if (d.activeElement !== btn) fail('menu-escape-focus', d.activeElement.tagName);
    // arrow keys
    const top = lis[0].querySelector('.top'); top.focus(); key(top, 'ArrowDown'); await sleep(20);
    const first = lis[0].querySelector('.mega a'); if (d.activeElement !== first) fail('menu-arrowdown', 'focus not in panel');
    key(first, 'ArrowDown'); if (!lis[0].querySelector('.mega').contains(d.activeElement) || d.activeElement === first) fail('menu-arrow-nav', 'no movement');
    key(d.activeElement, 'Escape'); await sleep(20);
    // hover intent
    const li1 = lis[1]; fire(li1, 'pointerenter'); await sleep(160);
    if (!li1.classList.contains('open')) fail('menu-hover-open', 'not opened'); fire(li1, 'pointerleave'); await sleep(40);
    if (!li1.classList.contains('open')) fail('menu-hover-intent', 'closed instantly (no delay)'); await sleep(260);
    if (li1.classList.contains('open')) fail('menu-hover-close', 'stayed open');
    // current section marked on section pages
    if (d.querySelector('#nav [aria-current]') && !d.querySelector('#nav .top[aria-current]')) fail('menu-current', 'bad');
  } else {
    const mb = d.getElementById('menu-btn'); mb.click(); await sleep(20);
    if (!nav.classList.contains('open') || mb.getAttribute('aria-expanded') !== 'true') fail('mobile-menu-open', 'not open');
    const li = lis[0], b = li.querySelector('.chevbtn'); b.click(); await sleep(20);
    if (gcs(li.querySelector('.mega')).display === 'none') fail('mobile-accordion', 'not expanded');
    if (li.querySelector('.mega').getBoundingClientRect().right > W + 1) fail('mobile-menu-wide', 'overflow');
    key(b, 'Escape'); await sleep(20); mb.click();
    const sb = d.querySelector('.side-toggle');
    if (sb) {
      const list = d.getElementById('sidelist');
      if (gcs(list).display !== 'none') fail('side-collapsed', 'sidebar not collapsed on mobile');
      const mainTop = d.querySelector('.content').getBoundingClientRect().top; if (mainTop > 620) fail('content-below-fold', Math.round(mainTop));
      sb.click(); await sleep(20); if (gcs(list).display === 'none') fail('side-toggle', 'does not open'); sb.click();
    }
  }
  /* ---------- sidebar (desktop) ---------- */
  const side = d.querySelector('.side');
  if (side && W >= 1300) {
    if (!side.querySelector('[aria-current=page]')) fail('side-current', 'no current page marked');
    const sr = side.getBoundingClientRect(); const cs = gcs(side); if (cs.maxHeight === 'none') fail('side-maxheight', 'unbounded');
  }
  /* ---------- table filter ---------- */
  const tf = d.querySelector('.tfilter input');
  if (tf) {
    const wrap = tf.closest('.tablewrap'), rows = [...wrap.querySelectorAll('tbody tr')];
    const word = (txt(rows[0]).match(/\S{2,}/) || ['a'])[0];
    tf.value = word; tf.dispatchEvent(new win.Event('input', { bubbles: true }));
    const shown = rows.filter(r => !r.hidden).length; if (shown === 0) fail('table-filter-works', 'no rows for ' + word);
    tf.value = 'zzzqqxx'; tf.dispatchEvent(new win.Event('input', { bubbles: true }));
    if (rows.filter(r => !r.hidden).length !== 0 || !txt(wrap.querySelector('.tcount'))) fail('table-filter-empty', 'no empty message');
    tf.value = ''; tf.dispatchEvent(new win.Event('input', { bubbles: true }));
    if (rows.some(r => r.hidden)) fail('table-filter-reset', 'rows stay hidden');
  }
  info.h1 = txt(d.querySelector('h1')); info.bytes = d.documentElement.outerHTML.length;
  return { fails, info };
};
