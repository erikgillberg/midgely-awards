// Turn square cards into 1080 × 1080 images and hand them to the phone's share sheet
// (Instagram can take them from there as a carousel post), or download them on a computer.
// html-to-image draws a page element, fonts and all, onto an image in the browser.
import { toBlob } from "https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/+esm";

const SIZE = 1080;

export async function cardImages(cards, prefix = "backfire") {
  // Images below the fold load lazily; load them all before drawing.
  const imgs = cards.flatMap((c) => [...c.querySelectorAll("img")]);
  imgs.forEach((i) => (i.loading = "eager"));
  const loaded = Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.race([loaded, new Promise((r) => setTimeout(r, 8000))]); // never wait forever on one image
  const files = [];
  for (const [i, card] of cards.entries()) {
    const w = card.getBoundingClientRect().width || card.offsetWidth;
    const blob = await toBlob(card, { width: w, height: w, pixelRatio: SIZE / w, cacheBust: true, style: { margin: "0" } });
    files.push(new File([blob], `${prefix}-${String(i + 1).padStart(2, "0")}.png`, { type: "image/png" }));
  }
  return files;
}

export async function shareCards(cards, title, url) {
  const slug = (title || "backfire").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let files;
  try { files = await cardImages(cards, slug); }
  catch (e) { alert("Couldn't make the images: " + e.message); return; }
  if (navigator.canShare && navigator.canShare({ files })) {
    try {
      await navigator.share({ files, title: `${title} · The Backfire Awards`, text: url });
      return;
    } catch (e) { if (e && e.name === "AbortError") return; }
  }
  // No share sheet with files (most computers): save them instead.
  for (const f of files) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(f); a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove();
    await new Promise((r) => setTimeout(r, 250));
  }
}
