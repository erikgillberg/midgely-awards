// Renders a 1200x630 share card per teardown into public/img/og/<slug>.jpg, for LinkedIn and other link previews.
// LinkedIn crops og:image to 1.91:1, so a portrait used directly loses its face. Run: node tools/og-cards.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const OUT = join(PUB, "img/og");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });

const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
const slugs = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(join(PUB, "carousels")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));

for (const slug of slugs) {
  const d = JSON.parse(readFileSync(join(PUB, "carousels", slug + ".json"), "utf8"));
  const img = d.portrait?.image || d.slides?.find((s) => s.image)?.image;
  const photo = img && existsSync(join(PUB, img)) ? `file://${join(PUB, img)}` : "";
  const html = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800;900&family=IBM+Plex+Sans:wght@500;600&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0a2033;color:#f2d6b0;display:flex;overflow:hidden;font-family:"IBM Plex Sans"}
.ph{flex:0 0 ${photo ? 470 : 0}px;background:#08192a url("${photo}") center 22%/cover;filter:grayscale(.15) contrast(1.05);position:relative}
.ph::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 70%,#0a2033)}
.tx{flex:1;padding:58px 64px 52px 56px;display:flex;flex-direction:column}
.bars{display:flex;flex-direction:column;gap:7px;width:180px;margin-bottom:34px}.bars i{height:8px;display:block}
h1{font:900 ${d.headline.length > 40 ? 74 : 84}px/0.98 "Big Shoulders Display";text-transform:uppercase;letter-spacing:.01em;color:#f2d6b0}
p{margin-top:24px;font:500 26px/1.35 "IBM Plex Sans";color:#d9c3a3}
.ft{margin-top:auto;display:flex;align-items:center;gap:16px;font:500 22px "IBM Plex Mono";letter-spacing:.06em;color:#f2d6b0}
.bf{width:58px;height:58px;border:3px solid #f2d6b0;display:grid;place-items:center;font:900 30px "Big Shoulders Display"}
</style>
<body>${photo ? '<div class="ph"></div>' : ""}<div class="tx">
<div class="bars"><i style="background:#c0392b"></i><i style="background:#ee6b3a"></i><i style="background:#6aa9b0"></i></div>
<h1>${esc(d.headline)}</h1><p>${esc(d.dek || "")}</p>
<div class="ft"><span class="bf">Bf</span>BACKFIREAWARDS.COM</div></div></body>`;
  const tmp = join(OUT, `.${slug}.html`);
  writeFileSync(tmp, html);
  execFileSync(CHROME, ["--headless=new", "--hide-scrollbars", "--allow-file-access-from-files", "--virtual-time-budget=4000",
    "--window-size=1200,630", `--screenshot=${join(OUT, slug + ".png")}`, `file://${tmp}`], { stdio: "ignore" });
  execFileSync("rm", [tmp]);
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", join(OUT, slug + ".png"), "--out", join(OUT, slug + ".jpg")], { stdio: "ignore" });
  execFileSync("rm", [join(OUT, slug + ".png")]);
  console.log("og", slug);
}
