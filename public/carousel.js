// Arrow buttons, dots and keyboard for the square-card carousels. Swiping is plain scroll-snap.
document.querySelectorAll("[data-carousel]").forEach((root) => {
  const track = root.querySelector(".cc-track");
  const cards = [...track.children].filter((c) => !c.hasAttribute("data-ig-only")); // the Instagram-only last card never shows here
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

// Card backgrounds load as they come near. The head script marks the page "lazy-bgs" and CSS holds every
// card background back until its card gets .bg-in. A card inside a carousel loads with its whole carousel,
// so swiping never waits on an image. Every page with card backgrounds loads this file.
{
  const LAZY = ".has-bg, .cc-payoff.cc-hero:not(.cc-igask)";
  const units = new Set([...document.querySelectorAll(LAZY)].map((el) => el.closest("[data-carousel]") || el));
  const show = (u) => [u, ...u.querySelectorAll(LAZY)].filter((el) => el.matches(LAZY)).forEach((el) => el.classList.add("bg-in"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: "600px 0px" });
    units.forEach((u) => io.observe(u));
  } else units.forEach(show);
}
