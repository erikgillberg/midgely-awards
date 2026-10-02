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
| `.github/workflows/deploy.yml` | Deploys to Cloudflare on every push to `main` |

The database sets itself up on the first request. A database from version 1 upgrades in place, keeping its nominees, votes and comments.

## Deploying

Every push to `main` deploys to the `midgley-awards` Pages project through GitHub Actions. This needs one repository secret:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with the **Cloudflare Pages: Edit** permission for this account.

## Settings in Cloudflare

Set these under the Pages project's **Settings**, for **Production**:

| Setting | Type | Required | Purpose |
| --- | --- | --- | --- |
| D1 database binding (named `DB`) | Binding | Yes | Where everything is stored |
| `ADMIN_TOKEN` | Secret | Yes | Unlocks `/admin`. New nominees wait for approval, so without it nothing new can be published |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` | Variable and secret | No | Adds Cloudflare's human check to the nomination and sign-up forms |
| `AUTO_APPROVE` | Variable, set to `1` | No | Publishes nominees immediately instead of queueing them |

Changes to settings take effect on the next deployment.

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
