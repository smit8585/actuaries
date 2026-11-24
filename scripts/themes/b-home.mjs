// Direction B "The Data Lens" home page: search-first hero, stat strip, bento tiles, filterable notices.
export default function homeB({ L, annRow, ANN, EV, GCA, tickSet, arr, PORTAL }) {
  const curve = (() => {
    let g = '';
    for (let i = 0; i < 9; i++) { const t = 60 + i * 20; g += `<path d="M-20 300 C 100 300,140 ${t},250 ${t} S 400 300,520 300" stroke="#2563EB" stroke-opacity="${0.1 + i * 0.1}" stroke-width="${i === 8 ? 3 : 1.4}" fill="none"/>`; }
    let bars = '';
    for (let i = 0; i < 19; i++) { const h = 20 + 120 * Math.exp(-Math.pow((i - 9) / 3.6, 2)); bars += `<rect x="${24 + i * 25}" y="${300 - h}" width="16" height="${h}" rx="4" fill="#2563EB" fill-opacity="${i === 9 ? 1 : 0.16 + h / 400}"/>`; }
    return `<svg class="curve" viewBox="0 0 500 320" aria-hidden="true" preserveAspectRatio="xMidYMax meet"><line x1="0" y1="300" x2="500" y2="300" stroke="#C9D4EA"/>${bars}<line x1="250" y1="50" x2="250" y2="300" stroke="#0B1E3F" stroke-dasharray="3 5"/><circle cx="250" cy="50" r="6" fill="#0B1E3F"/>${g.replace(/stroke="#2563EB"/g, 'stroke="#0B1E3F"').replace(/stroke-opacity="[^"]+"/g, m => m.replace(/[\d.]+/, v => String(+v * 0.55)))}</svg>`;
  })();
  const POP = [['ACET', 'about-acet.html'], ['Exam dates', 'examination-dates-1.html'], ['Exam fees', 'exam-fees.html'], ['Syllabus', 'syllabus.html'], ['Renew membership', 'annual-membership.html'], ['Verify a member', L('/verification-iai-member')]];
  const cats = [['all', 'All'], ['exam', 'Exams'], ['notice', 'Notices'], ['result', 'Results'], ['training', 'Training'], ['tender', 'Tenders']];
  const ev = EV;
  const evCard = (e, i) => `<a class="ev${i === 0 ? ' lead' : ''}" href="${L(e[4])}"><span class="when">${e[0] ? e[0] + ' ' + e[1] : 'Upcoming'}</span><b>${e[3]}</b><span class="go">${e[2]} ${arr}</span></a>`;
  return `
<div class="ticker"><div class="wrap"><span class="chip">Latest updates</span><div class="items" role="region" aria-label="Latest updates"><div class="track">${tickSet(false)}${tickSet(true)}</div></div><a class="link" href="announcement.html" aria-label="View all latest updates">View all ${arr}</a></div></div>

<section class="b-hero"><div class="wrap"><div class="b-hero-l">
<p class="mono-k">Statutory body · Actuaries Act, 2006</p>
<h1>The numbers behind India’s <span class="hl">financial future.</span></h1>
<p class="lead">The Institute of Actuaries of India educates, examines and regulates the nation’s actuaries. Find an exam date, a fee, a form or a member in seconds.</p>
<form class="b-search" role="search" action="search.html" method="get"><label class="sr" for="hq2">Search the Institute’s website</label><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input id="hq2" name="q" type="search" placeholder="Search exams, syllabus, fees, announcements…" autocomplete="off"><button type="submit">Search</button></form>
<ul class="b-chips" aria-label="Popular searches">${POP.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
</div>
<aside class="b-hero-r" aria-label="Featured"><div class="curve-card">${curve}<span class="mono-k">Featured</span><h2>Call for abstracts</h2><p>26th Global Conference of Actuaries. Share your research with the profession.</p><a class="b-btn" href="${GCA}" target="_blank" rel="noopener">Submit your abstract ${arr}</a></div></aside></div></section>

<section class="b-stats"><div class="wrap"><dl>
<div><dt>2006</dt><dd>The Actuaries Act comes into force, 10 November</dd></div>
<div><dt>12 + 2</dt><dd>Elected Fellow members and government nominees on the Council</dd></div>
<div><dt>1944</dt><dd>Actuarial Society of India established</dd></div>
<div><dt>26th</dt><dd>Global Conference of Actuaries, 2027</dd></div>
</dl></div></section>

<section class="b-sec"><div class="wrap"><div class="b-head"><p class="mono-k">01 · Start here</p><h2>Pick your path.</h2></div>
<div class="bento">
<a class="tile t-asp" href="${L('/what-actuary')}"><span class="mono-k">Aspiring actuary</span><h3>Start a career in actuarial science</h3><p>What an actuary does, who can become one, the ACET entrance exam and how to apply.</p><span class="go">Explore the profession ${arr}</span></a>
<a class="tile" href="${L('/student')}"><span class="mono-k">Student</span><h3>Exams &amp; study</h3><p>Syllabus, dates, results, study material.</p><span class="go">Open ${arr}</span></a>
<a class="tile" href="${L('/annual-membership')}"><span class="mono-k">Member</span><h3>Membership</h3><p>Renew, forms, CPD, library.</p><span class="go">Open ${arr}</span></a>
<a class="tile t-acet" href="${L('/about-acet')}"><span class="mono-k">ACET</span><h3>Entrance exam</h3><p>Dates, mock exams and the sign-up portal.</p><span class="go">Open ${arr}</span></a>
<a class="tile" href="${L('/placement-cell')}"><span class="mono-k">Employer</span><h3>Hire actuaries</h3><p>Placement Cell and ActuJobs.</p><span class="go">Open ${arr}</span></a>
<a class="tile t-ver" href="${L('/verification-iai-member')}"><span class="mono-k">Public</span><h3>Verify a member</h3><p>Check the credentials of an IAI member.</p><span class="go">Verify ${arr}</span></a>
</div></div></section>

<section class="b-sec alt"><div class="wrap"><div class="b-head row"><div><p class="mono-k">02 · What’s new</p><h2>Announcements &amp; events.</h2></div><a class="link" href="announcement.html">All announcements ${arr}</a></div>
<div class="b-two"><div><div class="filters" role="group" aria-label="Filter announcements">${cats.map(([k, t], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>
<div class="list b-list" id="annlist">${ANN.map(annRow).join('')}</div></div>
<div class="b-events"><h3 class="mono-k">Upcoming events</h3>${ev.map(evCard).join('')}</div></div></div></section>

<section class="b-sec"><div class="wrap"><div class="b-head row"><div><p class="mono-k">03 · The qualification path</p><h2>From student to Fellow.</h2></div><a class="link" href="${L('/education-policy-2026')}">Education curriculum ${arr}</a></div>
<ol class="b-path">
<li><a href="${L('/student')}"><span class="n">01</span><h3>Student</h3><p>Enrol through ACET or direct entry and begin the examinations.</p></a></li>
<li><a href="${L('/associate')}"><span class="n">02</span><h3>Associate</h3><p>Complete the prescribed examinations and requirements.</p></a></li>
<li><a href="${L('/fellow')}"><span class="n">03</span><h3>Fellow</h3><p>Advance through the higher subjects to qualify as a Fellow.</p></a></li>
<li><a href="${L('/cera-chartered-enterprise-risk-actuary-qualification')}"><span class="n">04</span><h3>CERA · MRA</h3><p>Specialist credentials, including Chartered Enterprise Risk Actuary.</p></a></li>
</ol></div></section>

<section class="b-sec alt"><div class="wrap"><div class="b-head"><p class="mono-k">04 · Keep learning</p><h2>Magazine, training and member stories.</h2></div>
<div class="b-res">
<a href="${L('/magazine')}"><img src="assets/img/magazine.jpg" alt="" loading="lazy"><div><h3>Digital magazine</h3><p>Articles, interviews and perspectives from across the profession.</p><span class="go">Read ${arr}</span></div></a>
<a href="${L('/node/3345')}"><img src="assets/img/learning.jpg" alt="" loading="lazy"><div><h3>Training &amp; learning</h3><p>Pre-recorded videos, online coaching and study material.</p><span class="go">Explore ${arr}</span></div></a>
<a href="${L('/Testimonial')}"><img src="assets/img/event-1.jpg" alt="" loading="lazy"><div><h3>Voices of members</h3><p>Hear from members who built careers in actuarial science.</p><span class="go">Listen ${arr}</span></div></a>
</div></div></section>

<section class="b-sec"><div class="wrap b-about"><div><p class="mono-k">About the Institute</p><h2>A statutory body for a profession built on trust.</h2><a class="link" href="${L('/about-iai')}">Read more about IAI ${arr}</a></div>
<div><p>The Institute of Actuaries of India is a statutory body established under The Actuaries Act, 2006 (35 of 2006) for the regulation of the profession of actuaries in India. The provisions of the Act came into force on 10 November 2006, by notification of the Government of India, Ministry of Finance, Department of Economic Affairs.</p>
<div class="vmv"><a href="${L('/vision-mission')}"><b>Vision</b><span>Where the Institute is headed</span></a><a href="${L('/vision-mission')}"><b>Mission</b><span>What the Institute does</span></a><a href="${L('/vision-mission')}"><b>Values</b><span>How the Institute acts</span></a></div></div></div></section>

<div class="partners"><div class="wrap"><p>Employers and partners across the actuarial community</p><div class="row logos">${[['allianz', 'Allianz'], ['gicre', 'GIC Re'], ['lic', 'LIC'], ['milliman', 'Milliman'], ['wtw', 'WTW'], ['tataaia', 'Tata AIA'], ['rbi', 'RBI'], ['pfrda', 'PFRDA'], ['oriental', 'The Oriental Insurance'], ['uiic', 'United India Insurance']].map(([f, n]) => `<a href="${L('/placement-cell')}" aria-label="${n}"><img src="assets/img/partner-${f}.png" alt="${n}" loading="lazy"></a>`).join('')}</div></div></div>
<script>(function(){var b=document.querySelectorAll('.filters button'),l=document.querySelectorAll('#annlist a');b.forEach(function(x){x.addEventListener('click',function(){b.forEach(function(y){y.setAttribute('aria-pressed',y===x)});var f=x.dataset.f;l.forEach(function(a){a.style.display=(f==='all'||a.dataset.cat===f)?'':'none'})})})})();</script>`;
}
