// Exports a teardown's carousel as social cards: 1080x1080 PNGs in social mode (the site's vote card swapped for
// "answer in the comments"), numbered in order, plus a LinkedIn document PDF built from them.
// Run: node tools/social-cards.mjs <slug> <outDir> [baseUrl]   (needs Google Chrome; PDF needs python3 with Pillow)
import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [slug, out, base = "https://backfireawards.com"] = process.argv.slice(2);
if (!slug || !out) { console.error("usage: node tools/social-cards.mjs <slug> <outDir> [baseUrl]"); process.exit(1); }
mkdirSync(out, { recursive: true });
const PORT = 9341, CARD_CSS = 506, PX = 1080;
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--remote-debugging-port=${PORT}`,
  "--hide-scrollbars", "--window-size=540,900", `--user-data-dir=/tmp/social-cards-${process.pid}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs; for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = {};
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending[d.id]) { pending[d.id](d.result); delete pending[d.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true })).result.value;

await send("Emulation.setDeviceMetricsOverride", { width: 540, height: 900, deviceScaleFactor: PX / CARD_CSS, mobile: false });
await send("Page.enable"); await send("Page.navigate", { url: `${base}/n/${slug}` }); await sleep(3500);
// Social mode: the site's vote card leaves, the comments card arrives.
await evaluate("document.querySelector('.post .carousel').classList.add('ig-export')"); await sleep(300);
const SEL = "document.querySelector('.post').querySelectorAll('.cc-track > .cc:not([data-web-only])')";
const n = await evaluate(`${SEL}.length`);
const files = [];
for (let k = 0; k < n; k++) {
  await evaluate(`(() => { const c = ${SEL}[${k}]; const t = c.parentElement; t.scrollLeft = c.offsetLeft - t.offsetLeft; c.scrollIntoView({block:'center'}); })()`);
  await sleep(500);
  const r = await evaluate(`(() => { const b = ${SEL}[${k}].getBoundingClientRect(); return {x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height}; })()`);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  const f = join(out, `${String(k + 1).padStart(2, "0")}.png`);
  writeFileSync(f, Buffer.from(shot.data, "base64")); files.push(f);
}
ws.close(); chrome.kill();
const pdf = join(out, `${slug[0].toUpperCase() + slug.slice(1)}_LinkedIn_Document.pdf`);
execFileSync("python3", ["-c", `import sys
from PIL import Image
ims=[Image.open(f).convert('RGB') for f in sys.argv[2:]]
ims[0].save(sys.argv[1], save_all=True, append_images=ims[1:], resolution=150)`, pdf, ...files]);
console.log(`${n} cards and ${pdf}`);
