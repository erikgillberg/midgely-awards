// The Midgley Awards — Cloudflare Pages advanced-mode worker (v2).
//
// Serves the static site from ./public and a JSON API backed by a D1 database.
// Bindings / settings (Cloudflare dashboard → Pages project → Settings):
//   D1 database binding (any name; `DB` preferred)       required
//   ADMIN_TOKEN       secret — unlocks /admin             required for moderation
//   TURNSTILE_SITE_KEY + TURNSTILE_SECRET                 optional bot check on submissions
//   AUTO_APPROVE = "1"                                    optional — skip the approval queue
//
// The schema creates and migrates itself on first request (v1 databases upgrade in place).

const SCHEMA_VERSION = 3;
const REPORTS_TO_HIDE = 3; // a comment hides itself after this many reports, pending review
const STATE_TTL = 15; // seconds the public list is cached at the edge

const DOMAINS = ["energy", "materials", "food", "cities", "information", "health", "finance", "governance"];
const HARMS = ["environmental", "health", "social", "economic"];
const KNOWABLE = ["knowable", "unforeseeable", "mixed", "contested"];
const STATUSES = ["historic", "unfolding", "prospective"];
const AWARDS = ["lifetime", "tech", "policy", "urban", "intended"];
const VOTER_RE = /^[A-Za-z0-9-]{16,64}$/;
const ID_RE = /^[A-Za-z0-9-]{1,64}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

// Per-visitor limits over a rolling 10 minutes.
const LIMITS = { nominee: 3, comment: 12, vote: 120, report: 20, subscribe: 3 };

const TABLES = [
  `CREATE TABLE IF NOT EXISTS nominees (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, years TEXT, work TEXT NOT NULL,
    solved TEXT NOT NULL, backfire TEXT NOT NULL, category TEXT,
    knowable TEXT, author TEXT, seeded INTEGER DEFAULT 0, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS votes (
    nominee_id TEXT NOT NULL, voter TEXT NOT NULL, created_at TEXT NOT NULL,
    PRIMARY KEY (nominee_id, voter))`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY, nominee_id TEXT NOT NULL, text TEXT NOT NULL,
    author TEXT, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS reports (
    kind TEXT NOT NULL, target_id TEXT NOT NULL, reporter TEXT NOT NULL,
    reason TEXT, created_at TEXT NOT NULL, PRIMARY KEY (kind, target_id, reporter))`,
  `CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS hits (k TEXT NOT NULL, ts INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS comments_nominee ON comments (nominee_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS hits_k_ts ON hits (k, ts)`,
];

// Columns added in v2 (ALTER TABLE ADD COLUMN when missing).
const NEW_COLUMNS = {
  nominees: [
    ["domain", "TEXT"], ["harms", "TEXT"], ["status", "TEXT"], ["award", "TEXT"],
    ["fix", "TEXT"], ["fix_url", "TEXT"], ["state", "TEXT DEFAULT 'approved'"], ["reports", "INTEGER DEFAULT 0"],
    ["wiki_name", "TEXT"], ["wiki_work", "TEXT"], // v3
  ],
  comments: [["hidden", "INTEGER DEFAULT 0"], ["reports", "INTEGER DEFAULT 0"]],
};

// Founding class. Fields: id, name, years, work, solved, backfire, knowable, domain, harms, status, award, fix, fixUrl
const SEED = [
  ["midgley", "Thomas Midgley Jr.", "1889–1944", "Leaded gasoline and CFCs (Freon)",
    "Tetraethyl lead ended engine knock; CFCs made refrigeration stable, nonflammable and safe to have around people.",
    "Decades of lead dispersed into cities worldwide, exposing children to a neurotoxin; CFCs survived to the stratosphere and destroyed ozone.",
    "mixed", "materials", "environmental,health", "historic", "lifetime",
    "The Montreal Protocol (1987) phased out CFCs and the ozone layer is slowly recovering. Leaded gasoline was phased out worldwide by 2021.",
    "https://en.wikipedia.org/wiki/Montreal_Protocol"],
  ["haber", "Fritz Haber", "1868–1934", "Synthetic ammonia (Haber-Bosch)",
    "Industrial nitrogen fixation made fertilizer abundant and helped make today's population supportable.",
    "Industrial explosives, fertilizer runoff, nitrous oxide emissions and a disrupted global nitrogen cycle.",
    "mixed", "food", "environmental", "unfolding", "", "", ""],
  ["nobel", "Alfred Nobel", "1833–1896", "Dynamite",
    "A far safer, controllable way to use nitroglycerin, transforming mining, tunneling and construction.",
    "A much more practical explosive for warfare. His discomfort with that legacy gave us the Nobel Prizes.",
    "knowable", "materials", "social", "historic", "", "", ""],
  ["franz", "John Franz", "1929–", "Glyphosate (Roundup)",
    "An extraordinarily effective herbicide that simplified weed control and helped enable no-till agriculture.",
    "Adoption at enormous scale bred herbicide-resistant weeds and ecological concerns. The human-health debate remains contested.",
    "contested", "food", "environmental,health", "unfolding", "", "", ""],
  ["muller", "Paul Müller", "1899–1965", "DDT as an insecticide",
    "Astonishingly effective against disease-carrying insects; helped control malaria and typhus. Nobel Prize, 1948.",
    "Persistent bioaccumulation and ecological harm, famously eggshell thinning in birds.",
    "unforeseeable", "health", "environmental", "historic", "",
    "The Stockholm Convention (2001) restricted DDT worldwide while allowing limited use against malaria mosquitoes.",
    "https://en.wikipedia.org/wiki/Stockholm_Convention_on_Persistent_Organic_Pollutants"],
  ["baekeland", "Leo Baekeland", "1863–1944", "Bakelite and the plastics age",
    "Synthetic polymers made modern medicine, electronics, transportation, food preservation and manufacturing possible.",
    "A century later: persistent plastic waste and microplastics distributed across the planet.",
    "unforeseeable", "materials", "environmental,health", "unfolding", "", "", ""],
  ["borlaug", "Norman Borlaug", "1914–2009", "The Green Revolution",
    "High-yield crops with fertilizer, irrigation and pesticides averted famine on a tremendous scale.",
    "Monocultures, groundwater depletion, fertilizer pollution and heavy dependence on industrial inputs.",
    "mixed", "food", "environmental,economic", "unfolding", "", "", ""],
  ["moses", "Robert Moses", "1888–1981", "Automobile-oriented urbanism",
    "Highways moved people longer distances extremely well and built infrastructure at unprecedented scale.",
    "Demolished neighborhoods, induced more driving, and left metropolitan forms that are enormously hard to retrofit.",
    "knowable", "cities", "social,environmental,economic", "unfolding", "urban",
    "A growing movement to remove urban freeways and reconnect the neighborhoods they split.", ""],
  ["zuckerberg", "Mark Zuckerberg", "1984–", "Algorithmic social media",
    "Connected people at global scale and made publishing essentially frictionless.",
    "Misinformation, polarization, privacy loss, addictive engagement and algorithmic amplification. Causality is heavily researched but still debated.",
    "contested", "information", "social", "unfolding", "intended", "", ""],
  ["berners-lee", "Tim Berners-Lee", "1955–", "The World Wide Web",
    "An open system that made information universally linkable and accessible, arguably the greatest democratization of knowledge in history.",
    "An information environment that also holds surveillance, spam, fraud, algorithmic manipulation and industrial-scale misinformation.",
    "unforeseeable", "information", "social,economic", "unfolding", "",
    "Berners-Lee's own Solid project aims to give people control of their personal data.", "https://solidproject.org/"],
];

// Wikipedia pages for the founding class (v3): id -> [the nominee, the achievement].
const SEED_WIKI = {
  midgley: ["https://en.wikipedia.org/wiki/Thomas_Midgley_Jr.", "https://en.wikipedia.org/wiki/Tetraethyllead"],
  haber: ["https://en.wikipedia.org/wiki/Fritz_Haber", "https://en.wikipedia.org/wiki/Haber_process"],
  nobel: ["https://en.wikipedia.org/wiki/Alfred_Nobel", "https://en.wikipedia.org/wiki/Dynamite"],
  franz: ["https://en.wikipedia.org/wiki/John_E._Franz", "https://en.wikipedia.org/wiki/Glyphosate"],
  muller: ["https://en.wikipedia.org/wiki/Paul_Hermann_M%C3%BCller", "https://en.wikipedia.org/wiki/DDT"],
  baekeland: ["https://en.wikipedia.org/wiki/Leo_Baekeland", "https://en.wikipedia.org/wiki/Bakelite"],
  borlaug: ["https://en.wikipedia.org/wiki/Norman_Borlaug", "https://en.wikipedia.org/wiki/Green_Revolution"],
  moses: ["https://en.wikipedia.org/wiki/Robert_Moses", "https://en.wikipedia.org/wiki/Car_dependency"],
  zuckerberg: ["https://en.wikipedia.org/wiki/Mark_Zuckerberg", "https://en.wikipedia.org/wiki/Facebook"],
  "berners-lee": ["https://en.wikipedia.org/wiki/Tim_Berners-Lee", "https://en.wikipedia.org/wiki/World_Wide_Web"],
};

// ---------------------------------------------------------------- setup

function findD1(env) {
  if (env.DB && typeof env.DB.prepare === "function") return env.DB;
  for (const k of Object.keys(env || {})) {
    if (k === "ASSETS") continue;
    const v = env[k];
    if (v && typeof v === "object" && v.constructor && v.constructor.name === "D1Database") return v;
  }
  return null;
}

let ready = null;
async function ensureSchema(db) {
  if (!ready) {
    ready = migrate(db).catch((e) => { ready = null; throw e; });
  }
  return ready;
}

async function migrate(db) {
  await db.batch(TABLES.map((s) => db.prepare(s)));
  for (const [table, cols] of Object.entries(NEW_COLUMNS)) {
    const info = await db.prepare(`PRAGMA table_info(${table})`).all();
    const have = new Set(info.results.map((r) => r.name));
    for (const [name, type] of cols) {
      if (!have.has(name)) await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`).run();
    }
  }
  const ver = Number((await db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").first())?.value || 1);
  if (ver >= SCHEMA_VERSION) return;

  const seeded = await db.prepare("SELECT value FROM meta WHERE key = 'seeded'").first();
  const stmts = [];
  SEED.forEach((r, i) => {
    const [id, name, years, work, solved, backfire, knowable, domain, harms, status, award, fix, fixUrl] = r;
    if (!seeded) {
      stmts.push(db.prepare(
        `INSERT OR IGNORE INTO nominees (id,name,years,work,solved,backfire,knowable,domain,harms,status,award,fix,fix_url,author,seeded,state,created_at,category)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,1,'approved',?,'')`
      ).bind(id, name, years, work, solved, backfire, knowable, domain, harms, status, award || null, fix || null, fixUrl || null,
        new Date(Date.UTC(2026, 8, 23, 0, 0, i + 1)).toISOString()));
    } else {
      // Upgrade a v1 founding entry in place (only fields v1 didn't have).
      stmts.push(db.prepare(
        `UPDATE nominees SET domain = COALESCE(domain, ?), harms = COALESCE(harms, ?), status = COALESCE(status, ?),
           award = COALESCE(award, ?), fix = COALESCE(fix, ?), fix_url = COALESCE(fix_url, ?), state = COALESCE(state, 'approved')
         WHERE id = ? AND seeded = 1`
      ).bind(domain, harms, status, award || null, fix || null, fixUrl || null, id));
    }
  });
  for (const [id, [wn, ww]] of Object.entries(SEED_WIKI)) {
    stmts.push(db.prepare("UPDATE nominees SET wiki_name = COALESCE(wiki_name, ?), wiki_work = COALESCE(wiki_work, ?) WHERE id = ? AND seeded = 1").bind(wn, ww, id));
  }
  // v1 community submissions: carry the old single category over to the new facets where it maps cleanly.
  stmts.push(db.prepare(`UPDATE nominees SET domain = COALESCE(domain, 'cities') WHERE seeded = 0 AND category = 'urban'`));
  stmts.push(db.prepare(`UPDATE nominees SET domain = COALESCE(domain, 'governance') WHERE seeded = 0 AND category = 'policy'`));
  stmts.push(db.prepare(`UPDATE nominees SET status = COALESCE(status, 'prospective') WHERE seeded = 0 AND category = 'prospective'`));
  stmts.push(db.prepare(`UPDATE nominees SET state = 'approved' WHERE state IS NULL`));
  stmts.push(db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES ('seeded','1')"));
  stmts.push(db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES ('schema_version', ?)").bind(String(SCHEMA_VERSION)));
  await db.batch(stmts);
}

// ---------------------------------------------------------------- helpers

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
const bad = (msg, status = 400) => json({ error: msg }, status);

function clean(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
function cleanUrl(v) {
  const s = clean(v, 500);
  if (!s) return "";
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : "";
  } catch { return ""; }
}
// A Wikipedia article link, or "" when empty. Returns null when it points anywhere else.
function cleanWiki(v) {
  const s = cleanUrl(v);
  if (!s) return clean(v, 500) ? null : "";
  const u = new URL(s);
  if (!/(^|\.)wikipedia\.org$/i.test(u.hostname)) return null;
  u.protocol = "https:";
  return u.toString();
}
const pick = (v, list) => (list.includes(v) ? v : "");
function pickMany(v, list) {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return [...new Set(arr.filter((x) => list.includes(x)))].join(",");
}

async function readBody(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 16384) return null;
  try { return await request.json(); } catch { return null; }
}

async function visitorKey(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const data = new TextEncoder().encode(ip + "|" + (env.ADMIN_TOKEN || "midgley"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function rateLimited(db, request, env, action) {
  const k = action + ":" + (await visitorKey(request, env));
  const now = Math.floor(Date.now() / 1000);
  const row = await db.prepare("SELECT COUNT(*) AS c FROM hits WHERE k = ? AND ts > ?").bind(k, now - 600).first();
  if (row.c >= LIMITS[action]) return true;
  await db.prepare("INSERT INTO hits (k, ts) VALUES (?, ?)").bind(k, now).run();
  if (Math.random() < 0.02) await db.prepare("DELETE FROM hits WHERE ts < ?").bind(now - 3600).run();
  return false;
}

async function turnstileOk(request, env, token) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const d = await r.json();
    return !!d.success;
  } catch { return false; }
}

function nomineeOut(r, admin = false) {
  const out = {
    id: r.id, name: r.name, years: r.years || "", work: r.work, solved: r.solved, backfire: r.backfire,
    knowable: r.knowable || "", domain: r.domain || "", harms: r.harms ? r.harms.split(",").filter(Boolean) : [],
    status: r.status || "", award: r.award || "", fix: r.fix || "", fixUrl: r.fix_url || "",
    wikiName: r.wiki_name || "", wikiWork: r.wiki_work || "",
    author: r.author || "", seeded: !!r.seeded, createdAt: r.created_at, score: r.score || 0,
  };
  if (admin) { out.state = r.state || "approved"; out.reports = r.reports || 0; out.legacyCategory = r.category || ""; }
  return out;
}
const commentOut = (c, admin = false) => {
  const o = { id: c.id, nomineeId: c.nominee_id, text: c.text, author: c.author || "", createdAt: c.created_at };
  if (admin) { o.hidden = !!c.hidden; o.reports = c.reports || 0; }
  return o;
};

const stateCacheKey = (url) => new Request(url.origin + "/api/state?__cache=1");
async function bustState(url) {
  try { await caches.default.delete(stateCacheKey(url)); } catch {}
}

function isAdmin(request, env) {
  return !!env.ADMIN_TOKEN && request.headers.get("authorization") === `Bearer ${env.ADMIN_TOKEN}`;
}

// ---------------------------------------------------------------- public API

async function getState(db, url, ctx) {
  const key = stateCacheKey(url);
  try {
    const hit = await caches.default.match(key);
    if (hit) return hit;
  } catch {}
  const [noms, scores, comments] = await db.batch([
    db.prepare(`SELECT * FROM nominees WHERE state = 'approved' ORDER BY created_at`),
    db.prepare(`SELECT nominee_id, COUNT(*) AS c FROM votes GROUP BY nominee_id`),
    db.prepare(`SELECT id, nominee_id, text, author, created_at FROM comments WHERE COALESCE(hidden,0) = 0 ORDER BY created_at LIMIT 5000`),
  ]);
  const score = Object.fromEntries(scores.results.map((r) => [r.nominee_id, r.c]));
  const body = JSON.stringify({
    nominees: noms.results.map((r) => nomineeOut({ ...r, score: score[r.id] || 0 })),
    comments: comments.results.map((c) => commentOut(c)),
    generatedAt: new Date().toISOString(),
  });
  const res = new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${STATE_TTL}` },
  });
  try { ctx.waitUntil(caches.default.put(key, res.clone())); } catch {}
  return res;
}

async function handleApi(request, env, url, ctx) {
  const db = findD1(env);
  if (!db) return bad("Database not connected. In Cloudflare: Settings → Bindings, add a D1 database binding for Production, then redeploy.", 503);
  await ensureSchema(db);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  if (path === "/api/config" && method === "GET") {
    return json({ turnstileSiteKey: env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY || "" : "", autoApprove: env.AUTO_APPROVE === "1" });
  }

  if (path === "/api/state" && method === "GET") return getState(db, url, ctx);

  if (path === "/api/my-votes" && method === "GET") {
    const voter = url.searchParams.get("voter") || "";
    if (!VOTER_RE.test(voter)) return json({ myVotes: [] });
    const r = await db.prepare("SELECT nominee_id FROM votes WHERE voter = ?").bind(voter).all();
    return json({ myVotes: r.results.map((x) => x.nominee_id) });
  }

  if (path === "/api/nominees" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read the submission.");
    if (b.website) return json({ status: "pending" }); // honeypot
    if (!(await turnstileOk(request, env, b.turnstile))) return bad("Please complete the human check and try again.", 403);
    if (await rateLimited(db, request, env, "nominee")) return bad("That's a lot of nominations at once. Try again in a few minutes.", 429);
    const n = {
      name: clean(b.name, 80), years: clean(b.years, 30), work: clean(b.work, 120),
      solved: clean(b.solved, 600), backfire: clean(b.backfire, 600),
      domain: pick(b.domain, DOMAINS), harms: pickMany(b.harms, HARMS),
      knowable: pick(b.knowable, KNOWABLE), status: pick(b.status, STATUSES),
      fix: clean(b.fix, 400), fixUrl: cleanUrl(b.fixUrl), author: clean(b.author, 60),
      wikiName: cleanWiki(b.wikiName), wikiWork: cleanWiki(b.wikiWork),
    };
    if (n.wikiName === null || n.wikiWork === null) return bad("Wikipedia links have to point to a page on wikipedia.org.");
    if (!n.name || !n.work || !n.solved || !n.backfire) return bad("Fill in the nominee, the achievement, and both sides of the ledger.");
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const state = env.AUTO_APPROVE === "1" ? "approved" : "pending";
    await db.prepare(
      `INSERT INTO nominees (id,name,years,work,solved,backfire,domain,harms,knowable,status,fix,fix_url,wiki_name,wiki_work,author,seeded,state,created_at,category)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,'')`
    ).bind(id, n.name, n.years, n.work, n.solved, n.backfire, n.domain || null, n.harms || null, n.knowable || null,
      n.status || null, n.fix || null, n.fixUrl || null, n.wikiName || null, n.wikiWork || null, n.author, state, createdAt).run();
    if (state === "approved") await bustState(url);
    return json({
      status: state,
      nominee: state === "approved" ? nomineeOut({ id, ...n, fix_url: n.fixUrl, wiki_name: n.wikiName, wiki_work: n.wikiWork, created_at: createdAt, seeded: 0, score: 0 }) : null,
    }, 201);
  }

  if (path === "/api/vote" && method === "POST") {
    const b = await readBody(request);
    const nomineeId = clean(b && b.nomineeId, 64);
    const voter = b && b.voter;
    if (!ID_RE.test(nomineeId) || !VOTER_RE.test(voter || "")) return bad("Invalid vote.");
    if (await rateLimited(db, request, env, "vote")) return bad("Slow down a little and try again shortly.", 429);
    const exists = await db.prepare("SELECT 1 FROM nominees WHERE id = ? AND state = 'approved'").bind(nomineeId).first();
    if (!exists) return bad("That nominee isn't available.", 404);
    const had = await db.prepare("SELECT 1 FROM votes WHERE nominee_id = ? AND voter = ?").bind(nomineeId, voter).first();
    if (had) await db.prepare("DELETE FROM votes WHERE nominee_id = ? AND voter = ?").bind(nomineeId, voter).run();
    else await db.prepare("INSERT OR IGNORE INTO votes (nominee_id, voter, created_at) VALUES (?,?,?)").bind(nomineeId, voter, new Date().toISOString()).run();
    const s = await db.prepare("SELECT COUNT(*) AS c FROM votes WHERE nominee_id = ?").bind(nomineeId).first();
    await bustState(url);
    return json({ voted: !had, score: s.c });
  }

  if (path === "/api/comments" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read the comment.");
    if (b.website) return json({ ok: true });
    const nomineeId = clean(b.nomineeId, 64);
    const text = clean(b.text, 1000);
    const author = clean(b.author, 60);
    if (!ID_RE.test(nomineeId) || !text) return bad("Write a comment first.");
    if (await rateLimited(db, request, env, "comment")) return bad("You're commenting faster than we allow. Try again in a few minutes.", 429);
    const exists = await db.prepare("SELECT 1 FROM nominees WHERE id = ? AND state = 'approved'").bind(nomineeId).first();
    if (!exists) return bad("That nominee isn't available.", 404);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.prepare("INSERT INTO comments (id,nominee_id,text,author,created_at,hidden,reports) VALUES (?,?,?,?,?,0,0)")
      .bind(id, nomineeId, text, author, createdAt).run();
    await bustState(url);
    return json({ id, nomineeId, text, author, createdAt }, 201);
  }

  if (path === "/api/report" && method === "POST") {
    const b = await readBody(request);
    const kind = b && (b.kind === "comment" || b.kind === "nominee") ? b.kind : "";
    const id = clean(b && b.id, 64);
    const voter = b && b.voter;
    if (!kind || !ID_RE.test(id) || !VOTER_RE.test(voter || "")) return bad("Invalid report.");
    if (await rateLimited(db, request, env, "report")) return bad("Too many reports at once. Try again later.", 429);
    const table = kind === "comment" ? "comments" : "nominees";
    const ins = await db.prepare("INSERT OR IGNORE INTO reports (kind, target_id, reporter, reason, created_at) VALUES (?,?,?,?,?)")
      .bind(kind, id, voter, clean(b.reason, 200), new Date().toISOString()).run();
    if (ins.meta && ins.meta.changes) {
      await db.prepare(`UPDATE ${table} SET reports = COALESCE(reports,0) + 1 WHERE id = ?`).bind(id).run();
      if (kind === "comment") {
        const r = await db.prepare("UPDATE comments SET hidden = 1 WHERE id = ? AND reports >= ? AND hidden = 0").bind(id, REPORTS_TO_HIDE).run();
        if (r.meta && r.meta.changes) await bustState(url);
      }
    }
    return json({ ok: true });
  }

  if (path === "/api/subscribe" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read that.");
    if (b.website) return json({ ok: true });
    const email = clean(b.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return bad("That email address doesn't look right.");
    if (!(await turnstileOk(request, env, b.turnstile))) return bad("Please complete the human check and try again.", 403);
    if (await rateLimited(db, request, env, "subscribe")) return bad("Try again in a few minutes.", 429);
    await db.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)").bind(email, new Date().toISOString()).run();
    return json({ ok: true });
  }

  if (path.startsWith("/api/admin")) return handleAdmin(request, env, url, db, path, method);

  return bad("Not found.", 404);
}

// ---------------------------------------------------------------- admin API

async function handleAdmin(request, env, url, db, path, method) {
  if (!env.ADMIN_TOKEN) return bad("Moderation is off. Add an ADMIN_TOKEN secret in the Pages project settings and redeploy.", 503);
  if (!isAdmin(request, env)) return bad("Wrong admin token.", 401);

  if (path === "/api/admin/overview" && method === "GET") {
    const [noms, scores, comments, subs] = await db.batch([
      db.prepare("SELECT * FROM nominees ORDER BY created_at DESC"),
      db.prepare("SELECT nominee_id, COUNT(*) AS c FROM votes GROUP BY nominee_id"),
      db.prepare("SELECT c.*, n.name AS nominee_name FROM comments c LEFT JOIN nominees n ON n.id = c.nominee_id WHERE COALESCE(c.reports,0) > 0 OR COALESCE(c.hidden,0) = 1 ORDER BY c.created_at DESC LIMIT 500"),
      db.prepare("SELECT COUNT(*) AS c FROM subscribers"),
    ]);
    const score = Object.fromEntries(scores.results.map((r) => [r.nominee_id, r.c]));
    return json({
      nominees: noms.results.map((r) => nomineeOut({ ...r, score: score[r.id] || 0 }, true)),
      flaggedComments: comments.results.map((c) => ({ ...commentOut(c, true), nomineeName: c.nominee_name || "" })),
      subscriberCount: subs.results[0].c,
    });
  }

  if (path === "/api/admin/subscribers" && method === "GET") {
    const r = await db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at").all();
    return json({ subscribers: r.results });
  }

  let m = path.match(/^\/api\/admin\/nominees\/([A-Za-z0-9-]{1,64})$/);
  if (m && method === "PATCH") {
    const b = (await readBody(request)) || {};
    const sets = [], vals = [];
    const text = { name: 80, years: 30, work: 120, solved: 600, backfire: 600, fix: 400, author: 60 };
    for (const [k, max] of Object.entries(text)) if (k in b) { sets.push(`${k} = ?`); vals.push(clean(b[k], max) || null); }
    if ("fixUrl" in b) { sets.push("fix_url = ?"); vals.push(cleanUrl(b.fixUrl) || null); }
    for (const [k, col] of [["wikiName", "wiki_name"], ["wikiWork", "wiki_work"]]) {
      if (!(k in b)) continue;
      const w = cleanWiki(b[k]);
      if (w === null) return bad("Wikipedia links have to point to a page on wikipedia.org.");
      sets.push(`${col} = ?`); vals.push(w || null);
    }
    if ("domain" in b) { sets.push("domain = ?"); vals.push(pick(b.domain, DOMAINS) || null); }
    if ("harms" in b) { sets.push("harms = ?"); vals.push(pickMany(b.harms, HARMS) || null); }
    if ("knowable" in b) { sets.push("knowable = ?"); vals.push(pick(b.knowable, KNOWABLE) || null); }
    if ("status" in b) { sets.push("status = ?"); vals.push(pick(b.status, STATUSES) || null); }
    if ("award" in b) { sets.push("award = ?"); vals.push(pick(b.award, AWARDS) || null); }
    if ("state" in b && ["approved", "pending", "rejected"].includes(b.state)) { sets.push("state = ?"); vals.push(b.state); }
    if (b.clearReports) { sets.push("reports = 0"); await db.prepare("DELETE FROM reports WHERE kind = 'nominee' AND target_id = ?").bind(m[1]).run(); }
    if (!sets.length) return bad("Nothing to change.");
    await db.prepare(`UPDATE nominees SET ${sets.join(", ")} WHERE id = ?`).bind(...vals, m[1]).run();
    await bustState(url);
    return json({ ok: true });
  }
  if (m && method === "DELETE") {
    await db.batch([
      db.prepare("DELETE FROM votes WHERE nominee_id = ?").bind(m[1]),
      db.prepare("DELETE FROM reports WHERE target_id IN (SELECT id FROM comments WHERE nominee_id = ?)").bind(m[1]),
      db.prepare("DELETE FROM comments WHERE nominee_id = ?").bind(m[1]),
      db.prepare("DELETE FROM reports WHERE kind = 'nominee' AND target_id = ?").bind(m[1]),
      db.prepare("DELETE FROM nominees WHERE id = ?").bind(m[1]),
    ]);
    await bustState(url);
    return json({ ok: true });
  }

  m = path.match(/^\/api\/admin\/comments\/([A-Za-z0-9-]{1,64})$/);
  if (m && method === "PATCH") {
    const b = (await readBody(request)) || {};
    if (b.restore) {
      await db.batch([
        db.prepare("UPDATE comments SET hidden = 0, reports = 0 WHERE id = ?").bind(m[1]),
        db.prepare("DELETE FROM reports WHERE kind = 'comment' AND target_id = ?").bind(m[1]),
      ]);
    } else if (b.hide) {
      await db.prepare("UPDATE comments SET hidden = 1 WHERE id = ?").bind(m[1]).run();
    } else return bad("Nothing to change.");
    await bustState(url);
    return json({ ok: true });
  }
  if (m && method === "DELETE") {
    await db.batch([
      db.prepare("DELETE FROM reports WHERE kind = 'comment' AND target_id = ?").bind(m[1]),
      db.prepare("DELETE FROM comments WHERE id = ?").bind(m[1]),
    ]);
    await bustState(url);
    return json({ ok: true });
  }

  return bad("Not found.", 404);
}

// ---------------------------------------------------------------- share pages

class SetAttr {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { el.setAttribute(this.attr, this.value); }
}
class SetText {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}

function withMeta(page, url, meta) {
  const abs = (p) => url.origin + p;
  let rw = new HTMLRewriter()
    .on('meta[property="og:image"]', new SetAttr("content", abs("/og.png")))
    .on('meta[name="twitter:image"]', new SetAttr("content", abs("/og.png")))
    .on('meta[property="og:url"]', new SetAttr("content", meta.canonical))
    .on('link[rel="canonical"]', new SetAttr("href", meta.canonical));
  if (meta.title) {
    rw = rw.on("title", new SetText(meta.title))
      .on('meta[property="og:title"]', new SetAttr("content", meta.title))
      .on('meta[name="twitter:title"]', new SetAttr("content", meta.title));
  }
  if (meta.desc) {
    rw = rw.on('meta[name="description"]', new SetAttr("content", meta.desc))
      .on('meta[property="og:description"]', new SetAttr("content", meta.desc))
      .on('meta[name="twitter:description"]', new SetAttr("content", meta.desc));
  }
  return rw.transform(page);
}

async function sharePage(request, env, url, id) {
  const page = await env.ASSETS.fetch(new Request(new URL("/", url), request));
  const db = findD1(env);
  let n = null;
  if (db) {
    try {
      await ensureSchema(db);
      n = await db.prepare("SELECT name, work, backfire FROM nominees WHERE id = ? AND state = 'approved'").bind(id).first();
    } catch {}
  }
  if (!n) return withMeta(page, url, { canonical: url.origin + "/" });
  return withMeta(page, url, {
    canonical: `${url.origin}/n/${id}`,
    title: `${n.name}: ${n.work} · The Midgley Awards`,
    desc: `Nominated for outstanding achievement in unintended consequences. ${n.backfire}`.slice(0, 280),
  });
}

// ---------------------------------------------------------------- entry

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url, ctx);
      } catch (e) {
        console.error(e && e.stack);
        return bad("Server error. Try again in a moment.", 500);
      }
    }
    const share = url.pathname.match(/^\/n\/([A-Za-z0-9-]{1,64})\/?$/);
    if (share && share[1] === "midgley") return Response.redirect(url.origin + "/midgley", 301);
    if (share && request.method === "GET") return sharePage(request, env, url, share[1]);
    const res = await env.ASSETS.fetch(request);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html") && res.ok) {
      return withMeta(res, url, { canonical: url.origin + "/" });
    }
    return res;
  },
};
