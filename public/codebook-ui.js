// The codebook and the data on the Table page. Rendered on the server so the page reads without scripts;
// table.js adds the pattern sheet and the chart tooltips.
import { CODEBOOK, CODEBOOK_VERSION, CODEBOOK_DATE, DIMENSIONS } from "./codebook.js";
import { esc, symbol, nomineePath } from "./shared.js";

const pad = (i) => String(i + 1).padStart(2, "0");
const tagged = (noms) => noms.filter((n) => n.patterns && n.patterns.length);
const casesFor = (noms, key) => noms.filter((n) => n.patterns.includes(key))
  .map((n) => ({ n, main: n.patterns[0] === key }))
  .sort((a, b) => b.main - a.main || (a.n.began || 0) - (b.n.began || 0));
const chip = (n, label) => `<a class="cb-case" href="${nomineePath(n)}"><span class="cb-sym" aria-hidden="true">${esc(symbol(n.name))}</span>${esc(n.name)}${label ? `<small>${label}</small>` : ""}</a>`;
const tip = (title, lines) => `data-tip="${esc(title)}" data-tip-lines="${esc(lines.join("\n"))}" tabindex="0"`;

export function codebookHTML(all) {
  const noms = tagged(all);
  const cards = CODEBOOK.map((p, i) => {
    const cs = casesFor(noms, p.key);
    return `<li><a class="cb-card" href="#p-${p.key}" data-p="${p.key}" aria-haspopup="dialog">
      <span class="cb-num">${pad(i)}</span>
      <span class="cb-name">${esc(p.name)}</span>
      <span class="cb-short">${esc(p.short)}</span>
      <span class="cb-formal">${p.formal.map(esc).join(" · ")}</span>
      <span class="cb-count">${cs.length ? `${cs.map((c) => `<span class="cb-sym${c.main ? "" : " also"}" title="${esc(c.n.name)}">${esc(symbol(c.n.name))}</span>`).join("")}<span>${cs.length} case${cs.length === 1 ? "" : "s"}</span>` : "<span>No cases yet</span>"}</span>
    </a></li>`;
  }).join("");

  const details = CODEBOOK.map((p, i) => {
    const cs = casesFor(noms, p.key);
    return `<article class="cb-detail" id="p-${p.key}">
      <p class="cb-num">Pattern ${i + 1} of ${CODEBOOK.length}</p>
      <h3>${esc(p.name)}</h3>
      <p class="cb-def">${esc(p.definition)}</p>
      <h4>It counts when</h4><ul>${p.conditions.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      <h4>Don't confuse it with</h4><p>${esc(p.confusedWith)}</p>
      <h4>Ask before you ship</h4><ol>${p.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>
      <h4>In the research</h4><p class="cb-terms">${p.formal.map((f) => `<span>${esc(f)}</span>`).join("")}</p>
      <ul class="cb-sources">${p.sources.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
      <h4>Cases</h4>${cs.length ? `<p class="cb-cases">${cs.map((c) => chip(c.n, c.main ? "main pattern" : "also")).join("")}</p>` : "<p>None yet. Know one? <a href=\"#nominate\" data-open-sheet=\"\">Nominate it</a>.</p>"}
      ${cs.length ? `<p><a class="cb-more" href="/search?pattern=${p.key}">Find stories with this pattern →</a></p>` : ""}
    </article>`;
  }).join("");

  const dims = Object.entries(DIMENSIONS).map(([k, d]) => {
    const counts = Object.keys(d.values).map((v) => noms.filter((n) => (d.multi ? n[k].includes(v) : n[k] === v)).length);
    return `<div class="cb-dim"><h3>${esc(d.label)}</h3><p>${esc(d.help)}</p>
      <ul>${Object.entries(d.values).map(([v, label], j) => `<li><span>${esc(label)}</span><b>${counts[j]}</b></li>`).join("")}</ul></div>`;
  }).join("");

  return `<header class="cb-head">
      <p class="label">The codebook · Version ${CODEBOOK_VERSION}, ${CODEBOOK_DATE}</p>
      <h2 id="codebook-h">Ten ways a good fix backfires</h2>
      <p class="lede">Every case on the table is tagged like a specimen: one main pattern and up to two more, plus how far the harm reached, how long it took to show, who paid and whether it can be undone. Each pattern rests on research in its field. Open one to see the test we apply and the questions to ask before you ship.</p>
    </header>
    <ol class="cb-grid">${cards}</ol>
    <div class="cb-details">${details}</div>
    <h3 class="cb-sub">Every case also gets</h3>
    <div class="cb-dims">${dims}</div>
    <p class="cb-note">Tags are provisional. Two separate automated passes coded every case and an editor settled the differences. Human coders review them next, and the codebook gets a new version number whenever a definition changes.</p>`;
}

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
    return `<li ${tip(r.p.name, names.length ? names : ["No cases yet"])}>
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
