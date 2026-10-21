// Runs on every page: the Nominate form in the menu, and helpers the other scripts share.

export async function api(path, opts = {}) {
  const res = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(body.error || "Request failed (" + res.status + ")"); Object.assign(err, body, { status: res.status }); throw err; }
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

// ---------- "already nominated?" while typing a nominee's name
let matchTimer = null;
document.addEventListener("input", (e) => {
  if (e.target.id !== "s-name") return;
  clearTimeout(matchTimer);
  const q = e.target.value.trim();
  const box = $("#s-match");
  if (q.length < 3) { box.hidden = true; return; }
  matchTimer = setTimeout(async () => {
    try {
      const r = await api("/api/match?q=" + encodeURIComponent(q));
      const nf = r.notFit;
      const e = (t) => String(t).replace(/</g, "&lt;");
      box.hidden = !r.matches.length && !nf;
      box.innerHTML = (nf ? `<p><b>${e(nf.name)} isn't a fit.</b> ${e(nf.why)} <a href="/guidelines#not-a-fit">Why some things don't qualify</a></p>` : "")
        + (r.matches.length ? `<p>Already nominated:</p>` + r.matches.map((m) => `<a href="${m.path}"><b>${e(m.name)}</b> ${e(m.work)} <span>Open it →</span></a>`).join("") + `<p class="sh-fine">If it's the same one, add your case in its comments instead.</p>` : "");
    } catch (err) { box.hidden = true; }
  }, 250);
});

// ---------- after a Murphy: offer its cards as images to post
async function offerMurphyCards(m) {
  const d = $(".sh-done", sheet);
  let b = d.querySelector("[data-make-cards]");
  if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "ghost"; b.dataset.makeCards = ""; b.textContent = "Make my Murphy cards for Instagram"; d.insertBefore(b, d.querySelector("[data-close-sheet]")); }
  b.hidden = false;
  b.onclick = async () => {
    b.disabled = true; b.textContent = "Making the cards…";
    const { murphyCarouselHTML } = await import("./shared.js");
    const { shareCards } = await import("./share.js");
    const holder = document.createElement("div");
    holder.className = "offstage";
    holder.innerHTML = murphyCarouselHTML({ fix: m.fix, oops: m.oops, name: m.name });
    document.body.appendChild(holder);
    // Off-screen images never load lazily; shareCards loads them all first (with a time limit).
    try { await shareCards([...holder.querySelectorAll(".cc:not([data-ig-only])")], "My Murphy", location.origin + "/murphy"); }
    finally { holder.remove(); b.disabled = false; b.textContent = "Make my Murphy cards for Instagram"; }
  };
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
  if ($(".sh-suggest", sheet)) {   // no nomination form for now: the newsletter and a reply instead
    lastFocus = document.activeElement; sheet.hidden = false; document.documentElement.classList.add("sheet-open");
    $("input[type=email]", sheet)?.focus(); return;
  }
  if ($(".sh-pick", sheet)?.hidden) award = "midgley";   // one award for now; the Murphy is on the roadmap
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
      body = { fix: v("m-fix"), oops: v("m-oops"), building: v("m-building"), name: v("m-name"), email: v("m-email"), utm };
      if (!body.fix || !body.oops) { msg.textContent = "Tell us what you were trying to fix and what happened instead."; return; }
      if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) { msg.textContent = "That email address doesn't look right."; return; }
      path = "/api/murphys";
      thanks = "We read every Murphy. If we feature yours, it'll be in The Backfire Newsletter or on our social accounts. Want to post it yourself? Make your cards below.";
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
      if (path === "/api/murphys") offerMurphyCards(body);
    } catch (err) {
      msg.textContent = "That didn't send: " + err.message;
      if (err.existing && err.existing.path) msg.innerHTML += ` <a href="${err.existing.path}">See it and add your case in the comments</a>.`;
    }
    resetTurnstile(form);
    btn.disabled = false;
  });
}

// ---------- The Backfire Newsletter sign-up forms
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
    msg.classList.add("ok"); msg.textContent = "You're on the list for The Backfire Newsletter.";
  } catch (err) { msg.textContent = err.message; resetTurnstile(form); }
  btn.disabled = false;
});

// ---------- the More menu
const panel = $("#menu-panel");
if (panel) {
  const setMenu = (open) => {
    panel.hidden = !open;
    document.querySelectorAll("[data-menu]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
    document.documentElement.classList.toggle("menu-open", open);
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-menu]")) { setMenu(panel.hidden); return; }
    if (e.target.closest("[data-menu-close]") || e.target === panel) setMenu(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setMenu(false); });
}
// Mark the current page in the menu.
document.querySelectorAll(".nav-i[href]").forEach((a) => { if (a.getAttribute("href") === location.pathname) a.setAttribute("aria-current", "page"); });

// ---------- the Backfire Newsletter box (left rail button)
const oopsBox = $("#oops-box");
if (oopsBox) {
  let back = null;
  const setOops = (open) => {
    oopsBox.hidden = !open;
    if (open) { back = document.activeElement; const f = oopsBox.querySelector("[data-signup]"); turnstileFor(f); f.querySelector('input[type="email"]').focus(); }
    else if (back) back.focus();
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-oops]")) return setOops(true);
    if (e.target.closest("[data-oops-close]") || e.target === oopsBox) setOops(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !oopsBox.hidden) setOops(false); });
}

// ---------- night / day: night is the default; the choice is remembered in this browser
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-theme-toggle]")) return;
  const d = document.documentElement, next = d.dataset.theme === "light" ? "dark" : "light";
  d.dataset.theme = next;
  try { localStorage.setItem("bf.theme", next); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === "light" ? "#F4E8D6" : "#0A2033";
});

// ---------- teardown pages: copy link, and buttons that count interest in things not built yet
document.addEventListener("click", (e) => {
  const copy = e.target.closest("[data-copy-link]");
  if (copy) {
    navigator.clipboard?.writeText(copy.dataset.copyLink).then(() => { copy.textContent = "Link copied"; }).catch(() => {});
    return;
  }
  const b = e.target.closest("[data-intent]");
  if (!b) return;
  fetch("/api/intent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ what: b.dataset.intent, id: b.dataset.id }) }).catch(() => {});
  if (b.dataset.intent === "comment-login") {
    e.preventDefault();
    const note = b.parentElement.querySelector(".td-intent"); if (note) note.hidden = false;
    b.disabled = true;
  }
});

// ---------- teardown pages: the background changes as each section comes into view
{
  const layers = [...document.querySelectorAll(".td-bgs span")];
  if (layers.length > 1) {
    const marks = [...document.querySelectorAll("#td-mast, .post, .td-sec, .td-comments, .td-others")];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = marks.indexOf(e.target) % layers.length;
      layers.forEach((l, k) => l.classList.toggle("on", k === i));
    }), { rootMargin: "-45% 0px -50% 0px" });
    marks.forEach((m) => io.observe(m));
  }
}
