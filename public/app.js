// The nominee list (home and category pages) and a nominee's own page.
// The server sends the first render in the HTML; this script redraws it with your votes and keeps it fresh.
import { DOMAINS, HARMS, STATUSES, KNOW, HONOREE, postHTML, nomCardHTML, byTop, nomineePath } from "./shared.js";
import { api } from "./site.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const POLL_MS = 60000;
const body = document.body.dataset;
const PAGE = body.page || "home";
const flagWords = (body.flags || "").split(" ");
const flags = { scores: flagWords.includes("scores"), categories: flagWords.includes("categories") };

function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}
let voter = store.get("midgley.voter");
if (!voter || !/^[A-Za-z0-9-]{16,64}$/.test(voter)) { voter = makeId(); store.set("midgley.voter", voter); }

let reported = {};
try { reported = JSON.parse(store.get("midgley.reported") || "{}") || {}; } catch (e) {}

const state = {
  noms: [], comments: [], myVotes: new Set(), myHerd: {}, loaded: false,
  sort: "top", f: { domain: "", harm: "", status: "", know: "" },
  open: new Set(PAGE === "nominee" && body.nominee ? [body.nominee] : []),
  local: {},         // id -> {fields, at}: our own vote, until the cached list catches up
  localComments: [], // our own comments, until the cached list includes them
  config: { turnstileSiteKey: "" }
};

// ---------- selects (home page only)
const opts = (map, all) => `<option value="">${all}</option>` + Object.entries(map).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
if ($("#flt-domain")) {
  $("#flt-domain").innerHTML = opts(DOMAINS, "All categories");
  $("#flt-harm").innerHTML = opts(HARMS, "Any kind of harm");
  $("#flt-status").innerHTML = opts(STATUSES, "Any status");
  $("#flt-know").innerHTML = opts(KNOW, "Knowable or not");
}

let toastTimer = null;
function toast(t) {
  const el = $("#toast"); el.textContent = t; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2600);
}
function showNotice(t) { const n = $("#notice"); if (n) { n.textContent = t; n.hidden = !t; } }

// ---------- data
async function load() {
  try {
    const [d, mv] = await Promise.all([api("/api/state"), api("/api/my-votes?voter=" + encodeURIComponent(voter)).catch(() => null)]);
    state.noms = d.nominees;
    state.comments = d.comments;
    if (mv) { state.myVotes = new Set(mv.myVotes); state.myHerd = mv.myHerd || {}; }
    const now = Date.now();
    for (const [id, v] of Object.entries(state.local)) if (now - v.at > 30000) delete state.local[id];
    const have = new Set(state.comments.map((c) => c.id));
    state.localComments = state.localComments.filter((c) => !have.has(c.id) && now - c.at < 120000);
    const first = !state.loaded;
    state.loaded = true;
    const typing = document.activeElement && document.activeElement.closest && document.activeElement.closest(".reply");
    if (!typing || first) render();
  } catch (e) {
    if (!state.loaded) showNotice(`The nominees couldn't refresh. ${e.message}. Refresh to try again.`);
  }
}

const allComments = () => state.comments.concat(state.localComments);
const withLocal = (n) => (state.local[n.id] ? { ...n, ...state.local[n.id].fields } : n);

// ---------- render
function sorter() {
  const oops = (n) => (n.oops == null ? -1 : n.oops);
  const herd = (n) => (n.herdTotal >= 10 ? n.herdYes / n.herdTotal : -1);
  switch (state.sort) {
    case "new": return (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));
    case "debated": return (a, b) => b.ccount - a.ccount || byTop(flags)(a, b);
    case "oops": return (a, b) => oops(b) - oops(a) || byTop(flags)(a, b);
    case "herd": return (a, b) => herd(b) - herd(a) || byTop(flags)(a, b);
    default: return byTop(flags);
  }
}

function render() {
  const list = $("#list");
  const drafts = {}; list.querySelectorAll(".reply textarea, .reply input").forEach((t) => (drafts[t.id] = t.value));
  const focused = document.activeElement && document.activeElement.id;
  const comments = allComments();
  const ccount = {}; comments.forEach((c) => (ccount[c.nomineeId] = (ccount[c.nomineeId] || 0) + 1));
  let noms = state.noms.map((n) => ({ ...withLocal(n), ccount: ccount[n.id] || 0 }));

  if (PAGE === "nominee") {
    noms = noms.filter((n) => n.id === body.nominee);
  } else {
    noms = noms.filter((n) => n.id !== HONOREE);
    if (PAGE === "category") noms = noms.filter((n) => n.domain === body.category);
  }
  const ranked = [...noms].sort(byTop(flags));
  const rankOf = {}; ranked.forEach((n, i) => (rankOf[n.id] = i + 1));
  const f = state.f;
  const total = noms.length;
  noms = noms.filter((n) =>
    (!f.domain || n.domain === f.domain) && (!f.harm || n.harms.includes(f.harm)) &&
    (!f.status || n.status === f.status) && (!f.know || n.knowable === f.know));
  noms.sort(sorter());
  const filtered = f.domain || f.harm || f.status || f.know;
  if ($("#count")) $("#count").textContent = filtered ? `${noms.length} of ${total} nominees` : `${total} nominees`;
  if (!noms.length) {
    list.innerHTML = PAGE === "nominee" ? `<p class="notice">That nominee isn't on the list. <a href="/">See all nominees</a>.</p>`
      : `<p class="empty">${total ? "Nothing matches these filters yet. Submit the first." : "No nominees here yet. Submit the first."}</p>`;
    return;
  }
  if (PAGE !== "nominee") { list.innerHTML = noms.map((n) => nomCardHTML(n, flags)).join(""); return; }
  list.innerHTML = noms.map((n) => postHTML(n, {
    flags, mine: state.myVotes.has(n.id), herd: state.myHerd[n.id],
    thread: comments.filter((c) => c.nomineeId === n.id), reported, name: store.get("midgley.name") || "",
  })).join("");
  Object.entries(drafts).forEach(([id, v]) => { const t = document.getElementById(id); if (t) t.value = v; });
  if (focused) { const el = document.getElementById(focused); if (el) el.focus(); }
}

// ---------- actions
async function report(kind, id) {
  try {
    await api("/api/report", { method: "POST", body: JSON.stringify({ kind, id, voter }) });
    reported[(kind === "comment" ? "c:" : "n:") + id] = 1;
    store.set("midgley.reported", JSON.stringify(reported));
    render();
    toast("Reported. A moderator will take a look.");
  } catch (e) { toast("Couldn't send the report: " + e.message); }
}

async function share(n) {
  const url = location.origin + nomineePath(n);
  if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try { await navigator.share({ title: `${n.name}: ${n.work}`, text: "Nominated for a Midgley Award", url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("Link copied"); }
  catch (e) { window.prompt ? window.prompt("Copy this link", url) : toast(url); }
}

$("#list").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-act]"); if (!btn) return;
  const id = btn.closest("[data-id]").dataset.id;
  const n = state.noms.find((x) => x.id === id);
  const act = btn.dataset.act;
  if (act === "toggle") {
    if (PAGE === "nominee") return; // the thread is always open on a nominee's page
    state.open.has(id) ? state.open.delete(id) : state.open.add(id); render(); return;
  }
  if (act === "share" && n) return share(n);
  if (act === "report-nom") return report("nominee", id);
  if (act === "report-c") return report("comment", btn.dataset.cid);
  if (act === "vote" && n) {
    const had = state.myVotes.has(id);
    had ? state.myVotes.delete(id) : state.myVotes.add(id);
    state.local[id] = { fields: { score: Math.max(0, withLocal(n).score + (had ? -1 : 1)) }, at: Date.now() };
    render();
    try {
      const r = await api("/api/vote", { method: "POST", body: JSON.stringify({ nomineeId: id, voter }) });
      state.local[id] = { fields: { score: r.score }, at: Date.now() };
      r.voted ? state.myVotes.add(id) : state.myVotes.delete(id);
      render();
    } catch (err) { delete state.local[id]; showNotice("Your vote didn't save: " + err.message); load(); }
  }
  if (act === "herd" && n) {
    // Tapping your current answer again withdraws it.
    const was = state.myHerd[id];
    const want = btn.dataset.vote === "yes";
    const vote = was === want ? "" : want ? "yes" : "no";
    if (vote) state.myHerd[id] = want; else delete state.myHerd[id];
    render();
    try {
      const r = await api("/api/herd", { method: "POST", body: JSON.stringify({ nomineeId: id, voter, vote }) });
      state.local[id] = { fields: { herdYes: r.herdYes, herdTotal: r.herdTotal }, at: Date.now() };
      render();
    } catch (err) {
      if (was === undefined) delete state.myHerd[id]; else state.myHerd[id] = was;
      showNotice("Your vote didn't save: " + err.message); render();
    }
  }
  if (act === "comment") {
    const ta = document.getElementById("c-" + id); const text = ta.value.trim(); if (!text) return;
    const author = document.getElementById("cn-" + id).value.trim();
    if (author) store.set("midgley.name", author);
    btn.disabled = true;
    try {
      const c = await api("/api/comments", { method: "POST", body: JSON.stringify({ nomineeId: id, text, author }) });
      ta.value = ""; state.localComments.push({ ...c, at: Date.now() }); render();
    } catch (err) { showNotice("Your comment didn't post: " + err.message); }
    btn.disabled = false;
  }
});

document.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
  state.sort = b.dataset.sort;
  document.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  render();
}));
[["#flt-domain", "domain"], ["#flt-harm", "harm"], ["#flt-status", "status"], ["#flt-know", "know"]].forEach(([sel, key]) => {
  if ($(sel)) $(sel).addEventListener("change", (e) => { state.f[key] = e.target.value; render(); });
});

// ---------- boot
api("/api/config").then((c) => (state.config = c)).catch(() => {});
load();
setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
let lastVis = Date.now();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && Date.now() - lastVis > 15000) load();
  lastVis = Date.now();
});
