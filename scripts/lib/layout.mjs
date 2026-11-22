// Shared layout pieces: header (with mega menu), footer, page shells.
export const arr = `<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
export const PORTAL = {
  login: 'https://member.actuariesindia.org/member/login',
  acetSignup: 'https://member.actuariesindia.org/acetstudents',
  acetLogin: 'https://member.actuariesindia.org/acetstudents/login',
  jobs: 'https://member.actuariesindia.org/actujobs/home/',
  admission: 'https://member.actuariesindia.org/admission',
};
const ICON = {
  cap: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};
export const ico = k => `<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg></span>`;
const svgi = k => `<svg class="si" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;
const mark = () => `<img class="mark" src="assets/img/logo.png" alt="" width="54" height="50">`;

export const FOOTER_LINKS = {
  quick: [['Home', 'index.html'], ['Member Login', PORTAL.login], ['Contact Us', 'contact-us.html'], ['Career', 'career.html'], ['Privacy Policy', 'privacy-policy.html']],
  links: [['Cookies Policy', 'cookies-policy.html'], ['Disclaimer', 'disclaimer-new.html'], ['Terms & Conditions', 'terms-conditions.html'], ['Help', 'help.html'], ['Sitemap', 'sitemap.html']],
  other: [['Web Information Manager', 'web-information-manager.html'], ['Vision & Mission', 'vision-mission.html'], ['IAI Logo', 'iai-logo.html'], ['Enquiry form', 'contact-us.html#enquiry']],
};
const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
const lk = ([t, h]) => `<li><a href="${h}"${ext(h)}>${t.replace(/&/g, '&amp;')}</a></li>`;

export function head(title, navHtml, opts = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Institute of Actuaries of India</title>
<meta name="description" content="${opts.description || 'Institute of Actuaries of India — statutory body for the actuarial profession. Design exploration, Direction A.'}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css"><script src="assets/site.js" defer></script></head><body>
<a href="#main" class="skip">Skip to content</a>
<div class="util"><div class="wrap"><span class="t">Statutory body under the Actuaries Act, 2006</span>
<nav aria-label="Utility"><a href="annual-membership.html">Annual Membership</a><a href="${PORTAL.acetSignup}" target="_blank" rel="noopener">ACET Sign Up</a><a href="${PORTAL.acetLogin}" target="_blank" rel="noopener">ACET Login</a><a href="${PORTAL.login}" target="_blank" rel="noopener">Member Login</a><a href="${PORTAL.jobs}" target="_blank" rel="noopener" class="jobs">ActuJobs</a></nav></div></div>
<header class="site"><div class="wrap">
<a class="brand" href="index.html" aria-label="Institute of Actuaries of India — home">${mark()}<span><span class="a">Institute of</span><span class="b">Actuaries of India</span></span></a>
<nav class="primary" id="nav" aria-label="Primary">${navHtml}</nav>
<div class="actions"><a class="iconbtn" href="search.html" aria-label="Search the site">${svgi('search')}</a><a class="btn red sm" href="${PORTAL.admission}" target="_blank" rel="noopener">Admission</a>
<button class="menu-btn" id="menu-btn" aria-label="Menu" aria-controls="nav" aria-expanded="false"><span aria-hidden="true">☰</span></button></div>
</div></header>`;
}

export const foot = `<footer class="site"><div class="wrap"><div class="cols">
<div><img src="assets/img/logo-white.png" alt="Institute of Actuaries of India" style="width:280px;height:auto"><p>A statutory body established under The Actuaries Act, 2006 for regulation of the profession of actuaries in India.</p>
<p><a class="link" style="color:#fff" href="contact-us.html">Contact us ${arr}</a></p></div>
<div><p class="fh">Quick links</p><ul>${FOOTER_LINKS.quick.map(lk).join('')}</ul></div>
<div><p class="fh">Links</p><ul>${FOOTER_LINKS.links.map(lk).join('')}</ul></div>
<div><p class="fh">Other links</p><ul>${FOOTER_LINKS.other.map(lk).join('')}</ul>
<p class="fh" style="margin-top:22px">Follow</p><ul class="social"><li><a href="https://x.com/actuariesindia" target="_blank" rel="noopener">X</a></li><li><a href="https://www.facebook.com/actuariesindia" target="_blank" rel="noopener">Facebook</a></li><li><a href="https://www.instagram.com/actuariesindia/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.youtube.com/user/IAIMumbai" target="_blank" rel="noopener">YouTube</a></li></ul></div>
</div><div class="copy">© Copyright Institute of Actuaries of India (IAI). All Rights Reserved.</div></div></footer>
</body></html>`;

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function shell({ title, crumbs = [], lead = '', side = null, sideTitle = '', body, navHtml, prev = null, next = null, help = true }) {
  const cr = crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`}</li>`).join('');
  const sidebar = side && side.length ? `<nav class="side" aria-label="In this section"><button class="side-toggle" type="button" aria-expanded="false" aria-controls="sidelist"><span>In this section</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="sidelist" class="sidelist"><p class="side-h">${esc(sideTitle)}</p>${side.map(s => sideItem(s)).join('')}</div></nav>` : '';
  const pn = (prev || next) ? `<nav class="pn" aria-label="Previous and next pages">${prev ? `<a class="prev" href="${prev.href}"><small>Previous</small><span>${esc(prev.text)}</span></a>` : '<span></span>'}${next ? `<a class="next" href="${next.href}"><small>Next</small><span>${esc(next.text)}</span></a>` : '<span></span>'}</nav>` : '';
  const helpBox = help ? `<aside class="help" aria-label="Need help?"><p class="fh2">Can’t find what you need?</p><p>Search the whole site or contact the right department at the Institute.</p><div class="row"><a class="btn ghost sm" href="search.html">Search the site</a><a class="btn primary sm" href="contact-us.html">Contact the Institute</a></div></aside>` : '';
  return head(esc(title), navHtml) + `<main id="main"><div class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li>${cr}<li><span aria-current="page">${esc(title)}</span></li></ol></nav>
<h1>${esc(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></div>
<div class="wrap layout${sidebar ? '' : ' nosidebar'}">${sidebar}<div class="content"><div class="prose">${body}</div>${pn}${helpBox}</div></div></main>` + foot;
}
function sideItem(s) {
  const e = /^https?:/.test(s.href || '');
  const hasKids = s.children && s.children.length;
  const a = s.href ? `<a${hasKids ? ' class="has-sub"' : ''} href="${s.href}"${s.current ? ' aria-current="page"' : ''}${e ? ' target="_blank" rel="noopener"' : ''}>${esc(s.text)}</a>` : `<span class="nolink">${esc(s.text)}</span>`;
  const kids = hasKids ? `<div class="sub">${s.children.map(c => sideItem(c)).join('')}</div>` : '';
  return a + kids;
}
