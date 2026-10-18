// Runs on every page: the Nominate form in the menu, and helpers the other scripts share.

export async function api(path, opts = {}) {
  const res = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed (" + res.status + ")");
  return body;
}

const $ = (s, root = document) => root.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

// ---------- Turnstile, the human check (only when the server has keys configured)
let config = null;
const configReady = api("/api/config").then((c) => (config = c)).catch(() => (config = {}));
let tsLoading = null;
const tsWidgets = new Map();
async function turnstileFor(form) {
  await configReady;
  if (!config.turnstileSiteKey) return;
  const slot = form.querySelector("[data-ts]");
  if (!slot || tsWidgets.has(form)) return;
  if (!tsLoading) tsLoading = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.onload = () => resolve(window.turnstile); s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  const ts = await tsLoading;
  if (ts) tsWidgets.set(form, { id: ts.render(slot, { sitekey: config.turnstileSiteKey, callback: (t) => (form.dataset.ts = t), "expired-callback": () => (form.dataset.ts = "") }) });
}
function resetTurnstile(form) {
  const w = tsWidgets.get(form);
  if (w && window.turnstile) { window.turnstile.reset(w.id); form.dataset.ts = ""; }
}

// ---------- the sheet
const sheet = $("#sheet");
let lastFocus = null;

function pick(award) {
  sheet.querySelectorAll("[data-award]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.award === award)));
  sheet.querySelectorAll("[data-award-form]").forEach((f) => (f.hidden = f.dataset.awardForm !== award));
  $(".sh-done", sheet).hidden = true;
  const form = sheet.querySelector(`[data-award-form="${award}"]`);
  if (form) { turnstileFor(form); const first = form.querySelector("input, textarea"); if (first) first.focus(); }
}

export function openSheet(award = "") {
  if (!sheet) return;
  lastFocus = document.activeElement;
  sheet.hidden = false;
  document.documentElement.classList.add("sheet-open");
  $("#s-author", sheet).value = store.get("midgley.name") || "";
  $(".sh-done", sheet).hidden = true;
  if (award) pick(award);
  else { sheet.querySelectorAll("[data-award-form]").forEach((f) => (f.hidden = true)); sheet.querySelector("[data-award]").focus(); }
}
function closeSheet() {
  sheet.hidden = true;
  document.documentElement.classList.remove("sheet-open");
  if (location.hash === "#nominate") history.replaceState(null, "", location.pathname + location.search);
  if (lastFocus) lastFocus.focus();
}

if (sheet) {
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-open-sheet]");
    if (open) { e.preventDefault(); openSheet(open.dataset.openSheet); return; }
    if (e.target.closest("[data-close-sheet]") || e.target === sheet) { closeSheet(); return; }
    const choice = e.target.closest("[data-award]");
    if (choice) pick(choice.dataset.award);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden) closeSheet(); });
  if (location.hash === "#nominate") openSheet(new URLSearchParams(location.search).get("award") || "");

  const done = (text) => {
    sheet.querySelectorAll("[data-award-form]").forEach((f) => (f.hidden = true));
    const d = $(".sh-done", sheet); d.hidden = false; $("p", d).textContent = text; $("button", d).focus();
  };
  const isWiki = (u) => { try { return /(^|\.)wikipedia\.org$/i.test(new URL(u).hostname); } catch (e) { return false; } };
  const utm = new URLSearchParams(location.search).get("utm_source") || "";

  sheet.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-award-form]");
    if (!form) return;
    e.preventDefault();
    const v = (id) => $("#" + id, form).value.trim();
    const msg = $(".msg", form);
    const btn = form.querySelector('button[type="submit"]');
    let path, body, thanks;
    if (form.dataset.awardForm === "midgley") {
      body = { name: v("s-name"), work: v("s-work"), solved: v("s-solved"), backfire: v("s-backfire"), domain: $("#s-domain", form).value, wikiWork: v("s-wiki"), author: v("s-author") };
      if (!body.name || !body.work || !body.solved || !body.backfire) { msg.textContent = "Fill in the nominee, what they made, what went right and what went oops."; return; }
      if (body.wikiWork && !isWiki(body.wikiWork)) { msg.textContent = "The Wikipedia link has to point to a page on wikipedia.org."; return; }
      if (body.author) store.set("midgley.name", body.author);
      path = "/api/nominees";
      thanks = `${body.name} is in the review queue and will appear once a moderator approves it.`;
    } else {
      body = { fix: v("m-fix"), oops: v("m-oops"), name: v("m-name"), email: v("m-email"), utm };
      if (!body.fix || !body.oops) { msg.textContent = "Tell us what was fixed and what went oops."; return; }
      if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) { msg.textContent = "That email address doesn't look right."; return; }
      path = "/api/murphys";
      thanks = "We read every Murphy. If we feature yours, it'll be in The Weekly Oops or on our social accounts.";
    }
    await configReady;
    if (config.turnstileSiteKey && !form.dataset.ts) { msg.textContent = "Complete the human check first."; return; }
    body.website = form.querySelector('[name="website"]').value;
    body.turnstile = form.dataset.ts || "";
    btn.disabled = true; msg.textContent = "";
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      form.reset();
      done(thanks);
    } catch (err) { msg.textContent = "That didn't send: " + err.message; }
    resetTurnstile(form);
    btn.disabled = false;
  });
}

// ---------- The Weekly Oops sign-up forms
document.addEventListener("focusin", (e) => { const f = e.target.closest && e.target.closest("[data-signup]"); if (f) turnstileFor(f); });
document.addEventListener("submit", async (e) => {
  const form = e.target.closest("[data-signup]");
  if (!form) return;
  e.preventDefault();
  const email = form.querySelector('input[type="email"]').value.trim();
  const msg = form.querySelector(".msg");
  const btn = form.querySelector('button[type="submit"]');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = "That email address doesn't look right."; return; }
  await configReady;
  if (config.turnstileSiteKey && !form.dataset.ts) { msg.textContent = "Complete the human check first."; return; }
  btn.disabled = true; msg.textContent = "";
  try {
    await api("/api/subscribe", { method: "POST", body: JSON.stringify({ email, website: form.querySelector('[name="website"]').value, turnstile: form.dataset.ts || "", utm: new URLSearchParams(location.search).get("utm_source") || "" }) });
    form.querySelectorAll("input, button, [data-ts]").forEach((x) => (x.hidden = true));
    msg.classList.add("ok"); msg.textContent = "You're on the list for The Weekly Oops.";
  } catch (err) { msg.textContent = err.message; resetTurnstile(form); }
  btn.disabled = false;
});
