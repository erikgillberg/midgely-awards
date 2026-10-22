# Backfire Awards: soft launch checklist and two-week plan

Written October 22, 2026. **Superseded the same day** for cadence and automation by the Google Doc "Backfire Awards launch sprint" (one nominee a week, weekly approval). The checklist in sections 1 and 2 still stands.

 Soft launch on Friday, October 23. Public launch on Monday, November 2: the date the site already gives, the anniversary of Midgley's death. Budget for Erik: about 20 minutes a day, most of it posting and replying on LinkedIn.

## 1. Before the soft launch (Erik, about 45 minutes, once)

| # | Task | Why | Time |
|---|---|---|---|
| 1 | Fill the placeholders on /privacy and /terms: legal entity name, state, entity type, mailing address, contact email. Check that /privacy names the email service the forms really use (it still says Formspree). | The pages are live with bracketed blanks. This is the one real blocker. | 15 min |
| 2 | Subscribe with a personal email from the home page and from a teardown. Confirm it lands in the email list. | The newsletter is the only conversion. | 5 min |
| 3 | Google Search Console: add a Domain property for backfireawards.com (DNS check in Cloudflare), then submit `https://backfireawards.com/sitemap.xml`. | Google doesn't find a new site on its own. Search Console also reports AI Overview appearances. | 10 min |
| 4 | Bing Webmaster Tools: sign in and use "Import from Google Search Console". | Bing's index feeds ChatGPT search and Copilot. | 5 min |
| 5 | Cloudflare, backfireawards.com zone, Security > Bots (AI Crawl Control): make sure AI crawlers aren't blocked. Cloudflare blocks them by default on some zones. | The site now invites AI agents in (robots.txt, llms.txt). A Cloudflare block would quietly cancel that. | 5 min |
| 6 | Set up the Instagram and LinkedIn profiles (bio, link to backfireawards.com, the Bf logo). | Every post points back to them. | 10 min |

## 2. Already done (Claude, October 22, verified on production)

- `robots.txt`: open to all crawlers, including AI agents, and points to the sitemap. Staging tells every crawler to stay out.
- `llms.txt`: a plain map of the site and all 14 teardowns, for AI agents and answer engines.
- `feed.xml`: an RSS feed of the teardowns.
- Structured data: Organization and WebSite (with site search) on the home page, and Article on every teardown.
- Real 404s: unknown URLs used to return the home page with a 200, which search engines treat as duplicate pages. They now return a 404 page.
- Sitemap: 8 category URLs that redirect to search are gone. Every listed URL returns 200.
- `favicon.ico` redirects to the SVG icon.
- Already in place: page titles and descriptions, canonical URLs, share images, and noindex on staging.

## 3. The two weeks

The core move is one teardown a day on LinkedIn as a native document post: the 10-card carousel uploaded as a PDF. Benchmarks from tool vendors (directional, not official) put document posts at about three times the engagement of text posts, because each swipe counts as time spent on the post. Keep the link out of the post body: say "Full teardown on backfireawards.com" and put the link in the first comment. That last part is common advice, but no source we found measures it.

Claude can export all 14 carousels as LinkedIn-ready PDFs, each with a drafted post. Say the word.

### Week 1: soft launch (Oct 23 to Oct 30)
The goal is feedback and the first 50 subscribers, not reach.

| Day | Erik (about 20 min) | Claude |
|---|---|---|
| Fri 10/23 | Send the link to 10 to 15 founders and builders you trust, one at a time. Ask one question: "Which card made you stop, and where did you get bored?" | Have the PDFs and post copy ready for the week. |
| Mon 10/26 | First LinkedIn post: why the Backfire Awards exist, with the Midgley carousel. Reply to every comment that day. | Look at what people clicked: shares, comment logins, votes. |
| Tue to Fri | One teardown a day (Moses, Haber, Nobel, Franz). Post in the morning, then spend 10 minutes replying. | Turn the feedback into fixes. Ship small ones the same day, and list bigger ones for you to decide. |
| Fri 10/30 | Answer the week's decision list by number. | Send the week's numbers: visits, subscribers, top teardown, Search Console coverage. |

### Week 2: public launch (Nov 2 to Nov 6)
The goal is the first 200 subscribers and the first outside shares.

| Day | Erik | Claude |
|---|---|---|
| Mon 11/2 | Launch post: "82 years ago today, the man who gave us leaded gasoline and Freon died. We gave him an award." Use the Midgley carousel. Ask the 10 to 15 people from week 1 to comment or share that morning. | Send the first Backfire Newsletter issue (Midgley), drafted for your approval. |
| Tue 11/3 | Post on Instagram: the same carousel, saved with "Save cards for Instagram". | Draft a "Show HN" post for Hacker News: the pattern codebook and dashboards, plainly described. |
| Wed 11/4 | Post the Show HN yourself if you want to, and reply for an hour. Skip it if the week is full. | Pitch 3 to 5 newsletters for founders and inventors (drafts only; you send them). |
| Thu to Fri | One teardown a day on LinkedIn, then answer the decision list. | Two-week report and what to keep, stop and start. |

## 4. How we'll know it worked (by November 6)

| Measure | Target | Where |
|---|---|---|
| Newsletter subscribers | 200 | the email list |
| Teardown pages in Google's index | 14 of 14 | Search Console > Pages |
| Comment-login and share clicks | 50 or more | the intents table (`/api/intent`) |
| Best LinkedIn post | 5,000 or more impressions | LinkedIn analytics |
| Feedback from week 1 | at least 8 of the 15 reply | your inbox |

If comment-login clicks pass 50, that is the signal to build real comments, as we agreed.

## Sources
- [AuthoredUp data via Contentdrips: LinkedIn document posts in 2026](https://contentdrips.com/blog/2026/07/linkedin-document-posts/)
- [Oktopost: LinkedIn carousel best practices for B2B in 2026](https://www.oktopost.com/blog/linkedin-carousel-pdf-best-practices/)
- [Dataslayer: LinkedIn algorithm, February 2026](https://www.dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now)
- [Website launch SEO checklist 2026](https://www.pravinkumar.co/blog/seo-checklist-launching-website-2026-complete-guide)
- [Nuxt SEO: launching and monitoring with Search Console](https://nuxtseo.com/learn-seo/nuxt/launch-and-listen)
