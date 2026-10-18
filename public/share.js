// Turn square cards into 1080 × 1080 images and hand them to the phone's share sheet
// (Instagram can take them from there as a carousel post), or download them on a computer.
// html-to-image draws a page element, fonts and all, onto an image in the browser.
import { toBlob } from "https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/+esm";

const SIZE = 1080;
// Instagram's editor zooms square photos to fill a 4:5 frame and crops the sides. Exporting 4:5
// (the square card centered, with bands of the card's own color) means nothing gets cropped.
const TALL = 1350;

// The page's fonts come from Google Fonts, a stylesheet html-to-image can't read across origins.
// Fetch it ourselves and inline each font file, so the images use the real typefaces.
let fontCSS = null;
async function embedFonts() {
  if (fontCSS !== null) return fontCSS;
  try {
    const link = document.querySelector('link[href*="fonts.googleapis.com/css"]');
    if (!link) return (fontCSS = "");
    let css = await fetch(link.href).then((r) => r.text());
    // Keep only the Latin subset ("/* latin */" blocks); the cards are English.
    css = css.split("/* ").filter((b) => b.startsWith("latin */")).map((b) => "/* " + b).join("") || css;
    const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || [])];
    const inlined = await Promise.all(urls.map(async (u) => {
      const b = await fetch(u).then((r) => r.blob());
      return [u, await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); })];
    }));
    for (const [u, data] of inlined) css = css.split(u).join(data);
    return (fontCSS = css);
  } catch (e) { return (fontCSS = ""); }
}

export async function cardImages(cards, prefix = "backfire") {
  // Images below the fold load lazily; load them all before drawing.
  const imgs = cards.flatMap((c) => [...c.querySelectorAll("img")]);
  imgs.forEach((i) => (i.loading = "eager"));
  const loaded = Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? i.decode().catch(() => {}) : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.race([loaded, new Promise((r) => setTimeout(r, 8000))]); // never wait forever on one image
  const files = [];
  for (const [i, card] of cards.entries()) {
    const w = card.getBoundingClientRect().width || card.offsetWidth;
    const square = await toBlob(card, { width: w, height: w, pixelRatio: SIZE / w, cacheBust: true, style: { margin: "0" }, fontEmbedCSS: await embedFonts() });
    const blob = await tall(square, bandColor(card));
    files.push(new File([blob], `${prefix}-${String(i + 1).padStart(2, "0")}.png`, { type: "image/png" }));
  }
  return files;
}

function bandColor(card) {
  const cs = getComputedStyle(card);
  return cs.getPropertyValue("--deep").trim() || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" ? cs.backgroundColor : "#12161C");
}
async function tall(squareBlob, color) {
  const img = await createImageBitmap(squareBlob);
  const c = document.createElement("canvas");
  c.width = SIZE; c.height = TALL;
  const g = c.getContext("2d");
  g.fillStyle = color; g.fillRect(0, 0, SIZE, TALL);
  g.drawImage(img, 0, (TALL - SIZE) / 2, SIZE, SIZE);
  return new Promise((r) => c.toBlob(r, "image/png"));
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
