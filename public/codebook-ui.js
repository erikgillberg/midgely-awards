// The Patterns page, its dashboards, and the patterns strip on the Table page. Rendered on the server so the
// pages read without scripts; patterns.js adds the menu highlight and chart-tip.js the tooltips.
import { CODEBOOK, CODEBOOK_VERSION, DIMENSIONS } from "./codebook.js";
import { esc, symbol, nomineePath } from "./shared.js";

const pad = (i) => String(i + 1).padStart(2, "0");
const tagged = (noms) => noms.filter((n) => n.patterns && n.patterns.length);
const casesFor = (noms, key) => noms.filter((n) => n.patterns.includes(key))
  .map((n) => ({ n, main: n.patterns[0] === key }))
  .sort((a, b) => b.main - a.main || (a.n.began || 0) - (b.n.began || 0));
const tip = (title, lines) => `data-tip="${esc(title)}" data-tip-lines="${esc(lines.join("\n"))}" tabindex="0"`;

// ---------------------------------------------------------------- the dashboards
// Night instrument panels. Marks glow in the palette; text stays in the cream inks so the numbers read first.
const SCALE_ROWS = ["global", "national", "regional", "local"];
const LAG_COLS = ["immediate", "years", "decades", "generations"];
const HUES = {
  surplus: "#E98946", stable: "#A3A45C", moved: "#5FB3AF", everyone: "#D08F9A", metric: "#5AA3C0",
  resistance: "#E06A4E", gamed: "#E0AC3E", later: "#B585BA", flipped: "#C9925F", buffered: "#86AE93",
};
const nameOf = (key) => CODEBOOK.find((c) => c.key === key)?.name || "";

function panel(code, title, sub, body, table, wide = "") {
  return `<figure class="db-panel${wide}"><figcaption><p class="db-code">${code}</p><h3>${esc(title)}</h3><p>${esc(sub)}</p></figcaption>
    <div class="db-plot">${body}</div>
    <details class="db-table"><summary>Show as a table</summary>${table}</details></figure>`;
}

function readouts(noms) {
  const seen = CODEBOOK.filter((p) => noms.some((n) => n.patterns.includes(p.key))).length;
  const global = noms.filter((n) => n.scale === "global").length;
  const sticky = noms.filter((n) => n.reversibility !== "reversible").length;
  const multi = noms.filter((n) => n.patterns.length > 1).length;
  const r = (v, of, label) => `<li><b>${v}${of ? `<small>/${of}</small>` : ""}</b><span>${label}</span></li>`;
  return `<ul class="db-read">${r(noms.length, "", "Cases tagged")}${r(seen, CODEBOOK.length, "Patterns seen")}${r(global, noms.length, "Global harm")}${r(sticky, noms.length, "Slow or impossible to undo")}${r(multi, noms.length, "More than one pattern")}</ul>`;
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
    return `<span class="db-mc${cs.length ? " on" : ""}${cs.length / max >= 0.5 ? " hot" : ""}" style="--a:${cs.length / max}" ${tip(`${DIMENSIONS.scale.values[s]}, ${DIMENSIONS.lag.values[l].toLowerCase()}`, cs.length ? cs.map((n) => n.name) : ["No cases"])}>${cs.length || "·"}</span>`;
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
  const bars = rows.map((r) => `<li style="--hue:#5FB3AF" ${tip(r.label, r.cs.length ? r.cs.map((n) => n.name) : ["No cases"])}>
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

export function dashboardsHTML(all) {
  const noms = tagged(all);
  return `<header class="db-head">
      <p class="pp-kicker">Dashboards</p>
      <h2 id="data-h">What ${noms.length} backfires have in common</h2>
      <p>Every tagged case, counted. ${noms.length} cases is a small sample, so read these as what we have collected, not how all backfires behave. Hover or tap any mark for the cases behind it.</p>
    </header>
    ${readouts(noms)}
    <div class="db-grid">${patternBars(noms)}${matrix(noms)}${timeline(noms)}${whoPays(noms)}${pairs(noms)}</div>`;
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
            : `<p>None yet. <a href="#nominate" data-open-sheet="">Nominate one</a>.</p>`}</div>
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
        <p class="pp-go"><a class="primary" href="#${CODEBOOK[0].key}">Start with pattern 1</a><a class="ghost" href="#data">Open the dashboards</a></p>
      </div>
    </header>
    ${nav}
    <section class="pp-index" id="index" aria-labelledby="pp-index-h"><h2 id="pp-index-h" class="pp-sec">The ten</h2><ol class="pp-tiles">${tiles}</ol></section>
    ${chapters}
    <section class="pp-data" id="data" aria-labelledby="data-h">${dashboardsHTML(all)}</section>
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
