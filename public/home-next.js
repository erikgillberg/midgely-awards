// A sketch of the next front page, built on the Patterns page's look: the teardowns first, then the patterns,
// the dashboards and the award. Served at /lab/home on staging and local only, until Erik approves it.
import { CODEBOOK } from "./codebook.js";
import { HUES, readouts, tagged } from "./codebook-ui.js";
import { esc, elementHTML, nomineePath, signupHTML, HONOREE } from "./shared.js";

const nameOf = (key) => CODEBOOK.find((p) => p.key === key)?.name || "";

// heads: { slug: { headline, dek } } from each teardown's carousel.
export function homeNextHTML(all, heads = {}) {
  const noms = tagged(all);
  const sources = CODEBOOK.reduce((s, p) => s + p.sources.length, 0);
  const order = [...noms].sort((a, b) => (a.id === HONOREE ? -1 : b.id === HONOREE ? 1 : 0));
  const cards = order.map((n) => {
    const h = heads[n.slug] || {};
    const main = n.patterns[0];
    return `<li><a class="hn-card" href="${nomineePath(n)}" style="--hue:${HUES[main]}">
      <span class="hn-el">${elementHTML(n, "mini")}</span>
      <span class="hn-who">${esc(n.name)}<small>${esc(n.work || "")}</small></span>
      <b class="hn-head">${esc(h.headline || n.work || n.name)}</b>
      ${h.dek ? `<span class="hn-dek">${esc(h.dek)}</span>` : ""}
      <span class="hn-pat"><i></i>${esc(nameOf(main))}</span>
    </a></li>`;
  }).join("");
  const asks = ["moved", "everyone", "metric", "later"].map((k) => {
    const p = CODEBOOK.find((c) => c.key === k);
    return `<li style="--hue:${HUES[k]}"><q>${esc(p.questions[0])}</q><a href="/patterns#${k}">${esc(p.name)}</a></li>`;
  }).join("");

  return `<header class="pp-hero hn-hero">
      <div class="glass frost pp-hero-card">
        <p class="pp-label">For founders, inventors and anyone building solutions for a better future</p>
        <h1>Sometimes the fix is the next problem</h1>
        <p class="pp-lede">Leaded gasoline made engines run better and reduced the IQ of millions. We tear down famous backfires, find the patterns behind them and surface the lessons, so you can build the future without becoming a nominee.</p>
        <ul class="pp-stats">
          <li><b>${noms.length}</b><span>teardowns</span></li>
          <li><b>${CODEBOOK.length}</b><span>patterns</span></li>
          <li><b>${sources}</b><span>research sources</span></li>
        </ul>
        <p class="pp-go"><a class="primary" href="#teardowns">Read the teardowns</a><a class="ghost" href="/patterns">The ten patterns</a></p>
      </div>
      <img class="hn-poster" src="/img/brand/bright-ideas-poster.jpg" alt="Retro poster: a beaming inventor in a space suit holds up a glowing light bulb while his lab sparks and catches fire behind him. Backfire Awards. Bright ideas. Unintended consequences.">
    </header>

    <section class="hn-sec" id="teardowns" aria-labelledby="td-h">
      <p class="pp-kicker">The teardowns</p>
      <h2 id="td-h" class="pp-sec">Famous fixes, taken apart</h2>
      <p class="hn-lede">Each one credits what the fix got right, follows what went wrong, and names the pattern behind it.</p>
      <ol class="hn-cards">${cards}</ol>
    </section>

    <section class="hn-sec" aria-labelledby="pt-h">
      <div class="pp-slab hn-slab">
        <div>
          <p class="pp-kicker">The patterns</p>
          <h2 id="pt-h" class="pp-sec">Ten ways a good fix backfires</h2>
          <p class="hn-lede">Backfires repeat. Learn the ten, and you can spot one before you ship it.</p>
          <ol class="hn-pills">${CODEBOOK.map((p, i) => `<li><a href="/patterns#${p.key}" style="--hue:${HUES[p.key]}"><span>${i + 1}</span>${esc(p.name)}</a></li>`).join("")}</ol>
        </div>
        <div>
          <h3>Ask before you ship</h3>
          <ul class="hn-asks">${asks}</ul>
        </div>
      </div>
    </section>

    <section class="hn-sec pp-data" aria-labelledby="hd-h">
      <p class="pp-kicker">Dashboards</p>
      <h2 id="hd-h" class="pp-sec">What ${noms.length} backfires have in common</h2>
      ${readouts(noms)}
      <p class="pp-go db-open"><a class="primary" href="/dashboards">Open the dashboards</a></p>
    </section>

    <section class="hn-sec" aria-labelledby="aw-h">
      <div class="pp-slab hn-slab hn-award">
        <img src="/img/brand/trophy-lead.jpg" alt="The Backfire statuette in lead: a rocket that loops up and turns back on itself, on a round base">
        <div>
          <p class="pp-kicker">The award</p>
          <h2 id="aw-h" class="pp-sec">The Midgley</h2>
          <p class="hn-lede">Cast in lead, for backfires at world scale, named for the inventor of leaded gasoline and Freon. Anyone can nominate. The first Midgleys are handed out in spring 2027.</p>
          <p class="pp-go"><a class="primary" href="#nominate" data-open-sheet="midgley">Nominate a backfire</a><a class="ghost hn-ghost" href="/midgley">About the Midgley</a></p>
        </div>
      </div>
    </section>

    <section class="hn-sec" aria-labelledby="nx-h">
      <p class="pp-kicker">Coming next</p>
      <h2 id="nx-h" class="pp-sec">From history to today</h2>
      <ul class="hn-next">
        <li><b>Teardowns of today's products and companies</b><span>The same patterns, read against decisions being made now, to find the risks and what might soften them.</span></li>
        <li><b>The Murphy</b><span>For backfires founders and inventors built themselves. Coming in a later season.</span></li>
      </ul>
    </section>

    <section class="hn-sec" aria-labelledby="wo-h">
      <div class="pp-slab hn-slab hn-oops">
        <div><p class="pp-kicker">The newsletter</p><h2 id="wo-h" class="pp-sec">The Weekly Oops</h2>
          <p class="hn-lede">One short email a week: a new backfire teardown, the pattern behind it, and who won.</p></div>
        <div>${signupHTML("home")}</div>
      </div>
    </section>`;
}
