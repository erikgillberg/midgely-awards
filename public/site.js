// Runs on every page: The Weekly Oops sign-up forms in the footer and on the home page.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function api(path, opts = {}) {
  const res = await fetch(path, { cache: "no-store", ...opts, headers: { "content-type": "application/json", ...(opts.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Request failed (" + res.status + ")");
  return body;
}

document.addEventListener("submit", async (e) => {
  const form = e.target.closest("[data-subscribe]");
  if (!form) return;
  e.preventDefault();
  const email = form.querySelector('input[type="email"]').value.trim();
  const msg = form.querySelector(".msg");
  const btn = form.querySelector('button[type="submit"]');
  if (!EMAIL_RE.test(email)) { msg.textContent = "That email address doesn't look right."; return; }
  btn.disabled = true; msg.textContent = "";
  try {
    await api("/api/subscribe", { method: "POST", body: JSON.stringify({ email, website: form.querySelector('[name="website"]').value }) });
    form.querySelectorAll("input, button").forEach((x) => (x.hidden = true));
    msg.classList.add("ok");
    msg.textContent = "You're on the list for The Weekly Oops.";
  } catch (err) { msg.textContent = err.message; }
  btn.disabled = false;
});
