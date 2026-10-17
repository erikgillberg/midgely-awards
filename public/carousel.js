// Arrow buttons, dots and keyboard for the square-card carousels. Swiping is plain scroll-snap.
document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".cc-track");
  const cards = [...track.children];
  const dots = [...root.querySelectorAll("[data-cc-dot]")];
  const prev = root.querySelector('[data-cc="prev"]');
  const next = root.querySelector('[data-cc="next"]');
  const at = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: Math.max(0, Math.min(cards.length - 1, i)) * track.clientWidth, behavior: "smooth" });
  const sync = () => {
    const i = at();
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
    prev.disabled = i === 0; next.disabled = i === cards.length - 1;
  };
  prev.onclick = () => go(at() - 1);
  next.onclick = () => go(at() + 1);
  track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(at() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(at() - 1); }
  });
  sync();
});
