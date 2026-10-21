// The codebook and the data on the Table page. Rendered on the server so the page reads without scripts;
// table.js adds the pattern sheet and the chart tooltips.
import { CODEBOOK, CODEBOOK_VERSION, DIMENSIONS } from "./codebook.js";
import { esc, symbol, nomineePath } from "./shared.js";

const pad = (i) => String(i + 1).padStart(2, "0");
const tagged = (noms) => noms.filter((n) => n.patterns && n.patterns.length);
const casesFor = (noms, key) => noms.filter((n) => n.patterns.includes(key))
  .map((n) => ({ n, main: n.patterns[0] === key }))
  .sort((a, b) => b.main - a.main || (a.n.began || 0) - (b.n.began || 0));
const tip = (title, lines) => `data-tip="${esc(title)}" data-tip-lines="${esc(lines.join("\n"))}" tabindex="0"`;

// ---------------------------------------------------------------- the data
const SCALE_ROWS = ["global", "national", "regional", "local"];
const LAG_COLS = ["immediate", "years", "decades", "generations"];

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
      <span class="cb-bl"><span class="cb-bn">${i + 1}</span>${esc(r.p.name)}</span>
      <span class="cb-track">${r.main.length ? `<span class="cb-seg" style="width:${(r.main.length / max) * 100}%"></span>` : ""}${r.also.length ? `<span class="cb-seg also" style="width:${(r.also.length / max) * 100}%"></span>` : ""}<b>${total || ""}</b></span>
    </li>`;
  }).join("");
  const table = `<table><thead><tr><th>Pattern</th><th>Main</th><th>Also</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.p.name)}</td><td>${r.main.length}</td><td>${r.also.length}</td></tr>`).join("")}</tbody></table>`;
  return figure("Which patterns show up", "Cases per pattern. A case can carry more than one.",
    `<p class="cb-legend"><span><i class="cb-key"></i>Main pattern</span><span><i class="cb-key also"></i>Also present</span></p><ol class="cb-bars">${bars}</ol>`, table);
}

function timeline(noms) {
  const from = 1860, to = 2030, x = (y) => ((y - from) / (to - from)) * 100;
  const dated = noms.filter((n) => n.began).sort((a, b) => a.began - b.began);
  const lanes = [];
  const dots = dated.map((n) => {
    let lane = lanes.findIndex((last) => x(n.began) - last > 11);
    if (lane < 0) { lanes.push(0); lane = lanes.length - 1; }
    lanes[lane] = x(n.began);
    const p = CODEBOOK.find((c) => c.key === n.patterns[0]);
    return `<a class="cb-dot" href="${nomineePath(n)}" style="left:${x(n.began)}%;bottom:${lane * 34 + 8}px" ${tip(n.name, [`${n.began}: ${n.work}`, `Main pattern: ${p ? p.name : ""}`])} aria-label="${esc(n.name)}, ${n.began}">${esc(symbol(n.name))}</a>`;
  }).join("");
  const ticks = [];
  for (let y = 1860; y <= 2020; y += 20) ticks.push(`<span${(y - 1860) % 40 ? ' class="minor"' : ""} style="left:${x(y)}%">${y}</span>`);
  const table = `<table><thead><tr><th>Year</th><th>Case</th><th>Main pattern</th></tr></thead><tbody>${dated.map((n) => `<tr><td>${n.began}</td><td>${esc(n.name)}</td><td>${esc(CODEBOOK.find((c) => c.key === n.patterns[0])?.name || "")}</td></tr>`).join("")}</tbody></table>`;
  return figure("When the fixes began", "The year each fix was invented or first shown to work.",
    `<div class="cb-time" style="height:${Math.max(1, lanes.length) * 34 + 44}px"><div class="cb-axis">${ticks.join("")}</div>${dots}</div>`, table);
}

function matrix(noms) {
  const cell = (s, l) => noms.filter((n) => n.scale === s && n.lag === l);
  const max = Math.max(1, ...SCALE_ROWS.flatMap((s) => LAG_COLS.map((l) => cell(s, l).length)));
  const head = `<span></span>${LAG_COLS.map((l) => `<span class="cb-mh">${esc(DIMENSIONS.lag.values[l])}</span>`).join("")}`;
  const body = SCALE_ROWS.map((s) => `<span class="cb-mh row">${esc(DIMENSIONS.scale.values[s])}</span>` + LAG_COLS.map((l) => {
    const cs = cell(s, l);
    return `<span class="cb-mc" style="--a:${cs.length / max}" ${tip(`${DIMENSIONS.scale.values[s]}, ${DIMENSIONS.lag.values[l].toLowerCase()}`, cs.length ? cs.map((n) => n.name) : ["No cases"])}>${cs.length || ""}</span>`;
  }).join("")).join("");
  const table = `<table><thead><tr><th>Scale</th>${LAG_COLS.map((l) => `<th>${esc(DIMENSIONS.lag.values[l])}</th>`).join("")}</tr></thead><tbody>${SCALE_ROWS.map((s) => `<tr><td>${esc(DIMENSIONS.scale.values[s])}</td>${LAG_COLS.map((l) => `<td>${cell(s, l).length}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  return figure("How far and how slow", "Cases by how far the harm reached and how long it took to show. Darker means more cases.",
    `<div class="cb-matrix"><span class="cb-mx">Time lag →</span>${head}${body}</div>`, table);
}

function whoPays(noms) {
  const d = DIMENSIONS.bearer;
  const rows = Object.entries(d.values).map(([k, label]) => ({ label, cs: noms.filter((n) => n.bearer.includes(k)) }));
  const max = Math.max(1, ...rows.map((r) => r.cs.length));
  const bars = rows.map((r) => `<li ${tip(r.label, r.cs.length ? r.cs.map((n) => n.name) : ["No cases"])}>
    <span class="cb-bl">${esc(r.label)}</span><span class="cb-track"><span class="cb-seg" style="width:${(r.cs.length / max) * 100}%"></span><b>${r.cs.length}</b></span></li>`).join("");
  const table = `<table><thead><tr><th>Who pays</th><th>Cases</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${r.cs.length}</td></tr>`).join("")}</tbody></table>`;
  return figure("Who pays", "Cases where each group carried the cost. Most have more than one.", `<ol class="cb-bars">${bars}</ol>`, table);
}

function figure(title, sub, chart, table) {
  return `<figure class="cb-fig"><figcaption><h3>${esc(title)}</h3><p>${esc(sub)}</p></figcaption>${chart}
    <details class="cb-table"><summary>Show as a table</summary>${table}</details></figure>`;
}

export function dataHTML(all) {
  const noms = tagged(all);
  return `<header class="cb-head">
      <p class="label">The data so far</p>
      <h2 id="data-h">What ${noms.length} backfires have in common</h2>
      <p class="lede">Every tagged case, counted. ${noms.length} cases is a small sample, so read these as what we have collected, not how all backfires behave. The picture sharpens with every nominee.</p>
    </header>
    <div class="cb-figs">${patternBars(noms)}${matrix(noms)}${timeline(noms)}${whoPays(noms)}</div>`;
}

// ---------------------------------------------------------------- the Patterns page
// Each pattern wears one color from the 1970s palette. Identity only: the charts stay one hue.
const HUES = {
  surplus: "#E98946", stable: "#85864A", moved: "#579996", everyone: "#B97D87", metric: "#3F86A0",
  resistance: "#C4583F", gamed: "#C9962E", later: "#9A6A9E", flipped: "#B07A4E", buffered: "#6E8F7A",
};
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
    const prev = CODEBOOK[i - 1], next = CODEBOOK[i + 1];
    return `<section class="pp-ch" id="${p.key}" style="--hue:${HUES[p.key]}" aria-labelledby="h-${p.key}">
      <div class="pp-ch-in">
        <header class="pp-ch-head">
          <p class="pp-n" aria-hidden="true">${pad(i)}</p>
          <p class="pp-kicker">Pattern ${i + 1} of ${CODEBOOK.length}</p>
          <h2 id="h-${p.key}">${esc(p.name)}</h2>
          <p class="pp-short">${esc(p.short)}</p>
          <p class="pp-def">${esc(p.definition)}</p>
        </header>
        <div class="pp-cards">
          <div class="glass frost pp-ask"><h3>Ask before you ship</h3><ol>${p.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol></div>
          <div class="glass dark"><h3>It counts when</h3><ul class="pp-checks">${p.conditions.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
          <div class="glass dark"><h3>Easy to confuse with</h3><p>${linkNames(p.confusedWith)}</p></div>
          <div class="glass dark pp-cases"><h3>Cases</h3>${cs.length
            ? `<ul>${cs.map((c) => `<li><a href="${nomineePath(c.n)}"><span class="pp-sym">${esc(symbol(c.n.name))}</span><span><b>${esc(c.n.name)}</b><small>${esc(c.n.work || "")}</small></span><em>${c.main ? "Main" : "Also"}</em></a></li>`).join("")}</ul>`
            : `<p>None yet. <a href="#nominate" data-open-sheet="">Nominate one</a>.</p>`}</div>
          <details class="glass dark pp-research"><summary><h3>In the research</h3><span>${p.sources.length} sources</span></summary>
            <p class="pp-terms">${p.formal.map((f) => `<span>${esc(f)}</span>`).join("")}</p>
            <ul>${p.sources.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></details>
        </div>
        <nav class="pp-step" aria-label="More patterns">${prev ? `<a href="#${prev.key}">← ${esc(prev.name)}</a>` : "<span></span>"}${next ? `<a href="#${next.key}">${esc(next.name)} →</a>` : `<a href="#data">The data →</a>`}</nav>
      </div>
    </section>`;
  }).join("");

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
        <p class="pp-go"><a class="primary" href="#${CODEBOOK[0].key}">Start with pattern 1</a><a class="ghost" href="#data">See the data</a></p>
      </div>
    </header>
    <nav class="pp-rail" aria-label="Patterns"><ol>${CODEBOOK.map((p, i) => `<li><a href="#${p.key}" style="--hue:${HUES[p.key]}"><span>${i + 1}</span>${esc(p.name)}</a></li>`).join("")}</ol></nav>
    <section class="pp-index" aria-labelledby="pp-index-h"><h2 id="pp-index-h" class="pp-sec">The ten</h2><ol class="pp-tiles">${tiles}</ol></section>
    ${chapters}
    <section class="pp-data frost-scope" id="data" aria-labelledby="data-h">${dataHTML(all)}</section>
    <section class="pp-dims" aria-labelledby="pp-dims-h">
      <h2 id="pp-dims-h" class="pp-sec">Every case also gets</h2>
      <div class="pp-dim-grid">${Object.values(DIMENSIONS).map((d) => `<div class="glass dark"><h3>${esc(d.label)}</h3><p>${esc(d.help)}</p><p class="pp-terms">${Object.values(d.values).map((v) => `<span>${esc(v)}</span>`).join("")}</p></div>`).join("")}</div>
      <p class="pp-note">Tags are provisional. Two separate automated passes coded every case and an editor settled the differences. Human coders review them next, and the codebook gets a new version number whenever a definition changes.</p>
    </section>`;
}

// On the Table page: the ten patterns as a strip that leads to the Patterns page.
export function patternsTeaserHTML(all) {
  const noms = tagged(all);
  return `<header class="cb-head">
      <p class="label">The codebook</p>
      <h2 id="codebook-h">Ten ways a good fix backfires</h2>
      <p class="lede">Every case on the table is tagged with the patterns behind it. <a href="/patterns">See all ten patterns</a>, the test for each and the data so far.</p>
    </header>
    <ol class="cb-grid">${CODEBOOK.map((p, i) => {
      const n = casesFor(noms, p.key).length;
      return `<li><a class="cb-card" href="/patterns#${p.key}"><span class="cb-num">${pad(i)}</span><span class="cb-name">${esc(p.name)}</span><span class="cb-short">${esc(p.short)}</span><span class="cb-count"><span>${n} case${n === 1 ? "" : "s"}</span></span></a></li>`;
    }).join("")}</ol>`;
}
