// The Backfire Awards: Cloudflare Pages advanced-mode worker.
//
// Serves the static site from ./public and a JSON API backed by a D1 database.
// Bindings / settings (Cloudflare dashboard → Pages project → Settings):
//   D1 database binding (any name; `DB` preferred)       required
//   ADMIN_TOKEN       secret — unlocks /admin             required for moderation
//   TURNSTILE_SITE_KEY + TURNSTILE_SECRET                 optional bot check on submissions
//   AUTO_APPROVE = "1"                                    optional — skip the approval queue
//   FEATURE_SCORES = "1"                                  Oops Score and Herd Score (replaces upvotes)
//   FEATURE_CATEGORIES = "1"                              category chips and /category pages
//   CF_BEACON_TOKEN                                       optional — Cloudflare Web Analytics, injected into every page
//
// Only requests to SITE count as production. Every other host (pages.dev, staging, previews)
// is sent with X-Robots-Tag: noindex.
//
// The schema creates and migrates itself on first request (v1 databases upgrade in place).

import {
  SITE, feedOopsHTML, jewelVar, DOMAINS as DOMAIN_LABELS, CATEGORY_SLUGS, AWARDS as AWARD_LABELS, LINKS, MIN_JUDGES, HONOREE, signupHTML,
  esc, slugify, nomineePath, cardHTML, headerHTML, footerHTML, herdPct, byTop, topValue, categoryChipsHTML,
  carouselHTML, tableHTML, keyHTML, JEWELS, CATEGORY_JEWEL, BUILD, sheetHTML, nomCardHTML, categoricTableHTML, categoricLegendHTML,
  postHTML, writeupHTML, autoCarousel, sceneOf, jewelOf, murphyPostHTML, murphyPath,
} from "./shared.js";

const SCHEMA_VERSION = 11;
const REPORTS_TO_HIDE = 3; // a comment hides itself after this many reports, pending review
const STATE_TTL = 15; // seconds the public list is cached at the edge
// Old and spare domains: each forwards to the same page on backfireawards.com, so shared links keep working.
const FORWARD_HOSTS = ["www.backfireawards.com", "midgleyawards.com", "www.midgleyawards.com", "midgelyawards.com", "www.midgelyawards.com",
  "backfires.org", "www.backfires.org", "midgley-awards.pages.dev"];
// The old staging address forwards to the new one.
const STAGING_FORWARD = { "staging.midgleyawards.com": "https://staging.backfireawards.com" };

const DOMAINS = ["energy", "materials", "food", "cities", "information", "health", "finance", "governance"];
const HARMS = ["environmental", "health", "social", "economic"];
const KNOWABLE = ["knowable", "unforeseeable", "mixed", "contested"];
const STATUSES = ["historic", "unfolding", "prospective"];
const AWARDS = Object.keys(AWARD_LABELS);
const SITE_HOST = new URL(SITE).hostname;
const VOTER_RE = /^[A-Za-z0-9-]{16,64}$/;
const ID_RE = /^[A-Za-z0-9-]{1,64}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

// Per-visitor limits over a rolling 10 minutes.
const LIMITS = { nominee: 3, comment: 12, vote: 120, report: 20, subscribe: 3, murphy: 5 };

const flagsOf = (env) => ({ scores: env.FEATURE_SCORES === "1", categories: env.FEATURE_CATEGORIES === "1" });

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
  // v4: Herd Score votes (yes = 1, no = 0) and judges' Oops Scores (1 to 100)
  `CREATE TABLE IF NOT EXISTS herd_votes (
    nominee_id TEXT NOT NULL, voter TEXT NOT NULL, yes INTEGER NOT NULL, created_at TEXT NOT NULL,
    PRIMARY KEY (nominee_id, voter))`,
  // v5: where every image came from and on what terms we use it.
  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY, nominee_id TEXT NOT NULL, role TEXT, path TEXT NOT NULL, alt TEXT,
    title TEXT, creator TEXT, made TEXT, license TEXT NOT NULL, license_url TEXT,
    source_page TEXT NOT NULL, source_file TEXT, credit TEXT NOT NULL, width INTEGER, height INTEGER,
    edits TEXT, retrieved_at TEXT NOT NULL, created_at TEXT NOT NULL)`,
  // v7: further reading for each nominee, shown on its page.
  `CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY, nominee_id TEXT NOT NULL, sort INTEGER DEFAULT 0, title TEXT NOT NULL,
    author TEXT, year TEXT, publisher TEXT, url TEXT, kind TEXT, created_at TEXT NOT NULL)`,
  // v8: Murphy stories from the Nominate form.
  `CREATE TABLE IF NOT EXISTS murphys (
    id TEXT PRIMARY KEY, fix TEXT NOT NULL, oops TEXT NOT NULL, name TEXT, email TEXT, utm_source TEXT,
    state TEXT DEFAULT 'new', created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS judge_scores (
    nominee_id TEXT NOT NULL, judge TEXT NOT NULL, score INTEGER NOT NULL, created_at TEXT NOT NULL,
    PRIMARY KEY (nominee_id, judge))`,
];

// Columns added in v2 (ALTER TABLE ADD COLUMN when missing).
const NEW_COLUMNS = {
  nominees: [
    ["domain", "TEXT"], ["harms", "TEXT"], ["status", "TEXT"], ["award", "TEXT"],
    ["fix", "TEXT"], ["fix_url", "TEXT"], ["state", "TEXT DEFAULT 'approved'"], ["reports", "INTEGER DEFAULT 0"],
    ["wiki_name", "TEXT"], ["wiki_work", "TEXT"], // v3
    // v4: the nominee page write-up and a readable URL
    ["slug", "TEXT"], ["meant", "TEXT"], ["got_right", "TEXT"], ["foresight", "TEXT"], ["pattern", "TEXT"],
    ["source1", "TEXT"], ["source2", "TEXT"],
    // v5: the element tile. catalog_no never changes once given; began, recognized and reach are facts, not rankings.
    ["catalog_no", "INTEGER"], ["began", "INTEGER"], ["recognized", "INTEGER"], ["reach", "INTEGER"],
    // v6: the tile shows the birth (or founding) year, and how many people it helped and harmed, as powers of ten.
    ["born", "INTEGER"], ["helped", "INTEGER"], ["harmed", "INTEGER"],
  ],
  comments: [["hidden", "INTEGER DEFAULT 0"], ["reports", "INTEGER DEFAULT 0"]],
  murphys: [["slug", "TEXT"], ["featured_at", "TEXT"]], // v10: featured Murphys are public posts at /m/<slug>
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

// v9: nominees added after launch of the founding class. Full rows; inserted once.
const SEED_ADDED = [
  { id: "magie", name: "Lizzie Magie", years: "1866 to 1948", work: "The Landlord's Game (which became Monopoly)",
    meant: "Teach people the economist Henry George's argument: when a few own the land and collect the rent, they get rich and everyone else gets poorer.",
    solved: "It worked as a game. She patented it in 1904, and people copied it by hand for decades, playing it in colleges and in homes from Atlantic City to Pennsylvania.",
    backfire: "In 1935 Parker Brothers sold a version as Monopoly, where you win by bankrupting everyone else. It became one of the best-selling board games of all time, and it taught the opposite lesson.",
    gotRight: "Her board, with properties around the edge and a jail in the corner, is still the one people play.",
    foresight: "She could not have seen a game built to criticize monopoly becoming the way millions learn to enjoy one.",
    pattern: "The lesson flipped", knowable: "unforeseeable", domain: "finance", harms: "social", status: "historic",
    wikiName: "https://en.wikipedia.org/wiki/Lizzie_Magie", wikiWork: "https://en.wikipedia.org/wiki/The_Landlord%27s_Game",
    born: 1866, helped: 9, harmed: null, created: "2026-10-18T00:00:00.000Z" },
];

// Element facts: [id, year it began, year the main backfire was documented, reach as a power of ten (9 = billions)].
const SEED_ELEMENTS = [
  ["haber", 1913, 1972, 9],
];
// Tile facts: [id, born or founded, people helped and people harmed, each as a power of ten (9 = a billion or more)].
const SEED_TILES = [
  ["haber", 1868, 9, 8],
  // v11: harmed is conservative: about 170 million Americans alone had high childhood lead exposure (McFarland and others, PNAS 2022).
  ["midgley", 1889, 9, 8],
  // Birth years only; helped and harmed wait for research.
  ["nobel", 1833, null, null], ["franz", 1929, null, null], ["muller", 1899, null, null],
  ["baekeland", 1863, null, null], ["borlaug", 1914, null, null], ["moses", 1888, null, null],
  ["zuckerberg", 1984, null, null], ["berners-lee", 1955, null, null],
];

// Image provenance. Every image on a carousel needs a row here before it goes public.
const SEED_MEDIA = [
  { id: "midgley-portrait", nominee: "midgley", role: "portrait", path: "/img/n/midgley/portrait.jpg",
    alt: "Studio portrait of Thomas Midgley Jr. in round glasses, suit and polka dot tie",
    title: "Portrait of Thomas Midgley Jr.", creator: "Blank and Stoller, New York", made: "Before 1944",
    license: "No known copyright (Science History Institute)", sourcePage: "https://commons.wikimedia.org/wiki/File:Portrait_of_Thomas_Midgley_Jr..jpg",
    credit: "Thomas Midgley Jr. Blank and Stoller, New York. Science History Institute. No known copyright.", edits: "Resized", retrieved: "2026-10-18" },
  { id: "midgley-traffic", nominee: "midgley", role: "meant", path: "/img/n/midgley/traffic.jpg",
    alt: "A busy Los Angeles intersection in 1922, with streetcars, early automobiles and a Union Gasoline station",
    title: "Intersection of North Broadway and Sunset Boulevard showing traffic congestion, Los Angeles, 1922", creator: "Automobile Club of Southern California", made: "1922",
    license: "Public domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Intersection_of_North_Broadway_and_Sunset_Boulevard_showing_traffic_congestion,_Los_Angeles,_1922_(AAA-EN-122-3).jpg",
    credit: "North Broadway and Sunset Boulevard, Los Angeles, 1922. Automobile Club of Southern California. Public domain.", edits: "Cropped off the print border; resized", retrieved: "2026-10-18" },
  { id: "midgley-pump", nominee: "midgley", role: "right", path: "/img/n/midgley/pump.jpg",
    alt: "A rusted red Atlantic gasoline pump with a yellow and blue Ethyl anti-knock compound emblem",
    title: "Atlantic Ethyl pump, Rt. 23, Leola, Pennsylvania", creator: "John Margolies", made: "1982",
    license: "Public domain (Library of Congress, John Margolies Roadside America collection)", sourcePage: "https://commons.wikimedia.org/wiki/File:Atlantic_Ethyl_pump,_Rt._23,_Leola,_Pennsylvania_LCCN2017707812.tif",
    credit: "Atlantic Ethyl pump, Leola, Pennsylvania. John Margolies, 1982. Library of Congress. Public domain.", edits: "Cropped off the slide mount; resized", retrieved: "2026-10-18" },
  { id: "midgley-ozone", nominee: "midgley", role: "oops", path: "/img/n/midgley/ozone.jpg",
    alt: "A NASA satellite map of the globe from below, with a large purple ozone hole covering Antarctica",
    title: "Hole in the Ozone Layer Over Antarctica", creator: "NASA", made: "1998-10-01",
    license: "Public domain (NASA)", sourcePage: "https://commons.wikimedia.org/wiki/File:Hole_in_the_Ozone_Layer_Over_Antarctica_-_GPN-2002-000117.jpg",
    credit: "The ozone hole over Antarctica, October 1, 1998. NASA. Public domain.", edits: "Resized", retrieved: "2026-10-18" },
  { id: "haber-portrait", nominee: "haber", role: "portrait", path: "/img/n/haber/portrait.jpg",
    alt: "Etched profile portrait of Fritz Haber, bald, with round glasses",
    title: "Autographed etching of Fritz Haber", creator: "Emil Orlik (1870 to 1932)", made: "1922",
    license: "Public domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Autographed_etching_of_Fritz_Haber_-_DPLA_-_6e2889b98aad264ed25931f79c5dbad8.jpg",
    credit: "Fritz Haber, etching by Emil Orlik, 1922. Public domain.", edits: "Cropped to the plate; resized", retrieved: "2026-10-17" },
  { id: "haber-guano", nominee: "haber", role: "meant", path: "/img/n/haber/guano.jpg",
    alt: "Workers loading guano into a rail cart at the foot of a huge pale heap, Chincha Islands, Peru, 1865",
    title: "Guano Mining in Chincha Islands Peru (1865)", creator: "Henry de Witt Moulton", made: "1865",
    license: "Public domain", sourcePage: "https://commons.wikimedia.org/wiki/File:Guano_Mining_in_Chincha_Islands_Peru_(1865)_Moulton.jpg",
    credit: "Guano mining, Chincha Islands, Peru, 1865. Henry de Witt Moulton. Public domain.", edits: "Resized", retrieved: "2026-10-17" },
  { id: "haber-wheat", nominee: "haber", role: "right", path: "/img/n/haber/wheat.jpg",
    alt: "A combine harvesting a vast golden wheat field on rolling hills",
    title: "Wheat harvest on the Palouse", creator: "U.S. Department of Agriculture", made: "Before 2004",
    license: "Public domain (U.S. government work)", sourcePage: "https://commons.wikimedia.org/wiki/File:Wheat_harvest_on_the_Palouse.jpg",
    credit: "Wheat harvest on the Palouse. USDA. Public domain.", edits: "Resized", retrieved: "2026-10-17" },
  { id: "haber-gulf", nominee: "haber", role: "oops", path: "/img/n/haber/gulf.jpg",
    alt: "Satellite view of brown and green water spreading from the Louisiana coast into the deep blue Gulf of Mexico",
    title: "Sediment and Phytoplankton in the Gulf of Mexico (MODIS)", creator: "NASA GSFC, MODIS Land Rapid Response Team", made: "2023-02-13",
    license: "Public domain (NASA)", sourcePage: "https://commons.wikimedia.org/wiki/File:Sediment_and_Phytoplankton_in_the_Gulf_of_Mexico_(MODIS).jpg",
    credit: "Sediment and phytoplankton in the Gulf of Mexico, 2023. NASA. Public domain.", edits: "Resized", retrieved: "2026-10-17" },
];

// Further reading: [id, nominee, sort, title, author, year, publisher, url, kind]
const SEED_READINGS = [
  ["midgley-r1", "midgley", 1, "Half of US population exposed to adverse lead levels in early childhood", "Michael J. McFarland, Matt E. Hauer and Aaron Reuben", "2022", "PNAS", "https://doi.org/10.1073/pnas.2118631119", "Paper"],
  ["midgley-r2", "midgley", 2, "Stratospheric sink for chlorofluoromethanes: chlorine atom-catalysed destruction of ozone", "Mario J. Molina and F. S. Rowland", "1974", "Nature", "https://doi.org/10.1038/249810a0", "Paper"],
  ["midgley-r3", "midgley", 3, "Something New Under the Sun: An Environmental History of the Twentieth-Century World", "J. R. McNeill", "2000", "W. W. Norton", "", "Book"],
  ["midgley-r4", "midgley", 4, "Thomas Midgley Jr.", "", "", "Wikipedia", "https://en.wikipedia.org/wiki/Thomas_Midgley_Jr.", "Article"],
  ["midgley-r5", "midgley", 5, "Montreal Protocol", "", "", "Wikipedia", "https://en.wikipedia.org/wiki/Montreal_Protocol", "Article"],
  ["haber-r1", "haber", 1, "How a century of ammonia synthesis changed the world", "Jan Willem Erisman and others", "2008", "Nature Geoscience", "https://doi.org/10.1038/ngeo325", "Paper"],
  ["haber-r2", "haber", 2, "Enriching the Earth: Fritz Haber, Carl Bosch, and the Transformation of World Food Production", "Vaclav Smil", "2001", "MIT Press", "", "Book"],
  ["haber-r3", "haber", 3, "The Alchemy of Air", "Thomas Hager", "2008", "Harmony Books", "https://en.wikipedia.org/wiki/Thomas_Hager", "Book"],
  ["haber-r4", "haber", 4, "Dead zone (ecology)", "", "", "Wikipedia", "https://en.wikipedia.org/wiki/Dead_zone_(ecology)", "Article"],
  ["haber-r5", "haber", 5, "Haber process", "", "", "Wikipedia", "https://en.wikipedia.org/wiki/Haber_process", "Article"],
];

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
  // v4: awards from v2 that are no longer offered; year ranges written without dashes; readable URLs.
  stmts.push(db.prepare("UPDATE nominees SET award = NULL WHERE award IS NOT NULL AND award NOT IN (" + AWARDS.map(() => "?").join(",") + ")").bind(...AWARDS));
  stmts.push(db.prepare("UPDATE nominees SET years = REPLACE(years, '–', ' to ') WHERE years LIKE '%_–_%'"));
  stmts.push(db.prepare("UPDATE nominees SET years = 'Born ' || REPLACE(years, '–', '') WHERE years LIKE '%–'"));
  // v5: element facts for founding nominees that have been researched, and the provenance of their images.
  for (const [id, began, recognized, reach] of SEED_ELEMENTS) {
    stmts.push(db.prepare("UPDATE nominees SET began = COALESCE(began, ?), recognized = COALESCE(recognized, ?), reach = COALESCE(reach, ?) WHERE id = ? AND seeded = 1").bind(began, recognized, reach, id));
  }
  for (const [id, born, helped, harmed] of SEED_TILES) {
    stmts.push(db.prepare("UPDATE nominees SET born = COALESCE(born, ?), helped = COALESCE(helped, ?), harmed = COALESCE(harmed, ?) WHERE id = ? AND seeded = 1").bind(born, helped, harmed, id));
  }
  for (const m of SEED_MEDIA) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO media (id,nominee_id,role,path,alt,title,creator,made,license,license_url,source_page,source_file,credit,width,height,edits,retrieved_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(m.id, m.nominee, m.role, m.path, m.alt, m.title, m.creator, m.made, m.license, m.licenseUrl || null,
      m.sourcePage, m.sourceFile || null, m.credit, m.width || null, m.height || null, m.edits || null, m.retrieved, new Date().toISOString()));
  }
  for (const [id, nominee, sort, title, author, year, publisher, url, kind] of SEED_READINGS) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO readings (id,nominee_id,sort,title,author,year,publisher,url,kind,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, nominee, sort, title, author || null, year || null, publisher || null, url || null, kind || null, new Date().toISOString()));
  }
  for (const n of SEED_ADDED) {
    stmts.push(db.prepare(`INSERT OR IGNORE INTO nominees (id,slug,name,years,work,meant,solved,backfire,got_right,foresight,pattern,knowable,domain,harms,status,
        wiki_name,wiki_work,born,helped,harmed,author,seeded,state,created_at,category)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NULL,1,'approved',?,'')`).bind(n.id, n.id, n.name, n.years, n.work, n.meant, n.solved, n.backfire,
      n.gotRight, n.foresight, n.pattern, n.knowable, n.domain, n.harms, n.status, n.wikiName, n.wikiWork, n.born, n.helped, n.harmed, n.created));
  }
  stmts.push(db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES ('seeded','1')"));
  stmts.push(db.prepare("INSERT OR REPLACE INTO meta (key,value) VALUES ('schema_version', ?)").bind(String(SCHEMA_VERSION)));
  await db.batch(stmts);
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS nominees_slug ON nominees (slug)").run();
  // v5: catalog numbers, given once in the order nominees joined (Midgley is No. 1) and never reused.
  const noNum = await db.prepare("SELECT id FROM nominees WHERE catalog_no IS NULL ORDER BY created_at").all();
  for (const row of noNum.results) {
    await db.prepare("UPDATE nominees SET catalog_no = (SELECT COALESCE(MAX(catalog_no), 0) + 1 FROM nominees) WHERE id = ?").bind(row.id).run();
  }
  const noSlug = await db.prepare("SELECT id, name, seeded FROM nominees WHERE slug IS NULL ORDER BY created_at").all();
  for (const row of noSlug.results) {
    await db.prepare("UPDATE nominees SET slug = ? WHERE id = ?").bind(await freeSlug(db, row.seeded ? row.id : slugify(row.name)), row.id).run();
  }
}

// A slug nobody else has: "edward-bassett", then "edward-bassett-2" and so on.
async function freeSlug(db, base, exceptId = "") {
  for (let i = 1; i < 100; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const taken = await db.prepare("SELECT 1 FROM nominees WHERE slug = ? AND id != ?").bind(slug, exceptId).first();
    if (!taken) return slug;
  }
  return base + "-" + crypto.randomUUID().slice(0, 8);
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
  await db.prepare("DELETE FROM hits WHERE ts < ?").bind(now - 3600).run(); // keep these for one hour at most
  return false;
}

// Returns "" when the check passes, otherwise Cloudflare's reason code (safe to show; no secrets in it).
async function turnstileFail(request, env, token) {
  if (!env.TURNSTILE_SECRET) return "";
  if (!token) return "missing-token";
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const d = await r.json();
    if (d.success) return "";
    const code = (d["error-codes"] || []).join(",") || "unknown";
    console.log("turnstile failed", code, d.hostname || "");
    return code;
  } catch { return "unreachable"; }
}

function nomineeOut(r, admin = false) {
  const out = {
    id: r.id, name: r.name, years: r.years || "", work: r.work, solved: r.solved, backfire: r.backfire,
    knowable: r.knowable || "", domain: r.domain || "", harms: r.harms ? r.harms.split(",").filter(Boolean) : [],
    status: r.status || "", award: r.award || "", fix: r.fix || "", fixUrl: r.fix_url || "",
    wikiName: r.wiki_name || "", wikiWork: r.wiki_work || "",
    slug: r.slug || r.id, meant: r.meant || "", gotRight: r.got_right || "", foresight: r.foresight || "",
    pattern: r.pattern || "", source1: r.source1 || "", source2: r.source2 || "",
    catalogNo: r.catalog_no || null, began: r.began || null, recognized: r.recognized || null, reach: r.reach ?? null,
    born: r.born || null, helped: r.helped ?? null, harmed: r.harmed ?? null,
    herdYes: r.herd_yes || 0, herdTotal: r.herd_total || 0,
    oops: r.oops_judges >= MIN_JUDGES ? Math.round(r.oops_avg) : null, oopsJudges: r.oops_judges >= MIN_JUDGES ? r.oops_judges : 0,
    author: r.author || "", seeded: !!r.seeded, createdAt: r.created_at, score: r.score || 0,
  };
  if (admin) {
    out.state = r.state || "approved"; out.reports = r.reports || 0; out.legacyCategory = r.category || "";
    out.judgeCount = r.oops_judges || 0; out.judgeAvg = r.oops_judges ? Math.round(r.oops_avg) : null;
  }
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

// Nominees with their upvotes, Herd Score and Oops Score, plus visible comments.
async function loadNominees(db, where, withComments, admin = false) {
  const q = [
    db.prepare(`SELECT * FROM nominees WHERE ${where} ORDER BY created_at`),
    db.prepare(`SELECT nominee_id, COUNT(*) AS c FROM votes GROUP BY nominee_id`),
    db.prepare(`SELECT nominee_id, SUM(yes) AS y, COUNT(*) AS t FROM herd_votes GROUP BY nominee_id`),
    db.prepare(`SELECT nominee_id, AVG(score) AS a, COUNT(*) AS c FROM judge_scores GROUP BY nominee_id`),
  ];
  if (withComments) q.push(db.prepare(`SELECT id, nominee_id, text, author, created_at FROM comments WHERE COALESCE(hidden,0) = 0 ORDER BY created_at LIMIT 5000`));
  const [noms, votes, herd, judges, comments] = await db.batch(q);
  const by = (res) => Object.fromEntries(res.results.map((r) => [r.nominee_id, r]));
  const v = by(votes), h = by(herd), j = by(judges);
  return {
    nominees: noms.results.map((r) => nomineeOut({
      ...r, score: v[r.id] ? v[r.id].c : 0, herd_yes: h[r.id] ? h[r.id].y : 0, herd_total: h[r.id] ? h[r.id].t : 0,
      oops_avg: j[r.id] ? j[r.id].a : null, oops_judges: j[r.id] ? j[r.id].c : 0,
    }, admin)),
    comments: withComments ? comments.results.map((c) => commentOut(c)) : [],
  };
}

// A post anyone can vote on or comment on: an approved nominee or a featured Murphy.
const postExists = (db, id) => db.prepare(
  "SELECT 1 FROM nominees WHERE id = ? AND state = 'approved' UNION ALL SELECT 1 FROM murphys WHERE id = ? AND state = 'featured' LIMIT 1"
).bind(id, id).first();

async function loadMurphys(db) {
  const [ms, herd] = await db.batch([
    db.prepare("SELECT id, slug, fix, oops, name, created_at, featured_at FROM murphys WHERE state = 'featured' ORDER BY featured_at DESC LIMIT 200"),
    db.prepare("SELECT nominee_id, SUM(yes) AS y, COUNT(*) AS t FROM herd_votes WHERE nominee_id IN (SELECT id FROM murphys WHERE state = 'featured') GROUP BY nominee_id"),
  ]);
  const h = Object.fromEntries(herd.results.map((x) => [x.nominee_id, x]));
  return ms.results.map((m) => ({ id: m.id, slug: m.slug, fix: m.fix, oops: m.oops, name: m.name || "", createdAt: m.featured_at || m.created_at,
    herdYes: h[m.id] ? h[m.id].y : 0, herdTotal: h[m.id] ? h[m.id].t : 0 }));
}

async function getState(db, url, ctx) {
  const key = stateCacheKey(url);
  try {
    const hit = await caches.default.match(key);
    if (hit) return hit;
  } catch {}
  const { nominees, comments } = await loadNominees(db, "state = 'approved'", true);
  const murphys = await loadMurphys(db);
  const body = JSON.stringify({
    nominees,
    murphys,
    comments,
    generatedAt: new Date().toISOString(),
  });
  const res = new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${STATE_TTL}` },
  });
  try { ctx.waitUntil(caches.default.put(key, res.clone())); } catch {}
  return res;
}

// Copies of each submission go to outside services when their settings exist. The site's database stays the record.
//   FORMSPREE_SUBSCRIBE, FORMSPREE_MURPHY, FORMSPREE_NOMINATION: a Formspree form id (the part after /f/)
//   MAILCHIMP_API_KEY (secret) + MAILCHIMP_AUDIENCE_ID: adds Weekly Oops sign-ups to the Mailchimp audience
//   BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID: adds newsletter sign-ups to Beehiiv
async function forward(env, kind, data) {
  const jobs = [];
  const fs = { subscribe: env.FORMSPREE_SUBSCRIBE, murphy: env.FORMSPREE_MURPHY, nomination: env.FORMSPREE_NOMINATION }[kind];
  if (fs) {
    jobs.push(fetch(`https://formspree.io/f/${fs}`, {
      method: "POST", headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ ...data, _subject: `Backfire Awards: new ${kind}` }),
    }));
  }
  // Mailchimp, directly (Formspree only connects to it on a paid plan). "pending" sends Mailchimp's
  // confirm-your-email message, so only real addresses reach the list.
  if (kind === "subscribe" && env.MAILCHIMP_API_KEY && env.MAILCHIMP_AUDIENCE_ID) {
    const dc = env.MAILCHIMP_API_KEY.split("-").pop();
    jobs.push(fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_AUDIENCE_ID}/members`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Basic " + btoa("site:" + env.MAILCHIMP_API_KEY) },
      body: JSON.stringify({ email_address: data.email, status: "pending", tags: ["Backfire Awards"], merge_fields: {} }),
    }).then(async (r) => {
      const body = r.ok ? "" : (await r.text()).slice(0, 300);
      console.log("mailchimp", r.status, body);
      // Already on the list (from another signup source): just add the Backfire Awards tag.
      if (r.status === 400 && body.includes("Member Exists")) {
        const hash = [...new Uint8Array(await crypto.subtle.digest("MD5", new TextEncoder().encode(data.email.toLowerCase())))]
          .map((b) => b.toString(16).padStart(2, "0")).join("");
        const t = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_AUDIENCE_ID}/members/${hash}/tags`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: "Basic " + btoa("site:" + env.MAILCHIMP_API_KEY) },
          body: JSON.stringify({ tags: [{ name: "Backfire Awards", status: "active" }] }),
        });
        console.log("mailchimp tag existing member", t.status);
      }
    }).catch((e) => console.log("mailchimp failed", String(e))));
  }
  if (kind === "subscribe" && env.BEEHIIV_API_KEY && env.BEEHIIV_PUBLICATION_ID) {
    jobs.push(fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.BEEHIIV_API_KEY}` },
      body: JSON.stringify({ email: data.email, utm_source: data.utm_source || "site", send_welcome_email: true, reactivate_existing: false }),
    }));
  }
  const results = await Promise.allSettled(jobs);
  results.forEach((x) => { if (x.status === "rejected" || (x.value && !x.value.ok)) console.error("forward failed", kind, x.reason || x.value.status); });
}

// "Fritz Haber", "haber, fritz" and "Dr. Fritz Haber" all reduce to the same words.
const normName = (s) => String(s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/\b(dr|sir|mr|mrs|ms|jr|sr|the|inc|co|corp|company)\b\.?/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
// A match when every word typed so far starts a word of the name, and the surname (last word) is among them.
function nameMatches(name, q) {
  const nw = name.split(" "), qw = q.split(" ").filter(Boolean);
  if (!qw.length) return false;
  return qw.every((w) => nw.some((x) => x.startsWith(w))) && (qw.length > 1 || nw[nw.length - 1].startsWith(qw[0]) || nw.length === 1);
}
async function findDuplicate(db, name) {
  const q = normName(name);
  if (!q) return null;
  const rows = await db.prepare("SELECT name, work, slug, state FROM nominees WHERE state IN ('approved','pending')").all();
  return rows.results.find((r) => normName(r.name) === q) || null;
}

async function insertNominee(db, n, state) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const slug = await freeSlug(db, slugify(n.name));
  await db.prepare(
    `INSERT INTO nominees (id,slug,name,years,work,meant,solved,backfire,got_right,foresight,pattern,domain,harms,knowable,status,award,
       fix,fix_url,wiki_name,wiki_work,source1,source2,born,helped,harmed,author,seeded,state,created_at,category,catalog_no)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?,'',(SELECT COALESCE(MAX(catalog_no), 0) + 1 FROM nominees))`
  ).bind(id, slug, n.name, n.years, n.work, n.meant || null, n.solved, n.backfire, n.gotRight || null, n.foresight || null, n.pattern || null,
    n.domain || null, n.harms || null, n.knowable || null, n.status || null, n.award || null,
    n.fix || null, n.fixUrl || null, n.wikiName || null, n.wikiWork || null, n.source1 || null, n.source2 || null,
    n.born || null, n.helped ?? null, n.harmed ?? null, n.author, state, createdAt).run();
  const num = await db.prepare("SELECT catalog_no FROM nominees WHERE id = ?").bind(id).first();
  return nomineeOut({
    id, slug, ...n, got_right: n.gotRight, fix_url: n.fixUrl, wiki_name: n.wikiName, wiki_work: n.wikiWork,
    created_at: createdAt, seeded: 0, score: 0, catalog_no: num && num.catalog_no,
  });
}

async function handleApi(request, env, url, ctx) {
  const db = findD1(env);
  if (!db) return bad("Database not connected. In Cloudflare: Settings → Bindings, add a D1 database binding for Production, then redeploy.", 503);
  await ensureSchema(db);
  const path = url.pathname.replace(/\/+$/, "");
  const method = request.method;

  if (path === "/api/config" && method === "GET") {
    return json({ turnstileSiteKey: env.TURNSTILE_SECRET ? env.TURNSTILE_SITE_KEY || "" : "", autoApprove: env.AUTO_APPROVE === "1", flags: flagsOf(env) });
  }

  if (path === "/api/state" && method === "GET") return getState(db, url, ctx);

  if (path === "/api/my-votes" && method === "GET") {
    const voter = url.searchParams.get("voter") || "";
    if (!VOTER_RE.test(voter)) return json({ myVotes: [], myHerd: {} });
    const [r, h] = await db.batch([
      db.prepare("SELECT nominee_id FROM votes WHERE voter = ?").bind(voter),
      db.prepare("SELECT nominee_id, yes FROM herd_votes WHERE voter = ?").bind(voter),
    ]);
    return json({ myVotes: r.results.map((x) => x.nominee_id), myHerd: Object.fromEntries(h.results.map((x) => [x.nominee_id, !!x.yes])) });
  }

  if (path === "/api/nominees" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read the submission.");
    if (b.website) return json({ status: "pending" }); // honeypot
    { const tf = await turnstileFail(request, env, b.turnstile); if (tf) return bad(`The human check didn't go through (${tf}). Try again.`, 403); }
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
    n.meant = clean(b.meant, 600);
    const dupe = await findDuplicate(db, n.name);
    if (dupe) return json({ error: `${dupe.name} is already nominated.`, existing: { name: dupe.name, work: dupe.work, path: dupe.state === "approved" ? "/n/" + dupe.slug : "" } }, 409);
    const state = env.AUTO_APPROVE === "1" ? "approved" : "pending";
    const created = await insertNominee(db, n, state);
    ctx.waitUntil(forward(env, "nomination", { name: n.name, work: n.work, solved: n.solved, backfire: n.backfire, domain: n.domain, author: n.author }));
    if (state === "approved") await bustState(url);
    return json({ status: state, nominee: state === "approved" ? created : null }, 201);
  }

  // Nominees whose name looks like the query, for the Nominate form's "already nominated" check.
  if (path === "/api/match" && method === "GET") {
    const q = normName(url.searchParams.get("q") || "");
    if (q.length < 3) return json({ matches: [] });
    const rows = await db.prepare("SELECT name, work, slug FROM nominees WHERE state = 'approved'").all();
    const matches = rows.results.filter((r) => nameMatches(normName(r.name), q)).slice(0, 5)
      .map((r) => ({ name: r.name, work: r.work, path: "/n/" + r.slug }));
    return json({ matches });
  }

  if (path === "/api/vote" && method === "POST") {
    const b = await readBody(request);
    const nomineeId = clean(b && b.nomineeId, 64);
    const voter = b && b.voter;
    if (!ID_RE.test(nomineeId) || !VOTER_RE.test(voter || "")) return bad("Invalid vote.");
    if (await rateLimited(db, request, env, "vote")) return bad("Slow down a little and try again shortly.", 429);
    const exists = await postExists(db, nomineeId);
    if (!exists) return bad("That nominee isn't available.", 404);
    const had = await db.prepare("SELECT 1 FROM votes WHERE nominee_id = ? AND voter = ?").bind(nomineeId, voter).first();
    if (had) await db.prepare("DELETE FROM votes WHERE nominee_id = ? AND voter = ?").bind(nomineeId, voter).run();
    else await db.prepare("INSERT OR IGNORE INTO votes (nominee_id, voter, created_at) VALUES (?,?,?)").bind(nomineeId, voter, new Date().toISOString()).run();
    const s = await db.prepare("SELECT COUNT(*) AS c FROM votes WHERE nominee_id = ?").bind(nomineeId).first();
    await bustState(url);
    return json({ voted: !had, score: s.c });
  }

  if (path === "/api/herd" && method === "POST") {
    if (!flagsOf(env).scores) return bad("Herd voting isn't open yet.", 404);
    const b = await readBody(request);
    const nomineeId = clean(b && b.nomineeId, 64);
    const voter = b && b.voter;
    const vote = b && b.vote; // "yes", "no", or "" to withdraw
    if (!ID_RE.test(nomineeId) || !VOTER_RE.test(voter || "") || !["yes", "no", ""].includes(vote)) return bad("Invalid vote.");
    if (await rateLimited(db, request, env, "vote")) return bad("Slow down a little and try again shortly.", 429);
    const exists = await postExists(db, nomineeId);
    if (!exists) return bad("That nominee isn't available.", 404);
    if (vote) {
      await db.prepare(`INSERT INTO herd_votes (nominee_id, voter, yes, created_at) VALUES (?,?,?,?)
        ON CONFLICT (nominee_id, voter) DO UPDATE SET yes = excluded.yes, created_at = excluded.created_at`)
        .bind(nomineeId, voter, vote === "yes" ? 1 : 0, new Date().toISOString()).run();
    } else {
      await db.prepare("DELETE FROM herd_votes WHERE nominee_id = ? AND voter = ?").bind(nomineeId, voter).run();
    }
    const t = await db.prepare("SELECT COALESCE(SUM(yes),0) AS y, COUNT(*) AS t FROM herd_votes WHERE nominee_id = ?").bind(nomineeId).first();
    await bustState(url);
    return json({ vote, herdYes: t.y, herdTotal: t.t });
  }

  if (path === "/api/subscribe" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read that.");
    if (b.website) return json({ ok: true });
    const email = clean(b.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return bad("That email address doesn't look right.");
    { const tf = await turnstileFail(request, env, b.turnstile); if (tf) return bad(`The human check didn't go through (${tf}). Try again.`, 403); }
    if (await rateLimited(db, request, env, "subscribe")) return bad("Try again in a few minutes.", 429);
    await db.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)").bind(email, new Date().toISOString()).run();
    ctx.waitUntil(forward(env, "subscribe", { email, utm_source: clean(b.utm, 60) }));
    return json({ ok: true });
  }

  if (path === "/api/murphys" && method === "POST") {
    const b = await readBody(request);
    if (!b) return bad("Couldn't read that.");
    if (b.website) return json({ ok: true }, 201); // honeypot
    { const tf = await turnstileFail(request, env, b.turnstile); if (tf) return bad(`The human check didn't go through (${tf}). Try again.`, 403); }
    if (await rateLimited(db, request, env, "murphy")) return bad("That's a lot of Murphys at once. Try again in a few minutes.", 429);
    const fix = clean(b.fix, 600), oops = clean(b.oops, 600), name = clean(b.name, 40), utm = clean(b.utm, 60);
    const email = clean(b.email, 254).toLowerCase();
    if (!fix || !oops) return bad("Tell us what was fixed and what went oops.");
    if (email && !EMAIL_RE.test(email)) return bad("That email address doesn't look right.");
    await db.prepare("INSERT INTO murphys (id,fix,oops,name,email,utm_source,state,created_at) VALUES (?,?,?,?,?,?,'new',?)")
      .bind(crypto.randomUUID(), fix, oops, name || null, email || null, utm || null, new Date().toISOString()).run();
    ctx.waitUntil(forward(env, "murphy", { fix, oops, name, email, utm_source: utm }));
    return json({ ok: true }, 201);
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
    const exists = await postExists(db, nomineeId);
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
    const kind = b && ["comment", "nominee", "murphy"].includes(b.kind) ? b.kind : "";
    const id = clean(b && b.id, 64);
    const voter = b && b.voter;
    if (!kind || !ID_RE.test(id) || !VOTER_RE.test(voter || "")) return bad("Invalid report.");
    if (await rateLimited(db, request, env, "report")) return bad("Too many reports at once. Try again later.", 429);
    const table = { comment: "comments", nominee: "nominees", murphy: "" }[kind]; // Murphy reports are kept in reports only
    const ins = await db.prepare("INSERT OR IGNORE INTO reports (kind, target_id, reporter, reason, created_at) VALUES (?,?,?,?,?)")
      .bind(kind, id, voter, clean(b.reason, 200), new Date().toISOString()).run();
    if (ins.meta && ins.meta.changes) {
      if (table) await db.prepare(`UPDATE ${table} SET reports = COALESCE(reports,0) + 1 WHERE id = ?`).bind(id).run();
      if (kind === "comment") {
        const r = await db.prepare("UPDATE comments SET hidden = 1 WHERE id = ? AND reports >= ? AND hidden = 0").bind(id, REPORTS_TO_HIDE).run();
        if (r.meta && r.meta.changes) await bustState(url);
      }
    }
    return json({ ok: true });
  }

  if (path.startsWith("/api/admin")) return handleAdmin(request, env, url, db, path, method);

  return bad("Not found.", 404);
}

// ---------------------------------------------------------------- admin API

// With Cloudflare Access in front of /admin, the signed-in email names the judge.
const accessEmail = (request) => clean(request.headers.get("cf-access-authenticated-user-email") || "", 60);

const yearOf = (v) => { const y = parseInt(v, 10); return y >= -3000 && y <= 2100 ? y : null; };
const reachOf = (v) => { const r = parseInt(v, 10); return r >= 0 && r <= 10 ? r : null; };

function adminFields(b, create) {
  const n = {
    name: clean(b.name, 80), years: clean(b.years, 30), work: clean(b.work, 120), meant: clean(b.meant, 600),
    solved: clean(b.solved, 600), backfire: clean(b.backfire, 600), gotRight: clean(b.gotRight, 600),
    foresight: clean(b.foresight, 600), pattern: clean(b.pattern, 200),
    domain: pick(b.domain, DOMAINS), harms: pickMany(b.harms, HARMS), knowable: pick(b.knowable, KNOWABLE),
    status: pick(b.status, STATUSES), award: pick(b.award, AWARDS), fix: clean(b.fix, 400), fixUrl: cleanUrl(b.fixUrl),
    source1: cleanUrl(b.source1), source2: cleanUrl(b.source2), wikiName: cleanWiki(b.wikiName), wikiWork: cleanWiki(b.wikiWork),
    author: clean(b.author, 60),
    born: yearOf(b.born), helped: reachOf(b.helped), harmed: reachOf(b.harmed),
  };
  if (n.wikiName === null || n.wikiWork === null) return { error: "Wikipedia links have to point to a page on wikipedia.org." };
  return n;
}

async function handleAdmin(request, env, url, db, path, method) {
  if (!env.ADMIN_TOKEN) return bad("Moderation is off. Add an ADMIN_TOKEN secret in the Pages project settings and redeploy.", 503);
  if (!isAdmin(request, env)) return bad("Wrong admin token.", 401);

  if (path === "/api/admin/overview" && method === "GET") {
    const { nominees } = await loadNominees(db, "1 = 1", false, true);
    const [comments, subs, judges, votes] = await db.batch([
      db.prepare("SELECT c.*, n.name AS nominee_name FROM comments c LEFT JOIN nominees n ON n.id = c.nominee_id WHERE COALESCE(c.reports,0) > 0 OR COALESCE(c.hidden,0) = 1 ORDER BY c.created_at DESC LIMIT 500"),
      db.prepare("SELECT COUNT(*) AS c FROM subscribers"),
      db.prepare("SELECT nominee_id, judge, score FROM judge_scores ORDER BY judge"),
      db.prepare("SELECT (SELECT COUNT(*) FROM votes) AS up, (SELECT COUNT(*) FROM herd_votes) AS herd"),
    ]);
    return json({
      nominees: nominees.reverse(),
      judgeScores: judges.results,
      judge: accessEmail(request),
      flags: flagsOf(env),
      voteCounts: votes.results[0],
      flaggedComments: comments.results.map((c) => ({ ...commentOut(c, true), nomineeName: c.nominee_name || "" })),
      subscriberCount: subs.results[0].c,
    });
  }

  // Create a nominee directly, published (for the team's write-ups).
  if (path === "/api/admin/nominees" && method === "POST") {
    const b = (await readBody(request)) || {};
    const n = adminFields(b, true);
    if (n.error) return bad(n.error);
    if (!n.name || !n.work || !n.solved || !n.backfire) return bad("Fill in the nominee, the achievement, what went right and what went oops.");
    const created = await insertNominee(db, { ...n, author: n.author || "Goat Farm" }, "approved");
    await bustState(url);
    return json({ nominee: created }, 201);
  }

  // A judge's Oops Score for one nominee, 1 to 100. An empty score removes it.
  if (path === "/api/admin/scores" && method === "PUT") {
    const b = (await readBody(request)) || {};
    const nomineeId = clean(b.nomineeId, 64);
    const judge = accessEmail(request) || clean(b.judge, 60);
    if (!ID_RE.test(nomineeId)) return bad("Pick a nominee.");
    if (!judge) return bad("Type your judge name first.");
    if (b.score === "" || b.score == null) {
      await db.prepare("DELETE FROM judge_scores WHERE nominee_id = ? AND judge = ?").bind(nomineeId, judge).run();
    } else {
      const score = Math.round(Number(b.score));
      if (!(score >= 1 && score <= 100)) return bad("Scores go from 1 to 100.");
      await db.prepare(`INSERT INTO judge_scores (nominee_id, judge, score, created_at) VALUES (?,?,?,?)
        ON CONFLICT (nominee_id, judge) DO UPDATE SET score = excluded.score, created_at = excluded.created_at`)
        .bind(nomineeId, judge, score, new Date().toISOString()).run();
    }
    await bustState(url);
    return json({ ok: true, judge });
  }

  // Launch: remove every upvote and Herd vote cast before launch.
  if (path === "/api/admin/clear-votes" && method === "POST") {
    const b = (await readBody(request)) || {};
    if (b.confirm !== "CLEAR") return bad("Send confirm: CLEAR to remove all votes.");
    await db.batch([db.prepare("DELETE FROM votes"), db.prepare("DELETE FROM herd_votes")]);
    await bustState(url);
    return json({ ok: true });
  }

  if (path === "/api/admin/murphys" && method === "GET") {
    const r = await db.prepare("SELECT * FROM murphys ORDER BY created_at DESC LIMIT 1000").all();
    if (url.searchParams.get("format") === "csv") {
      const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = [["created_at", "state", "name", "email", "utm_source", "fix", "oops"], ...r.results.map((m) => [m.created_at, m.state, m.name, m.email, m.utm_source, m.fix, m.oops])];
      return new Response(rows.map((row) => row.map(cell).join(",")).join("\n"), {
        headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="murphys.csv"', "cache-control": "no-store" },
      });
    }
    return json({ murphys: r.results });
  }
  const mm = path.match(/^\/api\/admin\/murphys\/([A-Za-z0-9-]{1,64})$/);
  if (mm && method === "PATCH") {
    const b = (await readBody(request)) || {};
    if (!["new", "featured", "archived"].includes(b.state)) return bad("State must be new, featured or archived.");
    if (b.state === "featured") {
      const m = await db.prepare("SELECT slug, fix FROM murphys WHERE id = ?").bind(mm[1]).first();
      if (m && !m.slug) {
        let slug = slugify(m.fix.split(/\s+/).slice(0, 6).join(" "));
        for (let i = 2; await db.prepare("SELECT 1 FROM murphys WHERE slug = ?").bind(slug).first(); i++) slug = slugify(m.fix.split(/\s+/).slice(0, 6).join(" ")) + "-" + i;
        await db.prepare("UPDATE murphys SET slug = ?, featured_at = COALESCE(featured_at, ?) WHERE id = ?").bind(slug, new Date().toISOString(), mm[1]).run();
      }
    }
    await db.prepare("UPDATE murphys SET state = ? WHERE id = ?").bind(b.state, mm[1]).run();
    await bustState(url);
    return json({ ok: true });
  }

  if (path === "/api/admin/subscribers" && method === "GET") {
    const r = await db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at").all();
    return json({ subscribers: r.results });
  }

  let m = path.match(/^\/api\/admin\/nominees\/([A-Za-z0-9-]{1,64})$/);
  if (m && method === "PATCH") {
    const b = (await readBody(request)) || {};
    const sets = [], vals = [];
    const text = { name: 80, years: 30, work: 120, meant: 600, solved: 600, backfire: 600, got_right: 600, foresight: 600, pattern: 200, fix: 400, author: 60 };
    for (const [k, max] of Object.entries(text)) {
      const key = k === "got_right" ? "gotRight" : k;
      if (key in b) { sets.push(`${k} = ?`); vals.push(clean(b[key], max) || null); }
    }
    if ("born" in b) { sets.push("born = ?"); vals.push(yearOf(b.born)); }
    if ("helped" in b) { sets.push("helped = ?"); vals.push(reachOf(b.helped)); }
    if ("harmed" in b) { sets.push("harmed = ?"); vals.push(reachOf(b.harmed)); }
    for (const [k, col] of [["fixUrl", "fix_url"], ["source1", "source1"], ["source2", "source2"]]) {
      if (k in b) { sets.push(`${col} = ?`); vals.push(cleanUrl(b[k]) || null); }
    }
    for (const [k, col] of [["wikiName", "wiki_name"], ["wikiWork", "wiki_work"]]) {
      if (!(k in b)) continue;
      const w = cleanWiki(b[k]);
      if (w === null) return bad("Wikipedia links have to point to a page on wikipedia.org.");
      sets.push(`${col} = ?`); vals.push(w || null);
    }
    if ("slug" in b) {
      const slug = slugify(b.slug);
      if (await db.prepare("SELECT 1 FROM nominees WHERE slug = ? AND id != ?").bind(slug, m[1]).first()) return bad("Another nominee already uses that address.");
      sets.push("slug = ?"); vals.push(slug);
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

// ---------------------------------------------------------------- pages

class SetAttr {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { el.setAttribute(this.attr, this.value); }
}
class SetText {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}
class SetHTML {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value, { html: true }); }
}
// Local runs have no build id; use the time the server started instead.
// (Workers report the time as 0 outside a request, so this is worked out on the first request.)
let devVer = "";
const ver = () => (BUILD !== "__BUILD__" ? BUILD : (devVer ||= "dev" + Date.now().toString(36)));
// "/styles.css" -> "/styles.css?v=<build>", so a new deploy is never hidden by a cached copy.
class Versioned {
  constructor(attr) { this.attr = attr; }
  element(el) { const v = el.getAttribute(this.attr); if (v && !v.includes("?")) el.setAttribute(this.attr, `${v}?v=${ver()}`); }
}
const LOOK_SCRIPT = `<script>(function(){var d=document.documentElement,k="bf.look",l=null,q=new URLSearchParams(location.search).get("look");
try{if(q==="70s"||q==="classic")localStorage.setItem(k,q);l=localStorage.getItem(k)}catch(e){}
l=l||d.getAttribute("data-look-default")||"classic";d.setAttribute("data-look",l)})()</script>`;
class Append {
  constructor(value) { this.value = value; }
  element(el) { el.append(this.value, { html: true }); }
}

// Every HTML page: shared header and footer, link-preview tags, analytics, and noindex off production.
function decorate(res, env, url, meta = {}, status = 0) {
  const flags = flagsOf(env);
  let rw = new HTMLRewriter()
    .on('link[rel="stylesheet"][href^="/"]', new Versioned("href"))
    .on('script[src^="/"]', new Versioned("src"))
    .on("#site-head", new SetHTML(headerHTML(flags)))
    .on("#site-foot", new SetHTML(footerHTML()))
    .on("body", new Append(sheetHTML()))
    .on("#weekly-oops", new SetHTML(signupHTML("home")))
    .on("#waitlist-embed", new SetHTML(waitlistHTML()))
    .on('meta[property="og:image"]', new SetAttr("content", SITE + "/og.png"))
    .on('meta[name="twitter:image"]', new SetAttr("content", SITE + "/og.png"))
    .on("body", new SetAttr("data-flags", [flags.scores && "scores", flags.categories && "categories"].filter(Boolean).join(" ")))
    // The site "look": classic, or the 1970s palette. LOOK_DEFAULT picks it per environment;
    // ?look=70s or ?look=classic overrides it for this browser (kept in localStorage).
    .on("html", new SetAttr("data-look-default", env.LOOK_DEFAULT === "70s" ? "70s" : "classic"))
    .on("head", new Append(LOOK_SCRIPT));
  if (url.hostname !== SITE_HOST) {
    rw = rw.on(".menu-in", new Append(`<section class="menu-look"><h2>Look (staging only)</h2><a href="?look=70s">1970s</a><a href="?look=classic">Classic</a></section>`));
  }
  if (meta.canonical) {
    rw = rw.on('meta[property="og:url"]', new SetAttr("content", meta.canonical))
      .on('link[rel="canonical"]', new SetAttr("href", meta.canonical));
  }
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
  for (const [sel, html] of Object.entries(meta.fill || {})) rw = rw.on(sel, new SetHTML(html));
  for (const [sel, spec] of Object.entries(meta.attrs || {})) {
    for (const [attr, value] of Array.isArray(spec[0]) ? spec : [spec]) rw = rw.on(sel, new SetAttr(attr, value));
  }
  if (env.CF_BEACON_TOKEN) {
    rw = rw.on("body", new Append(`<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${esc(JSON.stringify({ token: env.CF_BEACON_TOKEN }))}'></script>`));
  }
  const t = rw.transform(res);
  // Pages are built per request, so the template file's ETag says nothing about them: drop it,
  // or a browser revalidates, gets "not modified" and keeps showing an old page.
  const out = new Response(t.body, { status: status || t.status, headers: t.headers });
  out.headers.delete("etag");
  out.headers.set("cache-control", "no-cache");
  if (url.hostname !== SITE_HOST) out.headers.set("X-Robots-Tag", "noindex, nofollow");
  return out;
}

// A Tally form inside the page. Tally's embed script passes the page's utm_ tags to the form.
const tallyHTML = (id, title) =>
  `<iframe data-tally-src="https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" loading="lazy" width="100%" height="420" frameborder="0" title="${esc(title)}"></iframe>` +
  `<script async src="https://tally.so/widgets/embed.js" onload="Tally.loadEmbeds()"></script>`;
const waitlistHTML = () => tallyHTML(LINKS.waitlistForm, "Shop waitlist");

// A plain request for a page template: no conditional headers, so the answer is always the file itself.
const asset = (env, url, request, path) => env.ASSETS.fetch(new URL(path, url).toString());

async function siteState(env, url, ctx) {
  const db = findD1(env);
  if (!db) return null;
  try {
    await ensureSchema(db);
    return await (await getState(db, url, ctx)).json();
  } catch (e) {
    console.error(e && e.stack);
    return null;
  }
}

function listHTML(noms, comments, flags) {
  if (!noms.length) return `<p class="empty">No nominees here yet. Submit the first.</p>`;
  const ranked = [...noms].sort(byTop(flags));
  const ccount = {};
  comments.forEach((c) => (ccount[c.nomineeId] = (ccount[c.nomineeId] || 0) + 1));
  return ranked.map((n) => nomCardHTML(n, flags)).join("");
}

async function homePage(request, env, url, ctx, category) {
  const flags = flagsOf(env);
  const st = await siteState(env, url, ctx);
  const all = st ? st.nominees.filter((n) => n.id !== HONOREE) : [];
  const counts = {};
  all.forEach((n) => n.domain && (counts[n.domain] = (counts[n.domain] || 0) + 1));
  const noms = category ? all.filter((n) => n.domain === category) : all;
  const fill = {};
  if (st) fill[category ? "#list" : "#feed-posts"] = category ? listHTML(noms, st.comments, flags) : await feedHTML(request, env, url, st);
  if (flags.categories) fill["#cats"] = categoryChipsHTML(category, counts);
  const page = await asset(env, url, request, category ? "/category-page" : "/");
  if (!category) return decorate(page, env, url, { canonical: SITE + "/", fill });
  const name = DOMAIN_LABELS[category];
  const path = `/category/${CATEGORY_SLUGS[category]}`;
  fill["#cat-title"] = esc(name);
  return decorate(page, env, url, {
    canonical: SITE + path, title: `${name} · The Backfire Awards`,
    desc: `Nominees in ${name}: inventions and decisions that solved one problem and caused another.`,
    fill, attrs: { body: ["data-category", category] },
  });
}

async function nomineePage(request, env, url, ctx, key) {
  const st = await siteState(env, url, ctx);
  const n = st && st.nominees.find((x) => x.slug === key || x.id === key);
  if (!n) {
    const page = await asset(env, url, request, "/nominee");
    return decorate(page, env, url, {
      title: "Nominee not found · The Backfire Awards",
      fill: { "#list": `<p class="notice">That nominee isn't on the list. It may still be waiting for review. <a href="/">See all nominees</a>.</p>` },
    }, 404);
  }
  if (n.id === HONOREE) return Response.redirect(SITE_ORIGIN(url) + "/midgley", 301);
  if (key !== n.slug) return Response.redirect(SITE_ORIGIN(url) + nomineePath(n), 301);
  const flags = flagsOf(env);
  const thread = st.comments.filter((c) => c.nomineeId === n.id);
  const page = await asset(env, url, request, "/nominee");
  const pct = herdPct(n);
  const scores = flags.scores ? [n.oops != null ? `Oops Score ${n.oops}` : "", pct != null ? `Herd Score ${pct}%` : ""].filter(Boolean).join(", ") : "";
  return decorate(page, env, url, {
    canonical: SITE + nomineePath(n),
    title: `${n.name}: ${n.work} · The Backfire Awards`,
    desc: `${scores ? scores + ". " : ""}Nominated for outstanding achievement in unintended consequences. ${n.backfire}`.slice(0, 280),
    fill: {
      "#list": postHTML(n, { flags, thread, open: true, carousel: await carouselFor(request, env, url, n), more: await moreFor(env, n) }),
      "#more-feed": `<h2 class="feed-h">More backfires</h2>` + await feedHTML(request, env, url, st, n.id),
    },
    attrs: { body: [["data-nominee", n.id], ["data-bg", "cat"], ["style", `--scene:url(${sceneOf(n)});--cat:${jewelVar(jewelOf(n.domain), "deep")}`]] },
  });
}

async function murphyPage(request, env, url, ctx, key) {
  const st = await siteState(env, url, ctx);
  const m = st && (st.murphys || []).find((x) => x.slug === key);
  const page = await asset(env, url, request, "/nominee");
  if (!m) return decorate(page, env, url, { title: "Not found · The Backfire Awards", fill: { "#list": `<p class="notice">That Murphy isn't here. <a href="/">See the feed</a>.</p>` } }, 404);
  return decorate(page, env, url, {
    canonical: SITE + murphyPath(m),
    title: `A Murphy: ${m.fix.slice(0, 60)} · The Backfire Awards`,
    desc: `A Murphy: an everyday backfire. ${m.fix.replace(/[.!?]?$/, ".")} ${m.oops}`.slice(0, 280),
    fill: {
      "#list": murphyPostHTML(m, { flags: flagsOf(env), thread: st.comments.filter((c) => c.nomineeId === m.id), open: true }),
      "#more-feed": `<h2 class="feed-h">More backfires</h2>` + await feedHTML(request, env, url, st, m.id),
    },
    attrs: { body: [["data-nominee", m.id], ["data-bg", "cat"], ["style", "--scene:url(/img/scenes/murphy.jpg);--cat:#0B2230"]] },
  });
}

// /midgley: the namesake's post (he holds the first award), then the award and his story.
async function honoreePage(request, env, url, ctx) {
  const st = await siteState(env, url, ctx);
  const n = st && st.nominees.find((x) => x.id === HONOREE);
  const page = await asset(env, url, request, "/midgley");
  if (!n) return decorate(page, env, url, { canonical: SITE + "/midgley" });
  const flags = flagsOf(env);
  return decorate(page, env, url, {
    canonical: SITE + "/midgley",
    fill: {
      "#mg-post": postHTML(n, { flags, thread: st.comments.filter((c) => c.nomineeId === n.id), open: true, carousel: await carouselFor(request, env, url, n), more: await moreFor(env, n) }),
      "#more-feed": `<h2 class="feed-h">More backfires</h2>` + await feedHTML(request, env, url, st, n.id),
    },
    attrs: { body: [["data-nominee", n.id], ["data-bg", "cat"], ["style", `--scene:url(${sceneOf(n)});--cat:${jewelVar(jewelOf(n.domain), "deep")}`]] },
  });
}

// Design lab (staging and local only): the carousel for one nominee, the table and the palette.
async function labPage(request, env, url, ctx, key) {
  const st = await siteState(env, url, ctx);
  const n = st && st.nominees.find((x) => x.slug === key || x.id === key);
  const data = await asset(env, url, request, `/carousels/${key}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const page = await asset(env, url, request, "/lab");
  const used = Object.values(CATEGORY_JEWEL);
  const swatches = JEWELS.map((j) => {
    const cat = Object.keys(CATEGORY_JEWEL).find((k) => CATEGORY_JEWEL[k] === j.name);
    return `<div class="swatch"><div class="bar"><span style="background:${j.deep}"></span><span style="background:${j.base}"></span><span style="background:${j.light}"></span></div>
      <p><b>${j.name}</b><br>${cat ? esc(DOMAIN_LABELS[cat]) : used.includes(j.name) ? "" : "Free for a new category"}<br>${j.deep} · ${j.base} · ${j.light}</p></div>`;
  }).join("");
  const fill = {
    "#lab-swatches": swatches,
    "#lab-table": st ? tableHTML(st.nominees) : "",
    "#lab-title": esc(n ? `Carousel: ${n.name}` : "Carousel"),
    "#lab-note": n && data ? "Square cards at Instagram's 1:1 ratio. Swipe, use the arrows, or the arrow keys." : `No carousel written for “${esc(key)}” yet.`,
  };
  if (n && data) fill["#lab-carousel"] = carouselHTML(n, data, flagsOf(env));
  if (n) fill["#lab-key"] = keyHTML(n);
  const db = findD1(env);
  if (n && db) {
    const media = await db.prepare("SELECT * FROM media WHERE nominee_id = ? ORDER BY role").bind(n.id).all().catch(() => ({ results: [] }));
    fill["#lab-media"] = media.results.length ? `<table class="prov"><thead><tr><th>Image</th><th>Title and maker</th><th>License</th><th>Source</th></tr></thead><tbody>${media.results.map((m) =>
      `<tr><td><img src="${esc(m.path)}" alt="" width="72"></td><td><b>${esc(m.title)}</b><br>${esc(m.creator || "")}, ${esc(m.made || "")}<br><small>${esc(m.edits || "")}</small></td><td>${esc(m.license)}</td><td><a href="${esc(m.source_page)}" target="_blank" rel="noopener">Wikimedia Commons</a><br><small>Retrieved ${esc(m.retrieved_at)}</small></td></tr>`).join("")}</tbody></table>` : "<p>No image records yet.</p>";
  }
  return decorate(page, env, url, { title: `Lab: ${n ? n.name : key} · The Backfire Awards`, fill });
}

// Hand-written carousels live in /carousels/<slug>.json; every other nominee gets one built from its write-up.
const HANDWRITTEN = new Set(["haber", "midgley"]);
const carouselCache = new Map();
async function carouselFor(request, env, url, n) {
  if (!HANDWRITTEN.has(n.slug)) return carouselHTML(n, autoCarousel(n), flagsOf(env));
  if (!carouselCache.has(n.slug)) {
    // A plain request (no browser cache headers), so the answer is the file itself, never "not modified".
    const data = await env.ASSETS.fetch(new URL(`/carousels/${n.slug}.json`, url).toString()).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (data) carouselCache.set(n.slug, data);
    else return carouselHTML(n, autoCarousel(n), flagsOf(env));
  }
  return carouselHTML(n, carouselCache.get(n.slug) || autoCarousel(n), flagsOf(env));
}

// The full write-up behind "more": the seven sections, further reading and image credits.
async function moreFor(env, n) {
  const parts = [writeupHTML(n)];
  const db = findD1(env);
  if (db) {
    const [media, reads] = await db.batch([
      db.prepare("SELECT * FROM media WHERE nominee_id = ? ORDER BY role"),
      db.prepare("SELECT * FROM readings WHERE nominee_id = ? ORDER BY sort"),
    ].map((q) => q.bind(n.id))).catch(() => [{ results: [] }, { results: [] }]);
    if (reads.results.length) {
      parts.push(`<section><h2>Further reading</h2><ul class="reading">${reads.results.map((x) => {
        const t = x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>` : `<cite>${esc(x.title)}</cite>`;
        return `<li>${t}<span>${esc([x.author, x.publisher, x.year].filter(Boolean).join(", "))}${x.kind ? ` · ${esc(x.kind)}` : ""}</span></li>`;
      }).join("")}</ul></section>`);
    }
    if (media.results.length) {
      parts.push(`<section><h2>Image credits</h2><ul class="credits">${media.results.map((m) =>
        `<li><img src="${esc(m.path)}" alt="" width="64" height="64" loading="lazy"><div><b>${esc(m.title)}</b><span>${esc([m.creator, m.made].filter(Boolean).join(", "))}. ${esc(m.license)}.${m.edits ? ` ${esc(m.edits)}.` : ""}</span><a href="${esc(m.source_page)}" target="_blank" rel="noopener">Source</a></div></li>`).join("")}</ul></section>`);
    }
  }
  return parts.join("");
}

// The feed: nominees by the top sort, with a featured Murphy after every third.
async function feedHTML(request, env, url, st, exclude = "") {
  const flags = flagsOf(env);
  const noms = st.nominees.filter((x) => x.id !== HONOREE && x.id !== exclude).sort(byTop(flags));
  const murphys = (st.murphys || []).filter((m) => m.id !== exclude);
  const thread = (id) => st.comments.filter((c) => c.nomineeId === id);
  const out = [];
  let mi = 0;
  for (let i = 0; i < noms.length; i++) {
    const n = noms[i];
    out.push(postHTML(n, { flags, thread: thread(n.id), carousel: await carouselFor(request, env, url, n), more: writeupHTML(n) }));
    if (i === 4) out.push(feedOopsHTML());
    if ((i + 1) % 3 === 0 && mi < murphys.length) { const m = murphys[mi++]; out.push(murphyPostHTML(m, { flags, thread: thread(m.id) })); }
  }
  while (mi < murphys.length) { const m = murphys[mi++]; out.push(murphyPostHTML(m, { flags, thread: thread(m.id) })); }
  return out.join("");
}

// Links on a non-production host stay on that host, so staging and previews keep working.
const SITE_ORIGIN = (url) => (url.hostname === SITE_HOST ? SITE : url.origin);

async function sitemap(env, url, ctx) {
  const flags = flagsOf(env);
  const st = await siteState(env, url, ctx);
  const paths = ["/", "/search", "/table", "/midgley", "/murphy", "/awards", "/goat", "/shop", "/scores", "/guidelines", "/privacy", "/terms"];
  if (flags.categories) Object.values(CATEGORY_SLUGS).forEach((s) => paths.push("/category/" + s));
  if (st) st.nominees.filter((n) => n.id !== HONOREE).forEach((n) => paths.push(nomineePath(n)));
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n") + `\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}

// /micro sends people to the Murphy form, keeping utm_ tags so the form can record where they came from.
function microRedirect(url) {
  if (!LINKS.microForm) return null;
  const to = new URL(LINKS.microForm);
  for (const [k, v] of url.searchParams) if (k.startsWith("utm_")) to.searchParams.set(k, v);
  return Response.redirect(to.toString(), 302);
}

// ---------------------------------------------------------------- entry

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (FORWARD_HOSTS.includes(url.hostname)) return Response.redirect(SITE + url.pathname + url.search, 301);
    if (STAGING_FORWARD[url.hostname]) return Response.redirect(STAGING_FORWARD[url.hostname] + url.pathname + url.search, 301);
    // Staging and previews live behind Cloudflare Access. This is a stopgap for a host that was never added
    // to the Access app: it only checks that Access's header is present, which a determined visitor could fake.
    // Access itself is the real lock.
    if (url.hostname !== SITE_HOST && !/^(localhost|127\.0\.0\.1)$/.test(url.hostname) && !request.headers.get("cf-access-jwt-assertion"))
      return new Response("This address is private.", { status: 403, headers: { "content-type": "text/plain", "X-Robots-Tag": "noindex" } });
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url, ctx);
      } catch (e) {
        console.error(e && e.stack);
        return bad("Server error. Try again in a moment.", 500);
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD") return env.ASSETS.fetch(request);
    const p = url.pathname.replace(/\/+$/, "") || "/";
    const flags = flagsOf(env);

    if (p === "/" || p === "/index.html") return homePage(request, env, url, ctx, "");
    const n = p.match(/^\/n\/([A-Za-z0-9-]{1,64})$/);
    if (n) return nomineePage(request, env, url, ctx, n[1]);
    const mu = p.match(/^\/m\/([a-z0-9-]{1,80})$/);
    if (mu) return murphyPage(request, env, url, ctx, mu[1]);
    if (p === "/category") return flags.categories ? Response.redirect(SITE_ORIGIN(url) + "/#cats", 302) : Response.redirect(SITE_ORIGIN(url) + "/", 302);
    const c = p.match(/^\/category\/([a-z0-9-]{1,60})$/);
    if (c) {
      const key = Object.keys(CATEGORY_SLUGS).find((k) => CATEGORY_SLUGS[k] === c[1]);
      return Response.redirect(SITE_ORIGIN(url) + "/search" + (key ? "?cat=" + key : ""), 302);
    }
    if (p === "/nominee" || p === "/category-page") return Response.redirect(SITE_ORIGIN(url) + "/", 302); // page shells, filled above
    const lab = p.match(/^\/lab\/carousel\/([a-z0-9-]{1,64})$/);
    if (lab && url.hostname !== SITE_HOST) return labPage(request, env, url, ctx, lab[1]);
    if (p === "/table") {
      const st = await siteState(env, url, ctx);
      return decorate(await asset(env, url, request, "/table"), env, url, {
        canonical: SITE + "/table",
        fill: { "#pt-grid": `<div class="pt-gap" style="grid-row:8;grid-column:1"></div>` + categoricTableHTML(st ? st.nominees : []), "#pt-legend": categoricLegendHTML() },
      });
    }
    if (p === "/midgley") return honoreePage(request, env, url, ctx);
    if (p === "/sitemap.xml") return sitemap(env, url, ctx);
    if (p === "/murphy") return decorate(await asset(env, url, request, "/micro"), env, url, { canonical: SITE + "/murphy", fill: { "#murphy-embed": tallyHTML(LINKS.microFormId, "Share your Murphy") } });
    if (p === "/micro") return Response.redirect(SITE_ORIGIN(url) + "/murphy" + url.search, 301); // old name

    // Pages (no file extension, or .html) are rewritten per request; never let the browser's cached copy stand in.
    const isPage = !/\.[a-z0-9]+$/i.test(p) || p.endsWith(".html");
    const res = await env.ASSETS.fetch(isPage ? url.toString() : request);
    const type = res.headers.get("content-type") || "";
    // Scripts import each other as "./shared.js"; version those imports too.
    if (type.includes("javascript") && res.ok) {
      const js = (await res.text()).replace(/(from |import\()"\.\/([a-z-]+\.js)"/g, (m, how, file) => `${how}"./${file}?v=${ver()}"`);
      const out = new Response(js, res);
      if (url.searchParams.get("v")) out.headers.set("cache-control", "public, max-age=31536000, immutable");
      if (url.hostname !== SITE_HOST) out.headers.set("X-Robots-Tag", "noindex, nofollow");
      return out;
    }
    if (!type.includes("text/html")) {
      if (url.hostname === SITE_HOST) return res;
      const r = new Response(res.body, res);
      r.headers.set("X-Robots-Tag", "noindex, nofollow");
      return r;
    }
    return decorate(res, env, url, res.ok ? { canonical: SITE + p } : {});
  },
};
