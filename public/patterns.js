// The Patterns page: the rail follows the chapter you're reading, chapters fade in, charts get tooltips.
import "./chart-tip.js";

const links = new Map([...document.querySelectorAll(".pp-rail a")].map((a) => [a.hash.slice(1), a]));
const rail = document.querySelector(".pp-rail");
const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  links.forEach((a) => a.removeAttribute("aria-current"));
  const a = links.get(e.target.id);
  if (a) { a.setAttribute("aria-current", "true"); rail.scrollTo({ left: a.offsetLeft - rail.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" }); }
  rail.classList.toggle("on", e.target.classList.contains("pp-ch"));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll(".pp-ch, .pp-index, .pp-data, .pp-hero").forEach((s) => seen.observe(s));

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const rise = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); rise.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px" });
  const els = [...document.querySelectorAll(".pp-ch-head, .pp-cards > *, .pp-tiles > li, .pp-data .cb-fig")];
  // Only what is below the fold waits to rise; a jump to #pattern, find-in-page or a slow observer never leaves a blank screen.
  els.filter((el) => el.getBoundingClientRect().top > innerHeight).forEach((el) => { el.classList.add("rise"); rise.observe(el); });
  addEventListener("hashchange", () => els.forEach((el) => el.classList.add("in")));
  addEventListener("beforeprint", () => els.forEach((el) => el.classList.add("in")));
}
