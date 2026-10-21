// Shared by the server (_worker.js) and the browser (app.js, admin.js): labels,
// links, and the markup for nominee cards, the site header and the footer.
// One copy of each, so the page the server sends matches what the browser redraws.

export const SITE = "https://backfireawards.com";
// The name printed on cards and images.
export const BRAND_DOMAIN = "backfireawards.com";

// Build id, set by the deploy workflow. Added to stylesheet and script URLs so browsers fetch new copies.
export const BUILD = "__BUILD__";

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
  microFormId: "KpQa0D",
  microForm: "https://tally.so/r/KpQa0D",    // Tally: Share your Murphy (form id kept from its Micro Midgley days)
  waitlistForm: "kbakOe",                    // Tally: Backfire Awards shop waitlist (form id, embedded on /shop/waitlist)
  beehiivForm: "71cdf4c1-b2c8-4913-bb03-cc836734a7b1", // Beehiiv: The Backfire Newsletter sign-up form
  socials: [{ name: "Instagram", url: "https://www.instagram.com/backfireawards/" }],
};

// The Backfire Newsletter sign-up: our own form. The server keeps the address and passes it on to the newsletter service.
export const signupHTML = (where = "foot") =>
  `<form class="signup" data-signup novalidate>
    <label class="hp" for="su-${where}">Email</label>
    <input id="su-${where}" type="email" required placeholder="you@example.com" autocomplete="email" aria-label="Email address">
    <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="primary" type="submit">Subscribe</button>
    <div class="ts" data-ts></div>
    <span class="msg" role="status"></span>
  </form>`;
export const weeklyOopsHTML = () => signupHTML("x");
export const OOPS_LINE = "One short email a week: a new backfire teardown, the pattern behind it, and who won.";
// The Murphy (backfires founders and inventors built themselves) is on the roadmap since 2026-10-20: its pages and
// data stay, but nothing links to it and the Nominate form takes Midgley nominations only. Flip to bring it back.
export const MURPHYS_LIVE = false;
// The sign-up card that sits in the feed, once, after a few posts.
export const feedOopsHTML = () => `<section class="feed-oops" aria-labelledby="fo-h">
  <p class="ob-label">The newsletter</p><h2 id="fo-h">Get one backfire a week</h2><p>${OOPS_LINE} Unsubscribe any time.</p>${signupHTML("feed")}</section>`;
// Scores
export const MIN_JUDGES = 2;      // an Oops Score is public once this many judges have scored
export const MIN_HERD_VOTES = 10; // a Facepalm Index shows once this many readers have voted
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
    <a class="score oops" href="/faq#scores"><span class="label">Oops Score</span>${oops}</a>
    <a class="score herd" href="/faq#scores"><span class="label">Facepalm Index</span>${herd}</a>
  </div>`;
}

function herdVoteHTML(n, mine) {
  const yes = mine === true, no = mine === false;
  return `<div class="herdvote" role="group" aria-label="${esc(n.name)}: worth it?">
    <span class="q">Worth it?</span>
    <button data-act="herd" data-vote="no" aria-pressed="${no}">💡 Yes</button>
    <button data-act="herd" data-vote="yes" aria-pressed="${yes}">🤦 No</button>
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

// A nominee as a post, under its carousel: who, the scores, the vote, sharing and the comments,
// in the order people expect from a social feed. The full write-up lives below, behind "Read more".
const PICON = {
  yes: '<path d="M5 12.5 10 17 19 7"/>',
  no: '<path d="M6 6l12 12M18 6 6 18"/>',
  comment: '<path d="M20.5 11.5a8.5 8 0 0 1-12.2 7.2L3.5 20l1.4-4.3A8 8 0 1 1 20.5 11.5z"/>',
  share: '<path d="M21 3 10 14"/><path d="M21 3 14.5 21 10 14 3 9.5z"/>',
  dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
};
const picon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${PICON[k]}</svg>`;

// A post: the same shape for every kind of item, like a social feed.
//   header (tile, name, ⋯) / carousel / actions / scores / caption with "more" / comments
// p: { id, kind, path, title, sub, tile, carousel, captionTitle, caption, more, worthy, herdYes, herdTotal, oops, score }
// The vote asks "Worth it?". 💡 Yes is stored as a "no" vote and 🤦 No as a "yes" vote: stored "yes" has always
// meant facepalm (it began as "Midgley-worthy?"), and the Facepalm Index is the share of "yes" votes.
export const herdLine = (yes, total) => {
  const pct = total >= MIN_HERD_VOTES ? Math.round((100 * yes) / total) : null;
  return `Facepalm <b>${pct != null ? pct + "%" : "?"}</b>${pct != null ? ` of ${total}` : total ? ` (${total} vote${total === 1 ? "" : "s"} so far)` : ""}`;
};
function postShell(p, ctx = {}) {
  const flags = ctx.flags || {};
  const thread = ctx.thread || [];
  const pct = p.herdTotal >= MIN_HERD_VOTES ? Math.round((100 * p.herdYes) / p.herdTotal) : null;
  const vote = flags.scores || p.kind === "murphy"
    ? `<div class="pv-vote" role="group" aria-label="${esc(p.worthy)}"><span class="pv-q">${esc(p.worthy)}</span>
        <button class="pv-btn pv-yes" data-act="herd" data-vote="no" aria-pressed="false" aria-label="Yes, worth it"><span class="emo" aria-hidden="true">💡</span><span>Yes</span></button>
        <button class="pv-btn pv-no" data-act="herd" data-vote="yes" aria-pressed="false" aria-label="No, a facepalm"><span class="emo" aria-hidden="true">🤦</span><span>No</span></button></div>`
    : `<button class="pv-btn" data-act="vote" aria-pressed="false">${upIcon}<span class="c">${p.score}</span></button>`;
  const stats = [
    p.kind !== "murphy" && flags.scores ? `Oops <b>${p.oops ?? "?"}</b>` : "",
    `<span class="pv-herd">${herdLine(p.herdYes, p.herdTotal)}</span>`,
  ].filter(Boolean).join(" · ");
  return `<article class="post" id="post-${esc(p.id)}" data-id="${esc(p.id)}" data-kind="${p.kind}" data-path="${esc(p.path)}" style="${p.vars || ""}">
    <header class="pv-head">
      <a class="pv-who" href="${esc(p.path)}">${p.tile}<span><b>${esc(p.title)}</b><small>${esc(p.sub)}</small></span></a>
      <details class="pv-menu"><summary aria-label="More options">${picon("dots")}</summary>
        <div><button type="button" data-act="share-link">Copy link</button><button type="button" data-act="share-ig">Save cards for Instagram</button><button type="button" data-act="report">Report</button></div></details>
    </header>
    ${p.carousel}
    <div class="pv-bar">
      ${vote}
      <button class="pv-btn" data-act="comments" aria-label="Comments">${picon("comment")}<span class="cc-n">${thread.length}</span></button>
      <button class="pv-btn" data-act="share" aria-label="Share">${picon("share")}</button>
    </div>
    <p class="pv-stats">${stats} · <a href="/faq#scores">scores</a></p>
    <div class="pv-caption"><p><a href="${esc(p.path)}"><b>${esc(p.captionTitle)}</b></a> ${esc(p.caption)}${p.more ? ` <button class="pv-more" type="button" data-act="more">more</button>` : ""}</p>
      ${p.more ? `<div class="pv-full" hidden>${p.more}</div>` : ""}</div>
    <div class="pv-comments" data-collapsed>
      ${thread.length > 2 ? `<button class="pv-viewall" type="button" data-act="comments">View all ${thread.length} comments</button>` : ""}
      <div class="pv-thread">${threadHTML(thread)}</div>
      <button class="pv-add" type="button" data-act="comment-new">Add a comment…</button>
    </div>
  </article>`;
}

// One comment. The full thread is in every post; the comments panel shows all of it, the post the latest two.
// Replies (one level) follow their comment, marked cm-r; the post hides them and the panel indents them.
export const commentHTML = (c, old = false) =>
  `<p class="cm${c.parentId ? " cm-r" : ""}${old ? " pv-old" : ""}${c.goat ? " cm-goat" : ""}" data-cid="${esc(c.id)}"${c.parentId ? ` data-parent="${esc(c.parentId)}"` : ""}><b>${esc(c.author || "Anonymous")}</b>${c.goat ? ` <span class="cm-badge">AI moderator</span>` : ""} <span class="cm-t">${esc(c.text)}</span> <small>${esc(ago(c.createdAt))} · <button type="button" class="pv-rep" data-act="reply-c">Reply</button>${c.goat ? "" : ` · <button type="button" class="pv-rep" data-act="report-c">Report</button>`}</small></p>`;

// A post's comments in reading order: each comment, oldest first, followed by its replies.
// A reply whose comment is hidden stands on its own.
export function threadHTML(thread) {
  const top = new Set(thread.filter((c) => !c.parentId).map((c) => c.id));
  const tops = thread.filter((c) => !c.parentId || !top.has(c.parentId));
  const kids = {};
  thread.forEach((c) => { if (c.parentId && top.has(c.parentId)) (kids[c.parentId] = kids[c.parentId] || []).push(c); });
  return tops.map((c, i) => commentHTML(c.parentId ? { ...c, parentId: undefined } : c, i < tops.length - 2) + (kids[c.id] || []).map((r) => commentHTML(r)).join("")).join("");
}

export function postHTML(n, ctx = {}) {
  return postShell({
    id: n.id, kind: "nominee", path: nomineePath(n), title: n.name, sub: [n.years, DOMAINS[n.domain]].filter(Boolean).join(" · "),
    tile: elementHTML(n, "mini"), carousel: ctx.carousel || "", captionTitle: n.work, caption: n.backfire,
    more: ctx.more || fullSections(n), worthy: "Worth it?", herdYes: n.herdYes, herdTotal: n.herdTotal, oops: n.oops, score: n.score,
    vars: jewelVars(jewelOf(n.domain)),
  }, ctx);
}

// ---------------------------------------------------------------- Murphys as posts

export const murphyPath = (m) => "/m/" + m.slug;
// End a reader's sentence with a period if it has no closing punctuation.
const sentence = (t) => { const s = String(t || "").trim(); return /[.!?]["')]?$/.test(s) ? s : s + "."; };
export function murphyTileHTML(m) {
  return `<div class="el mini mu-tile"><span class="el-num">2</span><span class="el-year"></span><span class="el-sym">Mu</span><span class="el-name">MURPHY</span><span class="el-up"></span><span class="el-down"></span></div>`;
}
export function murphyCarouselHTML(m) {
  const who = m.name ? `From ${m.name}` : "From a reader";
  const foot = (i) => `<footer class="cc-foot"><span>${BRAND_DOMAIN}</span><span>${i} / 3</span></footer>`;
  return `<div class="carousel mu-carousel" data-carousel style="--deep:#0B2230;--base:#2F6E8F;--light:#BFE0EF">
    <div class="cc-track" tabindex="0" aria-label="A Murphy, 3 cards">
      <section class="cc cc-hook mu-hook"><img class="cc-scene" src="/img/scenes/murphy.jpg" alt="" loading="lazy">
        <div class="cc-hook-top"><div class="el lg mu-el"><span class="el-num">2</span><span class="el-year"></span><span class="el-sym">Mu</span><span class="el-name">MURPHY</span><span class="el-up"></span><span class="el-down"></span></div><p class="cc-kicker">A Murphy<br>${esc(who)}</p></div>
        <h2 class="cc-headline mid">The fix</h2><p class="cc-dek">${esc(m.fix)}</p><p class="cc-swipe" aria-hidden="true">Swipe <span>→</span></p>${foot(1)}</section>
      <section class="cc no-img" data-sym="Mu"><div class="cc-body"><p class="cc-label"><span>01</span> What went oops</p><h3 class="cc-title">${esc(m.oops)}</h3></div>${foot(2)}</section>
      <section class="cc cc-payoff"><div class="cc-body"><p class="cc-label">Murphy's law</p><h3 class="cc-title">Anything that can go wrong will go wrong.</h3><p class="cc-cta">Got one? Share yours at <b>${BRAND_DOMAIN}</b></p><p class="cc-follow site-follow">Follow the Backfire Awards for a new backfire every week.</p></div>${foot(3)}</section>${IG_ASK}
    </div>
    <div class="cc-nav"><button type="button" data-cc="prev" aria-label="Previous card">←</button><span class="cc-dots"><i data-cc-dot="0"></i><i data-cc-dot="1"></i><i data-cc-dot="2"></i></span><button type="button" data-cc="next" aria-label="Next card">→</button></div>
  </div>`;
}
export function murphyPostHTML(m, ctx = {}) {
  return postShell({
    id: m.id, kind: "murphy", path: murphyPath(m), title: "A Murphy", sub: m.name ? `from ${m.name}` : "from a reader",
    tile: murphyTileHTML(m), carousel: murphyCarouselHTML(m), captionTitle: "The Murphy.", caption: `${sentence(m.fix)} ${sentence(m.oops)}`, more: "",
    worthy: "Worth it?", herdYes: m.herdYes, herdTotal: m.herdTotal, vars: "--deep:#0B2230;--base:#2F6E8F;--light:#BFE0EF",
  }, ctx);
}

// The full write-up for a nominee's page, behind "Read more". Further reading and image credits are added by the server.
export const writeupHTML = (n) => fullSections(n);

// A carousel for any nominee, built from its write-up, for nominees without a hand-written one.
export function autoCarousel(n) {
  const first = (t) => (String(t || "").match(/^.*?[.!?](\s|$)/) || [t || ""])[0].trim();
  const slides = [];
  if (n.meant) slides.push({ kind: "meant", label: "What it was meant to do", title: first(n.meant), text: n.meant });
  slides.push({ kind: "right", label: "What went right", title: first(n.solved), text: n.solved });
  slides.push({ kind: "oops", label: "What went oops", title: first(n.backfire), text: n.backfire });
  if (n.gotRight) slides.push({ kind: "gotright", label: "What they got right", title: first(n.gotRight), text: n.gotRight });
  slides.push({ kind: "foresight", label: "Could anyone have seen it coming?", title: KNOW[n.knowable] || "Not yet rated", text: n.foresight || "" });
  const pk = PATTERNS.find((p) => p.name.toLowerCase() === String(n.pattern || "").toLowerCase());
  if (pk) slides.push({ kind: "pattern", label: "Pattern", title: pk.name, patternKey: pk.key });
  // Long texts make long titles; trim the repeat between title and text.
  slides.forEach((s) => { if (s.text && s.title && s.text.startsWith(s.title)) s.text = s.text.slice(s.title.length).trim(); if (s.title.length > 70) { s.text = s.title + " " + (s.text || ""); s.title = s.label; } });
  return { slug: n.slug, headline: String(n.work).split(" (")[0], dek: first(n.solved), scene: sceneOf(n), slides, auto: true };
}
export const sceneOf = (n) => `/img/scenes/${n.status === "prospective" || !DOMAINS[n.domain] ? "unsure" : n.domain}.jpg`;

// A nominee in the list: a square card in its category's jewel, with its element tile.
export function nomCardHTML(n, flags = {}) {
  const j = jewelOf(n.domain);
  const pct = herdPct(n);
  const scores = flags.scores
    ? `<p class="nc-scores"><span>Oops <b>${n.oops ?? "?"}</b></span><span>Facepalm <b>${pct != null ? pct + "%" : "?"}</b></span></p>`
    : `<p class="nc-scores"><span>${n.score} upvote${n.score === 1 ? "" : "s"}</span></p>`;
  return `<article class="nom-card" id="nom-${esc(n.id)}" data-id="${esc(n.id)}" style="${jewelVars(j)}">
    <a href="${nomineePath(n)}">
      ${elementHTML(n, "nc")}
      <h3>${esc(n.name)}</h3>
      <p class="nc-work">${esc(n.work)}</p>
      ${scores}
    </a>
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

// Line icons for the menu, drawn on a 24px grid.
const ICON = {
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  gauge: '<path d="M4.5 16.5a8 8 0 1 1 15 0"/><path d="m12 13 4-4.5"/><circle cx="12" cy="13" r="1.4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>',
  patterns: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8.5 6h7M7.2 8.2l3.6 7.6M16.8 8.2l-3.6 7.6"/>',
  plus: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>',
  table: '<rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="9.5" y="10" width="5" height="5"/><rect x="16" y="10" width="5" height="5"/><rect x="6" y="17.5" width="12" height="3.5"/>',
  award: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2.5 5 2.5-1.5-8"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

// Every page's navigation: a rail on the left on wide screens, a top bar and a bottom tab bar on phones,
// and the full menu (every section of the site) behind More.
export const MENU = [
  ["The awards", [["/midgley", "The Midgley"], ...(MURPHYS_LIVE ? [["/murphy", "The Murphy"]] : []), ["/awards", "Awards night"], ["/table", "The Categoric Table"], ["/patterns", "The Patterns"], ["/dashboards", "Dashboards"]]],
  ["What this is", [["/faq", "FAQ"], ["/faq#nominee", "What makes a good nominee"], ["/faq#scores", "How scores work"], ["/guidelines", "Community guidelines"]]],
  ["More from us", [["/shop", "Shop"], ["/#oops", "The newsletter"], ["/privacy", "Privacy"], ["/terms", "Terms"]]],
];
export function headerHTML(flags = {}) {
  const item = (href, k, label, extra = "") => `<a class="nav-i" href="${href}" ${extra}>${icon(k)}<span>${label}</span></a>`;
  return `<div class="rail">
    <a class="brand" href="/"><span class="mini" aria-hidden="true">Bf</span><span class="brand-t">The Backfire Awards</span></a>
    <nav class="rail-nav" aria-label="Main">
      ${item("/", "home", "Home")}
      ${item("/search", "search", "Search")}
      <button class="nav-i nav-nom" type="button" data-open-sheet="">${icon("plus")}<span>Nominate</span></button>
      ${item("/table", "table", "The Table")}
      ${item("/patterns", "patterns", "The Patterns")}
      ${item("/dashboards", "gauge", "Dashboards")}
      ${item("/awards", "award", "The Awards")}
      ${item("/shop", "bag", "Shop")}
    </nav>
    <button class="nav-i nav-theme" type="button" data-theme-toggle aria-label="Switch between night and day">${icon("sun")}<span class="t-day">Day mode</span><span class="t-night">Night mode</span></button>
    <button class="nav-i nav-oops" type="button" data-oops aria-haspopup="dialog">${icon("mail")}<span>Newsletter</span></button>
    <button class="nav-i nav-more" type="button" data-menu aria-expanded="false" aria-controls="menu-panel">${icon("menu")}<span>More</span></button>
  </div>
  <div class="oops-box" id="oops-box" role="dialog" aria-modal="true" aria-labelledby="ob-h" hidden>
    <div class="oops-box-in">
      <button class="menu-x" type="button" data-oops-close aria-label="Close">×</button>
      <p class="ob-label">The newsletter</p>
      <h2 id="ob-h">The Backfire Newsletter</h2>
      <p>${OOPS_LINE}</p>
      ${signupHTML("rail")}
    </div>
  </div>
  <nav class="tabbar" aria-label="Main">
    ${item("/", "home", "Home")}
    ${item("/search", "search", "Search")}
    <button class="nav-i nav-nom" type="button" data-open-sheet="" aria-label="Nominate">${icon("plus")}<span>Nominate</span></button>
    ${item("/table", "table", "Table")}
    <button class="nav-i" type="button" data-menu aria-expanded="false" aria-controls="menu-panel">${icon("menu")}<span>More</span></button>
  </nav>
  <div class="menu-panel" id="menu-panel" hidden>
    <div class="menu-in">
      <button class="menu-x" type="button" data-menu-close aria-label="Close menu">×</button>
      <section class="menu-oops"><h2>The Backfire Newsletter</h2><p>${OOPS_LINE}</p>${signupHTML("menu")}</section>
      <section><h2>Display</h2><button class="nav-theme menu-theme" type="button" data-theme-toggle><span class="t-day">Switch to day mode</span><span class="t-night">Switch to night mode</span></button></section>
      ${MENU.map(([h, links]) => `<section><h2>${h}</h2>${links.map(([href, t]) => `<a href="${href}" data-menu-close>${t}</a>`).join("")}</section>`).join("")}
      ${flags.staging ? `<section class="menu-look"><h2>Look (staging only)</h2><a href="?look=70s">1970s</a><a href="?look=classic">Classic</a></section>` : ""}
    </div>
  </div>`;
}

// One form for both awards. Pick the award, then fill in what that award needs.
export function sheetHTML() {
  const cats = `<option value="">Not sure</option>` + Object.entries(DOMAINS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  const f = (id, label, el, hint = "") => `<label class="sh-field" for="${id}"><span>${label}</span>${el}${hint ? `<small>${hint}</small>` : ""}</label>`;
  return `<div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" hidden>
    <div class="sheet-in">
      <button class="sheet-x" type="button" data-close-sheet aria-label="Close">×</button>
      <p class="sh-step">Nominate</p>
      <h2 id="sheet-h">${MURPHYS_LIVE ? "Which award?" : "Nominate a backfire"}</h2>
      <div class="sh-pick" role="radiogroup" aria-label="Award"${MURPHYS_LIVE ? "" : " hidden"}>
        <button type="button" role="radio" aria-checked="false" data-award="midgley"><span class="element aw-midgley"><span class="n">No. 1</span><span class="sym">Mg</span><span class="w">MIDGLEY</span></span><b>The Midgley</b><small>A backfire at world scale: an invention, product or decision.</small></button>
        <button type="button" role="radio" aria-checked="false" data-award="murphy"><span class="element aw-murphy"><span class="n">No. 2</span><span class="sym">Mu</span><span class="w">MURPHY</span></span><b>The Murphy</b><small>A backfire you built yourself: the fix in your product, company or invention that made things worse.</small></button>
      </div>
      <form class="sh-form" data-award-form="midgley" hidden novalidate>
        ${f("s-name", "Nominee", `<input id="s-name" maxlength="80" required placeholder="Person, company or program">`)}
        <div class="sh-match" id="s-match" hidden></div>
        ${f("s-work", "What they made or decided", `<input id="s-work" maxlength="120" required placeholder="Leaded gasoline">`)}
        ${f("s-solved", "What went right", `<textarea id="s-solved" maxlength="600" required placeholder="The problem it solved, and how well"></textarea>`)}
        ${f("s-backfire", "What went oops", `<textarea id="s-backfire" maxlength="600" required placeholder="Who or what was harmed, and how"></textarea>`)}
        ${f("s-domain", "Category", `<select id="s-domain">${cats}</select>`)}
        ${f("s-wiki", "A Wikipedia page about it (optional)", `<input id="s-wiki" type="url" maxlength="500" placeholder="https://en.wikipedia.org/wiki/...">`)}
        ${f("s-author", "Your name (optional)", `<input id="s-author" maxlength="60" autocomplete="name" placeholder="Shown as the nominator">`)}
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="ts" data-ts></div>
        <div class="sh-actions"><button class="primary" type="submit">Send nomination</button><span class="msg" role="status"></span></div>
        <p class="sh-fine">Nominations appear after a quick review against the <a href="/guidelines">guidelines</a>.</p>
      </form>
      <form class="sh-form" data-award-form="murphy" hidden novalidate>
        ${f("m-fix", "What were you trying to fix?", `<textarea id="m-fix" maxlength="600" required placeholder="We offered a launch discount to win our first customers"></textarea>`)}
        ${f("m-oops", "What happened instead?", `<textarea id="m-oops" maxlength="600" required placeholder="Customers learned to wait for the next discount"></textarea>`)}
        ${f("m-building", "What are you building? (optional, never published)", `<input id="m-building" maxlength="120" placeholder="A scheduling app for clinics">`)}
        ${f("m-name", "Your first name (optional)", `<input id="m-name" maxlength="40" autocomplete="given-name">`, "Used if we feature it.")}
        ${f("m-email", "Email (optional)", `<input id="m-email" type="email" maxlength="254" autocomplete="email">`, "Only to tell you if it's featured.")}
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="ts" data-ts></div>
        <div class="sh-actions"><button class="primary" type="submit">Send my Murphy</button><span class="msg" role="status"></span></div>
        <p class="sh-fine">Keep it about the decision, not a person someone could identify.</p>
      </form>
      <div class="sh-done" hidden><h2>Thanks.</h2><p></p><button class="primary" type="button" data-close-sheet>Done</button></div>
    </div>
  </div>`;
}

export function footerHTML() {
  const socials = LINKS.socials.length
    ? LINKS.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")
    : `<span class="placeholder">Social links coming soon</span>`;
  return `<div class="site-foot-in">
    <div class="oops-mini">
      <p><b>The Backfire Newsletter</b> One short email a week about things that worked too well.</p>
      ${signupHTML("foot")}
    </div>
    <nav class="foot" aria-label="Site">
      <a href="/">Nominees</a>
      <a href="/midgley">The Midgley</a>
      ${MURPHYS_LIVE ? `<a href="/murphy">The Murphy</a>` : ""}
      <a href="/awards">The Awards</a>
      <a href="/shop">Shop</a>
      <a href="/faq">FAQ</a>
      <a href="/guidelines">Guidelines</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="https://goatfarm.team">Who we are ↗</a>
    </nav>
    <div class="socials">${socials}</div>
    <p class="runby">Run by <a href="https://goatfarm.team">Goat Farm</a>: five humans and one AI goat. Better to try and fail than never try. Mostly.</p>
  </div>`;
}

// ---------------------------------------------------------------- patterns

// Things people nominate that don't meet the standard, and why. One list for the guidelines page,
// the Nominate form's name check and Goat. Each "why" sticks to documented facts.
export const NOT_A_FIT_RULES = {
  failed: "A failure, not a backfire",
  design: "A weapon, not a fix",
  fraud: "It was a deception",
  accident: "An accident, not a solution",
};
export const NOT_A_FIT = [
  { name: "Thalidomide", match: ["thalidomide"], rule: "failed",
    why: "A sedative sold as safe in pregnancy that caused severe birth defects in more than 10,000 babies. It was never properly tested for the people it was sold to. A safety failure, not a fix that worked." },
  { name: "Chernobyl", match: ["chernobyl"], rule: "accident",
    why: "A reactor explosion during a safety test on a flawed design in 1986. It was a disaster, not the side effect of nuclear power doing its job." },
  { name: "Three Mile Island", match: ["three mile island"], rule: "accident",
    why: "A partial meltdown in 1979 from equipment failure and operator confusion. An accident, not a backfire." },
  { name: "The Ford Pinto", match: ["pinto", "ford pinto"], rule: "failed",
    why: "A fuel tank placement that made rear-end crashes more dangerous. A product defect, not a fix that worked." },
  { name: "New Coke", match: ["new coke"], rule: "failed",
    why: "A product people didn't want. The old formula was back on shelves within three months in 1985. A flop, not a backfire." },
  { name: "Agent Orange", match: ["agent orange"], rule: "design",
    why: "A defoliant sprayed as a weapon of war. Its dioxin did lasting harm to Vietnamese civilians and US veterans, but a weapon is not a fix for a problem, so it is out of scope here." },
  { name: "The atomic bomb", match: ["atomic bomb", "atom bomb", "nuclear bomb", "manhattan project"], rule: "design",
    why: "Built to destroy. Harm by design doesn't qualify, though nuclear power and its waste can." },
  { name: "Theranos", match: ["theranos", "elizabeth holmes"], rule: "fraud",
    why: "Its blood tests never worked as claimed, and its founder was convicted of fraud in 2022. Lying is not an unintended consequence." },
];
const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
export const notAFitFor = (q) => { const t = norm(q); return t.length < 4 ? null : NOT_A_FIT.find((x) => x.match.some((m) => t.includes(m) || (m.includes(t) && t.length >= 5))) || null; };
export function notAFitHTML() {
  return `<ul class="naf">${NOT_A_FIT.map((x) => `<li><b>${esc(x.name)}</b> <span class="naf-rule">${esc(NOT_A_FIT_RULES[x.rule])}</span><p>${esc(x.why)}</p></li>`).join("")}</ul>`;
}

// The patterns behind backfires. Every nominee gets one. Order is fixed; add new ones at the end.
export const PATTERNS = [
  { key: "surplus", name: "Solve a shortage, create a surplus", text: "Too little becomes too much, and the extra goes somewhere." },
  { key: "stable", name: "Too stable to go away", text: "Built to last, so it lasts where it shouldn't." },
  { key: "moved", name: "The problem moves", text: "Fixed in one place, it lands in another." },
  { key: "everyone", name: "Great for one, bad for all", text: "Each user wins. When everyone uses it, everyone loses." },
  { key: "metric", name: "Chasing the wrong number", text: "It hit its target. The target was the wrong one." },
  { key: "resistance", name: "The cure breeds resistance", text: "Kill most of the problem and the survivors take over." },
  { key: "gamed", name: "The reward gets gamed", text: "People chase the incentive instead of the goal." },
  { key: "later", name: "Cheap now, paid later", text: "The bill arrives decades after the benefit." },
  { key: "flipped", name: "The lesson flipped", text: "Built to teach one lesson, it taught the opposite." },
  { key: "buffered", name: "The risk piles up", text: "Stop every small failure, and the risk saves up for one big one." },
];
const COUNT_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export const PATTERN_COUNT = COUNT_WORD[PATTERNS.length] || String(PATTERNS.length);
// Why patterns matter, on every focused pattern card. Built from the count so it stays true as patterns are added.
export const PATTERN_WHY = `Backfires repeat. We sort every one into ${PATTERN_COUNT} patterns, so you can spot one before you make one yourself.`;

// ---------------------------------------------------------------- lists

export const HONOREE = "midgley"; // holds the first award; shown on /midgley, kept out of the ranked list

// "Top" ranks by upvotes, or by Facepalm "yes" votes once scores are on.
export const topValue = (n, flags) => (flags && flags.scores ? n.herdYes || 0 : n.score || 0);
export const byTop = (flags) => (a, b) => topValue(b, flags) - topValue(a, flags) || String(a.createdAt).localeCompare(String(b.createdAt));

export function categoryChipsHTML(active, counts = {}) {
  return `<a class="catchip" href="/" aria-current="${!active}">All</a>` +
    Object.entries(DOMAINS).map(([k, v]) =>
      `<a class="catchip" href="/category/${CATEGORY_SLUGS[k]}" aria-current="${active === k}">${esc(v)}${counts[k] ? ` <span>${counts[k]}</span>` : ""}</a>`).join("");
}

// ---------------------------------------------------------------- the periodic table of backfires

// Jewel tones, one per category. Each category is a "group" in the table, the way elements are.
// New categories take the next unused jewel; the list leaves room to grow.
// deep: card background. base: tiles and accents. light: text and rules on deep.
export const JEWELS = [
  { name: "Ruby",       deep: "#3B0A14", base: "#9B1B30", light: "#F4B6C0" },
  { name: "Sapphire",   deep: "#0A1A3B", base: "#1F4E9C", light: "#B5CBF2" },
  { name: "Citrine",    deep: "#3A2604", base: "#B8790F", light: "#F6D89A" },
  { name: "Emerald",    deep: "#06291D", base: "#0F7A55", light: "#A8E3C9" },
  { name: "Amethyst",   deep: "#241038", base: "#6A3FA0", light: "#D6C2F0" },
  { name: "Tourmaline", deep: "#062A2C", base: "#127C82", light: "#A6E0E2" },
  { name: "Garnet",     deep: "#331008", base: "#8C3A1C", light: "#F0C2AE" },
  { name: "Rhodolite",  deep: "#360A22", base: "#A62C67", light: "#F3B8D3" },
  { name: "Peridot",    deep: "#1F2A06", base: "#5E7F14", light: "#D6E8A4" },
  { name: "Lapis",      deep: "#0D1530", base: "#2C3F8C", light: "#C1CBF1" },
  { name: "Topaz",      deep: "#2E1A06", base: "#A3591A", light: "#F2CFA6" },
  { name: "Jade",       deep: "#0B2A22", base: "#2E7D64", light: "#B8E2D2" },
];
export const CATEGORY_JEWEL = {
  materials: "Ruby", cities: "Sapphire", energy: "Citrine", food: "Emerald",
  information: "Amethyst", governance: "Tourmaline", finance: "Garnet", health: "Rhodolite",
};
const ONYX = { name: "Onyx", deep: "#111418", base: "#3A424C", light: "#D5DBE1" }; // "Not sure yet"
export function jewelOf(domain) {
  const name = CATEGORY_JEWEL[domain];
  if (name) return JEWELS.find((j) => j.name === name);
  const keys = Object.keys(DOMAINS);
  const i = keys.indexOf(domain);
  return i >= 0 ? JEWELS[i % JEWELS.length] : ONYX;
}
// Category colors go out as named variables with today's value as the fallback, so a site "look"
// (see styles.css, html[data-look]) can retune every category in one place.
const jwSlug = (j) => (j.name || "prospective").toLowerCase();
export const jewelVar = (j, part) => `var(--jw-${jwSlug(j)}-${part[0]},${j[part]})`;
const jewelVars = (j) => `--deep:${jewelVar(j, "deep")};--base:${jewelVar(j, "base")};--light:${jewelVar(j, "light")}`;

// A nominee as an element. Everything on the tile is a fixed fact, so a saved image never goes stale:
//   top left     the category's group number (the color says the same thing)
//   top right    year born (a person) or founded (an organization)
//   center       symbol: two letters from the surname
//   word         the surname
//   bottom left  ▲ people helped, as a power of ten
//   bottom right ▼ people harmed, as a power of ten
// Color is the category; its group number heads the column in the table.
// Live numbers (scores, ranks) stay on the website, never on the tile.
// 9 -> "1B", 8 -> "100M", 4 -> "10K". Plain shorthand people already read on price tags and follower counts.
// Researched figures are estimates, so they carry "~" (about).
export function powerText(r) {
  if (r == null) return "?";
  return "~" + powerNum(r);
}
function powerNum(r) {
  const unit = r >= 9 ? ["B", 9] : r >= 6 ? ["M", 6] : r >= 3 ? ["K", 3] : ["", 0];
  return String(10 ** (r - unit[1])) + unit[0];
}
// Plain words for a power of ten: 9 -> "About a billion people (estimate)".
export function powerWords(r) {
  if (r == null) return "Not yet researched";
  const names = { 3: "a thousand", 4: "10,000", 5: "100,000", 6: "a million", 7: "10 million", 8: "100 million", 9: "a billion" };
  return (names[r] ? `About ${names[r]}` : r < 3 ? "Fewer than a thousand" : "More than a billion") + " people (estimate)";
}
export const surnameOf = (name) => String(name).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, "").split(/\s+/).pop();
export const groupOf = (domain) => { const i = Object.keys(DOMAINS).indexOf(domain); return i >= 0 ? i + 1 : null; };
function ordinal(k) {
  const t = k % 100, u = k % 10;
  return k + (t >= 11 && t <= 13 ? "th" : u === 1 ? "st" : u === 2 ? "nd" : u === 3 ? "rd" : "th");
}

export function elementHTML(n, size = "") {
  const j = jewelOf(n.domain);
  return `<div class="el ${size}" style="${jewelVars(j)}">
    <span class="el-num" title="Group">${groupOf(n.domain) ?? "?"}</span>
    <span class="el-year" title="Born">${n.born ?? "?"}</span>
    <span class="el-sym">${esc(symbol(n.name))}</span>
    <span class="el-name">${esc(surnameOf(n.name))}</span>
    <span class="el-up" title="People helped, estimated"><i>▲</i>${powerText(n.helped)}</span>
    <span class="el-down" title="People harmed, estimated"><i>▼</i>${powerText(n.harmed)}</span>
  </div>`;
}

// The key: the tile in the middle, a label around it for each spot, with a line to what it names.
// Positions are percentages of a square, so the diagram scales like an image.
const KEY_SPOTS = [
  // [label position class, line from (x, y), line to (x, y)]: measured against the tile at 36% wide, 28% from the top
  ["k-group", [29, 18], [35.8, 31.8]],
  ["k-born", [71, 15], [64.2, 31.8]],
  ["k-sym", [29, 44], [43.5, 44]],
  ["k-name", [71, 54.4], [54.6, 54.4]],
  ["k-up", [20, 73], [35.8, 60.4]],
  ["k-down", [80, 73], [64.2, 60.4]],
];
export function keyHTML(n) {
  const g = groupOf(n.domain);
  const who = surnameOf(n.name);
  const text = {
    "k-group": [g ?? "?", "Group", `${DOMAINS[n.domain] || "Category not set"}. The color matches.`],
    "k-born": [n.born ?? "?", "Born", n.born ? `${who} was born in ${n.born}.` : "Year born, or founded."],
    "k-sym": [symbol(n.name), "Symbol", "The first two letters of the name."],
    "k-name": [who, "Name", "The surname, or the short name of a program."],
    "k-up": ["▲" + powerText(n.helped), "Helped", `${powerWords(n.helped)}.`],
    "k-down": ["▼" + powerText(n.harmed), "Harmed", `${powerWords(n.harmed)}.`],
  };
  const lines = KEY_SPOTS.map(([, a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><circle cx="${b[0]}" cy="${b[1]}" r="0.8"/>`).join("");
  return `<div class="el-diagram" style="${jewelVars(jewelOf(n.domain))}">
    <svg class="dg-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
    <div class="dg-tile">${elementHTML(n, "dg")}</div>
    ${KEY_SPOTS.map(([cls]) => { const [v, h, d] = text[cls]; return `<div class="dg-label ${cls}"><b>${esc(String(v))}</b><span>${esc(h)}</span><p>${esc(d)}</p></div>`; }).join("")}
  </div>`;
}

// Instagram has no vote buttons, so an exported post ends by asking in the comments instead.
// Hidden on the site; feed.js shows it only while saving cards for Instagram.
const IG_ASK = `<section class="cc cc-igask" data-ig-only aria-hidden="true">
    <div class="cc-body">
      <p class="cc-label">Your verdict</p>
      <h3 class="cc-title">Worth it?</h3>
      <p class="cc-igvote"><span>💡 Yes</span><span>🤦 No</span></p>
      <p class="cc-text">Answer in the comments.</p>
      <p class="cc-follow">Follow, like and share. Help your fellow humans avoid the lion at the watering hole.</p>
    </div>
    <footer class="cc-foot"><span>${BRAND_DOMAIN}</span><span>@backfireawards</span></footer>
  </section>`;

// The carousel: a headline card, the write-up one idea per card, then the payoff and the ask.
// data comes from /carousels/<slug>.json.
export function carouselHTML(n, data, flags = {}) {
  const j = jewelOf(n.domain);
  const cards = [];
  const key = data.keyCard !== false; // story-shaped carousels skip "How to read the tile"
  const total = data.slides.length + (key ? 3 : 2);
  const foot = (i) => `<footer class="cc-foot"><span>${BRAND_DOMAIN}</span><span>${i} / ${total}</span></footer>`;
  cards.push(`<section class="cc cc-hook" aria-roledescription="slide" aria-label="1 of ${total}">
    ${data.portrait ? `<figure class="cc-portrait${data.portrait.photo ? " photo" : ""}"><img src="${esc(data.portrait.image)}" alt="${esc(data.portrait.alt)}" loading="lazy"></figure>`
      : `<img class="cc-scene" src="${esc(data.scene || sceneOf(n))}" alt="" loading="lazy">`}
    <div class="cc-hook-top">${elementHTML(n, "lg")}<p class="cc-kicker">${esc(n.name)}<br>${esc(n.years || "")}<br>${esc(DOMAINS[n.domain] || "")}</p></div>
    <h2 class="cc-headline ${data.headline.length > 22 ? "long" : data.headline.length > 13 ? "mid" : ""}">${esc(data.headline)}</h2>
    <p class="cc-dek">${esc(data.dek)}</p>
    <p class="cc-swipe" aria-hidden="true">Swipe <span>→</span></p>
    ${foot(1)}
  </section>`);
  if (key) cards.push(`<section class="cc cc-key" aria-roledescription="slide" aria-label="2 of ${total}">
    <p class="cc-label cc-key-title">How to read the tile</p>${keyHTML(n)}
    ${foot(2)}
  </section>`);
  let num = 0; // the pattern card carries its own number, so story cards count without it
  data.slides.forEach((s, k) => {
    const i = k + (key ? 3 : 2);
    if (s.kind !== "pattern") num++;
    const img = s.image ? `<figure class="cc-img"><img src="${esc(s.image)}" alt="${esc(s.alt || "")}" loading="lazy"><figcaption>${esc(s.credit || "")}</figcaption></figure>` : "";
    const stat = s.stat ? `<p class="cc-stat"><b>${esc(s.stat)}</b> ${esc(s.statLabel || "")}</p>` : "";
    const chip = s.kind === "foresight" ? foresightHTML(s.knowable || n.knowable) : ""; // a story may correct the rating
    const also = s.also && s.also.length ? `<ul class="cc-also">${s.also.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : "";
    // A focused pattern card (story carousels): this pattern big, why patterns matter, and all the patterns as a small row.
    const pi = PATTERNS.findIndex((p) => p.key === s.patternKey);
    const focus = s.kind === "pattern" && s.focus;
    const ledger = s.kind === "ledger" ? `<div class="cc-lg"><div class="lg-gave"><h4>${esc(s.gainsLabel || "What it gave")}</h4><ul>${(s.gains || []).map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
      <div class="lg-cost"><h4>${esc(s.costsLabel || "What it cost")}</h4><ul>${(s.costs || []).map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div></div>` : "";
    const lessons = s.items && s.items.length ? `<ol class="cc-lessons">${s.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : "";
    const patterns = focus ? `<p class="cc-text">${esc(PATTERNS[pi].text)}</p><p class="cc-why">${esc(PATTERN_WHY)}</p>
      <ol class="cc-pdots" aria-label="The ${PATTERN_COUNT} patterns">${PATTERNS.map((p, i) => `<li class="${i === pi ? "on" : ""}" title="${esc(p.name)}">${i + 1}</li>`).join("")}</ol>`
      : s.kind === "pattern" ? `<ol class="cc-patterns">${PATTERNS.map((p, i) => `<li class="${p.key === s.patternKey ? "on" : ""}"><span class="pn">${p.key === s.patternKey ? "→ " : ""}#${i + 1}</span><span><b>${esc(p.name)}</b> ${esc(p.text)}</span></li>`).join("")}</ol>` : "";
    cards.push(`<section class="cc cc-${esc(s.kind)} ${img ? "has-img" : "no-img"}" data-sym="${esc(symbol(n.name))}" aria-roledescription="slide" aria-label="${i} of ${total}">
      ${img}
      <div class="cc-body">
        ${s.kind === "pattern"
          ? `<p class="cc-label cc-eyebrow">${focus ? `${s.eyebrow ? esc(s.eyebrow) + " · " : ""}Pattern ${pi + 1} of ${PATTERNS.length}` : `Pattern #${pi + 1}`}</p>`
          : `<p class="cc-label"><span>${String(num).padStart(2, "0")}</span> ${s.title === s.label ? "" : esc(s.label)}</p>`}
        <h3 class="cc-title">${esc(s.title)}</h3>
        ${stat}${chip}
        ${s.text ? `<p class="cc-text">${esc(s.text)}</p>` : ""}${ledger}${lessons}${also}${patterns}
      </div>
      ${foot(i)}
    </section>`);
  });
  const pct = herdPct(n);
  const band = oopsBand(n.oops);
  if (n.id === HONOREE) cards.push(`<section class="cc cc-award" aria-roledescription="slide" aria-label="${total} of ${total}">
    <figure class="cc-trophy"><img src="/img/brand/lifetime-midgley.jpg" alt="A bronze figure of Thomas Midgley Jr. under a glass dome. The plaque reads: The Midgley. Contains lead. In case of emergency, do not break glass." loading="lazy"></figure>
    <div class="cc-body">
      <p class="cc-label">The first Midgley</p>
      <p class="cc-award-kind">Lifetime Achievement</p>
      <h3 class="cc-title">Thomas Midgley Jr.</h3>
      <p class="cc-text">For changing the world twice.</p>
      <p class="cc-cta">Nominate the next one at <b>${BRAND_DOMAIN}</b></p>
    </div>
    ${foot(total)}
  </section>`);
  else cards.push(`<section class="cc cc-payoff" data-web-only aria-roledescription="slide" aria-label="${total} of ${total}">
    <div class="cc-body">
      <p class="cc-label">The verdict so far</p>
      <div class="cc-scores">
        <div><span class="k">Oops Score</span><b>${n.oops != null ? n.oops : "?"}</b><span class="s">${band ? esc(band.label) : "Judges still scoring"}</span></div>
        <div><span class="k">Facepalm Index</span><b>${pct != null ? pct + "%" : "?"}</b><span class="s">${pct != null ? n.herdTotal + " votes" : "Not enough votes yet"}</span></div>
      </div>
      <h3 class="cc-title">${esc(n.work)}: worth it?</h3>
      <p class="cc-cta">Vote and argue at <b>${BRAND_DOMAIN}${nomineePath(n)}</b></p>
      <p class="cc-follow">Follow the Backfire Awards for a new backfire every week.</p>
    </div>
    ${foot(total)}
  </section>`);
  cards.push(IG_ASK);
  return `<div class="carousel" style="${jewelVars(j)}" data-carousel>
    <div class="cc-track" tabindex="0" aria-label="${esc(n.name)}, ${total} cards">${cards.join("")}</div>
    <div class="cc-nav">
      <button type="button" data-cc="prev" aria-label="Previous card">←</button>
      <span class="cc-dots">${Array.from({ length: total }, (_, i) => `<i data-cc-dot="${i}"></i>`).join("")}</span>
      <button type="button" data-cc="next" aria-label="Next card">→</button>
    </div>
  </div>`;
}

// Knowable, partly, unforeseeable: a three-step scale with the nominee's place marked.
function foresightHTML(k) {
  const steps = [["knowable", "Knowable"], ["mixed", "Partly"], ["unforeseeable", "Unforeseeable"]];
  if (k === "contested") return `<span class="cc-chip">Still contested</span>`;
  return `<div class="cc-scale" role="img" aria-label="${esc(KNOW[k] || "Not rated")}">${steps.map(([key, label]) => `<span class="${key === k ? "on" : ""}">${label}</span>`).join("")}</div>`;
}

// The whole table: categories are columns (groups); each new nominee joins the bottom of its column.
export function tableHTML(noms) {
  const keys = Object.keys(DOMAINS);
  const cols = keys.map((k) => {
    const j = jewelOf(k);
    const items = noms.filter((n) => n.domain === k);
    return `<div class="pt-col" style="${jewelVars(j)}"><p class="pt-head"><b>${groupOf(k)}</b> ${esc(DOMAINS[k])}</p>
      ${items.sort((a, b) => (a.catalogNo || 0) - (b.catalogNo || 0)).map((n) => `<a href="${nomineePath(n)}" title="${esc(n.name)}: ${esc(n.work)}">${elementHTML(n, "sm")}</a>`).join("")}</div>`;
  });
  return `<div class="ptable">${cols.join("")}</div>`;
}

// ---------------------------------------------------------------- the Categoric Table

// What each category covers, with a few well-known backfires, for the table's legend.
export const CATEGORY_INFO = {
  health: { text: "Treatments, drugs and public health.", examples: ["Antibiotics in animal feed and the rise of resistant bacteria", "Thalidomide", "Radium tonics"] },
  governance: { text: "Laws, rules and rewards that changed what people do.", examples: ["England's window tax, and the bricked-up windows", "Prohibition", "Bounties that bred the pests they paid for"] },
  energy: { text: "How we power homes, factories and cars.", examples: ["Corn ethanol", "Coal smoke stacks built tall to clear the air nearby", "Biomass burning"] },
  information: { text: "Computers, networks and software.", examples: ["Engagement-ranked social feeds", "Email, and spam", "Infinite scroll"] },
  materials: { text: "Substances made to be useful and durable.", examples: ["CFCs and the ozone hole", "PFAS, the forever chemicals", "Asbestos"] },
  food: { text: "Growing food and managing nature.", examples: ["Cane toads released in Australia", "DDT", "Kudzu planted to stop erosion"] },
  finance: { text: "Products, prices and promotions.", examples: ["Planned obsolescence", "Bottled water", "The Landlord's Game, which became Monopoly"] },
  cities: { text: "How we build places and move through them.", examples: ["Urban freeways through city neighborhoods", "Parking minimums", "Wider roads and the traffic they bring"] },
  prospective: { text: "Coming later: teardowns of products and decisions being made today, read against the patterns. Like the two rows under the periodic table, they sit apart.", examples: [] },
};

// Where each category sits. Positions copy the periodic table: [row, column], rows 1 to 7 plus
// rows 9 and 10 for the two separate rows. 118 squares in all.
const PT_BLOCKS = [
  ["health", [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1]]],
  ["governance", [[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2]]],
  ["energy", [4, 5, 6, 7].flatMap((r) => [3, 4, 5, 6, 7].filter((c) => !(c === 3 && r >= 6)).map((c) => [r, c]))],
  ["information", [4, 5, 6, 7].flatMap((r) => [8, 9, 10, 11, 12].map((c) => [r, c]))],
  ["materials", [2, 3, 4, 5, 6, 7].flatMap((r) => [13, 14].map((c) => [r, c]))],
  ["food", [2, 3, 4, 5, 6, 7].flatMap((r) => [15, 16].map((c) => [r, c]))],
  ["finance", [[2, 17], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17]]],
  ["cities", [[1, 18], [2, 18], [3, 18], [4, 18], [5, 18], [6, 18], [7, 18]]],
  ["prospective", [9, 10].flatMap((r) => Array.from({ length: 15 }, (_, i) => [r, i + 3]))],
];

export function categoricTableHTML(noms) {
  const byCat = {};
  [...noms].sort((a, b) => (a.catalogNo || 0) - (b.catalogNo || 0)).forEach((n) => {
    const k = n.status === "prospective" ? "prospective" : DOMAINS[n.domain] ? n.domain : null;
    if (k) (byCat[k] = byCat[k] || []).push(n);
  });
  const cells = [];
  for (const [k, spots] of PT_BLOCKS) {
    const j = k === "prospective" ? { deep: "#14181C", base: "#4A5560", light: "#D5DBE1" } : jewelOf(k);
    const items = byCat[k] || [];
    spots.forEach(([r, c], i) => {
      const n = items[i];
      const style = `grid-row:${r};grid-column:${c};${jewelVars(j)}`;
      cells.push(n
        ? `<a class="pt-cell filled" style="${style}" href="${nomineePath(n)}" aria-label="${esc(n.name)}: ${esc(n.work)}" data-name="${esc(n.name)}" data-work="${esc(n.work)}" data-desc="${esc((String(n.backfire).match(/^.*?[.!?](\s|$)/) || [n.backfire])[0].trim())}">${elementHTML(n, "pt")}<span class="pt-more"><b>${esc(n.name)}</b>${esc(n.work)}</span></a>`
        : `<div class="pt-cell pt-empty" style="${style}" aria-hidden="true"><span class="pt-bf">Bf</span></div>`);
    });
  }
  cells.push(`<div class="pt-mark" style="grid-row:6;grid-column:3">↓</div><div class="pt-mark" style="grid-row:7;grid-column:3">↓</div>`);
  return cells.join("");
}

export function categoricLegendHTML() {
  const keys = [...Object.keys(DOMAINS), "prospective"];
  return keys.map((k) => {
    const j = k === "prospective" ? { deep: "#14181C", base: "#4A5560", light: "#D5DBE1" } : jewelOf(k);
    const g = k === "prospective" ? "" : groupOf(k);
    const info = CATEGORY_INFO[k];
    return `<details class="lg-item" style="${jewelVars(j)}">
      <summary><span class="lg-box">${g}</span><span class="lg-name">${esc(k === "prospective" ? "Today (coming later)" : DOMAINS[k])}</span><span class="lg-more">more</span></summary>
      <p>${esc(info.text)}</p>
      ${info.examples.length ? `<ul>${info.examples.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
    </details>`;
  }).join("");
}
