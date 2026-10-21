// The Patterns page: the sticky menu lights the section you're in, panels rise as they arrive, charts get tooltips.
import "./chart-tip.js";

const nav = document.querySelector(".pp-nav");
const links = new Map([...nav.querySelectorAll("a")].map((a) => [a.hash.slice(1), a]));
const light = (id) => {
  const a = links.get(id); if (!a || a.hasAttribute("aria-current")) return;
  links.forEach((x) => x.removeAttribute("aria-current"));
  a.setAttribute("aria-current", "true");
  nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" });
};
const seen = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && light(e.target.id)),
  { rootMargin: "-35% 0px -60% 0px" });
links.forEach((_, id) => { const s = document.getElementById(id); if (s) seen.observe(s); });

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const rise = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); rise.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  const els = [...document.querySelectorAll(".pp-slab, .pp-tiles > li, .db-read, .db-panel")];
  // Only what starts below the fold waits to rise; a jump to a section or printing shows everything.
  els.filter((el) => el.getBoundingClientRect().top > innerHeight).forEach((el) => { el.classList.add("rise"); rise.observe(el); });
  const all = () => els.forEach((el) => el.classList.add("in"));
  addEventListener("hashchange", all); addEventListener("beforeprint", all);
  if (location.hash) all();   // arriving at a section: show it at once
}
