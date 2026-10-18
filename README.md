# The Midgley Awards

For outstanding achievement in unintended consequences. People nominate solutions that worked too well, vote on them and argue about them in the comments.

The site is a static page plus a small server, both hosted on Cloudflare Pages. Nominees, votes, comments, reports and email sign-ups are stored in a Cloudflare D1 database.

## How it is put together

| Path | What it is |
| --- | --- |
| `public/index.html`, `app.js`, `styles.css` | The public site |
| `public/labels.js` | Display names for fields, statuses, kinds of harm and awards |
| `public/admin.html`, `admin.js` | The moderation screen at `/admin` |
| `public/guidelines.html`, `terms.html` | Community guidelines, and terms and privacy |
| `public/midgley.html` | The page about Thomas Midgley Jr., who holds the first award. He is kept out of the voting list, and `/n/midgley` redirects here |
| `public/_worker.js` | The server: the JSON API, share pages at `/n/<id>`, and database setup |
| `public/shared.js` | Labels, outside links (`LINKS`), and the markup for nominee cards, the header and the footer. Used by both the server and the browser |
| `public/nominee.html`, `category-page.html` | Page shells the server fills for `/n/<slug>` and `/category/<slug>` |
| `public/goat.html`, `shop.html`, `shop/waitlist.html`, `micro.html`, `scores.html`, `privacy.html` | The other pages |
| `.github/workflows/deploy.yml` | Deploys `main` to production and `staging` to staging |

The database sets itself up on the first request. A database from version 1 upgrades in place, keeping its nominees, votes and comments.

## Deploying

Every push to `main` deploys to the `midgley-awards` Pages project through GitHub Actions. This needs one repository secret:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with the **Cloudflare Pages: Edit** permission for this account.

The site lives at https://midgleyawards.com. The misspelled midgelyawards.com and both www hosts are attached to the same Pages project and forward to the home page (see `SITE` and `FORWARD_HOSTS` in `_worker.js`).

## Staging

Work goes to the `staging` branch first. It deploys as a preview at `staging.midgley-awards.pages.dev` and `staging.midgleyawards.com`, uses the Preview settings and database, and sends `X-Robots-Tag: noindex`. When Erik approves, merge `staging` into `main`. Database changes only add tables and columns, so the code on `main` keeps working with a database that has already been upgraded.

## Settings in Cloudflare

Set these under the Pages project's **Settings**, for **Production**:

| Setting | Type | Required | Purpose |
| --- | --- | --- | --- |
| D1 database binding (named `DB`) | Binding | Yes | Where everything is stored |
| `ADMIN_TOKEN` | Secret | Yes | Unlocks `/admin`. New nominees wait for approval, so without it nothing new can be published |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` | Variable and secret | No | Adds Cloudflare's human check to the nomination and sign-up forms |
| `AUTO_APPROVE` | Variable, set to `1` | No | Publishes nominees immediately instead of queueing them |
| `FEATURE_SCORES` | Variable, set to `1` | No | Turns on the Oops Score and the Herd Score, which replace upvotes |
| `FEATURE_CATEGORIES` | Variable, set to `1` | No | Turns on category chips and the `/category/...` pages |
| `CF_BEACON_TOKEN` | Variable | No | Cloudflare Web Analytics token. The server adds the analytics script to every page |

Changes to settings take effect on the next deployment.

## Pages and addresses

| Address | What it is |
| --- | --- |
| `/` | Intro cards, then the feed of posts |
| `/n/<slug>` | A Midgley nominee as a post (carousel, votes, comments, full write-up), then the feed |
| `/m/<slug>` | A featured Murphy as a post, then the feed |
| `/search` | Search and filters (`?q=`, `award=`, `cat=`, `status=`, `sort=`) |
| `/table` | The Categoric Table |
| `/midgley`, `/murphy`, `/awards`, `/scores`, `/goat`, `/shop`, `/guidelines`, `/privacy`, `/terms` | The other pages |
| `/lab/carousel/<slug>` | Design lab, staging and local only |

Hand-written carousels live in `public/carousels/<slug>.json` (add the slug to `HANDWRITTEN` in `_worker.js`). Every other nominee gets a carousel built from its write-up over its category's scene in `public/img/scenes/`.

## Forms and email

Every form posts to the site's own API, and the database is the record. Copies go to outside services when these settings exist (Pages project, Production and Preview):

| Setting | Type | Purpose |
| --- | --- | --- |
| `FORMSPREE_SUBSCRIBE` | Variable | Formspree form id for The Weekly Oops sign-ups (connect that form to Mailchimp in Formspree) |
| `FORMSPREE_MURPHY` | Variable | Formspree form id for Murphys |
| `FORMSPREE_NOMINATION` | Variable | Formspree form id for Midgley nominations |
| `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` | Secret, variable | Optional: add sign-ups to Beehiiv instead |

## Moderation

- New nominations wait in the review queue at `/admin`.
- Comments publish immediately. Anyone can report a nominee or a comment. A comment with three reports is hidden until a moderator reviews it.
- Each visitor is limited to 3 nominations, 12 comments, 120 votes and 20 reports in any 10 minutes.

## Running it locally

```
npm install
npm run dev
```

The local admin token is `dev-token`.

## API

| Method and path | Purpose |
| --- | --- |
| `GET /api/state` | Approved nominees with vote counts, and visible comments. Cached for 15 seconds |
| `GET /api/my-votes?voter=<id>` | The nominees one browser has voted for |
| `POST /api/nominees` | Submit a nominee |
| `POST /api/vote` | Add or remove a vote |
| `POST /api/comments` | Post a comment |
| `POST /api/report` | Report a nominee or comment |
| `POST /api/subscribe` | Join the winners email list |
| `/api/admin/...` | Moderation, with `Authorization: Bearer <ADMIN_TOKEN>` |
