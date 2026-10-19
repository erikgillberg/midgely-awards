(function () {
  "use strict";
  const { DOMAINS, HARMS, STATUSES, KNOW, AWARDS, oopsBand } = window.MIDGLEY;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch (e) {} }
  };
  let token = store.get("midgley.admin") || "";
  let data = null;
  const editing = new Set();

  function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2400); }
  function notice(t) { const n = $("#notice"); n.textContent = t; n.hidden = !t; }

  async function api(path, opts = {}) {
    const res = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", authorization: "Bearer " + token, ...(opts.headers || {}) } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(body.error || "Request failed (" + res.status + ")"); e.status = res.status; throw e; }
    return body;
  }

  function setLocked(locked) {
    $("#token").value = "";
    ["#token", "#login button[type=submit]", 'label[for="token"]'].forEach((q) => ($(q).hidden = !locked));
    $("#logout").hidden = locked;
  }

  async function load() {
    try {
      data = await api("/api/admin/overview");
      notice(""); $("#panels").hidden = false; setLocked(false);
      render();
      loadMurphys();
    } catch (e) {
      $("#panels").hidden = true; setLocked(true);
      notice(e.message);
      if (e.status === 401) { token = ""; store.set("midgley.admin", ""); }
    }
  }

  const sel = (id, map, val, blank) =>
    `<select id="${id}">${blank !== undefined ? `<option value="">${blank}</option>` : ""}${Object.entries(map).map(([k, v]) => `<option value="${k}" ${k === val ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>`;

  function chips(n) {
    const c = [];
    if (n.state !== "approved") c.push(`<span class="chip st-${n.state}">${n.state}</span>`);
    if (n.award) c.push(`<span class="chip award">${esc(AWARDS[n.award])}</span>`);
    if (n.domain) c.push(`<span class="chip">${esc(DOMAINS[n.domain])}</span>`);
    if (n.status) c.push(`<span class="chip">${esc(STATUSES[n.status])}</span>`);
    if (n.knowable) c.push(`<span class="chip k-${n.knowable}">${esc(KNOW[n.knowable])}</span>`);
    n.harms.forEach((h) => c.push(`<span class="chip">${esc(HARMS[h])}</span>`));
    if (n.reports) c.push(`<span class="chip st-rejected">${n.reports} report${n.reports === 1 ? "" : "s"}</span>`);
    if (n.legacyCategory && !n.seeded) c.push(`<span class="chip">v1: ${esc(n.legacyCategory)}</span>`);
    return c.join(" ");
  }

  // The nominee write-up, in page order. [key, label, max, kind]
  const FIELDS = [
    ["name", "Nominee", 80], ["years", "Years (1889 to 1944, or Born 1955)", 30], ["work", "The achievement", 120, "full"],
    ["slug", "Page address (/n/...)", 60],
    ["born", "Tile: year born (or founded)", 5],
    ["helped", "Tile: people helped, power of ten (6 = a million or more, 9 = a billion or more)", 2],
    ["harmed", "Tile: people harmed, power of ten (same scale)", 2],
    ["meant", "1. What it was meant to do", 600, "text"], ["solved", "2. What went right", 600, "text"],
    ["backfire", "3. What went oops", 600, "text"], ["gotRight", "4. What they got right", 600, "text"],
    ["foresight", "5. Could anyone have seen it coming? (the knowable setting below gives the short answer)", 600, "text"],
    ["pattern", "6. Pattern, in plain words", 200, "full"],
    ["source1", "7. Source link 1", 500, "full"], ["source2", "7. Source link 2", 500, "full"],
    ["wikiName", "Wikipedia: nominee", 500, "full"], ["wikiWork", "Wikipedia: achievement", 500, "full"],
    ["fix", "The fix", 400, "text"], ["fixUrl", "Fix link", 500, "full"], ["author", "Submitted by", 60],
  ];
  function fieldsHTML(n, pre) {
    const f = FIELDS.filter(([k]) => !(pre === "new" && k === "slug")).map(([k, label, max, kind]) => {
      const id = `e-${k}-${pre}`, val = esc(n[k] || "");
      const input = kind === "text" ? `<textarea id="${id}" maxlength="${max}">${val}</textarea>` : `<input id="${id}" value="${val}" maxlength="${max}">`;
      return `<label class="${kind ? "full" : ""}">${esc(label)}${input}</label>`;
    }).join("");
    return f + `
      <label>Category${sel("e-domain-" + pre, DOMAINS, n.domain || "", "Not sure")}</label>
      <label>Status${sel("e-status-" + pre, STATUSES, n.status || "", "None")}</label>
      <label>Knowable${sel("e-knowable-" + pre, KNOW, n.knowable || "", "None")}</label>
      <label>Special award${sel("e-award-" + pre, AWARDS, n.award || "", "None")}</label>
      <label class="full">Kinds of harm<span class="checks">${Object.entries(HARMS).map(([k, v]) => `<label style="flex-direction:row;text-transform:none;letter-spacing:0;font:13px var(--sans);color:var(--ink)"><input type="checkbox" data-harm="${k}" ${(n.harms || []).includes(k) ? "checked" : ""} style="width:auto">${esc(v)}</label>`).join("")}</span></label>`;
  }
  function readFields(pre) {
    const box = document.querySelector(`[data-edit="${pre}"]`);
    const out = {};
    FIELDS.forEach(([k]) => { const el = document.getElementById(`e-${k}-${pre}`); if (el) out[k] = el.value; });
    ["domain", "status", "knowable", "award"].forEach((k) => (out[k] = document.getElementById(`e-${k}-${pre}`).value));
    out.harms = [...box.querySelectorAll("[data-harm]:checked")].map((x) => x.dataset.harm);
    return out;
  }
  function editor(n) {
    return `<div class="edit" data-edit="${esc(n.id)}">${fieldsHTML(n, n.id)}
      <div class="btns full"><button class="ok" data-act="save" data-id="${esc(n.id)}">Save changes</button><button data-act="cancel" data-id="${esc(n.id)}">Cancel</button></div>
    </div>`;
  }

  // Judges: one 1 to 100 Oops Score per nominee. Scores go public once two judges have scored.
  function judgesHTML() {
    const judge = data.judge || store.get("midgley.judge") || "";
    const mine = {}; const counts = {};
    data.judgeScores.forEach((r) => { counts[r.nominee_id] = (counts[r.nominee_id] || 0) + 1; if (r.judge === judge) mine[r.nominee_id] = r.score; });
    const rows = data.nominees.filter((n) => n.state === "approved").map((n) => {
      const band = n.judgeAvg != null ? oopsBand(n.judgeAvg) : null;
      return `<tr><td><b>${esc(n.name)}</b><br><span style="color:var(--ink-3);font-size:12px">${esc(n.work)}</span></td>
        <td><input class="score-in" type="number" min="1" max="100" inputmode="numeric" data-score="${esc(n.id)}" value="${mine[n.id] ?? ""}" aria-label="Your score for ${esc(n.name)}"></td>
        <td style="font:13px var(--mono)">${n.judgeAvg != null ? `${n.judgeAvg} · ${esc(band.label)}` : "None"}<br><span style="color:var(--ink-3)">${counts[n.id] || 0} judge${counts[n.id] === 1 ? "" : "s"}${(counts[n.id] || 0) < 2 ? ", not public yet" : ""}</span></td></tr>`;
    }).join("");
    return `<div class="login" style="margin-bottom:12px">${data.judge ? `<span>Scoring as <b>${esc(data.judge)}</b></span>` : `<label class="label" for="judge">Judge name</label><input id="judge" value="${esc(judge)}" placeholder="Your name, the same every time" maxlength="60">`}</div>
      <p style="margin:0 0 10px;color:var(--ink-2);font-size:14px">Score how big the backfire was and how long it lasts, from 1 to 100. A score saves when you leave the box. Clear the box to remove your score.</p>
      <table class="judges"><thead><tr><th>Nominee</th><th>Your score</th><th>Average</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function nomRow(n, actions) {
    return `<div class="row">
      <div class="top"><b>${esc(n.name)}</b><span class="yrs" style="font:13px var(--mono);color:var(--ink-3)">${esc(n.years)}</span>
        <span class="by" style="font-size:12px;color:var(--ink-3)">${n.seeded ? "Founding class" : esc(n.author || "Anonymous") + " · " + new Date(n.createdAt).toLocaleString()} · ${n.score} votes</span></div>
      <p><strong>${esc(n.work)}</strong></p>
      ${n.wikiName || n.wikiWork ? `<p style="font-size:13px">Wikipedia: ${[n.wikiName, n.wikiWork].filter(Boolean).map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`).join(" · ")}</p>` : ""}
      <p><b style="color:var(--ozone)">Solved:</b> ${esc(n.solved)}</p>
      <p><b style="color:var(--ethyl)">Created:</b> ${esc(n.backfire)}</p>
      ${n.fix ? `<p><b style="color:var(--amber)">Fix:</b> ${esc(n.fix)} ${n.fixUrl ? `<a href="${esc(n.fixUrl)}" target="_blank" rel="noopener">${esc(n.fixUrl)}</a>` : ""}</p>` : ""}
      <div class="meta">${chips(n)}</div>
      ${editing.has(n.id) ? editor(n) : `<div class="btns">${actions}<button data-act="edit" data-id="${esc(n.id)}">Edit</button>${n.state === "approved" ? `<a href="/n/${esc(n.id)}" target="_blank" style="font-size:13px;align-self:center">View</a>` : ""}</div>`}
    </div>`;
  }

  function render() {
    const noms = data.nominees;
    const pending = noms.filter((n) => n.state === "pending");
    const rnom = noms.filter((n) => n.reports > 0);
    const act = (n) => {
      const b = [];
      if (n.state !== "approved") b.push(`<button class="ok" data-act="approve" data-id="${esc(n.id)}">Approve</button>`);
      if (n.state === "pending") b.push(`<button data-act="reject" data-id="${esc(n.id)}">Decline</button>`);
      if (n.state === "approved") b.push(`<button data-act="unpublish" data-id="${esc(n.id)}">Unpublish</button>`);
      if (n.reports) b.push(`<button data-act="clear" data-id="${esc(n.id)}">Clear reports</button>`);
      b.push(`<button class="danger" data-act="delete" data-id="${esc(n.id)}">Delete</button>`);
      return b.join("");
    };
    $("#c-pending").textContent = pending.length;
    $("#pending").innerHTML = pending.map((n) => nomRow(n, act(n))).join("") || `<p class="empty-row">Nothing waiting.</p>`;
    $("#c-rnom").textContent = rnom.length;
    $("#rnom").innerHTML = rnom.map((n) => nomRow(n, act(n))).join("") || `<p class="empty-row">No reports.</p>`;
    const why = { flag: "Goat flagged", hold: "Goat is holding", unchecked: "Goat couldn't check" };
    const cmMeta = (c) => `<span class="by" style="font:12px var(--mono);color:var(--ink-3)">${esc(c.author || "Anonymous")}${c.goat ? " (AI moderator)" : ""} on ${esc(c.nomineeName)}${c.parentId ? " · a reply" : ""} · ${new Date(c.createdAt).toLocaleString()}</span>`;
    $("#c-flag").textContent = data.flaggedComments.length;
    $("#goat-state").textContent = data.goat
      ? "Goat reads every new comment. Flagged comments still show; held ones stay hidden until you keep them. Goat never deletes anything."
      : "Goat is off: no Anthropic API key yet. Run tools/set-anthropic-key.sh to turn it on.";
    $("#flag").innerHTML = data.flaggedComments.map((c) => `<div class="row">
        <div class="top">${cmMeta(c)}
        ${c.hidden && c.mod !== "hold" ? `<span class="chip st-pending">hidden</span>` : ""}${why[c.mod] ? `<span class="chip st-pending">${why[c.mod]}</span>` : ""}${c.reports ? `<span class="chip st-rejected">${c.reports} report${c.reports === 1 ? "" : "s"}</span>` : ""}</div>
        <p style="white-space:pre-wrap">${esc(c.text)}</p>
        ${c.modReason && why[c.mod] ? `<p style="margin:0;color:var(--ink-3);font-size:14px">Goat: ${esc(c.modReason)}</p>` : ""}
        <div class="btns"><button class="ok" data-act="restore" data-cid="${esc(c.id)}">${c.hidden ? "Show it" : "Keep it"}</button>${c.hidden ? "" : `<button data-act="hide" data-cid="${esc(c.id)}">Hide</button>`}<button class="danger" data-act="cdelete" data-cid="${esc(c.id)}">Delete</button></div>
      </div>`).join("") || `<p class="empty-row">No flagged comments.</p>`;
    $("#c-drafts").textContent = data.goatDrafts.length;
    $("#drafts").innerHTML = data.goatDrafts.map((c) => `<div class="row">
        <div class="top"><span class="by" style="font:12px var(--mono);color:var(--ink-3)">Reply on ${esc(c.nomineeName)} · ${new Date(c.createdAt).toLocaleString()} · ${esc(c.modReason)}</span></div>
        ${c.parentText ? `<p style="white-space:pre-wrap;margin:0;color:var(--ink-2)"><b>${esc(c.parentAuthor || "Anonymous")}</b> ${esc(c.parentText)}</p>` : ""}
        <textarea id="draft-${esc(c.id)}" rows="3" maxlength="1000" style="width:100%;font:15px var(--sans)">${esc(c.text)}</textarea>
        <div class="btns"><button class="ok" data-act="draft-ok" data-cid="${esc(c.id)}">Approve and post as Goat</button><button class="danger" data-act="draft-no" data-cid="${esc(c.id)}">Discard</button></div>
      </div>`).join("") || `<p class="empty-row">No drafts waiting.</p>`;
    $("#recent").innerHTML = data.recentComments.map((c) => `<div class="row">
        <div class="top">${cmMeta(c)}</div>
        <p style="white-space:pre-wrap">${esc(c.text)}</p>
        <div class="btns">${c.goat ? "" : `<button data-act="goat-draft" data-cid="${esc(c.id)}"${data.goat ? "" : " disabled"}>Ask Goat for a reply</button>`}<button data-act="hide" data-cid="${esc(c.id)}">Hide</button></div>
      </div>`).join("") || `<p class="empty-row">No comments yet.</p>`;
    const rest = noms.filter((n) => n.state !== "pending");
    $("#c-all").textContent = rest.length;
    $("#all").innerHTML = rest.map((n) => nomRow(n, act(n))).join("");
    $("#judging").innerHTML = judgesHTML();
    $("#c-votes").textContent = `${data.voteCounts.up} upvotes, ${data.voteCounts.herd} Facepalm votes`;
    $("#flags").textContent = `Scores ${data.flags.scores ? "on" : "off"} · Categories ${data.flags.categories ? "on" : "off"}`;
    if (!$("#new-form").dataset.ready) {
      $("#new-form").innerHTML = `<div class="edit" data-edit="new">${fieldsHTML({ harms: [] }, "new")}
        <div class="btns full"><button class="ok" data-act="create">Publish nominee</button></div></div>`;
      $("#new-form").dataset.ready = "1";
    }
    $("#c-subs").textContent = data.subscriberCount + (data.subscriberCount === 1 ? " address" : " addresses");
  }

  async function loadMurphys() {
    try {
      const r = await api("/api/admin/murphys");
      const fresh = r.murphys.filter((m) => m.state === "new").length;
      $("#c-murphys").textContent = `${r.murphys.length} total, ${fresh} new`;
      $("#murphys").innerHTML = r.murphys.slice(0, 100).map((m) => `<div class="row">
        <div class="top"><span class="chip ${m.state === "new" ? "st-pending" : ""}">${esc(m.state)}</span>
          <span style="font:12px var(--mono);color:var(--ink-3)">${esc(m.name || "No name")}${m.email ? " · " + esc(m.email) : ""}${m.utm_source ? " · from " + esc(m.utm_source) : ""} · ${new Date(m.created_at).toLocaleString()}</span></div>
        <p><b>Fix:</b> ${esc(m.fix)}</p><p><b style="color:var(--ethyl)">Oops:</b> ${esc(m.oops)}</p>
        <div class="btns"><button class="ok" data-murphy="${esc(m.id)}" data-state="featured">Feature (publish as a post)</button><button data-murphy="${esc(m.id)}" data-state="archived">Archive</button>${m.state !== "new" ? `<button data-murphy="${esc(m.id)}" data-state="new">Back to new</button>` : ""}</div>
      </div>`).join("") || `<p class="empty-row">No Murphys yet.</p>`;
    } catch (e) { $("#murphys").innerHTML = `<p class="empty-row">${esc(e.message)}</p>`; }
  }
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-murphy]");
    if (b) {
      try { await api("/api/admin/murphys/" + b.dataset.murphy, { method: "PATCH", body: JSON.stringify({ state: b.dataset.state }) }); toast("Saved"); loadMurphys(); } catch (err) { toast(err.message); }
    }
    if (e.target.id === "murphy-csv") {
      const res = await fetch("/api/admin/murphys?format=csv", { headers: { authorization: "Bearer " + token } });
      const a = document.createElement("a"); a.href = URL.createObjectURL(await res.blob()); a.download = "murphys.csv"; a.click();
    }
  });

  async function patchNominee(id, body, msg) {
    try { await api("/api/admin/nominees/" + id, { method: "PATCH", body: JSON.stringify(body) }); toast(msg); await load(); }
    catch (e) { toast(e.message); }
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = b.dataset.id, cid = b.dataset.cid;
    switch (b.dataset.act) {
      case "approve": return patchNominee(id, { state: "approved" }, "Approved and published");
      case "reject": return patchNominee(id, { state: "rejected" }, "Declined");
      case "unpublish": return patchNominee(id, { state: "pending" }, "Moved back to review");
      case "clear": return patchNominee(id, { clearReports: true }, "Reports cleared");
      case "edit": editing.add(id); return render();
      case "cancel": editing.delete(id); return render();
      case "save": {
        const body = readFields(id);
        editing.delete(id);
        return patchNominee(id, body, "Saved");
      }
      case "create": {
        try {
          const r = await api("/api/admin/nominees", { method: "POST", body: JSON.stringify(readFields("new")) });
          $("#new-form").dataset.ready = ""; toast(`Published at /n/${r.nominee.slug}`); load();
        } catch (err) { toast(err.message); }
        return;
      }
      case "clear-votes": {
        if (prompt("This removes every upvote and Facepalm vote. Type CLEAR to confirm.") !== "CLEAR") return;
        try { await api("/api/admin/clear-votes", { method: "POST", body: JSON.stringify({ confirm: "CLEAR" }) }); toast("All votes removed"); load(); } catch (err) { toast(err.message); }
        return;
      }
      case "delete":
        if (!confirm("Delete this nominee with its votes and comments? This can't be undone.")) return;
        try { await api("/api/admin/nominees/" + id, { method: "DELETE" }); toast("Deleted"); load(); } catch (err) { toast(err.message); }
        return;
      case "restore":
        try { await api("/api/admin/comments/" + cid, { method: "PATCH", body: JSON.stringify({ restore: true }) }); toast("Comment kept"); load(); } catch (err) { toast(err.message); }
        return;
      case "hide":
        try { await api("/api/admin/comments/" + cid, { method: "PATCH", body: JSON.stringify({ hide: true }) }); toast("Comment hidden"); load(); } catch (err) { toast(err.message); }
        return;
      case "draft-ok": {
        const text = $("#draft-" + CSS.escape(cid)).value.trim();
        if (!text) return toast("The reply is empty.");
        try { await api("/api/admin/comments/" + cid, { method: "PATCH", body: JSON.stringify({ approve: true, text }) }); toast("Posted as Goat"); load(); } catch (err) { toast(err.message); }
        return;
      }
      case "draft-no":
        try { await api("/api/admin/comments/" + cid, { method: "DELETE" }); toast("Draft discarded"); load(); } catch (err) { toast(err.message); }
        return;
      case "goat-draft":
        b.disabled = true; toast("Asking Goat…");
        try { await api("/api/admin/comments/" + cid + "/goat", { method: "POST", body: "{}" }); toast("Draft ready under Goat's reply drafts"); load(); } catch (err) { b.disabled = false; toast(err.message); }
        return;
      case "cdelete":
        if (!confirm("Delete this comment?")) return;
        try { await api("/api/admin/comments/" + cid, { method: "DELETE" }); toast("Comment deleted"); load(); } catch (err) { toast(err.message); }
        return;
    }
  });

  // Judge scores save when a score box loses focus.
  document.addEventListener("change", async (e) => {
    if (e.target.id === "judge") { store.set("midgley.judge", e.target.value.trim()); return; }
    const id = e.target.dataset && e.target.dataset.score;
    if (!id) return;
    const judge = data.judge || ($("#judge") && $("#judge").value.trim()) || "";
    if (!judge) { toast("Type your judge name first."); return; }
    try {
      await api("/api/admin/scores", { method: "PUT", body: JSON.stringify({ nomineeId: id, judge, score: e.target.value }) });
      toast("Score saved"); load();
    } catch (err) { toast(err.message); }
  });

  $("#load-subs").onclick = async () => {
    try {
      const r = await api("/api/admin/subscribers");
      const t = $("#subs"); t.value = r.subscribers.map((s) => s.email).join("\n"); t.hidden = false; t.select();
    } catch (e) { toast(e.message); }
  };

  $("#login").addEventListener("submit", (e) => {
    e.preventDefault();
    token = $("#token").value.trim(); store.set("midgley.admin", token); load();
  });
  $("#logout").onclick = () => { token = ""; store.set("midgley.admin", ""); $("#panels").hidden = true; setLocked(true); };

  if (token) load();
})();
