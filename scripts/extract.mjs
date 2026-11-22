// usage: node scripts/extract.mjs <crawlDir>  -> scripts/data/pages.json (+ queue of uncrawled internal links)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2];
const ORIGIN = /^https?:\/\/(www\.)?actuariesindia\.org/i;
export const slugOf = (href) => {
  let u; try { u = new URL(href, 'https://www.actuariesindia.org/'); } catch { return null; }
  if (!ORIGIN.test(u.origin)) return null;
  let s = decodeURIComponent(u.pathname).replace(/^\/|\/$/g, '');
  if (!s) return 'home';
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|png|jpe?g|gif|rar)$/i.test(s)) return null;
  if (u.search) s += '__' + u.search.replace(/[^a-zA-Z0-9]/g, '_');
  return s.replace(/\//g, '__');
};
const dec = s => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '’').replace(/&ndash;/g, '–');
const text = h => dec(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function sanitize(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|form|select|button|textarea|svg|noscript|title|template)[\s\S]*?<\/\1>/gi, '').replace(/<(input|link|meta)[^>]*>/gi, '');
  html = html.replace(/<div[^>]*class="mxgraph"[\s\S]*?<\/div>/i, '<p class="orgchart-note">__ORGCHART__</p>').replace(/<label[\s\S]*?<\/label>/gi, '');
  // keep only a safe set of attributes
  html = html.replace(/<(\w+)([^>]*)>/g, (m, tag, attrs) => {
    tag = tag.toLowerCase();
    if (['span', 'font', 'o:p', 'section', 'article', 'header', 'footer', 'div', 'center'].includes(tag)) { if (tag !== 'div' && tag !== 'section') return ''; const im = attrs.match(/\sid\s*=\s*"([^"]+)"/i); return im ? `<div id="${im[1]}">` : '<div>'; }
    const keep = [];
    for (const a of ['href', 'src', 'alt', 'colspan', 'rowspan', 'target', 'id', 'name']) {
      const mm = attrs.match(new RegExp(`\\s${a}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
      if (mm) keep.push(`${a}="${(mm[2] ?? mm[3])}"`);
    }
    const selfClose = /\/\s*$/.test(attrs) && !['a', 'p'].includes(tag) ? ' /' : '';
    return `<${tag}${keep.length ? ' ' + keep.join(' ') : ''}${selfClose}>`;
  });
  html = html.replace(/<\/section>/gi, '</div>').replace(/<\/(span|font|o:p|article|header|footer|center)>/gi, '');
  html = html.replace(/<p>\s*(&nbsp;|\s)*<\/p>/gi, '').replace(/<div>\s*<\/div>/gi, '');
  return html.replace(/\n{3,}/g, '\n\n').trim();
}

const pages = {}; const queue = new Set();
for (const f of readdirSync(dir)) {
  if (!f.startsWith('p_') || !f.endsWith('.html')) continue;
  const slug = f.slice(2, -5);
  const raw = readFileSync(join(dir, f), 'utf8');
  const t = (raw.match(/<title>([\s\S]*?)<\/title>/i) || [, slug])[1];
  const title = dec(t).split('|')[0].trim();
  // main content: article(s) inside the main content block
  const a0 = raw.indexOf('<article');
  let body = '';
  if (a0 >= 0) {
    const a1 = raw.indexOf('</article>', a0);
    body = raw.slice(raw.indexOf('>', a0) + 1, a1);
    // views (tables / listings) that follow the article inside main content
    const after = raw.slice(a1, a1 + 60000);
    const v = after.match(/<div class="views-element-container[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>|<footer|<div class="region region-footer)/);
    if (v && text(v[0]).length > 40) body += v[0];
  }
  if (text(body).length < 20) {
    const m = raw.match(/<div id="block-iai-content"[\s\S]*?(?=<\/main>|<footer)/);
    if (m) body = m[0];
  }
  const html = sanitize(body);
  pages[slug] = { slug, title, html, len: text(html).length };
  for (const m of html.matchAll(/href="([^"]+)"/g)) { const s = slugOf(m[1]); if (s) queue.add(s + '|' + m[1]); }
}
writeFileSync('scripts/data/pages.json', JSON.stringify(pages));
const missing = [...queue].filter(q => !pages[q.split('|')[0]]);
writeFileSync('scripts/data/queue.txt', [...new Set(missing.map(q => q.split('|')[1]))].join('\n'));
console.log('pages', Object.keys(pages).length, 'short(<80 chars):', Object.values(pages).filter(p => p.len < 80).map(p => p.slug + ':' + p.len).join(', '));
console.log('uncrawled internal links:', new Set(missing.map(q => q.split('|')[0])).size);
