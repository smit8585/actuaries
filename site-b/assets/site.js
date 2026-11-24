/* IAI prototype · behaviour: mega menu (hover-intent + click + keyboard), mobile nav, sidebar, table filters */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var isDesktop = function () { return window.matchMedia('(min-width:1281px)').matches; };

  /* ---------- Mega menu ---------- */
  var items = $$('#nav .has-mega');
  var timers = new Map();
  function setOpen(li, open) {
    li.classList.toggle('open', open);
    var b = $('.chevbtn', li); if (b) b.setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) { items.forEach(function (l) { if (l !== except) setOpen(l, false); }); }
  function panelLinks(li) { return $$('.mega a', li).filter(function (a) { return a.offsetParent !== null; }); }
  function topControls() { return $$('#nav .navlist > li > .top').filter(function (a) { return a.offsetParent !== null; }); }

  items.forEach(function (li) {
    var btn = $('.chevbtn', li);
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = !li.classList.contains('open');
      closeAll(li); setOpen(li, o);
    });
    li.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !isDesktop()) return;
      clearTimeout(timers.get(li));
      timers.set(li, setTimeout(function () { closeAll(li); setOpen(li, true); }, 90));
    });
    li.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !isDesktop()) return;
      clearTimeout(timers.get(li));
      timers.set(li, setTimeout(function () { setOpen(li, false); }, 220));
    });
    li.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !li.contains(e.relatedTarget)) setOpen(li, false);
    });
    li.addEventListener('keydown', function (e) {
      var k = e.key, t = e.target;
      var inPanel = !!t.closest('.mega');
      if (k === 'Escape' && li.classList.contains('open')) {
        e.preventDefault(); e.stopPropagation(); setOpen(li, false); btn.focus(); return;
      }
      if (!inPanel) {
        if (k === 'ArrowDown') { e.preventDefault(); closeAll(li); setOpen(li, true); var f = panelLinks(li)[0]; if (f) f.focus(); }
        else if (k === 'ArrowRight' || k === 'ArrowLeft') {
          if (t === btn) return;
          e.preventDefault();
          var c = topControls(), i = c.indexOf(t), n = c[(i + (k === 'ArrowRight' ? 1 : c.length - 1)) % c.length];
          if (n) n.focus();
        }
      } else {
        var l = panelLinks(li), idx = l.indexOf(t);
        if (k === 'ArrowDown') { e.preventDefault(); (l[idx + 1] || l[0]).focus(); }
        else if (k === 'ArrowUp') { e.preventDefault(); if (idx <= 0) btn.focus(); else l[idx - 1].focus(); }
        else if (k === 'Home') { e.preventDefault(); l[0].focus(); }
        else if (k === 'End') { e.preventDefault(); l[l.length - 1].focus(); }
      }
    });
  });
  // Career (plain link) also takes part in left/right roving
  $$('#nav .navlist > li > .top:not(.has-mega .top)').forEach(function (a) {
    a.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var c = topControls(), i = c.indexOf(a), n = c[(i + (e.key === 'ArrowRight' ? 1 : c.length - 1)) % c.length];
      if (n) n.focus();
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#nav')) closeAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeAll();
    var nav = $('#nav'), mb = $('#menu-btn');
    if (nav && nav.classList.contains('open')) { nav.classList.remove('open'); if (mb) { mb.setAttribute('aria-expanded', 'false'); mb.focus(); } }
  });

  /* ---------- Mobile nav ---------- */
  var mb = $('#menu-btn'), nav = $('#nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(o));
      if (!o) closeAll();
    });
    window.addEventListener('resize', function () { if (isDesktop()) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- Sidebar ---------- */
  var tgl = $('.side-toggle');
  if (tgl) tgl.addEventListener('click', function () {
    var s = tgl.closest('.side'), o = s.classList.toggle('open');
    tgl.setAttribute('aria-expanded', String(o));
  });
  $$('.side .sub').forEach(function (sub) {
    var links = $$(':scope > a', sub);
    if (links.length <= 10) return;
    var hasCurrent = links.slice(8).some(function (a) { return a.getAttribute('aria-current'); });
    if (hasCurrent) return;
    links.slice(8).forEach(function (a) { a.hidden = true; });
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'more'; b.textContent = 'Show ' + (links.length - 8) + ' more';
    b.addEventListener('click', function () { links.forEach(function (a) { a.hidden = false; }); b.remove(); });
    sub.appendChild(b);
  });

  /* ---------- Table filters ---------- */
  $$('.tfilter input').forEach(function (inp) {
    var wrap = inp.closest('.tablewrap');
    var rows = $$('tbody tr', wrap);
    var status = $('.tcount', wrap);
    function run() {
      var q = inp.value.trim().toLowerCase(), n = 0;
      rows.forEach(function (r) { var show = !q || r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !show; if (show) n++; });
      if (status) status.textContent = q ? (n ? 'Showing ' + n + ' of ' + rows.length + ' rows' : 'No rows match “' + inp.value + '”') : '';
    }
    inp.addEventListener('input', run);
  });
})();
