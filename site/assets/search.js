/* Site search: word-prefix matching over title + text, highlighting, keyboard navigation, paging */
(function () {
  'use strict';
  var q = document.getElementById('q'), res = document.getElementById('results'), cnt = document.getElementById('count'), empty = document.getElementById('empty');
  var PAGE = 20, shown = PAGE, hits = [], terms = [];
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var rx = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  function hl(text, res_) { return res_.length ? esc(text).replace(new RegExp('(' + res_.map(function (t) { return '\\b' + rx(esc(t)); }).join('|') + ')', 'gi'), '<mark>$1</mark>') : esc(text); }
  function snippet(text, ts) {
    var m = new RegExp('\\b' + rx(ts[0]), 'i').exec(text); var i = m ? m.index : 0;
    var start = Math.max(0, i - 70); var s = text.slice(start, start + 190);
    return (start > 0 ? '… ' : '') + s + (start + 190 < text.length ? ' …' : '');
  }
  function search(query) {
    terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var res_ = terms.map(function (t) { return new RegExp('\\b' + rx(t), 'i'); });
    var phrase = terms.length > 1 ? new RegExp(rx(terms.join(' ')), 'i') : null;
    return window.SEARCH_INDEX.map(function (r) {
      var score = 0;
      for (var i = 0; i < res_.length; i++) {
        var inT = res_[i].test(r[0]), inX = res_[i].test(r[2]);
        if (!inT && !inX) return null;
        score += (inT ? 10 : 0) + (inX ? 2 : 0);
        if (new RegExp('\\b' + rx(terms[i]) + '\\b', 'i').test(r[0])) score += 5;
      }
      if (phrase && phrase.test(r[0])) score += 15;
      return [score, r];
    }).filter(Boolean).sort(function (a, b) { return b[0] - a[0] || a[1][0].localeCompare(b[1][0]); });
  }
  function render() {
    var list = hits.slice(0, shown);
    res.innerHTML = list.map(function (h) {
      var r = h[1];
      return '<a class="res-item" href="' + r[1] + '"><b>' + hl(r[0], terms) + '</b><span>' + hl(snippet(r[2], terms), terms) + '</span></a>';
    }).join('') + (hits.length > shown ? '<button type="button" class="btn ghost sm more-res">Show ' + Math.min(PAGE, hits.length - shown) + ' more results</button>' : '');
    var b = res.querySelector('.more-res');
    if (b) b.addEventListener('click', function () { shown += PAGE; render(); var links = res.querySelectorAll('.res-item'); if (links[shown - PAGE]) links[shown - PAGE].focus(); });
  }
  function run() {
    var t = q.value.trim();
    shown = PAGE;
    if (t.length < 2) { res.innerHTML = ''; cnt.textContent = t ? 'Type at least two characters.' : ''; empty.hidden = false; return; }
    hits = search(t);
    if (!hits.length) {
      res.innerHTML = '';
      cnt.textContent = 'No results for “' + t + '”. Try fewer or different words, or start from a popular page below.';
      empty.hidden = false; return;
    }
    empty.hidden = true;
    cnt.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + t + '”';
    render();
  }
  q.addEventListener('input', run);
  q.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { var f = res.querySelector('.res-item'); if (f) { e.preventDefault(); f.focus(); } } });
  res.addEventListener('keydown', function (e) {
    var links = [].slice.call(res.querySelectorAll('.res-item')), i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[i]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (i === 0) q.focus(); else links[i - 1].focus(); }
  });
  var u = new URLSearchParams(location.search).get('q'); if (u) q.value = u; else q.focus();
  run();
})();
