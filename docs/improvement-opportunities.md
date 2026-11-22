# IAI website — improvement opportunities (noted, not implemented)

Analysis of the original actuariesindia.org content (229 pages crawled Nov 2026) against what the site is for. **Nothing here has been changed in the prototype.** Items marked ◆ need a decision from the Institute.

## 1. What the site is for

A statutory body's site has to do six jobs at once:

1. **Regulate and protect the public**: professional standards, discipline, member verification, the legal framework.
2. **Educate and examine**: ACET, examinations, syllabi, fees, results, the Student → Associate → Fellow path.
3. **Serve members**: renewals, forms, CPD, services, member lists.
4. **Connect employers and talent**: placement cell, vacancies, ActuJobs.
5. **Promote the profession**: what an actuary is, events, conferences, magazine, outreach.
6. **Run the Institute**: council, committees, tenders, announcements.

Audiences: aspiring students and parents, current students, members, employers and insurers, regulators and government, the public.

## 2. Evidence from the content

* 229 pages: ~46 event/archive pages, ~30 committee pages, ~33 exam pages, ~14 policy pages.
* 53 pages whose newest year is 2022 or earlier (conference pages 2014–2020 not marked as archive).
* 76 pages under 60 words. "What is an actuary?" is 39 words, "Who can become an actuary?" 60, "Career advice" 41, "Meet some of our members" is only a list of names, the magazine page is 8 words.
* Long policy text: exam policies 4,274 words, FAQ ≈ 3,200, volunteering ≈ 1,800, terms ≈ 1,700.
* Typos: "competant" (Annual Membership, Associate), "anlytics" (What does an actuary do), "Aadhar" (Associate, exam policies).
* Menu label for disciplinary cases cites the Actuaries Act "2002"; 11 pages cite the 2006 Act.
* Help page still mentions Flash Player and Windows Media Player.
* 28 links dead on the original site (old `subMenu.aspx`, raw IP address 115.112.202.200, retired goo.gl links, two dead sub-domains).
* Disciplinary cases page is empty (dynamic content). Member lists are two PDFs. All announcements are PDFs (~750 documents overall).
* Verification of a member is a paid application: Rs 2,000 + GST, documents and consent letter.
* FAQs are spread over at least six pages.
* Subject codes (CS1, CM2, CP3, SP9, SA4…) are used without plain-language explanation.

## 3. Where the content under-serves users

Aspirants and parents are the weakest-served group even though the profession's pipeline depends on them: thin definition pages, no earnings/employer/career-path information, no end-to-end route from school or degree to Fellow, costs and timelines scattered across ACET, direct entry, curriculum, fees and the student support scheme.

## 4. Improvement possibilities

### Journeys and tools
* One "how to become an actuary" page with steps, costs, durations, next actions.
* Guided "which route am I?" (after 12th / graduate in maths, stats, engineering / CA, CS, CMA / credits from another body).
* Fee and total-cost calculator; "plan my exams" view (subjects, prerequisites, session dates).
* Single "My dashboard" entry point instead of separate sign-ins for ACET, members, jobs.
* Self-service verification of an actuary's credentials ◆; searchable member register with status ◆ (today: PDFs).
* Structured, searchable disciplinary outcomes ◆.
* Exam-centre finder; "what happens on exam day" page.
* Reminders for exam dates, results and renewals (email / WhatsApp).

### Announcements, events, data
* Announcements as web pages with the PDF attached; filterable feed with email/RSS.
* Events as structured records (date, venue, CPD credit, status, registration); one filterable archive instead of dozens of pages.
* Small live statistics: members by category, exam pass rates ◆.
* Magazine: surface the latest issue and articles.

### Content freshness and quality
* Mark archive pages; set review/expiry rules for time-bound notices; "last reviewed" on every page.
* Fix typos and the 2002 / 2006 Act inconsistency; remove Flash / Windows Media Player references.
* Replace or retire the 28 dead links ◆ (supply current destinations).
* Summaries and tables of contents for long policy pages; show version history and effective dates.
* Consolidate FAQs into one searchable, categorised FAQ.
* Explain acronyms and subject codes on first use (CILA, CIHCI, GCA, IFS, CS1…).

### Navigation and structure
* Task-based ("I want to…") plus audience entry points; remove duplicate entries (ACET exam, Results appear several times) and one-link groups (Olympiad).
* Replace the department/level contact matrix with "who do I contact for…", a routed enquiry form, response-time promise and request status.
* Consistent page template: summary, key dates, steps, documents, contacts, last updated.

### Trust and transparency
* Service standards (time to answer queries, issue results, verify members) ◆.
* Governance material made easy to find (council, committees, reports, RTI); plain-language summary of the Act and regulations.
* Visible exam-integrity, appeal and re-evaluation procedures.
* Clear, secure payment/receipt pages; scam and phishing notice for fees and jobs.

### Inclusion and reach
* Hindi and selected regional languages for key aspirant pages and FAQs ◆.
* Accessibility beyond HTML: tagged PDFs, captions/transcripts for webinars, text instead of text-in-image posters.
* Mobile-first registration flows (portals are separate sites).
* Parent/teacher content: school counselling, "talk to a student", outreach events.

### Operations and platform (WordPress phase)
* Content owner and review cycle per section ◆; editor training and style guide.
* Custom post types and taxonomies (events, announcements, documents, people) instead of one-off pages.
* Document library with versioning and metadata (replaces ~750 loose PDFs).
* Analytics and feedback: top and failed searches, journey drop-off, "was this helpful?".
* SEO and structured data (events, organisation), canonical URLs (original had `/index.php/` duplicates), redirects from old URLs, security review.

## 5. Decisions needed from the Institute

* Open verification and the member register to the public, and under what rules.
* Languages to support.
* Fee and policy details that would feed any calculator.
* Content ownership and review cycle.
* Real career, salary and employer data for aspirant pages (none exists on the current site; none was invented).

## 6. Possible quick wins vs larger projects

**Quick wins:** typos and Act-year fix, one consolidated FAQ, announcements as web pages, dead-link clean-up, archive labels, acronym explainers, "last reviewed" dates.
**Larger projects:** end-to-end aspirant journey and calculators, member register and verification, events/announcements data model, document library, multilingual content, accessibility programme for PDFs and video.
