// The Patterns page, its dashboards, and the patterns strip on the Table page. Rendered on the server so the
// pages read without scripts; patterns.js adds the menu highlight and chart-tip.js the tooltips.
import { CODEBOOK, CODEBOOK_VERSION, DIMENSIONS } from "./codebook.js";
import { esc, symbol, nomineePath } from "./shared.js";
import { CASE_IMPACTS } from "./case-impacts.js";

const pad = (i) => String(i + 1).padStart(2, "0");
export const tagged = (noms) => noms.filter((n) => n.patterns && n.patterns.length);
const casesFor = (noms, key) => noms.filter((n) => n.patterns.includes(key))
  .map((n) => ({ n, main: n.patterns[0] === key }))
  .sort((a, b) => b.main - a.main || (a.n.began || 0) - (b.n.began || 0));
const tip = (title, lines) => `data-tip="${esc(title)}" data-tip-lines="${esc(lines.join("\n"))}" tabindex="0"`;

// ---------------------------------------------------------------- the dashboards
// Night instrument panels. Marks glow in the palette; text stays in the cream inks so the numbers read first.
const SCALE_ROWS = ["global", "national", "regional", "local"];
const LAG_COLS = ["immediate", "years", "decades", "generations"];
// Each pattern's color, from the Switchback family in the logo, stepped for the night background.
// The seven chart hues pass the colorblind and contrast checks on navy; every bar also carries its name.
export const HUES = {
  surplus: "#E56636", stable: "#6CB8E8", moved: "#1FA9AF", everyone: "#CD6199", metric: "#5981E0",
  resistance: "#E04A3F", gamed: "#D99B1F", later: "#A269C9", flipped: "#E9CFA4", buffered: "#47AA62",
};
const nameOf = (key) => CODEBOOK.find((c) => c.key === key)?.name || "";

function panel(code, title, sub, body, table, wide = "") {
  return `<figure class="db-panel${wide}"><figcaption><p class="db-code">${code}</p><h3>${esc(title)}</h3><p>${esc(sub)}</p></figcaption>
    <div class="db-plot">${body}</div>
    <details class="db-table"><summary>Show as a table</summary>${table}</details></figure>`;
}

// Ring gauges: an instrument face per headline number. The arc is the share; the number is the count.
function gauge(value, of, label, hue) {
  const r = 78, c = 2 * Math.PI * r, frac = of ? value / of : 0;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 2 * Math.PI, long = i % 5 === 0;
    const r1 = 92, r2 = long ? 99 : 96;
    return `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + r2 * Math.sin(a)).toFixed(1)}" y2="${(100 - r2 * Math.cos(a)).toFixed(1)}"${long ? ' class="long"' : ""}/>`;
  }).join("");
  return `<li class="db-gauge" style="--hue:${hue}" ${tip(label, [of ? `${value} of ${of} cases` : `${value} cases`])}>
    <span class="db-dial"><svg viewBox="0 0 200 200" aria-hidden="true"><g class="db-ticks">${ticks}</g>
      <circle class="db-track" cx="100" cy="100" r="${r}"/>
      ${of ? `<circle class="db-arc" cx="100" cy="100" r="${r}" stroke-dasharray="${(frac * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 100 100)"/>` : ""}
    </svg>
    <span class="db-gv"><b>${value}</b>${of ? `<small>of ${of}</small>` : ""}</span></span>
    <span class="db-gl">${esc(label)}</span>
  </li>`;
}

export function readouts(noms) {
  const n = noms.length;
  const seen = CODEBOOK.filter((p) => noms.some((x) => x.patterns.includes(p.key))).length;
  const global = noms.filter((x) => x.scale === "global").length;
  const sticky = noms.filter((x) => x.reversibility !== "reversible").length;
  const multi = noms.filter((x) => x.patterns.length > 1).length;
  return `<ul class="db-gauges">${gauge(n, 0, "Cases tagged", "#F2D6B0")}${gauge(seen, CODEBOOK.length, "Patterns seen", "#2BB5BB")}${gauge(global, n, "Global harm", "#EE6B3A")}${gauge(sticky, n, "Slow or impossible to undo", "#5981E0")}${gauge(multi, n, "More than one pattern", "#A269C9")}</ul>`;
}

function patternBars(noms) {
  const rows = CODEBOOK.map((p) => {
    const cs = casesFor(noms, p.key);
    return { p, main: cs.filter((c) => c.main), also: cs.filter((c) => !c.main) };
  });
  const max = Math.max(1, ...rows.map((r) => r.main.length + r.also.length));
  const bars = rows.map((r, i) => {
    const total = r.main.length + r.also.length;
    const names = [...r.main.map((c) => c.n.name + " (main)"), ...r.also.map((c) => c.n.name + " (also)")];
    return `<li style="--hue:${HUES[r.p.key]}" ${tip(r.p.name, names.length ? names : ["No cases yet"])}>
      <span class="db-bl"><span class="db-bn">${pad(i)}</span>${esc(r.p.name)}</span>
      <span class="db-track">${r.main.length ? `<span class="db-seg" style="width:${(r.main.length / max) * 100}%"></span>` : ""}${r.also.length ? `<span class="db-seg also" style="width:${(r.also.length / max) * 100}%"></span>` : ""}<b>${total || "0"}</b></span>
    </li>`;
  }).join("");
  const table = `<table><thead><tr><th>Pattern</th><th>Main</th><th>Also</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.p.name)}</td><td>${r.main.length}</td><td>${r.also.length}</td></tr>`).join("")}</tbody></table>`;
  return panel("DB-01", "Which patterns show up", "Cases per pattern. Solid is the main pattern; outlined means also present.",
    `<ol class="db-bars">${bars}</ol>`, table);
}

function matrix(noms) {
  const cell = (s, l) => noms.filter((n) => n.scale === s && n.lag === l);
  const max = Math.max(1, ...SCALE_ROWS.flatMap((s) => LAG_COLS.map((l) => cell(s, l).length)));
  const head = `<span></span>${LAG_COLS.map((l) => `<span class="db-mh">${esc(DIMENSIONS.lag.values[l])}</span>`).join("")}`;
  const body = SCALE_ROWS.map((s) => `<span class="db-mh row">${esc(DIMENSIONS.scale.values[s])}</span>` + LAG_COLS.map((l) => {
    const cs = cell(s, l);
    return `<span class="db-mc${cs.length ? " on" : ""}${cs.length === max ? " hot" : ""}" style="--a:${cs.length / max}" ${tip(`${DIMENSIONS.scale.values[s]}, ${DIMENSIONS.lag.values[l].toLowerCase()}`, cs.length ? cs.map((n) => n.name) : ["No cases"])}>${cs.length || "·"}</span>`;
  }).join("")).join("");
  const table = `<table><thead><tr><th>Scale</th>${LAG_COLS.map((l) => `<th>${esc(DIMENSIONS.lag.values[l])}</th>`).join("")}</tr></thead><tbody>${SCALE_ROWS.map((s) => `<tr><td>${esc(DIMENSIONS.scale.values[s])}</td>${LAG_COLS.map((l) => `<td>${cell(s, l).length}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return panel("DB-02", "How far and how slow", "Cases by how far the harm reached, against how long it took to show. Brighter means more.",
    `<div class="db-matrix"><span class="db-mx">Time lag →</span>${head}${body}</div>`, table);
}

function timeline(noms) {
  const from = 1860, to = 2030, x = (y) => ((y - from) / (to - from)) * 100;
  const dated = noms.filter((n) => n.began).sort((a, b) => a.began - b.began);
  const lanes = [];
  const dots = dated.map((n) => {
    let lane = lanes.findIndex((last) => x(n.began) - last > 10);
    if (lane < 0) { lanes.push(0); lane = lanes.length - 1; }
    lanes[lane] = x(n.began);
    return `<a class="db-dot" href="${nomineePath(n)}" style="left:${x(n.began)}%;bottom:${lane * 36 + 34}px;--stem:${lane * 36 + 10}px;--hue:${HUES[n.patterns[0]]}" ${tip(n.name, [`${n.began}: ${n.work}`, `Main pattern: ${nameOf(n.patterns[0])}`])} aria-label="${esc(n.name)}, ${n.began}">${esc(symbol(n.name))}</a>`;
  }).join("");
  const ticks = [];
  for (let y = 1860; y <= 2020; y += 20) ticks.push(`<span${(y - 1860) % 40 ? ' class="minor"' : ""} style="left:${x(y)}%">${y}</span>`);
  const table = `<table><thead><tr><th>Year</th><th>Case</th><th>Main pattern</th></tr></thead><tbody>${dated.map((n) => `<tr><td>${n.began}</td><td>${esc(n.name)}</td><td>${esc(nameOf(n.patterns[0]))}</td></tr>`).join("")}</tbody></table>`;
  return panel("DB-03", "When the fixes began", "The year each fix was invented or first shown to work, in the color of its main pattern.",
    `<div class="db-time" style="height:${Math.max(1, lanes.length) * 36 + 70}px"><div class="db-axis">${ticks.join("")}</div>${dots}</div>`, table, " wide");
}

function whoPays(noms) {
  const d = DIMENSIONS.bearer;
  const rows = Object.entries(d.values).map(([k, label]) => ({ label, cs: noms.filter((n) => n.bearer.includes(k)) }));
  const max = Math.max(1, ...rows.map((r) => r.cs.length));
  const bars = rows.map((r) => `<li style="--hue:#1FA9AF" ${tip(r.label, r.cs.length ? r.cs.map((n) => n.name) : ["No cases"])}>
    <span class="db-bl">${esc(r.label)}</span><span class="db-track"><span class="db-seg" style="width:${(r.cs.length / max) * 100}%"></span><b>${r.cs.length}</b></span></li>`).join("");
  const table = `<table><thead><tr><th>Who pays</th><th>Cases</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${r.cs.length}</td></tr>`).join("")}</tbody></table>`;
  return panel("DB-04", "Who pays", "Cases where each group carried the cost. Most cases have more than one.", `<ol class="db-bars">${bars}</ol>`, table);
}

function pairs(noms) {
  const count = {};
  noms.forEach((n) => n.patterns.forEach((a, i) => n.patterns.slice(i + 1).forEach((b) => {
    const k = [a, b].sort().join("+"); (count[k] = count[k] || []).push(n.name);
  })));
  const rows = Object.entries(count).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const list = rows.length ? rows.map(([k, names]) => {
    const [a, b] = k.split("+");
    return `<li ${tip(`${nameOf(a)} + ${nameOf(b)}`, names)}><span class="db-pair"><i style="--hue:${HUES[a]}"></i><i style="--hue:${HUES[b]}"></i></span>
      <span class="db-pn">${esc(nameOf(a))} <em>+</em> ${esc(nameOf(b))}</span><b>${names.length}</b></li>`;
  }).join("") : "<li>No case carries two patterns yet.</li>";
  const table = `<table><thead><tr><th>Pair</th><th>Cases</th></tr></thead><tbody>${rows.map(([k, names]) => `<tr><td>${esc(k.split("+").map(nameOf).join(" + "))}</td><td>${esc(names.join(", "))}</td></tr>`).join("")}</tbody></table>`;
  const most = rows.length ? rows[0][1].length : 0;
  return panel("DB-05", "Patterns that travel together", `Pairs of patterns found in the same case.${most && most < 5 ? ` Early days: no pair has turned up in more than ${most === 1 ? "one case" : most + " cases"} yet.` : ""}`, `<ol class="db-pairs">${list}</ol>`, table);
}

// Impacts over time for one case: one small chart per measured series on a shared timeline (units never share an
// axis), harms in vermilion, benefits in teal, projections dashed, turning points marked across all of them.
const DIR_HUE = { harm: "#E8604C", benefit: "#2BB5BB", context: "#AEB9C2" };
const fmt = (v) => (v == null || !Number.isFinite(+v) ? "" : (v = +v, v === 0) ? "0" : Math.abs(v) >= 1e6 ? `${+(v / 1e6).toPrecision(3)}M` : Math.abs(v) >= 1e4 ? `${+(v / 1e3).toPrecision(3)}K` : `${+v.toPrecision(3)}`);
const usd = (v) => (v >= 1e12 ? `$${+(v / 1e12).toPrecision(3)} trillion` : v >= 1e9 ? `$${+(v / 1e9).toPrecision(3)} billion` : v >= 1e6 ? `$${+(v / 1e6).toPrecision(3)} million` : `$${fmt(v)}`);

export function impactPanelHTML(all, nomineeId, code = "DB-06") {
  const c = CASE_IMPACTS.find((x) => x.nominee === nomineeId);
  if (!c || !(c.series || []).length) return "";
  const n = all.find((x) => x.id === nomineeId);
  const shown = (p) => !c.chartFrom || p.year >= c.chartFrom;
  const years = c.series.filter((s) => s.featured).flatMap((s) => s.points.filter(shown).map((p) => p.year)).concat((c.events || []).filter(shown).map((e) => e.year));
  const from = Math.floor(Math.min(...years) / 10) * 10, to = Math.ceil((Math.max(...years) + 1) / 10) * 10;
  const x = (y) => ((y - from) / (to - from)) * 100;
  const events = (c.events || []).filter(shown).map((e) => `<span class="im-ev" style="left:${x(e.year)}%" ${tip(String(e.year), [e.label])}><i></i></span>`).join("");
  const rows = c.series.filter((s) => s.featured).map((s) => {
    const every = s.points.filter((p) => Number.isFinite(p.value)).sort((a, b) => a.year - b.year);
    const pts = every.filter(shown), hidden = every.filter((p) => !shown(p));
    if (!pts.length) return "";
    // Lines start at zero unless every value sits high up the scale (like nitrous oxide at 315 to 339 ppb); then the
    // floor rises so the change shows, and the floor value is labeled.
    // The scale counts every point, including early ones not drawn, so a long rise is never hidden.
    const top = Math.max(...every.map((p) => Math.max(p.value, p.high ?? -Infinity)));
    const low = Math.min(...every.map((p) => Math.min(p.value, p.low ?? Infinity)));
    const floor = low > 0.5 * top ? low - (top - low) * 0.15 : 0;
    const max = top + (top - floor) * 0.12 || 1;
    const y = (v) => 100 - ((v - floor) / (max - floor)) * 100;
    const seg = (list) => list.map((p) => `${x(p.year).toFixed(2)},${y(p.value).toFixed(2)}`).join(" ");
    const known = pts.filter((p) => !p.projected), ahead = pts.filter((p) => p.projected);
    const bridge = known.length && ahead.length ? [known[known.length - 1], ...ahead] : ahead;
    const band = pts.some((p) => p.low != null && p.high != null)
      ? `<polygon class="im-band" points="${pts.filter((p) => p.low != null && p.high != null).map((p) => `${x(p.year).toFixed(2)},${y(p.high).toFixed(2)}`).join(" ")} ${pts.filter((p) => p.low != null && p.high != null).reverse().map((p) => `${x(p.year).toFixed(2)},${y(p.low).toFixed(2)}`).join(" ")}"/>` : "";
    const dots = pts.map((p) => `<span class="im-pt${p.projected ? " proj" : ""}${pts.length > 25 ? " sm" : ""}" style="left:${x(p.year)}%;bottom:${100 - y(p.value)}%" ${tip(`${s.label}, ${p.year}`, [
      `${fmt(p.value)} ${s.unit}${p.low != null && p.high != null ? ` (${fmt(p.low)} to ${fmt(p.high)})` : ""}${p.projected ? ", projected" : p.estimate ? ", estimate" : ""}`,
      p.note || "", `Source: ${p.source || s.source}`].filter(Boolean))}></span>`).join("");
    return `<li class="im-row" style="--hue:${DIR_HUE[s.direction] || DIR_HUE.context}">
      <div class="im-meta"><b>${esc(s.label)}</b><span>${esc([s.unit, s.geography].filter(Boolean).join(" · "))}</span><em class="im-dir">${s.direction}</em></div>
      <div class="im-plot"><div class="im-area"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${band}
        ${known.length > 1 ? `<polyline class="im-line" points="${seg(known)}"/>` : ""}${bridge.length > 1 ? `<polyline class="im-line proj" points="${seg(bridge)}"/>` : ""}</svg>
        ${dots}</div><span class="im-max">${fmt(top)}</span>${floor ? `<span class="im-min">axis starts at ${fmt(floor)}</span>` : ""}${hidden.length ? `<span class="im-early">${hidden.map((p) => `${p.year}: ${fmt(p.value)}`).join(" · ")}</span>` : ""}</div>
    </li>`;
  }).join("");
  const ticks = [];
  for (let yv = from; yv <= to; yv += 20) ticks.push(`<span style="left:${x(yv)}%">${yv}</span>`);
  const money = (c.money || []).map((m) => `<li class="im-money ${m.direction}"><em class="im-kind">${{ harm: "Harm", avoided: "Harm avoided", benefit: "Benefit", fix: "Cost of the fix" }[m.direction] || ""}</em><b>${m.low_usd && m.high_usd ? `${usd(m.low_usd)} to ${usd(m.high_usd).replace("$", "")}${m.per_year_usd != null || /a year|per year|annual/i.test(m.label) ? " a year" : ""}` : m.total_usd ? usd(m.total_usd) : m.per_year_usd ? `${usd(m.per_year_usd)} a year` : ""}</b>
    <span>${esc(m.label)}${m.years ? ` <em>${esc(m.years)}</em>` : ""}</span>${m.caption ? `<small class="im-note">${esc(m.caption)}</small>` : ""}<small>${esc(m.source)}${m.usd_year ? `, in ${m.usd_year} dollars` : ""}</small></li>`).join("");
  const table = `<table><thead><tr><th>Series</th><th>Year</th><th>Value</th><th>Source</th></tr></thead><tbody>${c.series.filter((s) => s.featured).flatMap((s) => s.points.map((p) =>
    `<tr><td>${esc(s.label)}</td><td>${p.year}${p.projected ? " (projected)" : ""}</td><td>${fmt(p.value)} ${esc(s.unit)}</td><td>${esc(p.source || s.source)}</td></tr>`)).join("")}</tbody></table>`;
  return panel(code, `Impact over time: ${n ? n.name : nomineeId}`,
    "What the fixes gave and what they cost, year by year. Each measure has its own scale; dollar figures come from separate studies and are not added together.",
    `<div class="im-wrap"><div class="im-events">${events}</div><ol class="im-rows">${rows}</ol><div class="im-axis">${ticks.join("")}</div></div>
     <p class="cb-legend db-legend"><span><i class="im-key harm"></i>Harm</span><span><i class="im-key benefit"></i>Benefit</span><span><i class="im-key proj"></i>Projected</span></p>
     ${money ? `<h4 class="im-h">In dollars, where studies estimate it</h4><ul class="im-moneys">${money}</ul>` : ""}
     ${(c.gaps || []).length ? `<h4 class="im-h">Not yet quantified</h4><ul class="im-gaps">${c.gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>` : ""}`, table, " wide");
}

// The Dashboards page: every panel. The Patterns page shows the gauges and links here.
export function dashboardsHTML(all) {
  const noms = tagged(all);
  return `<header class="db-hero">
      <p class="pp-kicker">Dashboards · Codebook version ${CODEBOOK_VERSION}</p>
      <h1>What ${noms.length} backfires have in common</h1>
      <p>Every case we have torn down, counted by the patterns behind it, how far the harm reached, how long it took to show and who paid. ${noms.length} cases is a small sample, so read these as what we have collected, not how all backfires behave. Hover or tap any mark for the cases behind it.</p>
      <p class="db-links"><a href="/patterns">The ten patterns</a><a href="/table">The Categoric Table</a></p>
    </header>
    ${readouts(noms)}
    <div class="db-grid">${patternBars(noms)}${matrix(noms)}${timeline(noms)}${whoPays(noms)}${pairs(noms)}${CASE_IMPACTS.filter((c) => all.some((n) => n.id === c.nominee)).map((c, i) => impactPanelHTML(all, c.nominee, `DB-${String(6 + i).padStart(2, "0")}`)).join("")}</div>
    <p class="pp-note">Tags are provisional. Two separate automated passes coded every case and an editor settled the differences. Human coders review them next.</p>`;
}

export function dashboardsTeaserHTML(all) {
  const noms = tagged(all);
  return `<header class="db-head">
      <p class="pp-kicker">Dashboards</p>
      <h2 id="data-h">What ${noms.length} backfires have in common</h2>
      <p>The patterns, the scale, the time lag and who paid, counted across every case.</p>
    </header>
    ${readouts(noms)}
    <p class="pp-go db-open"><a class="primary" href="/dashboards">Open the dashboards</a></p>`;
}

// ---------------------------------------------------------------- the Patterns page
const NAME_LINKS = CODEBOOK.map((p) => [esc(p.name), p.key]).sort((a, b) => b[0].length - a[0].length);
const linkNames = (text) => NAME_LINKS.reduce((t, [name, key]) => t.replace(name, `<a href="#${key}">${name}</a>`), esc(text));

export function patternsPageHTML(all) {
  const noms = tagged(all);
  const sources = CODEBOOK.reduce((s, p) => s + p.sources.length, 0);
  const tiles = CODEBOOK.map((p, i) => {
    const cs = casesFor(noms, p.key);
    return `<li><a class="pp-tile" href="#${p.key}" style="--hue:${HUES[p.key]}">
      <span class="pp-tn">${pad(i)}</span><span class="pp-tname">${esc(p.name)}</span>
      <span class="pp-tshort">${esc(p.short)}</span>
      <span class="pp-tcases">${cs.length ? cs.map((c) => `<i class="${c.main ? "" : "also"}" title="${esc(c.n.name)}">${esc(symbol(c.n.name))}</i>`).join("") : "<em>No cases yet</em>"}</span>
    </a></li>`;
  }).join("");

  const chapters = CODEBOOK.map((p, i) => {
    const cs = casesFor(noms, p.key);
    return `<section class="pp-ch" id="${p.key}" style="--hue:${HUES[p.key]}" aria-labelledby="h-${p.key}">
      <div class="pp-slab">
        <header class="pp-ch-head">
          <p class="pp-n" aria-hidden="true">${pad(i)}</p>
          <p class="pp-kicker">Pattern ${i + 1} of ${CODEBOOK.length}</p>
          <h2 id="h-${p.key}">${esc(p.name)}</h2>
          <p class="pp-short">${esc(p.short)}</p>
          <p class="pp-def">${esc(p.definition)}</p>
        </header>
        <div class="pp-body">
          <div class="pp-ask"><h3>Ask before you ship</h3><ol>${p.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol></div>
          <div class="pp-two">
            <div><h3>It counts when</h3><ul class="pp-checks">${p.conditions.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
            <div><h3>Easy to confuse with</h3><p>${linkNames(p.confusedWith)}</p></div>
          </div>
          <div class="pp-cases"><h3>Cases</h3>${cs.length
            ? `<ul>${cs.map((c) => `<li><a href="${nomineePath(c.n)}" title="${esc(c.n.work || "")}"><span class="pp-sym${c.main ? "" : " also"}">${esc(symbol(c.n.name))}</span><b>${esc(c.n.name)}</b>${c.main ? "" : "<em>also</em>"}</a></li>`).join("")}</ul>`
            : `<p>None yet. <a href="#nominate" data-open-sheet="">Suggest one</a>.</p>`}</div>
          <details class="pp-research"><summary><h3>In the research</h3><span>${p.sources.length} sources</span></summary>
            <p class="pp-terms">${p.formal.map((f) => `<span>${esc(f)}</span>`).join("")}</p>
            <ul>${p.sources.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></details>
        </div>
      </div>
    </section>`;
  }).join("");

  const nav = `<nav class="pp-nav" aria-label="On this page"><ol>
      <li><a href="#index" class="pp-nav-t">The ten</a></li>
      ${CODEBOOK.map((p, i) => `<li><a href="#${p.key}" style="--hue:${HUES[p.key]}" title="${esc(p.name)}"><span>${i + 1}</span><em>${esc(p.name)}</em></a></li>`).join("")}
      <li><a href="#data" class="pp-nav-t">Dashboards</a></li>
      <li><a href="#tags" class="pp-nav-t">Tags</a></li>
    </ol></nav>`;

  return `<header class="pp-hero">
      <div class="glass frost pp-hero-card">
        <p class="pp-label">The codebook · Version ${CODEBOOK_VERSION}</p>
        <h1>The Patterns</h1>
        <p class="pp-lede">Ten ways a good fix backfires. Every case we collect is taken apart and tagged with the patterns behind it, so the next builder can spot one before shipping it.</p>
        <ul class="pp-stats">
          <li><b>${CODEBOOK.length}</b><span>patterns</span></li>
          <li><b>${noms.length}</b><span>cases tagged</span></li>
          <li><b>${sources}</b><span>research sources</span></li>
        </ul>
        <p class="pp-go"><a class="primary" href="#${CODEBOOK[0].key}">Start with pattern 1</a><a class="ghost" href="/dashboards">Open the dashboards</a></p>
      </div>
    </header>
    ${nav}
    <section class="pp-index" id="index" aria-labelledby="pp-index-h"><h2 id="pp-index-h" class="pp-sec">The ten</h2><ol class="pp-tiles">${tiles}</ol></section>
    ${chapters}
    <section class="pp-data" id="data" aria-labelledby="data-h">${dashboardsTeaserHTML(all)}</section>
    <section class="pp-dims" id="tags" aria-labelledby="pp-dims-h">
      <div class="pp-slab pp-dims-slab">
        <h2 id="pp-dims-h" class="pp-sec">Every case also gets</h2>
        <div class="pp-dim-grid">${Object.values(DIMENSIONS).map((d) => `<div><h3>${esc(d.label)}</h3><p>${esc(d.help)}</p><p class="pp-terms">${Object.values(d.values).map((v) => `<span>${esc(v)}</span>`).join("")}</p></div>`).join("")}</div>
        <p class="pp-note">Tags are provisional. Two separate automated passes coded every case and an editor settled the differences. Human coders review them next, and the codebook gets a new version number whenever a definition changes.</p>
      </div>
    </section>`;
}

// On the Table page: the ten patterns as a strip that leads to the Patterns page.
export function patternsTeaserHTML(all) {
  const noms = tagged(all);
  return `<header class="cb-head">
      <p class="label">The codebook</p>
      <h2 id="codebook-h">Ten ways a good fix backfires</h2>
      <p class="lede">Every case on the table is tagged with the patterns behind it. <a href="/patterns">See all ten patterns</a>, the test for each and the dashboards.</p>
    </header>
    <ol class="cb-grid">${CODEBOOK.map((p, i) => {
      const n = casesFor(noms, p.key).length;
      return `<li><a class="cb-card" href="/patterns#${p.key}"><span class="cb-num">${pad(i)}</span><span class="cb-name">${esc(p.name)}</span><span class="cb-short">${esc(p.short)}</span><span class="cb-count"><span>${n} case${n === 1 ? "" : "s"}</span></span></a></li>`;
    }).join("")}</ol>`;
}
