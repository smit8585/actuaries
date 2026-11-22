// usage: node scripts/crawl-menu.mjs <home.html> -> scripts/data/menu.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');
const start = html.indexOf('id="ultimenu-main"');
const end = html.indexOf('</ul>\n', html.indexOf('region-ultimenu-main-', start) + 1);
let nav = html.slice(start, html.indexOf('</nav>', start) > 0 ? html.indexOf('</nav>', start) : start + 60000);
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const tops = nav.split('<li class="ultimenu__item').slice(1);
const menu = [];
for (const t of tops) {
  const m = t.match(/class="ultimenu__link[^"]*">([^<]*)/);
  const hm = t.match(/<a href="([^"]*)"[^>]*class="ultimenu__link/);
  const item = { name: clean(m ? m[1] : ''), href: hm ? hm[1] : '', groups: [] };
  const re = /<p[^>]*list-group-item[^>]*>([\s\S]*?)<\/p>|<(\/?)ul[^>]*>|<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  let g = null, depth = 0, last = null, x;
  const body = t.slice(t.indexOf('ultimenu__flyout') > 0 ? t.indexOf('ultimenu__flyout') : t.length);
  while ((x = re.exec(body))) {
    if (x[1] !== undefined) { g = { title: clean(x[1]), links: [] }; item.groups.push(g); depth = 0; last = null; }
    else if (x[2] !== undefined && x[0].startsWith('<ul') ) { depth++; }
    else if (x[0].startsWith('</ul')) { depth--; }
    else if (x[3] !== undefined) {
      const text = clean(x[4]); if (!text) continue;
      if (!g) { g = { title: '', links: [] }; item.groups.push(g); }
      const l = { text, href: x[3], children: [] };
      if (depth >= 2 && last) last.children.push(l); else { g.links.push(l); last = l; }
    }
  }
  if (item.name) menu.push(item);
}
mkdirSync('scripts/data', { recursive: true });
writeFileSync('scripts/data/menu.json', JSON.stringify(menu, null, 1));
const hrefs = new Set();
const walk = l => { hrefs.add(l.href); l.children.forEach(walk); };
menu.forEach(m => m.groups.forEach(g => g.links.forEach(walk)));
console.log(menu.map(m => `${m.name}: ${m.groups.map(g => g.title + '(' + g.links.length + ')').join(' | ')}`).join('\n'));
console.log('unique hrefs', hrefs.size);
