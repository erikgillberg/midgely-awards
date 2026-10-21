// Search and filter every nominee and featured Murphy. The address keeps the filters, so a search can be shared.
import { api } from "./site.js";
import { DOMAINS, HONOREE, nomCardHTML, byTop, esc, murphyPath, MURPHYS_LIVE } from "./shared.js";
import { CODEBOOK, DIMENSIONS, ERAS, periodOf } from "./codebook.js";

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const state = { q: params.get("q") || "", award: params.get("award") || "", cat: params.get("cat") || "", status: params.get("status") || "", sort: params.get("sort") || "top" };
// Codebook filters: pattern, scale, time period, who pays.
const FACETS = [
  ["pattern", "Pattern", CODEBOOK.map((p, i) => [p.key, `${i + 1}. ${p.name}`])],
  ["scale", "Scale", Object.entries(DIMENSIONS.scale.values)],
  ["era", "Time period", ERAS.map((e) => [e.key, e.label])],
  ["bearer", "Who pays", Object.entries(DIMENSIONS.bearer.values)],
];
FACETS.forEach(([k]) => (state[k] = params.get(k) || ""));
let data = { nominees: [], murphys: [], comments: [] };
let flags = {};
(document.body.dataset.flags || "").split(" ").forEach((f) => f && (flags[f] = true));

$("#cat-chips").innerHTML = `<button type="button" data-v="" aria-pressed="true">All categories</button>` +
  Object.entries(DOMAINS).map(([k, v]) => `<button type="button" data-v="${k}" aria-pressed="false">${esc(v)}</button>`).join("");
$("#facets").innerHTML = FACETS.map(([k, label, opts]) => `<label>${label} <select data-facet="${k}"><option value="">Any</option>${opts.map(([v, t]) => `<option value="${v}"${state[k] === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`).join("");
$("#facets").addEventListener("change", (e) => { const k = e.target.dataset.facet; if (k) { state[k] = e.target.value; render(); } });
if (!MURPHYS_LIVE) $("[data-filter=award]").hidden = true;
$("#q").value = state.q;
$("#sort").value = state.sort;
document.querySelectorAll("[data-filter]").forEach((g) => g.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === state[g.dataset.filter]))));

const murphyCard = (m) => `<article class="nom-card mu-card"><a href="${murphyPath(m)}">
  <div class="el nc mu-tile"><span class="el-num">2</span><span class="el-year"></span><span class="el-sym">Mu</span><span class="el-name">MURPHY</span><span class="el-up"></span><span class="el-down"></span></div>
  <h3>A Murphy</h3><p class="nc-work">${esc(m.fix)}</p></a></article>`;

function render() {
  const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (text) => words.every((w) => text.toLowerCase().includes(w));
  const ccount = {}; data.comments.forEach((c) => (ccount[c.nomineeId] = (ccount[c.nomineeId] || 0) + 1));
  let items = [];
  if (state.award !== "murphy") {
    items = items.concat(data.nominees.filter((n) => n.id !== HONOREE
      && (!state.cat || n.domain === state.cat) && (!state.status || n.status === state.status)
      && (!state.pattern || (n.patterns || []).includes(state.pattern)) && (!state.scale || n.scale === state.scale)
      && (!state.era || periodOf(n.began) === state.era) && (!state.bearer || (n.bearer || []).includes(state.bearer))
      && hit([n.name, n.work, n.solved, n.backfire, DOMAINS[n.domain] || "", n.pattern || "",
        ...(n.patterns || []).map((k) => CODEBOOK.find((p) => p.key === k)?.name || "")].join(" "))).map((n) => ({ kind: "n", n, c: ccount[n.id] || 0 })));
  }
  if (MURPHYS_LIVE && state.award !== "midgley" && !state.cat && !state.status && !FACETS.some(([k]) => state[k])) {
    items = items.concat(data.murphys.filter((m) => hit([m.fix, m.oops, m.name].join(" "))).map((m) => ({ kind: "m", m, c: ccount[m.id] || 0 })));
  }
  const top = byTop(flags);
  const v = (x) => (x.kind === "n" ? x.n : { ...x.m, score: 0, oops: null });
  const sorts = {
    top: (a, b) => top(v(a), v(b)),
    new: (a, b) => String(v(b).createdAt).localeCompare(String(v(a).createdAt)),
    debated: (a, b) => b.c - a.c,
    oops: (a, b) => (v(b).oops ?? -1) - (v(a).oops ?? -1),
    herd: (a, b) => (v(b).herdTotal >= 10 ? v(b).herdYes / v(b).herdTotal : -1) - (v(a).herdTotal >= 10 ? v(a).herdYes / v(a).herdTotal : -1),
  };
  items.sort(sorts[state.sort] || sorts.top);
  $("#count").textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;
  $("#results").innerHTML = items.map((x) => (x.kind === "n" ? nomCardHTML(x.n, flags) : murphyCard(x.m))).join("")
    || `<p class="empty">Nothing matches yet. <a href="#nominate" data-open-sheet="">Nominate one</a>.</p>`;
  const p = new URLSearchParams(Object.entries(state).filter(([k, v]) => v && !(k === "sort" && v === "top")));
  history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
}

$("#q").addEventListener("input", (e) => { state.q = e.target.value; render(); });
$("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
document.querySelectorAll("[data-filter]").forEach((g) => g.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  state[g.dataset.filter] = b.dataset.v;
  g.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  render();
}));

api("/api/state").then((d) => { data = { nominees: d.nominees, murphys: d.murphys || [], comments: d.comments }; render(); })
  .catch((e) => ($("#results").innerHTML = `<p class="empty">Couldn't load: ${esc(e.message)}</p>`));
