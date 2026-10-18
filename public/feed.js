// Posts in a feed or on their own page: votes, comments, sharing, "more", and reporting.
// The server sends the posts ready to read; this script makes them interactive.
import { api } from "./site.js";
import { herdLine } from "./shared.js";

const $ = (s, r = document) => r.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}
let voter = store.get("midgley.voter");
if (!voter || !/^[A-Za-z0-9-]{16,64}$/.test(voter)) { voter = makeId(); store.set("midgley.voter", voter); }

let toastTimer = null;
export function toast(t) {
  let el = $("#toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = t; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2600);
}

// Show which way this browser already voted.
api("/api/my-votes?voter=" + encodeURIComponent(voter)).then((r) => {
  (r.myVotes || []).forEach((id) => document.querySelectorAll(`.post[data-id="${CSS.escape(id)}"] [data-act="vote"]`).forEach((b) => b.setAttribute("aria-pressed", "true")));
  Object.entries(r.myHerd || {}).forEach(([id, yes]) => {
    const btn = document.querySelector(`.post[data-id="${CSS.escape(id)}"] [data-act="herd"][data-vote="${yes ? "yes" : "no"}"]`);
    if (btn) btn.setAttribute("aria-pressed", "true");
  });
}).catch(() => {});

const name = () => store.get("midgley.name") || "";
document.querySelectorAll(".pv-reply [name=author]").forEach((i) => (i.value = name()));

async function shareLink(post) {
  const url = location.origin + post.dataset.path;
  const title = $(".pv-who b", post).textContent;
  if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try { await navigator.share({ title: `${title} · The Backfire Awards`, url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch (e) { window.prompt("Copy this link", url); }
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const post = btn.closest(".post");
  if (!post) return;
  const id = post.dataset.id;
  const act = btn.dataset.act;
  if (act === "more") {
    const full = $(".pv-full", post); full.hidden = !full.hidden;
    btn.textContent = full.hidden ? "more" : "less";
    return;
  }
  if (act === "comments") {
    const box = $(".pv-comments", post); box.removeAttribute("data-collapsed");
    const vb = $(".pv-viewall", post); if (vb) vb.remove();
    $(".pv-reply [name=text]", post).focus();
    return;
  }
  if (act === "share" || act === "share-link") { btn.closest("details")?.removeAttribute("open"); return shareLink(post); }
  if (act === "share-ig") {
    btn.closest("details")?.removeAttribute("open");
    const cards = [...post.querySelectorAll(".carousel .cc")];
    if (!cards.length) return toast("This post has no cards to save yet.");
    toast("Making the cards…");
    const { shareCards } = await import("./share.js");
    return shareCards(cards, $(".pv-who b", post).textContent, location.origin + post.dataset.path);
  }
  if (act === "report") {
    btn.closest("details")?.removeAttribute("open");
    try { await api("/api/report", { method: "POST", body: JSON.stringify({ kind: post.dataset.kind === "murphy" ? "murphy" : "nominee", id, voter }) }); toast("Reported. A moderator will take a look."); }
    catch (err) { toast("Couldn't send the report: " + err.message); }
    return;
  }
  if (act === "report-c") {
    const cid = btn.closest("[data-cid]").dataset.cid;
    try { await api("/api/report", { method: "POST", body: JSON.stringify({ kind: "comment", id: cid, voter }) }); btn.replaceWith(document.createTextNode("Reported")); }
    catch (err) { toast("Couldn't send the report: " + err.message); }
    return;
  }
  if (act === "vote") {
    const on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!on));
    try {
      const r = await api("/api/vote", { method: "POST", body: JSON.stringify({ nomineeId: id, voter }) });
      btn.setAttribute("aria-pressed", String(r.voted)); $(".c", btn).textContent = r.score;
    } catch (err) { btn.setAttribute("aria-pressed", String(on)); toast("Your vote didn't save: " + err.message); }
    return;
  }
  if (act === "herd") {
    const group = btn.parentElement;
    const was = group.querySelector('[aria-pressed="true"]');
    const vote = was === btn ? "" : btn.dataset.vote;   // tapping your answer again takes it back
    group.querySelectorAll("[data-act=herd]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn && vote !== "")));
    try {
      const r = await api("/api/herd", { method: "POST", body: JSON.stringify({ nomineeId: id, voter, vote }) });
      const h = $(".pv-herd", post); if (h) h.innerHTML = herdLine(r.herdYes, r.herdTotal);
    } catch (err) {
      group.querySelectorAll("[data-act=herd]").forEach((b) => b.setAttribute("aria-pressed", String(b === was)));
      toast("Your vote didn't save: " + err.message);
    }
  }
});

document.addEventListener("submit", async (e) => {
  const form = e.target.closest(".pv-reply");
  if (!form) return;
  e.preventDefault();
  const post = form.closest(".post");
  const text = form.text.value.trim(), author = form.author.value.trim();
  if (!text) return;
  if (author) store.set("midgley.name", author);
  const btn = form.querySelector("button"); btn.disabled = true;
  try {
    const c = await api("/api/comments", { method: "POST", body: JSON.stringify({ nomineeId: post.dataset.id, text, author }) });
    const p = document.createElement("p"); p.className = "cm";
    p.innerHTML = "<b></b> <span></span> <small>just now</small>";
    p.querySelector("b").textContent = c.author || "Anonymous"; p.querySelector("span").textContent = c.text;
    $(".pv-thread", post).appendChild(p);
    const n = $(".cc-n", post); n.textContent = Number(n.textContent) + 1;
    form.text.value = "";
  } catch (err) { toast("Your comment didn't post: " + err.message); }
  btn.disabled = false;
});

// Close any open ⋯ menu when clicking elsewhere.
document.addEventListener("click", (e) => {
  document.querySelectorAll(".pv-menu[open]").forEach((d) => { if (!d.contains(e.target)) d.removeAttribute("open"); });
});
