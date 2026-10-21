// Chart tooltips for the codebook charts: anything with data-tip shows its title and lines on hover or keyboard focus.
const ctip = document.getElementById("pt-tip");
function showTip(el, x, y) {
  ctip.innerHTML = "";
  const b = document.createElement("b"); b.textContent = el.dataset.tip;
  ctip.append(b);
  el.dataset.tipLines.split("\n").forEach((t) => { const p = document.createElement("p"); p.textContent = t; ctip.append(p); });
  ctip.dataset.for = "";
  ctip.hidden = false;
  ctip.style.left = Math.max(12, Math.min(x + 16, innerWidth - ctip.offsetWidth - 12)) + "px";
  ctip.style.top = Math.max(12, Math.min(y + 16, innerHeight - ctip.offsetHeight - 12)) + "px";
}
document.addEventListener("mousemove", (e) => {
  const el = e.target.closest?.("[data-tip]");
  if (el) showTip(el, e.clientX, e.clientY);
  else if (ctip && !e.target.closest?.(".pt-cell")) ctip.hidden = true;
});
document.addEventListener("focusin", (e) => {
  const el = e.target.closest?.("[data-tip]"); if (!el) return;
  const r = el.getBoundingClientRect(); showTip(el, r.left, r.bottom);
});
document.addEventListener("focusout", (e) => { if (e.target.closest?.("[data-tip]")) ctip.hidden = true; });
