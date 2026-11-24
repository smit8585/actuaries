// Shared layout pieces: header (with mega menu), footer, page shells.
export const SITE_B = process.env.SITE === 'b';
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
<meta name="description" content="${opts.description || `Institute of Actuaries of India — statutory body for the actuarial profession. Design exploration, Direction ${SITE_B ? 'B' : 'A'}.`}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${SITE_B ? 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap' : 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap'}" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">${SITE_B ? '<link rel="stylesheet" href="assets/theme-b.css">' : ''}<script src="assets/site.js" defer></script></head><body>
<a href="#main" class="skip">Skip to content</a>
<div class="dsw-pull" aria-hidden="true"></div><div class="dsw" role="navigation" aria-label="Design direction"><span>Design preview</span><a href="${SITE_B ? '../index.html' : 'index.html'}" data-d="a"${SITE_B ? '' : ' aria-current="true"'}>A · The Institution</a><a href="${SITE_B ? 'index.html' : 'b/index.html'}" data-d="b"${SITE_B ? ' aria-current="true"' : ''}>B · The Data Lens</a></div><script>(function(){var f=location.pathname.split('/').pop()||'index.html',b=${SITE_B ? 'true' : 'false'},bar=document.querySelector('.dsw'),pg=document.querySelector('.dsw-pull');bar.querySelectorAll('a').forEach(function(a){var d=a.dataset.d;a.href=(d==='a')?(b?'../':'')+f:(b?'':'b/')+f});
var acc=0,last=0,HOLD=3000;function show(on){bar.classList.toggle('show',on);if(!on){acc=0;pg.style.transform='scaleX(0)'}}
function pull(){var n=Date.now();if(window.scrollY>0||bar.classList.contains('show'))return;if(n-last>500)acc=0;acc+=last?Math.min(n-last,200):0;last=n;pg.style.transform='scaleX('+Math.min(acc/HOLD,1)+')';if(acc>=HOLD)show(true)}
addEventListener('wheel',function(e){if(e.deltaY<0)pull();else if(bar.classList.contains('show'))show(false)},{passive:true});
var ty=null;addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});addEventListener('touchmove',function(e){if(ty!==null&&e.touches[0].clientY>ty+4)pull()},{passive:true});addEventListener('touchend',function(){ty=null;last=0;if(!bar.classList.contains('show')){acc=0;pg.style.transform='scaleX(0)'}});
addEventListener('scroll',function(){if(window.scrollY>12&&bar.classList.contains('show'))show(false)},{passive:true});
addEventListener('keydown',function(e){if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='d')show(!bar.classList.contains('show'))});
setInterval(function(){if(!bar.classList.contains('show')&&Date.now()-last>600&&acc>0){acc=0;pg.style.transform='scaleX(0)'}},400)})()</script>
<div class="util"><div class="wrap"><span class="t">Statutory body under the Actuaries Act, 2006</span>
<nav aria-label="Utility"><a href="annual-membership.html">Annual Membership</a><a href="${PORTAL.acetSignup}" target="_blank" rel="noopener">ACET Sign Up</a><a href="${PORTAL.acetLogin}" target="_blank" rel="noopener">ACET Login</a><a href="${PORTAL.login}" target="_blank" rel="noopener">Member Login</a><a href="${PORTAL.jobs}" target="_blank" rel="noopener" class="jobs">ActuJobs</a></nav></div></div>
<header class="site"><div class="wrap">
<a class="brand" href="index.html" aria-label="Institute of Actuaries of India — home">${mark()}<span><span class="a">Institute of</span><span class="b">Actuaries of India</span></span></a>
<nav class="primary" id="nav" aria-label="Primary">${navHtml}</nav>
<div class="actions">${SITE_B ? `<form class="hsearch" role="search" action="search.html" method="get"><label class="sr" for="hq">Search the site</label>${svgi('search')}<input id="hq" name="q" type="search" placeholder="Search exams, dates, fees…" autocomplete="off"></form>` : ''}<a class="iconbtn" href="search.html" aria-label="Search the site">${svgi('search')}</a><a class="btn red sm" href="${PORTAL.admission}" target="_blank" rel="noopener">Admission</a>
<button class="menu-btn" id="menu-btn" aria-label="Menu" aria-controls="nav" aria-expanded="false"><span aria-hidden="true">☰</span></button></div>
</div></header>`;
}

const SOCIAL = [
  ['X (Twitter)', 'https://x.com/actuariesindia', '<path d="M4 4l11.733 16h4.267L8.267 4z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/>'],
  ['Facebook', 'https://www.facebook.com/actuariesindia', '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'],
  ['Instagram', 'https://www.instagram.com/actuariesindia/', '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>'],
  ['YouTube', 'https://www.youtube.com/user/IAIMumbai', '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>'],
];
export const foot = `<footer class="site"><div class="wrap"><div class="cols">
<div><img src="assets/img/logo-white.png" alt="Institute of Actuaries of India" style="width:280px;height:auto"><p>A statutory body established under The Actuaries Act, 2006 for regulation of the profession of actuaries in India.</p>
<p><a class="link" style="color:#fff" href="contact-us.html">Contact us ${arr}</a></p></div>
<div><p class="fh">Quick links</p><ul>${FOOTER_LINKS.quick.map(lk).join('')}</ul></div>
<div><p class="fh">Links</p><ul>${FOOTER_LINKS.links.map(lk).join('')}</ul></div>
<div><p class="fh">Other links</p><ul>${FOOTER_LINKS.other.map(lk).join('')}</ul>
<p class="fh" style="margin-top:22px">Follow</p><ul class="social">${SOCIAL.map(([n, h, d]) => `<li><a href="${h}" target="_blank" rel="noopener" aria-label="${n}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg></a></li>`).join('')}</ul></div>
</div><div class="copy">© Copyright Institute of Actuaries of India (IAI). All Rights Reserved.</div></div></footer>
</body></html>`;

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function shell({ title, crumbs = [], lead = '', side = null, sideTitle = '', body, navHtml, prev = null, next = null, help = true, hub = false }) {
  const cr = crumbs.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`}</li>`).join('');
  const sidebar = side && side.length ? `<nav class="side" aria-label="In this section"><button class="side-toggle" type="button" aria-expanded="false" aria-controls="sidelist"><span>In this section</span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div id="sidelist" class="sidelist"><p class="side-h">${esc(sideTitle)}</p>${side.map(s => sideItem(s)).join('')}</div></nav>` : '';
  const pn = (prev || next) ? `<nav class="pn" aria-label="Previous and next pages">${prev ? `<a class="prev" href="${prev.href}"><small>Previous</small><span>${esc(prev.text)}</span></a>` : '<span></span>'}${next ? `<a class="next" href="${next.href}"><small>Next</small><span>${esc(next.text)}</span></a>` : '<span></span>'}</nav>` : '';
  const helpBox = '';
  return head(esc(title), navHtml) + `<main id="main"><div class="page-head${hub ? ' hub-head' : ''}"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li>${cr}<li><span aria-current="page">${esc(title)}</span></li></ol></nav>
<h1>${esc(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></div>
<div class="wrap layout${sidebar ? '' : ' nosidebar'}${hub ? ' hubpage' : ''}">${sidebar}<div class="content"><div class="prose">${body}</div>${pn}${helpBox}</div></div></main>` + foot;
}
function sideItem(s) {
  const e = /^https?:/.test(s.href || '');
  const hasKids = s.children && s.children.length;
  const a = s.href ? `<a${hasKids ? ' class="has-sub"' : ''} href="${s.href}"${s.current ? ' aria-current="page"' : ''}${e ? ' target="_blank" rel="noopener"' : ''}>${esc(s.text)}</a>` : `<span class="nolink">${esc(s.text)}</span>`;
  const kids = hasKids ? `<div class="sub">${s.children.map(c => sideItem(c)).join('')}</div>` : '';
  return a + kids;
}
