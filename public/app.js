(function () {
  "use strict";
  const { DOMAINS, HARMS, STATUSES, KNOW, AWARDS } = window.MIDGLEY;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const POLL_MS = 60000;

  function makeId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let voter = store.get("midgley.voter");
  if (!voter || !/^[A-Za-z0-9-]{16,64}$/.test(voter)) { voter = makeId(); store.set("midgley.voter", voter); }

  let reported = {};
  try { reported = JSON.parse(store.get("midgley.reported") || "{}") || {}; } catch (e) {}

  const state = {
    noms: [], comments: [], myVotes: new Set(), loaded: false,
    sort: "top", f: { domain: "", harm: "", status: "", know: "" },
    open: new Set(),
    localScores: {},   // id -> {score, at}: our own vote, until the cached list catches up
    localComments: [], // our own comments, until the cached list includes them
    config: { turnstileSiteKey: "" }
  };

  // ---------- selects
  const opts = (map, all) => `<option value="">${all}</option>` + Object.entries(map).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  $("#flt-domain").innerHTML = opts(DOMAINS, "All fields");
  $("#flt-harm").innerHTML = opts(HARMS, "Any kind of harm");
  $("#flt-status").innerHTML = opts(STATUSES, "Any status");
  $("#flt-know").innerHTML = opts(KNOW, "Knowable or not");
  $("#f-domain").innerHTML = opts(DOMAINS, "Choose a field");
  $("#f-status").innerHTML = Object.entries(STATUSES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  $("#f-know").innerHTML = Object.entries(KNOW).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("");
  $("#f-harms").innerHTML = Object.entries(HARMS).map(([k, v]) => `<label><input type="checkbox" value="${k}" id="f-harm-${k}">${esc(v)}</label>`).join("");
  $("#f-author").value = store.get("midgley.name") || "";

  // ---------- helpers
  function symbol(name) {
    const parts = String(name).replace(/[^A-Za-zÀ-ÿ\s-]/g, "").trim().split(/\s+/).filter((p) => !/^(jr|sr|ii|iii|iv)$/i.test(p));
    const last = parts[parts.length - 1] || "?";
    return last.charAt(0).toUpperCase() + (last.charAt(1) || "").toLowerCase();
  }
  function ago(iso) {
    const d = new Date(iso); if (isNaN(d)) return "";
    const s = (Date.now() - d) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago"; if (s < 86400 * 30) return Math.floor(s / 86400) + "d ago";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  const upIcon = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2 L13 10 H1 Z" fill="currentColor"/></svg>`;
  const byline = (a, seeded) => (seeded ? "Founding class" : a || "Anonymous");
  let toastTimer = null;
  function toast(t) {
    const el = $("#toast"); el.textContent = t; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (el.hidden = true), 2600);
  }
  function showNotice(t) { const n = $("#notice"); n.textContent = t; n.hidden = !t; }

  async function api(path, opts = {}) {
    const res = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Request failed (" + res.status + ")");
    return body;
  }

  // ---------- data
  async function load() {
    try {
      const [d, mv] = await Promise.all([api("/api/state"), api("/api/my-votes?voter=" + encodeURIComponent(voter)).catch(() => null)]);
      state.noms = d.nominees;
      state.comments = d.comments;
      if (mv) state.myVotes = new Set(mv.myVotes);
      const now = Date.now();
      for (const [id, v] of Object.entries(state.localScores)) if (now - v.at > 30000) delete state.localScores[id];
      const have = new Set(state.comments.map((c) => c.id));
      state.localComments = state.localComments.filter((c) => !have.has(c.id) && now - c.at < 120000);
      const first = !state.loaded;
      state.loaded = true;
      const typing = document.activeElement && document.activeElement.closest && document.activeElement.closest(".reply");
      if (!typing || first) render();
      if (first) openDeepLink();
    } catch (e) {
      if (!state.loaded) $("#list").innerHTML = `<p class="empty">The nominees couldn't load. ${esc(e.message)}. Refresh to try again.</p>`;
    }
  }

  function allComments() { return state.comments.concat(state.localComments); }
  function scoreOf(n) { const l = state.localScores[n.id]; return l ? l.score : n.score; }

  // ---------- render
  function render() {
    const list = $("#list");
    const drafts = {}; list.querySelectorAll(".reply textarea, .reply input").forEach((t) => (drafts[t.id] = t.value));
    const focused = document.activeElement && document.activeElement.id;
    const comments = allComments();
    const ccount = {}; comments.forEach((c) => (ccount[c.nomineeId] = (ccount[c.nomineeId] || 0) + 1));
    let noms = state.noms.map((n) => ({ ...n, score: scoreOf(n), ccount: ccount[n.id] || 0 }));
    const byTop = (a, b) => b.score - a.score || String(a.createdAt).localeCompare(String(b.createdAt));
    const ranked = [...noms].sort(byTop);
    const rankOf = {}; ranked.forEach((n, i) => (rankOf[n.id] = i + 1));
    const f = state.f;
    noms = noms.filter((n) =>
      (!f.domain || n.domain === f.domain) && (!f.harm || n.harms.includes(f.harm)) &&
      (!f.status || n.status === f.status) && (!f.know || n.knowable === f.know));
    if (state.sort === "top") noms.sort(byTop);
    else if (state.sort === "new") noms.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    else noms.sort((a, b) => b.ccount - a.ccount || byTop(a, b));
    const filtered = f.domain || f.harm || f.status || f.know;
    $("#count").textContent = filtered ? `${noms.length} of ${state.noms.length} nominees` : `${state.noms.length} nominees`;
    if (!noms.length) {
      list.innerHTML = `<p class="empty">${state.noms.length ? "Nothing matches these filters yet. Submit the first." : "No nominees yet. Submit the first."}</p>`;
      return;
    }
    list.innerHTML = noms.map((n) => {
      const mine = state.myVotes.has(n.id);
      const open = state.open.has(n.id);
      const thread = comments.filter((c) => c.nomineeId === n.id);
      const fix = n.fix ? `<dt class="x">The fix</dt><dd>${esc(n.fix)}${n.fixUrl ? ` <a href="${esc(n.fixUrl)}" target="_blank" rel="noopener nofollow">Learn more</a>` : ""}</dd>` : "";
      return `<article class="nom ${rankOf[n.id] === 1 && n.score > 0 ? "top" : ""}" id="nom-${esc(n.id)}" data-id="${esc(n.id)}">
        <div class="vote">
          <div class="tile" title="Rank ${rankOf[n.id]} of ${ranked.length}"><span class="n">${rankOf[n.id]}</span><span class="sym">${esc(symbol(n.name))}</span></div>
          <button class="up" data-act="vote" aria-pressed="${mine}" aria-label="${mine ? "Withdraw vote for" : "Upvote"} ${esc(n.name)}">${upIcon}<span class="c">${n.score}</span></button>
        </div>
        <div class="body">
          <div class="head"><h3>${esc(n.name)}</h3>${n.years ? `<span class="yrs">${esc(n.years)}</span>` : ""}</div>
          <p class="work">${esc(n.work)}</p>
          <dl class="ledger">
            <dt class="s">Solved</dt><dd>${esc(n.solved)}</dd>
            <dt class="b">Created</dt><dd>${esc(n.backfire)}</dd>
            ${fix}
          </dl>
          <div class="meta">
            ${n.award ? `<span class="chip award">${esc(AWARDS[n.award] || n.award)}</span>` : ""}
            ${n.domain ? `<span class="chip">${esc(DOMAINS[n.domain] || n.domain)}</span>` : ""}
            ${n.status ? `<span class="chip">${esc(STATUSES[n.status] || n.status)}</span>` : ""}
            ${KNOW[n.knowable] ? `<span class="chip k-${esc(n.knowable)}">${esc(KNOW[n.knowable])}</span>` : ""}
            ${n.harms.map((h) => `<span class="chip">${esc(HARMS[h] || h)} harm</span>`).join("")}
          </div>
          <div class="meta">
            <span class="by">${esc(byline(n.author, n.seeded))}${n.seeded ? "" : " · " + esc(ago(n.createdAt))}</span>
            <button class="toggle" data-act="toggle" aria-expanded="${open}">${open ? "Hide comments" : n.ccount ? n.ccount + (n.ccount === 1 ? " comment" : " comments") : "Comment"}</button>
            <button class="linkish" data-act="share">Share</button>
            ${reported["n:" + n.id] ? `<span class="by">Reported</span>` : `<button class="linkish" data-act="report-nom">Report</button>`}
          </div>
          ${open ? `<div class="thread">
            ${thread.map((c) => `<div class="cm"><span class="who">${esc(c.author || "Anonymous")} · ${esc(ago(c.createdAt))}</span><p>${esc(c.text)}</p>
              <div class="tools">${reported["c:" + c.id] ? `<span class="by">Reported</span>` : `<button class="linkish" data-act="report-c" data-cid="${esc(c.id)}">Report</button>`}</div></div>`).join("") || `<span class="by">No comments yet. Argue for or against.</span>`}
            <div class="reply"><input id="cn-${esc(n.id)}" maxlength="60" placeholder="Your name" value="${esc(store.get("midgley.name") || "")}" aria-label="Your name"><textarea id="c-${esc(n.id)}" maxlength="1000" placeholder="Make the case, or push back" aria-label="Comment"></textarea><button class="ghost" data-act="comment">Post</button></div>
          </div>` : ""}
        </div>
      </article>`;
    }).join("");
    Object.entries(drafts).forEach(([id, v]) => { const t = document.getElementById(id); if (t) t.value = v; });
    if (focused) { const el = document.getElementById(focused); if (el) el.focus(); }
  }

  function openDeepLink() {
    const m = location.pathname.match(/^\/n\/([A-Za-z0-9-]{1,64})\/?$/);
    if (!m) return;
    const id = m[1];
    if (!state.noms.some((n) => n.id === id)) { showNotice("That nominee isn't on the list. It may still be waiting for review."); return; }
    state.open.add(id); render();
    const el = document.getElementById("nom-" + id);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "auto" });
      el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2200);
    }
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
    const url = location.origin + "/n/" + n.id;
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: `${n.name}: ${n.work}`, text: "Nominated for a Midgley Award", url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied"); }
    catch (e) { window.prompt ? window.prompt("Copy this link", url) : toast(url); }
  }

  $("#list").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]"); if (!btn) return;
    const id = btn.closest(".nom").dataset.id;
    const n = state.noms.find((x) => x.id === id);
    const act = btn.dataset.act;
    if (act === "toggle") { state.open.has(id) ? state.open.delete(id) : state.open.add(id); render(); return; }
    if (act === "share" && n) return share(n);
    if (act === "report-nom") return report("nominee", id);
    if (act === "report-c") return report("comment", btn.dataset.cid);
    if (act === "vote" && n) {
      const had = state.myVotes.has(id);
      had ? state.myVotes.delete(id) : state.myVotes.add(id);
      state.localScores[id] = { score: Math.max(0, scoreOf(n) + (had ? -1 : 1)), at: Date.now() };
      render();
      try {
        const r = await api("/api/vote", { method: "POST", body: JSON.stringify({ nomineeId: id, voter }) });
        state.localScores[id] = { score: r.score, at: Date.now() };
        r.voted ? state.myVotes.add(id) : state.myVotes.delete(id);
        render();
      } catch (err) { delete state.localScores[id]; showNotice("Your vote didn't save: " + err.message); load(); }
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
    $(sel).addEventListener("change", (e) => { state.f[key] = e.target.value; render(); });
  });

  // ---------- Turnstile (only when the server has keys configured)
  let tsLoading = null;
  const tsTokens = {};
  function loadTurnstile() {
    if (!state.config.turnstileSiteKey) return Promise.resolve(null);
    if (!tsLoading) tsLoading = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true; s.onload = () => resolve(window.turnstile); s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return tsLoading;
  }
  const tsWidgets = {};
  async function mountTurnstile(slot) {
    const ts = await loadTurnstile();
    if (!ts || tsWidgets[slot]) return;
    tsWidgets[slot] = ts.render("#" + slot, {
      sitekey: state.config.turnstileSiteKey,
      callback: (t) => (tsTokens[slot] = t),
      "expired-callback": () => (tsTokens[slot] = "")
    });
  }
  function resetTurnstile(slot) { if (window.turnstile && tsWidgets[slot]) { window.turnstile.reset(tsWidgets[slot]); tsTokens[slot] = ""; } }

  // ---------- submit form
  $("#open-form").onclick = () => { $("#form").hidden = false; $("#open-form").hidden = true; $("#thanks").hidden = true; mountTurnstile("f-ts"); $("#f-name").focus(); };
  $("#f-cancel").onclick = () => { $("#form").hidden = true; $("#open-form").hidden = false; $("#f-msg").textContent = ""; };

  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = (id) => $(id).value.trim();
    const nom = {
      name: v("#f-name"), years: v("#f-years"), work: v("#f-work"), solved: v("#f-solved"), backfire: v("#f-backfire"),
      domain: $("#f-domain").value, status: $("#f-status").value, knowable: $("#f-know").value,
      harms: [...document.querySelectorAll("#f-harms input:checked")].map((x) => x.value),
      fix: v("#f-fix"), fixUrl: v("#f-fixurl"), author: v("#f-author"), website: v("#f-website"),
      turnstile: tsTokens["f-ts"] || ""
    };
    if (!nom.name || !nom.work || !nom.solved || !nom.backfire) { $("#f-msg").textContent = "Fill in the nominee, the achievement, and both sides of the ledger."; return; }
    if (!nom.domain) { $("#f-msg").textContent = "Pick the field it belongs to."; return; }
    if (state.config.turnstileSiteKey && !nom.turnstile) { $("#f-msg").textContent = "Complete the human check first."; return; }
    if (nom.author) store.set("midgley.name", nom.author);
    $("#f-submit").disabled = true; $("#f-msg").textContent = "";
    try {
      const r = await api("/api/nominees", { method: "POST", body: JSON.stringify(nom) });
      ["#f-name", "#f-years", "#f-work", "#f-solved", "#f-backfire", "#f-fix", "#f-fixurl"].forEach((id) => ($(id).value = ""));
      document.querySelectorAll("#f-harms input").forEach((x) => (x.checked = false));
      $("#form").hidden = true; $("#open-form").hidden = false;
      if (r.status === "approved" && r.nominee) {
        state.noms.push(r.nominee);
        document.querySelector('.seg button[data-sort="new"]').click();
        toast("Nominee added");
      } else {
        const t = $("#thanks");
        t.textContent = `Thanks. ${nom.name} is in the review queue and will appear once a moderator approves it.`;
        t.hidden = false;
      }
    } catch (err) { $("#f-msg").textContent = "That didn't save: " + err.message; }
    resetTurnstile("f-ts");
    $("#f-submit").disabled = false;
  });

  // ---------- subscribe
  $("#sub-email").addEventListener("focus", () => mountTurnstile("sub-ts"), { once: true });
  $("#sub-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#sub-email").value.trim();
    const msg = $("#sub-msg");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = "That email address doesn't look right."; return; }
    if (state.config.turnstileSiteKey && !tsTokens["sub-ts"]) { msg.textContent = "Complete the human check first."; mountTurnstile("sub-ts"); return; }
    $("#sub-btn").disabled = true; msg.textContent = "";
    try {
      await api("/api/subscribe", { method: "POST", body: JSON.stringify({ email, website: $("#sub-website").value, turnstile: tsTokens["sub-ts"] || "" }) });
      $("#sub-form").hidden = true; $("#sub-ts").hidden = true;
      msg.style.color = "var(--ozone)"; msg.textContent = "You're on the list. One email when the winners are announced.";
    } catch (err) { msg.textContent = err.message; resetTurnstile("sub-ts"); }
    $("#sub-btn").disabled = false;
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
})();
