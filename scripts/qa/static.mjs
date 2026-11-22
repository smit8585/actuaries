// Static HTML checks across every generated page. Run: node scripts/qa/static.mjs
import { readFileSync, readdirSync } from 'node:fs';
const files = readdirSync('site').filter(f => f.endsWith('.html'));
const bad = {}; const titles = {};
const add = (k, f, d = '') => { (bad[k] = bad[k] || []).push(f + (d ? ' ' + d : '')); };
const count = (h, re) => (h.match(re) || []).length;
for (const f of files) {
  const raw = readFileSync('site/' + f, 'utf8');
  const h = raw.replace(/<script[\s\S]*?<\/script>/g, '');
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; (titles[t] = titles[t] || []).push(f);
  for (const tag of ['div', 'table', 'ul', 'ol', 'tr', 'td', 'th', 'nav', 'details', 'iframe', 'a', 'section', 'main', 'footer', 'header', 'button', 'select', 'form']) {
    const o = count(h, new RegExp('<' + tag + '(?=[\\s>])', 'g')), c = count(h, new RegExp('</' + tag + '>', 'g'));
    if (o !== c) add('unbalanced-' + tag, f, o + '/' + c);
  }
  if (/__ORGCHART__|\bundefined\b|\[object|>NaN</.test(h)) add('leak', f);
  if (/�/.test(h)) add('mojibake', f);
  if (/href=""/.test(h)) add('empty-href', f);
  if (/<a [^>]*>\s*<\/a>/.test(h)) add('empty-anchor', f);
  if (/<img(?![^>]*\balt=)/.test(h)) add('img-no-alt', f);
  if (count(h, /<h1[\s>]/g) !== 1) add('h1-count', f, count(h, /<h1[\s>]/g));
  if (/<main[^>]*>[\s\S]*<main/.test(h)) add('nested-main', f);
  if (!/<meta name="viewport"/.test(h)) add('no-viewport', f);
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) add('dup-id', f, dup[0]);
  if (/target="_blank"(?![^>]*noopener)/.test(h)) add('blank-no-rel', f);
}
for (const [t, f] of Object.entries(titles)) if (f.length > 1) add('dup-title', t, '-> ' + f.slice(0, 3).join(', '));
const keys = Object.keys(bad);
if (!keys.length) console.log('static checks: all clean on', files.length, 'pages');
for (const k of keys) console.log(k.padEnd(22), String(bad[k].length).padStart(4), bad[k].slice(0, 3).join(' | '));
console.log('pages checked:', files.length);
