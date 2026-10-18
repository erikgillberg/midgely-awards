// Zoom and pan for the Categoric Table: buttons, ctrl/trackpad pinch, two-finger pinch,
// and tapping a square zooms to it. At full zoom one square fills the frame.
const view = document.querySelector(".pt-view");
const grid = document.querySelector(".pt-grid");
if (view && grid) {
  let zoom = 1;
  const base = () => view.clientWidth;               // the whole table fits the frame at zoom 1
  // At full zoom one square fills the frame's shorter side.
  const maxZoom = () => (18 * Math.min(view.clientWidth, view.clientHeight)) / view.clientWidth / 1.1;
  function setZoom(z, cx = view.clientWidth / 2, cy = view.clientHeight / 2) {
    z = Math.max(1, Math.min(maxZoom(), z));
    const fx = (view.scrollLeft + cx) / grid.offsetWidth, fy = (view.scrollTop + cy) / grid.offsetHeight;
    zoom = z;
    grid.style.width = base() * zoom + "px";
    view.scrollLeft = fx * grid.offsetWidth - cx;
    view.scrollTop = fy * grid.offsetHeight - cy;
    document.querySelector("[data-z-level]").textContent = Math.round(zoom * 100) + "%";
  }
  document.querySelector("[data-z='in']").onclick = () => setZoom(zoom * 1.6);
  document.querySelector("[data-z='out']").onclick = () => setZoom(zoom / 1.6);
  document.querySelector("[data-z='fit']").onclick = () => setZoom(1);
  view.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;              // trackpad pinch arrives as ctrl+wheel
    e.preventDefault();
    const r = view.getBoundingClientRect();
    setZoom(zoom * Math.exp(-e.deltaY / 200), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  let pinch = null;
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  view.addEventListener("touchstart", (e) => { if (e.touches.length === 2) pinch = { d: dist(e.touches), z: zoom }; }, { passive: true });
  view.addEventListener("touchmove", (e) => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    const r = view.getBoundingClientRect();
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
    setZoom(pinch.z * dist(e.touches) / pinch.d, cx, cy);
  }, { passive: false });
  view.addEventListener("touchend", () => (pinch = null));
  // Hovering a square shows who it is; clicking opens the post (the link does that on its own).
  const tip = document.getElementById("pt-tip");
  grid.addEventListener("mousemove", (e) => {
    const cell = e.target.closest(".pt-cell.filled");
    if (!cell || matchMedia("(hover: none)").matches) { tip.hidden = true; return; }
    if (tip.dataset.for !== cell.dataset.name) {
      tip.dataset.for = cell.dataset.name;
      tip.innerHTML = "";
      const b = document.createElement("b"); b.textContent = cell.dataset.name;
      const w = document.createElement("span"); w.className = "w"; w.textContent = cell.dataset.work;
      const d = document.createElement("p"); d.textContent = cell.dataset.desc;
      const c = document.createElement("span"); c.className = "c"; c.textContent = "Click to open →";
      tip.append(b, w, d, c);
    }
    tip.hidden = false;
    const x = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 12), y = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 12);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  });
  grid.addEventListener("mouseleave", () => (tip.hidden = true));
  window.addEventListener("resize", () => setZoom(zoom));
  setZoom(1);
}
