// Shared by the server (_worker.js) and the browser (app.js, admin.js): labels,
// links, and the markup for nominee cards, the site header and the footer.
// One copy of each, so the page the server sends matches what the browser redraws.

export const SITE = "https://midgleyawards.com";
// The name printed on cards and images. Moves to the new domain before launch.
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
  beehiivForm: "71cdf4c1-b2c8-4913-bb03-cc836734a7b1", // Beehiiv: The Weekly Oops sign-up form
  socials: [],        // [{ name: "Instagram", url: "https://..." }]
};

// The Weekly Oops sign-up form from Beehiiv. The loader script draws the form where it sits.
export const weeklyOopsHTML = () =>
  `<div class="beehiiv-embed"><script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="${LINKS.beehiivForm}"></script></div>`;

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
    <a class="brand" href="/"><span class="mini" aria-hidden="true">Bf</span><span>The Backfire Awards</span></a>
    <nav aria-label="Main">
      <a href="/">Nominees</a>
      <a href="/midgley">The Midgley</a>
      <a href="/murphy">The Murphy</a>
      ${flags.categories ? `<a href="/category">Categories</a>` : ""}
      <a href="/shop">Shop</a>
    </nav>
  </div>`;
}

export function footerHTML() {
  const socials = LINKS.socials.length
    ? LINKS.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")
    : `<span class="placeholder">Social links coming soon</span>`;
  return `<div class="site-foot-in">
    <div class="oops-mini">
      <p><b>The Weekly Oops</b> One short email a week about things that worked too well.</p>
      ${weeklyOopsHTML()}
    </div>
    <nav class="foot" aria-label="Site">
      <a href="/">Nominees</a>
      <a href="/midgley">The Midgley</a>
      <a href="/murphy">The Murphy</a>
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

// ---------------------------------------------------------------- patterns

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
];

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
const jewelVars = (j) => `--deep:${j.deep};--base:${j.base};--light:${j.light}`;

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
export function powerText(r) {
  if (r == null) return "?";
  const unit = r >= 9 ? ["B", 9] : r >= 6 ? ["M", 6] : r >= 3 ? ["K", 3] : ["", 0];
  return String(10 ** (r - unit[1])) + unit[0];
}
// Plain words for a power of ten: 9 -> "a billion or more", 8 -> "100 million or more".
export function powerWords(r) {
  if (r == null) return "not yet researched";
  const names = { 3: "a thousand", 4: "10,000", 5: "100,000", 6: "a million", 7: "10 million", 8: "100 million", 9: "a billion" };
  return names[r] ? `${names[r]} or more` : r < 3 ? "fewer than a thousand" : "more than a billion";
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
    <span class="el-up" title="People helped"><i>▲</i>${powerText(n.helped)}</span>
    <span class="el-down" title="People harmed"><i>▼</i>${powerText(n.harmed)}</span>
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
    "k-up": ["▲" + powerText(n.helped), "Helped", `People it helped: ${powerWords(n.helped)}.`],
    "k-down": ["▼" + powerText(n.harmed), "Harmed", `People it harmed: ${powerWords(n.harmed)}.`],
  };
  const lines = KEY_SPOTS.map(([, a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><circle cx="${b[0]}" cy="${b[1]}" r="0.8"/>`).join("");
  return `<div class="el-diagram" style="${jewelVars(jewelOf(n.domain))}">
    <svg class="dg-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
    <div class="dg-tile">${elementHTML(n, "dg")}</div>
    ${KEY_SPOTS.map(([cls]) => { const [v, h, d] = text[cls]; return `<div class="dg-label ${cls}"><b>${esc(String(v))}</b><span>${esc(h)}</span><p>${esc(d)}</p></div>`; }).join("")}
  </div>`;
}

// The carousel: a headline card, the write-up one idea per card, then the payoff and the ask.
// data comes from /carousels/<slug>.json.
export function carouselHTML(n, data, flags = {}) {
  const j = jewelOf(n.domain);
  const cards = [];
  const total = data.slides.length + 3;
  const foot = (i) => `<footer class="cc-foot"><span>${BRAND_DOMAIN}</span><span>${i} / ${total}</span></footer>`;
  cards.push(`<section class="cc cc-hook" aria-roledescription="slide" aria-label="1 of ${total}">
    ${data.portrait ? `<figure class="cc-portrait"><img src="${esc(data.portrait.image)}" alt="${esc(data.portrait.alt)}" loading="eager"></figure>` : ""}
    <div class="cc-hook-top">${elementHTML(n, "lg")}<p class="cc-kicker">${esc(n.name)}<br>${esc(n.years || "")}<br>${esc(DOMAINS[n.domain] || "")}</p></div>
    <h2 class="cc-headline">${esc(data.headline)}</h2>
    <p class="cc-dek">${esc(data.dek)}</p>
    <p class="cc-swipe" aria-hidden="true">Swipe <span>→</span></p>
    ${foot(1)}
  </section>`);
  cards.push(`<section class="cc cc-key" aria-roledescription="slide" aria-label="2 of ${total}">
    <p class="cc-label cc-key-title">How to read the tile</p>${keyHTML(n)}
    ${foot(2)}
  </section>`);
  data.slides.forEach((s, k) => {
    const i = k + 3;
    const img = s.image ? `<figure class="cc-img"><img src="${esc(s.image)}" alt="${esc(s.alt || "")}" loading="lazy"><figcaption>${esc(s.credit || "")}</figcaption></figure>` : "";
    const stat = s.stat ? `<p class="cc-stat"><b>${esc(s.stat)}</b> ${esc(s.statLabel || "")}</p>` : "";
    const chip = s.kind === "foresight" ? foresightHTML(n.knowable) : "";
    const also = s.also && s.also.length ? `<ul class="cc-also">${s.also.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : "";
    const patterns = s.kind === "pattern" ? `<ol class="cc-patterns">${PATTERNS.map((p, i) => `<li class="${p.key === s.patternKey ? "on" : ""}"><span class="pn">${p.key === s.patternKey ? "→ " : ""}#${i + 1}</span><span><b>${esc(p.name)}</b> ${esc(p.text)}</span></li>`).join("")}</ol>` : "";
    cards.push(`<section class="cc cc-${esc(s.kind)} ${img ? "has-img" : "no-img"}" data-sym="${esc(symbol(n.name))}" aria-roledescription="slide" aria-label="${i} of ${total}">
      ${img}
      <div class="cc-body">
        ${s.kind === "pattern"
          ? `<p class="cc-label cc-eyebrow">Pattern #${PATTERNS.findIndex((p) => p.key === s.patternKey) + 1}</p>`
          : `<p class="cc-label"><span>${String(k + 1).padStart(2, "0")}</span> ${esc(s.label)}</p>`}
        <h3 class="cc-title">${esc(s.title)}</h3>
        ${stat}${chip}
        ${s.text ? `<p class="cc-text">${esc(s.text)}</p>` : ""}${also}${patterns}
      </div>
      ${foot(i)}
    </section>`);
  });
  const pct = herdPct(n);
  const band = oopsBand(n.oops);
  cards.push(`<section class="cc cc-payoff" aria-roledescription="slide" aria-label="${total} of ${total}">
    <div class="cc-body">
      <p class="cc-label">The verdict so far</p>
      <div class="cc-scores">
        <div><span class="k">Oops Score</span><b>${n.oops != null ? n.oops : "?"}</b><span class="s">${band ? esc(band.label) : "Judges still scoring"}</span></div>
        <div><span class="k">Herd Score</span><b>${pct != null ? pct + "%" : "?"}</b><span class="s">${pct != null ? n.herdTotal + " votes" : "Not enough votes yet"}</span></div>
      </div>
      <h3 class="cc-title">Is ${esc(n.name)} Midgley-worthy?</h3>
      <p class="cc-cta">Vote and argue at <b>${BRAND_DOMAIN}${nomineePath(n)}</b></p>
      <p class="cc-follow">Follow the Backfire Awards for a new backfire every week.</p>
    </div>
    ${foot(total)}
  </section>`);
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
