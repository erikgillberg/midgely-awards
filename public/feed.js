// Posts in a feed or on their own page: votes, comments, sharing, "more", and reporting.
// The server sends the posts ready to read; this script makes them interactive.
import { api } from "./site.js";
import { herdLine, commentHTML } from "./shared.js";

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

// ---------- the comments panel: slides up from the bottom on a phone, a centered panel on a computer
const sheet = document.createElement("div");
sheet.className = "cs"; sheet.hidden = true;
sheet.innerHTML = `<div class="cs-panel" role="dialog" aria-modal="true" aria-labelledby="cs-h">
  <div class="cs-grab" aria-hidden="true"></div>
  <header class="cs-head"><h2 id="cs-h">Comments</h2><button type="button" class="cs-x" aria-label="Close comments">×</button></header>
  <div class="cs-list"></div>
  <div class="cs-to" hidden><span></span><button type="button" class="cs-to-x" aria-label="Stop replying">×</button></div>
  <form class="cs-form"><input name="author" maxlength="60" placeholder="Name" aria-label="Your name" autocomplete="nickname"><input name="text" maxlength="1000" placeholder="Add a comment…" aria-label="Comment" required enterkeyhint="send"><button type="submit">Post</button></form>
</div>`;
document.body.appendChild(sheet);
const panel = $(".cs-panel", sheet), list = $(".cs-list", sheet), form = $(".cs-form", sheet);
let sheetPost = null, lastFocus = null;

// Newest comments first, each with its replies under it, oldest reply first.
function fillList() {
  const groups = [];
  sheetPost.querySelectorAll(".pv-thread .cm").forEach((c) => {
    if (!c.classList.contains("cm-r") || !groups.length) groups.push([]);
    groups[groups.length - 1].push(c);
  });
  list.innerHTML = groups.length ? "" : `<p class="cs-empty">No comments yet. Start the conversation.</p>`;
  groups.reverse().flat().forEach((c) => { const x = c.cloneNode(true); x.classList.remove("pv-old"); list.appendChild(x); });
}

// Replying: one level, so a reply to a reply joins the first comment's conversation.
const replyBar = $(".cs-to", sheet);
let replyTo = null;
function startReply(cm) {
  const top = cm.classList.contains("cm-r") ? cm.dataset.parent : cm.dataset.cid;
  const who = $("b", cm).textContent;
  replyTo = { id: top };
  $("span", replyBar).textContent = "Replying to " + who;
  replyBar.hidden = false;
  form.text.placeholder = "Reply to " + who + "…";
  if (!form.text.value.trim()) form.text.value = cm.classList.contains("cm-r") ? "@" + who + " " : "";
  form.text.focus();
}
function stopReply() {
  replyTo = null; replyBar.hidden = true; form.text.placeholder = "Add a comment…";
}
$(".cs-to-x", sheet).addEventListener("click", () => { stopReply(); form.text.focus(); });
let draftFor = null;
function openSheet(post, typing) {
  if (draftFor !== post) { form.text.value = ""; draftFor = post; stopReply(); } // a draft belongs to one post
  sheetPost = post; lastFocus = document.activeElement;
  $("#cs-h", sheet).textContent = "Comments · " + $(".pv-who b", post).textContent;
  fillList();
  form.author.value = name();
  sheet.hidden = false; panel.style.transform = "";
  document.documentElement.classList.add("cs-open");
  list.scrollTop = 0;
  lift();
  if (typing) form.text.focus(); // inside the tap, so a phone shows its keyboard
  else $(".cs-x", sheet).focus({ preventScroll: true });
}
function closeSheet() {
  if (sheet.hidden) return;
  form.text.blur();
  sheet.hidden = true; sheetPost = null;
  document.documentElement.classList.remove("cs-open");
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
sheet.addEventListener("click", (e) => {
  if (e.target === sheet || e.target.closest(".cs-x")) return closeSheet();
  const rep = e.target.closest("[data-act=report-c]");
  if (rep) return reportComment(rep);
  const re = e.target.closest("[data-act=reply-c]");
  if (re) startReply(re.closest(".cm"));
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

// Swipe the panel down to close it (from the grab bar or the header).
let drag = null;
panel.addEventListener("touchstart", (e) => { if (e.target.closest(".cs-grab, .cs-head")) { drag = { y: e.touches[0].clientY, dy: 0 }; panel.classList.add("dragging"); } }, { passive: true });
panel.addEventListener("touchmove", (e) => { if (!drag) return; drag.dy = Math.max(0, e.touches[0].clientY - drag.y); panel.style.transform = `translateY(${drag.dy}px)`; }, { passive: true });
panel.addEventListener("touchend", () => { if (!drag) return; panel.classList.remove("dragging"); const far = drag.dy > 90; drag = null; if (far) closeSheet(); else panel.style.transform = ""; });
panel.addEventListener("touchcancel", () => { if (!drag) return; drag = null; panel.classList.remove("dragging"); panel.style.transform = ""; });

// Keep the panel above the phone's keyboard.
function lift() {
  const vv = window.visualViewport;
  if (vv) sheet.style.setProperty("--kb", Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px");
}
if (window.visualViewport) { visualViewport.addEventListener("resize", lift); visualViewport.addEventListener("scroll", lift); }

// Keep Tab inside the open panel.
sheet.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const f = [...panel.querySelectorAll("button:not([disabled]), input, [href]")].filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

async function reportComment(btn) {
  const cid = btn.closest("[data-cid]").dataset.cid;
  try {
    await api("/api/report", { method: "POST", body: JSON.stringify({ kind: "comment", id: cid, voter }) });
    document.querySelectorAll(`[data-cid="${CSS.escape(cid)}"] [data-act=report-c]`).forEach((b) => b.replaceWith(document.createTextNode("Reported")));
  } catch (err) { toast("Couldn't send the report: " + err.message); }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const post = sheetPost;
  const text = form.text.value.trim(), author = form.author.value.trim();
  if (!text || !post) return;
  if (author) store.set("midgley.name", author);
  const btn = form.querySelector("button"); btn.disabled = true;
  try {
    const parentId = replyTo ? replyTo.id : undefined;
    const c = await api("/api/comments", { method: "POST", body: JSON.stringify({ nomineeId: post.dataset.id, text, author, parentId }) });
    if (c.held) {
      toast("Thanks. Goat, our AI moderator, is holding this one for a person to review before it shows.");
    } else {
      const tmp = document.createElement("div");
      tmp.innerHTML = commentHTML({ id: c.id, author: c.author, text: c.text, parentId: c.parentId, createdAt: new Date().toISOString() });
      const cm = tmp.firstElementChild;
      const thread = $(".pv-thread", post);
      // A reply goes after the last reply in its conversation; a comment goes at the end.
      const lastOf = (root, pid) => { const all = [...root.querySelectorAll(`.cm[data-cid="${CSS.escape(pid)}"], .cm[data-parent="${CSS.escape(pid)}"]`)]; return all[all.length - 1]; };
      const after = c.parentId && lastOf(thread, c.parentId);
      if (after) after.after(cm); else thread.appendChild(cm);
      // The post shows the latest two comments; older ones and all replies fold away behind "View all".
      const tops = [...thread.querySelectorAll(".cm:not(.cm-r)")];
      tops.forEach((x, i) => x.classList.toggle("pv-old", i < tops.length - 2));
      const all = thread.querySelectorAll(".cm");
      $(".cc-n", post).textContent = all.length;
      let vb = $(".pv-viewall", post);
      if (all.length > 2) {
        if (!vb) { vb = document.createElement("button"); vb.type = "button"; vb.className = "pv-viewall"; vb.dataset.act = "comments"; thread.before(vb); }
        vb.textContent = `View all ${all.length} comments`;
      }
      if (sheetPost === post) { // the panel may have moved on to another post while this one was sending
        $(".cs-empty", list)?.remove();
        const copy = cm.cloneNode(true); copy.classList.remove("pv-old");
        const at = c.parentId && lastOf(list, c.parentId);
        if (at) at.after(copy); else { list.prepend(copy); list.scrollTop = 0; }
      }
    }
    if (draftFor === post) { form.text.value = ""; stopReply(); }
  } catch (err) { toast("Your comment didn't post: " + err.message); }
  btn.disabled = false;
});

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
  if (act === "comments" || act === "comment-new") return openSheet(post, act === "comment-new");
  if (act === "share" || act === "share-link") { btn.closest("details")?.removeAttribute("open"); return shareLink(post); }
  if (act === "share-ig") {
    btn.closest("details")?.removeAttribute("open");
    // Instagram gets its own ending: the site's vote card stays here, the "answer in the comments" card goes there.
    const car = $(".carousel", post);
    if (!car) return toast("This post has no cards to save yet.");
    const cards = [...car.querySelectorAll(".cc")].filter((c) => !c.hasAttribute("data-web-only"));
    toast("Making the cards…");
    const { shareCards } = await import("./share.js");
    car.classList.add("ig-export");
    try { return await shareCards(cards, $(".pv-who b", post).textContent, location.origin + post.dataset.path); }
    finally { car.classList.remove("ig-export"); }
  }
  if (act === "report") {
    btn.closest("details")?.removeAttribute("open");
    try { await api("/api/report", { method: "POST", body: JSON.stringify({ kind: post.dataset.kind === "murphy" ? "murphy" : "nominee", id, voter }) }); toast("Reported. A moderator will take a look."); }
    catch (err) { toast("Couldn't send the report: " + err.message); }
    return;
  }
  if (act === "report-c") return reportComment(btn);
  if (act === "reply-c") { const cm = btn.closest(".cm"); openSheet(post, true); const twin = list.querySelector(`.cm[data-cid="${CSS.escape(cm.dataset.cid)}"]`); return startReply(twin || cm); }
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

// Close any open ⋯ menu when clicking elsewhere.
document.addEventListener("click", (e) => {
  document.querySelectorAll(".pv-menu[open]").forEach((d) => { if (!d.contains(e.target)) d.removeAttribute("open"); });
});
