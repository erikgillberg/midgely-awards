(function () {
  "use strict";
  const { DOMAINS, HARMS, STATUSES, KNOW, AWARDS } = window.MIDGLEY;
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

  function editor(n) {
    const id = n.id;
    return `<div class="edit" data-edit="${esc(id)}">
      <label>Nominee<input id="e-name-${id}" value="${esc(n.name)}" maxlength="80"></label>
      <label>Years<input id="e-years-${id}" value="${esc(n.years)}" maxlength="30"></label>
      <label class="full">Achievement<input id="e-work-${id}" value="${esc(n.work)}" maxlength="120"></label>
      <label class="full">Solved<textarea id="e-solved-${id}" maxlength="600">${esc(n.solved)}</textarea></label>
      <label class="full">Created<textarea id="e-backfire-${id}" maxlength="600">${esc(n.backfire)}</textarea></label>
      <label>Field${sel("e-domain-" + id, DOMAINS, n.domain, "None")}</label>
      <label>Status${sel("e-status-" + id, STATUSES, n.status, "None")}</label>
      <label>Knowable${sel("e-knowable-" + id, KNOW, n.knowable, "None")}</label>
      <label>Award${sel("e-award-" + id, AWARDS, n.award, "No award")}</label>
      <label class="full">Kinds of harm<span class="checks">${Object.entries(HARMS).map(([k, v]) => `<label style="flex-direction:row;text-transform:none;letter-spacing:0;font:13px var(--sans);color:var(--ink)"><input type="checkbox" data-harm="${k}" ${n.harms.includes(k) ? "checked" : ""} style="width:auto">${esc(v)}</label>`).join("")}</span></label>
      <label class="full">The fix<textarea id="e-fix-${id}" maxlength="400">${esc(n.fix)}</textarea></label>
      <label class="full">Fix link<input id="e-fixUrl-${id}" value="${esc(n.fixUrl)}" maxlength="500"></label>
      <label>Submitted by<input id="e-author-${id}" value="${esc(n.author)}" maxlength="60"></label>
      <div class="btns full"><button class="ok" data-act="save" data-id="${esc(id)}">Save changes</button><button data-act="cancel" data-id="${esc(id)}">Cancel</button></div>
    </div>`;
  }

  function nomRow(n, actions) {
    return `<div class="row">
      <div class="top"><b>${esc(n.name)}</b><span class="yrs" style="font:13px var(--mono);color:var(--ink-3)">${esc(n.years)}</span>
        <span class="by" style="font-size:12px;color:var(--ink-3)">${n.seeded ? "Founding class" : esc(n.author || "Anonymous") + " · " + new Date(n.createdAt).toLocaleString()} · ${n.score} votes</span></div>
      <p><strong>${esc(n.work)}</strong></p>
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
    $("#c-flag").textContent = data.flaggedComments.length;
    $("#flag").innerHTML = data.flaggedComments.map((c) => `<div class="row">
        <div class="top"><span class="by" style="font:12px var(--mono);color:var(--ink-3)">${esc(c.author || "Anonymous")} on ${esc(c.nomineeName)} · ${new Date(c.createdAt).toLocaleString()}</span>
        ${c.hidden ? `<span class="chip st-pending">hidden</span>` : ""}<span class="chip st-rejected">${c.reports} report${c.reports === 1 ? "" : "s"}</span></div>
        <p style="white-space:pre-wrap">${esc(c.text)}</p>
        <div class="btns"><button class="ok" data-act="restore" data-cid="${esc(c.id)}">Keep and clear reports</button>${c.hidden ? "" : `<button data-act="hide" data-cid="${esc(c.id)}">Hide</button>`}<button class="danger" data-act="cdelete" data-cid="${esc(c.id)}">Delete</button></div>
      </div>`).join("") || `<p class="empty-row">No flagged comments.</p>`;
    const rest = noms.filter((n) => n.state !== "pending");
    $("#c-all").textContent = rest.length;
    $("#all").innerHTML = rest.map((n) => nomRow(n, act(n))).join("");
    $("#c-subs").textContent = data.subscriberCount + (data.subscriberCount === 1 ? " address" : " addresses");
  }

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
        const v = (k) => document.getElementById(`e-${k}-${id}`).value;
        const box = document.querySelector(`[data-edit="${id}"]`);
        const harms = [...box.querySelectorAll("[data-harm]:checked")].map((x) => x.dataset.harm);
        editing.delete(id);
        return patchNominee(id, {
          name: v("name"), years: v("years"), work: v("work"), solved: v("solved"), backfire: v("backfire"),
          domain: v("domain"), status: v("status"), knowable: v("knowable"), award: v("award"),
          harms, fix: v("fix"), fixUrl: v("fixUrl"), author: v("author")
        }, "Saved");
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
      case "cdelete":
        if (!confirm("Delete this comment?")) return;
        try { await api("/api/admin/comments/" + cid, { method: "DELETE" }); toast("Comment deleted"); load(); } catch (err) { toast(err.message); }
        return;
    }
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
