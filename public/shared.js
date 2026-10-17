// Shared by the server (_worker.js) and the browser (app.js, admin.js): labels,
// links, and the markup for nominee cards, the site header and the footer.
// One copy of each, so the page the server sends matches what the browser redraws.

export const SITE = "https://midgleyawards.com";

// Categories. Keys are stored on each nominee (the `domain` column); slugs are the /category/ URLs.
export const DOMAINS = {
  materials: "Chemistry and Materials",
  cities: "Cities and Transport",
  energy: "Energy and Climate",
  food: "Ecology and Agriculture",
  information: "Tech and AI",
  governance: "Policy and Incentives",
  finance: "Business and Marketing",
  health: "Health and Medicine",
};
export const CATEGORY_SLUGS = {
  materials: "chemistry-and-materials",
  cities: "cities-and-transport",
  energy: "energy-and-climate",
  food: "ecology-and-agriculture",
  information: "tech-and-ai",
  governance: "policy-and-incentives",
  finance: "business-and-marketing",
  health: "health-and-medicine",
};
export const HARMS = { environmental: "Environmental", health: "Health", social: "Social", economic: "Economic" };
export const STATUSES = { historic: "Historic", unfolding: "Still unfolding", prospective: "Prospective" };
export const KNOW = {
  knowable: "Knowable at the time",
  unforeseeable: "Unforeseeable at the time",
  mixed: "Partly knowable",
  contested: "Still contested",
};
// Special awards: badges that sit on top of a category. Prospective is a status, shown as its own badge.
export const AWARDS = {
  lifetime: "Lifetime Midgley",
  redemption: "Redemption Award",
  peoples: "People's Choice",
};

// Outside links. Empty means "not set up yet": the site shows a placeholder instead.
export const LINKS = {
  microForm: "",      // Tally form for Micro Midgleys
  waitlistForm: "",   // Tally form for the shop waitlist
  socials: [],        // [{ name: "Instagram", url: "https://..." }]
};

// Scores
export const MIN_JUDGES = 2;      // an Oops Score is public once this many judges have scored
export const MIN_HERD_VOTES = 10; // a Herd Score shows once this many readers have voted
export function oopsBand(score) {
  if (score == null) return null;
  if (score >= 90) return { key: "certified", label: "Certified Backfire" };
  if (score >= 60) return { key: "big", label: "Big Oops" };
  return { key: "fine", label: "Mostly Fine" };
}
export const herdPct = (n) => (n.herdTotal >= MIN_HERD_VOTES ? Math.round((100 * n.herdYes) / n.herdTotal) : null);

// ---------------------------------------------------------------- helpers

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function slugify(s) {
  return String(s || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "nominee";
}

export function symbol(name) {
  const parts = String(name).replace(/[^A-Za-zÀ-ÿ\s-]/g, "").trim().split(/\s+/).filter((p) => !/^(jr|sr|ii|iii|iv)$/i.test(p));
  const last = parts[parts.length - 1] || "?";
  return last.charAt(0).toUpperCase() + (last.charAt(1) || "").toLowerCase();
}

// "https://en.wikipedia.org/wiki/Haber_process" -> "Haber process"; other sites -> their host name.
export function linkTitle(u) {
  try {
    const url = new URL(u);
    const m = url.pathname.match(/\/wiki\/(.+)$/);
    if (/wikipedia\.org$/i.test(url.hostname) && m) return decodeURIComponent(m[1]).replace(/_/g, " ");
    return url.hostname.replace(/^www\./, "");
  } catch (e) { return "Source"; }
}

export const nomineePath = (n) => (n.id === "midgley" ? "/midgley" : "/n/" + (n.slug || n.id));

function ago(iso) {
  const d = new Date(iso); if (isNaN(d)) return "";
  const s = (Date.now() - d) / 1000;
  if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago"; if (s < 86400 * 30) return Math.floor(s / 86400) + "d ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const upIcon = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2 L13 10 H1 Z" fill="currentColor"/></svg>`;

// ---------------------------------------------------------------- scores

export function scoresHTML(n, size = "small") {
  const band = oopsBand(n.oops);
  const pct = herdPct(n);
  const oops = n.oops != null
    ? `<span class="num">${n.oops}</span><span class="band b-${band.key}">${band.label}</span><span class="sub">${n.oopsJudges} judges</span>`
    : `<span class="num none">?</span><span class="sub">Not scored yet</span>`;
  const herd = pct != null
    ? `<span class="num">${pct}%</span><span class="sub">${n.herdTotal} votes</span>`
    : `<span class="num none">?</span><span class="sub">Not enough votes yet</span>`;
  return `<div class="scores ${size}">
    <a class="score oops" href="/scores"><span class="label">Oops Score</span>${oops}</a>
    <a class="score herd" href="/scores"><span class="label">Herd Score</span>${herd}</a>
  </div>`;
}

function herdVoteHTML(n, mine) {
  const yes = mine === true, no = mine === false;
  return `<div class="herdvote" role="group" aria-label="Is ${esc(n.name)} Midgley-worthy?">
    <span class="q">Midgley-worthy?</span>
    <button data-act="herd" data-vote="yes" aria-pressed="${yes}">Yes</button>
    <button data-act="herd" data-vote="no" aria-pressed="${no}">No</button>
  </div>`;
}

// ---------------------------------------------------------------- nominee card

// ctx: { flags, rank, total, top, mine, herd, open, thread, reported, name, full }
export function cardHTML(n, ctx = {}) {
  const flags = ctx.flags || {};
  const thread = ctx.thread || [];
  const reported = ctx.reported || {};
  const ccount = ctx.ccount != null ? ctx.ccount : thread.length;
  const path = nomineePath(n);
  const fix = n.fix ? `<dt class="x">The fix</dt><dd>${esc(n.fix)}${n.fixUrl ? ` <a href="${esc(n.fixUrl)}" target="_blank" rel="noopener nofollow">Learn more</a>` : ""}</dd>` : "";
  const wiki = [n.wikiName, n.wikiWork].filter(Boolean).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(linkTitle(u))}</a>`);
  const cat = n.domain && DOMAINS[n.domain]
    ? (flags.categories ? `<a class="chip cat" href="/category/${CATEGORY_SLUGS[n.domain]}">${esc(DOMAINS[n.domain])}</a>` : `<span class="chip">${esc(DOMAINS[n.domain])}</span>`)
    : "";
  const vote = flags.scores ? "" : `<button class="up" data-act="vote" aria-pressed="${!!ctx.mine}" aria-label="${ctx.mine ? "Withdraw vote for" : "Upvote"} ${esc(n.name)}">${upIcon}<span class="c">${n.score}</span></button>`;
  const title = ctx.full ? `<h1>${esc(n.name)}</h1>` : `<h3><a href="${path}">${esc(n.name)}</a></h3>`;

  return `<article class="nom ${ctx.top ? "top" : ""} ${ctx.full ? "full" : ""}" id="nom-${esc(n.id)}" data-id="${esc(n.id)}">
    <div class="vote">
      <div class="tile" ${ctx.rank ? `title="Rank ${ctx.rank} of ${ctx.total}"` : ""}><span class="n">${ctx.rank || ""}</span><span class="sym">${esc(symbol(n.name))}</span></div>
      ${vote}
    </div>
    <div class="body">
      <div class="head">${title}${n.years ? `<span class="yrs">${esc(n.years)}</span>` : ""}</div>
      <p class="work">${esc(n.work)}</p>
      ${flags.scores ? scoresHTML(n, ctx.full ? "large" : "small") : ""}
      ${ctx.full ? fullSections(n) : `<dl class="ledger">
        <dt class="s">Went right</dt><dd>${esc(n.solved)}</dd>
        <dt class="b">Went oops</dt><dd>${esc(n.backfire)}</dd>
        ${fix}
      </dl>${wiki.length ? `<p class="wiki">On Wikipedia: ${wiki.join(" · ")}</p>` : ""}`}
      <div class="meta">
        ${n.award && AWARDS[n.award] ? `<span class="chip award">${esc(AWARDS[n.award])}</span>` : ""}
        ${n.status === "prospective" ? `<span class="chip award">Prospective</span>` : ""}
        ${cat}
        ${n.status && n.status !== "prospective" ? `<span class="chip">${esc(STATUSES[n.status] || n.status)}</span>` : ""}
        ${KNOW[n.knowable] ? `<span class="chip k-${esc(n.knowable)}">${esc(KNOW[n.knowable])}</span>` : ""}
        ${(n.harms || []).map((h) => `<span class="chip">${esc(HARMS[h] || h)} harm</span>`).join("")}
      </div>
      ${flags.scores ? herdVoteHTML(n, ctx.herd) : ""}
      <div class="meta">
        <span class="by">${n.seeded ? "Founding class" : esc(n.author || "Anonymous") + " · " + esc(ago(n.createdAt))}</span>
        ${ctx.full ? `<span class="by">${ccount} comment${ccount === 1 ? "" : "s"}</span>` : `<button class="toggle" data-act="toggle" aria-expanded="${!!ctx.open}">${ctx.open ? "Hide comments" : ccount ? ccount + (ccount === 1 ? " comment" : " comments") : "Comment"}</button>`}
        <button class="linkish" data-act="share">Share</button>
        ${reported["n:" + n.id] ? `<span class="by">Reported</span>` : `<button class="linkish" data-act="report-nom">Report</button>`}
      </div>
      ${ctx.open ? `<div class="thread">
        ${thread.map((c) => `<div class="cm"><span class="who">${esc(c.author || "Anonymous")} · ${esc(ago(c.createdAt))}</span><p>${esc(c.text)}</p>
          <div class="tools">${reported["c:" + c.id] ? `<span class="by">Reported</span>` : `<button class="linkish" data-act="report-c" data-cid="${esc(c.id)}">Report</button>`}</div></div>`).join("") || `<span class="by">No comments yet. Argue for or against.</span>`}
        <div class="reply"><input id="cn-${esc(n.id)}" maxlength="60" placeholder="Your name" value="${esc(ctx.name || "")}" aria-label="Your name"><textarea id="c-${esc(n.id)}" maxlength="1000" placeholder="Make the case, or push back" aria-label="Comment"></textarea><button class="ghost" data-act="comment">Post</button></div>
      </div>` : ""}
    </div>
  </article>`;
}

// The seven-part write-up on a nominee's own page. Sections without text are left out.
function fullSections(n) {
  const sec = (h, body) => (body ? `<section><h2>${h}</h2>${body}</section>` : "");
  const p = (t) => (t ? `<p>${esc(t)}</p>` : "");
  const seen = [KNOW[n.knowable] ? `<p><span class="chip k-${esc(n.knowable)}">${esc(KNOW[n.knowable])}</span></p>` : "", p(n.foresight)].join("");
  const sources = [n.source1, n.source2, n.wikiName, n.wikiWork].filter(Boolean)
    .filter((u, i, a) => a.indexOf(u) === i)
    .map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(linkTitle(u))}</a></li>`).join("");
  return `<div class="writeup">
    ${sec("What it was meant to do", p(n.meant))}
    ${sec("What went right", p(n.solved))}
    ${sec("What went oops", p(n.backfire))}
    ${sec("What they got right", p(n.gotRight))}
    ${sec("Could anyone have seen it coming?", seen)}
    ${sec("Pattern", p(n.pattern))}
    ${sec("The fix", n.fix ? `<p>${esc(n.fix)}${n.fixUrl ? ` <a href="${esc(n.fixUrl)}" target="_blank" rel="noopener nofollow">Learn more</a>` : ""}</p>` : "")}
    ${sec("Sources", sources ? `<ul>${sources}</ul>` : "")}
  </div>`;
}

// ---------------------------------------------------------------- site header and footer

export function headerHTML(flags = {}) {
  return `<div class="site-head-in">
    <a class="brand" href="/"><span class="mini" aria-hidden="true">Mg</span><span>The Midgley Awards</span></a>
    <nav aria-label="Main">
      <a href="/">Nominees</a>
      ${flags.categories ? `<a href="/category">Categories</a>` : ""}
      <a href="/midgley">Lifetime Midgley</a>
      <a href="/goat">Goat</a>
      <a href="/shop">Shop</a>
      <a class="micro-btn" href="/micro">Share your Micro Midgley</a>
    </nav>
  </div>`;
}

export function footerHTML() {
  const socials = LINKS.socials.length
    ? LINKS.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")
    : `<span class="placeholder">Social links coming soon</span>`;
  return `<div class="site-foot-in">
    <form class="oops-mini" data-subscribe novalidate>
      <label for="foot-email"><b>The Weekly Oops</b> One short email a week about things that worked too well.</label>
      <div class="row"><input id="foot-email" type="email" required placeholder="you@example.com" autocomplete="email"><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="primary" type="submit">Subscribe</button></div>
      <span class="msg" role="status"></span>
    </form>
    <nav class="foot" aria-label="Site">
      <a href="/">Nominees</a>
      <a href="/midgley">Lifetime Midgley</a>
      <a href="/goat">Goat</a>
      <a href="/shop">Shop</a>
      <a href="/scores">How scores work</a>
      <a href="/guidelines">Guidelines</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </nav>
    <div class="socials">${socials}</div>
    <p class="runby">Run by Goat Farm. Better to try and fail than never try. Mostly.</p>
  </div>`;
}

// ---------------------------------------------------------------- lists

export const HONOREE = "midgley"; // holds the first award; shown on /midgley, kept out of the ranked list

// "Top" ranks by upvotes, or by Herd "yes" votes once scores are on.
export const topValue = (n, flags) => (flags && flags.scores ? n.herdYes || 0 : n.score || 0);
export const byTop = (flags) => (a, b) => topValue(b, flags) - topValue(a, flags) || String(a.createdAt).localeCompare(String(b.createdAt));

export function categoryChipsHTML(active, counts = {}) {
  return `<a class="catchip" href="/" aria-current="${!active}">All</a>` +
    Object.entries(DOMAINS).map(([k, v]) =>
      `<a class="catchip" href="/category/${CATEGORY_SLUGS[k]}" aria-current="${active === k}">${esc(v)}${counts[k] ? ` <span>${counts[k]}</span>` : ""}</a>`).join("");
}
