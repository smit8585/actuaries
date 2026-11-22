export const ORIGIN = /^https?:\/\/(www\.)?actuariesindia\.org/i;
export const FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|png|jpe?g|gif|rar|mp4|mp3|PDF)$/i;
export const slugOf = (href) => {
  let u; try { u = new URL(href, 'https://www.actuariesindia.org/'); } catch { return null; }
  if (!ORIGIN.test(u.origin)) return null;
  let s = decodeURIComponent(u.pathname).replace(/^\/|\/$/g, '');
  if (!s) return u.search ? null : 'home';
  if (FILE_RE.test(s)) return null;
  if (u.search) s += '__' + u.search.replace(/[^a-zA-Z0-9]/g, '_');
  return s.replace(/\//g, '__');
};
export const fileOf = (slug) => slug === 'home' ? 'index.html' : slug.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') + '.html';
export const dec = s => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rsquo;/g, '’');
export const textOf = h => dec(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
