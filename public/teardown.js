// The teardown page under each story's carousel: the record behind the cards. Tags, impact over time, references,
// image credits, corrections, then the comment test and sharing. Rendered on the server.
import { CODEBOOK, DIMENSIONS } from "./codebook.js";
import { CASE_SOURCES } from "./case-sources.js";
import { impactPanelHTML, HUES, patternChapterHTML, readouts, tagged } from "./codebook-ui.js";
import { esc, nomineePath, symbol, jewelOf, jewelVars, elementHTML, DOMAINS } from "./shared.js";

// Dated corrections per case: what changed, and why. Newest first. Shown on the case and on /corrections.
export const CORRECTIONS = [
  { id: "nobel", date: "2026-10-20", text: "Dynamite reached the Franco-Prussian War in 1870, three years after the 1867 patent. We had written four." },
  { id: "zuckerberg", date: "2026-10-20", text: "Facebook cut the weight of the angry reaction to zero in September 2020. We had written late 2020." },
  { id: "midgley", date: "2026-10-21", text: "Freon's gain now reads fridges that would not poison or burn. We had written cheap cooling for food and medicine, which no source supports." },
  { id: "nobel", date: "2026-10-21", text: "Dynamite was used by both armies in the Franco-Prussian War, in small and unknown amounts. We had written weapons for both sides." },
  { id: "edward-m-bassett", date: "2026-10-21", text: "Bassett warned that banning apartments might not survive in court. We had written that he advised cities not to ban them, which overstated his view." },
];

const label = (dim, v) => DIMENSIONS[dim]?.values?.[v] || v;
let secN = 0;
const sec = (id, title, body, open = true) =>
  `<details class="td-sec" id="${id}" data-bg-i="${secN}"${open ? " open" : ""}><summary><h2>${esc(title)}</h2></summary><div class="td-body">${body}</div></details>`;

export function teardownHTML(n, all, media = [], url = "", story = {}) {
  const pats = (n.patterns || []).map((k, i) => {
    const p = CODEBOOK.find((c) => c.key === k);
    return p ? `<a class="td-pat" href="/patterns#${k}" style="--hue:${HUES[k]}"><i></i>${esc(p.name)}${i === 0 ? "<small>main</small>" : ""}</a>` : "";
  }).join("");
  const facts = [
    ["Scale", n.scale && label("scale", n.scale)],
    ["Time lag", n.lag && label("lag", n.lag)],
    ["Who pays", (n.bearer || []).map((b) => label("bearer", b)).join(", ")],
    ["Undo", n.reversibility && label("reversibility", n.reversibility)],
    ["Began", n.began],
  ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(String(v))}</dd></div>`).join("");
  const tags = `<div class="td-pats">${pats}</div>${facts ? `<dl class="td-facts">${facts}</dl>` : ""}
    <p class="td-note">Tags from the <a href="/patterns">codebook</a>. See every case in the <a href="/dashboards">dashboards</a>.</p>`;

  const impact = impactPanelHTML(all, n.id, "");

  const refs = (CASE_SOURCES[n.slug] || CASE_SOURCES[n.id] || []).map((r) =>
    `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.source)}</a>` : esc(r.source)}</li>`).join("");

  const credits = media.map((m) => `<li><img src="${esc(m.path)}" alt="" width="56" height="56" loading="lazy"><div><b>${esc(m.title)}</b>
    <span>${esc([m.creator, m.made].filter(Boolean).join(", "))}. ${m.license_url ? `<a href="${esc(m.license_url)}" target="_blank" rel="noopener">${esc(m.license)}</a>` : esc(m.license)}${m.source_page ? `. <a href="${esc(m.source_page)}" target="_blank" rel="noopener">Source</a>` : ""}</span></div></li>`).join("");

  const fixes = CORRECTIONS.filter((c) => c.id === n.id);
  const corrections = `${fixes.length ? `<ul class="td-fixes">${fixes.map((c) => `<li><time>${c.date}</time>${esc(c.text)}</li>`).join("")}</ul>` : "<p>No corrections yet.</p>"}
    <p class="td-note">See something wrong? Email <a href="mailto:teardowns@backfireawards.com?subject=${encodeURIComponent("Correction: " + n.name)}">teardowns@backfireawards.com</a>. Every correction is dated here and on the <a href="/corrections">corrections page</a>.</p>`;

  const page = (url || "https://backfireawards.com") + nomineePath(n);
  const share = `<div class="td-actions">
      <a class="td-btn li" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}" target="_blank" rel="noopener" data-intent="share-linkedin" data-id="${esc(n.id)}">Share on LinkedIn</a>
      <button class="td-btn" type="button" data-copy-link="${esc(page)}">Copy link</button>
    </div>
    <aside class="td-comments td-float" id="discussion" aria-label="Discussion">
      <p class="td-float-q">What would you have done differently?</p>
      <button class="td-btn primary" type="button" data-intent="comment-login" data-id="${esc(n.id)}">Log in to comment</button>
      <p class="td-intent" hidden>Comments open soon. Thanks for the nudge: we counted it.</p>
    </aside>`;

  const others = all.filter((x) => x.id !== n.id).slice(0, 8).map((x) =>
    `<a class="td-other" href="${nomineePath(x)}"><span class="td-sym">${esc(symbol(x.name))}</span><span>${esc(x.name)}<small>${esc(x.work || "")}</small></span></a>`).join("");

  secN = 0;
  const bgs = (story.backgrounds || []).slice(0, 5);

  return `${bgs.length ? `<div class="td-bgs" aria-hidden="true">${bgs.map((b, i) => `<span class="${i ? "" : "on"}" style="background-image:url(${esc(b)})"></span>`).join("")}</div>` : ""}
  <section class="td" style="${jewelVars(jewelOf(n.domain))}">
    ${impact ? sec("impact", "Impact over time", `<div class="td-dark">${impact}</div>`) : ""}
    ${(() => {
      const k = (n.patterns || [])[0], p = CODEBOOK.find((c) => c.key === k);
      if (!p) return "";
      const noms = tagged(story.everyone || all.concat([n]));
      return `<section class="td-wide pp td-pattern" id="pattern">${patternChapterHTML(noms, p, CODEBOOK.indexOf(p), "pattern-" + k)}
        <p class="td-link"><a href="/patterns">See all ten patterns →</a></p></section>
        <section class="td-wide pp td-dash" id="dashboards"><h2>What ${noms.length} backfires have in common</h2>${readouts(noms)}
        <p class="td-link"><a href="/dashboards">Open the dashboards →</a></p></section>`;
    })()}
    ${sec("tags", "The pattern and tags", tags)}

    ${refs ? sec("references", "References", `<ol class="td-refs">${refs}</ol>`, false) : ""}
    ${credits ? sec("credits", "Image credits", `<ul class="td-credits">${credits}</ul>`, false) : ""}
    ${sec("corrections", "Corrections", corrections, false)}
    <h2 class="feed-h td-more" id="more">More teardowns</h2>
    <nav class="td-others" aria-label="More teardowns">${others}</nav>
  </section>`;
}

// The top of a teardown page, before the carousel: the story's headline, its tile and its main pattern,
// in the category's color. On a first visit this is the brand's front door.
export function teardownMastHTML(n, story = {}) {
  const main = CODEBOOK.find((c) => c.key === (n.patterns || [])[0]);
  const stops = [["story", "The story"], ["impact", "Impact"], ["pattern", "Pattern"], ["dashboards", "Dashboards"], ["tags", "Tags"],
    ["references", "Sources"], ["corrections", "Corrections"], ["more", "More"]];
  return `<a class="td-hero" href="/" aria-label="The Backfire Awards home">
      <img src="/img/brand/hero-compact.jpg" srcset="/img/brand/hero-compact.webp" width="1920" height="640" alt="Backfire Awards. Bright Ideas. Unintended Consequences.">
    </a>
    <header class="td-mast" style="${jewelVars(jewelOf(n.domain))}">
      <div class="td-mast-tile">${elementHTML(n, "lg")}</div>
      <div class="td-mast-txt">
        <p class="td-kicker">A Backfire teardown · ${esc(DOMAINS[n.domain] || "")}</p>
        <h1>${esc(n.name)}</h1>
        <p class="td-dek">${esc(n.work)}${n.years ? ` · ${esc(n.years)}` : ""}</p>
        ${main ? `<a class="td-mast-pat" href="#pattern" style="--hue:${HUES[main.key]}"><i></i>The pattern: ${esc(main.name)}</a>` : ""}
      </div>
    </header>
    <span id="story" class="td-anchor"></span>
    <nav class="td-nav" aria-label="On this page"><ol>${stops.map(([id, l]) => `<li><a href="#${id}" data-stop="${id}">${l}</a></li>`).join("")}</ol>
      <div class="td-nav-act">
        <a class="td-nav-btn li" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://backfireawards.com" + nomineePath(n))}" target="_blank" rel="noopener" data-intent="share-linkedin" data-id="${esc(n.id)}">Share</a>
        <button class="td-nav-btn" type="button" data-copy-link="${esc("https://backfireawards.com" + nomineePath(n))}">Copy link</button>
        <button class="td-nav-btn cta" type="button" data-intent="comment-login" data-id="${esc(n.id)}">Comment</button>
      </div>
      <p class="td-intent" hidden>Comments open soon. Thanks: we counted your click.</p></nav>`;
}
