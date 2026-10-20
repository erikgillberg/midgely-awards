// The Backfire codebook: how cases are tagged. One source for the Table page, search, the database and the
// story framework. Version it: change a definition and the version goes up, so tags can be traced to the
// codebook they were made with. Plain names face readers; "formal" names the research behind each pattern.

export const CODEBOOK_VERSION = "0.1";
export const CODEBOOK_DATE = "October 2026";

// Patterns are tags. A case gets one primary pattern and up to two secondary ones.
export const CODEBOOK = [
  {
    key: "surplus", name: "Solve a shortage, create a surplus",
    short: "Too little becomes too much, and the extra goes somewhere.",
    definition: "The fix raises the supply of something scarce so well that the excess, beyond what the system can absorb, builds up and does harm.",
    conditions: ["The original problem was a shortage.", "The fix scaled up supply.", "The harm comes from the excess, not from the thing in normal amounts."],
    confusedWith: "The problem moves, when the excess lands somewhere else. Tag both when it does.",
    formal: ["Nutrient surplus", "Overproduction under price supports", "Rebound effect (Jevons paradox)", "Overshoot"],
    questions: ["If this works better than planned, where does the extra go?", "What absorbs the excess today, and how much more can it take?"],
    sources: [
      "Meadows, Meadows, Randers and Behrens, The Limits to Growth (1972)",
      "Erisman and others, \"How a century of ammonia synthesis changed the world,\" Nature Geoscience (2008)",
      "Jevons, The Coal Question (1865)",
    ],
  },
  {
    key: "stable", name: "Too stable to go away",
    short: "Built to last, so it lasts where it shouldn't.",
    definition: "The property that made the fix useful, its durability, keeps it in the world long after its use, so it builds up or travels to where it does harm.",
    conditions: ["Its usefulness depended on lasting.", "The harm comes from lasting past its use or moving beyond it."],
    confusedWith: "Cheap now, paid later, which is about when the bill arrives, not why the thing persists.",
    formal: ["Persistence", "Bioaccumulation"],
    questions: ["How long does this last after we stop needing it?", "Where does it end up, and what breaks it down there?"],
    sources: [
      "Stockholm Convention on Persistent Organic Pollutants, Annex D screening criteria (2001)",
      "Geyer, Jambeck and Law, \"Production, use, and fate of all plastics ever made,\" Science Advances (2017)",
    ],
  },
  {
    key: "moved", name: "The problem moves",
    short: "Fixed in one place, it lands in another.",
    definition: "The fix solves the problem where it is measured and shifts the cost to a place, group or system the decision makers weren't counting.",
    conditions: ["The harm lands outside the boundary the fix was judged within.", "The people or places harmed bore the cost without being counted in the decision or compensated for it."],
    confusedWith: "Cheap now, paid later, when the same users pay later instead of someone else.",
    formal: ["Externality", "Problem displacement", "Rearranging effects"],
    questions: ["Who isn't at the table who will feel this?", "Where does the problem go after it leaves our boundary?"],
    sources: [
      "Pigou, The Economics of Welfare (1920)",
      "Tenner, Why Things Bite Back (1996)",
    ],
  },
  {
    key: "everyone", name: "Great for one, bad for all",
    short: "Each user wins. When everyone uses it, everyone loses.",
    definition: "Each adopter gains from the fix, but adoption draws down or crowds a shared resource no one can be kept from using, so when everyone adopts, the shared result is worse than before.",
    conditions: ["Adopting is the sensible choice for each person or firm.", "The harm comes from the total, not from any one user."],
    confusedWith: "The problem moves, when the harm falls on outsiders rather than on the users as a group. Induced demand belongs here when new capacity fills up because everyone shifts to it.",
    formal: ["Tragedy of the commons", "Social trap", "Induced demand"],
    questions: ["What happens when everyone does this, not just us?", "What shared thing gets used up when it spreads?"],
    sources: [
      "Hardin, \"The Tragedy of the Commons,\" Science (1968)",
      "Platt, \"Social Traps,\" American Psychologist (1973)",
      "Downs, \"The Law of Peak-Hour Expressway Congestion,\" Traffic Quarterly (1962)",
      "Ostrom, Governing the Commons (1990), on how communities avoid the tragedy",
    ],
  },
  {
    key: "metric", name: "Chasing the wrong number",
    short: "It hit its target. The target was the wrong one.",
    definition: "The fix improved a measurable stand-in for the goal, but the stand-in was not on the causal path to the goal, so it rose while the goal didn't, or got worse.",
    conditions: ["The designers chose a measure to optimize.", "The measure and the real goal came apart."],
    confusedWith: "The reward gets gamed, where people exploit the measure. Here the measure itself was the wrong target. Tag both when both happen.",
    formal: ["Surrogate endpoint", "Surrogation", "Proxy failure"],
    questions: ["If this number goes up and nothing else changes, are we better off?", "What could move this number without helping anyone?"],
    sources: [
      "Fleming and DeMets, \"Surrogate end points in clinical trials: are we being misled?\" Annals of Internal Medicine (1996)",
      "Choi, Hecht and Tayler, \"Lost in translation: The effects of incentive compensation on strategy surrogation,\" The Accounting Review (2012)",
    ],
  },
  {
    key: "resistance", name: "The cure breeds resistance",
    short: "Kill most of the problem and the survivors take over.",
    definition: "The fix suppresses most of a living population, which selects for heritable traits that let some survive it, until the survivors are the problem.",
    conditions: ["The target population has heritable variation and reproduces fast enough for selection to act.", "The fix was applied widely or alone, with few other controls."],
    confusedWith: "The reward gets gamed, which is people adapting to incentives, not populations evolving.",
    formal: ["Evolved resistance", "Selection pressure", "Antimicrobial resistance"],
    questions: ["What survives this, and what happens when that's all that's left?", "Are we relying on one control?"],
    sources: [
      "Fleming, \"Penicillin,\" Nobel Lecture (December 11, 1945)",
      "Antimicrobial Resistance Collaborators, \"Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis,\" The Lancet (2022)",
      "Heap, The International Herbicide-Resistant Weed Database, weedscience.org (accessed October 2026)",
    ],
  },
  {
    key: "gamed", name: "The reward gets gamed",
    short: "People chase the incentive instead of the goal.",
    definition: "The fix created a reward, and people found ways to earn it that don't serve, or that work against, the goal it was meant to reach.",
    conditions: ["There is an incentive: money, status, a score or a rule.", "People change their behavior to earn it."],
    confusedWith: "Chasing the wrong number, where the designers picked the wrong target before anyone gamed it.",
    formal: ["Goodhart's law", "Campbell's law", "Perverse incentive"],
    questions: ["What's the cheapest way to earn this reward?", "Would we be happy if people did exactly that?"],
    sources: [
      "Kerr, \"On the Folly of Rewarding A, While Hoping for B,\" Academy of Management Journal (1975)",
      "Goodhart, \"Problems of Monetary Management: The U.K. Experience,\" Papers in Monetary Economics, Reserve Bank of Australia (1975)",
      "Campbell, \"Assessing the impact of planned social change,\" Evaluation and Program Planning (1979)",
    ],
  },
  {
    key: "later", name: "Cheap now, paid later",
    short: "The bill arrives decades after the benefit.",
    definition: "The benefit arrives at once and the cost arrives years or generations later, so it barely weighs on the decision.",
    conditions: ["A long delay separates the benefit from the harm.", "The delay is part of why the harm was discounted or missed."],
    confusedWith: "Too stable to go away, which explains why some harms last, not why they were discounted.",
    formal: ["Delayed feedback", "Temporal discounting"],
    questions: ["What does this cost in twenty years, and who pays then?", "What would we decide if the bill came due today?"],
    sources: [
      "Senge, The Fifth Discipline (1990)",
      "Sterman, Business Dynamics (2000)",
      "Frederick, Loewenstein and O'Donoghue, \"Time Discounting and Time Preference: A Critical Review,\" Journal of Economic Literature (2002)",
    ],
  },
  {
    key: "flipped", name: "The lesson flipped",
    short: "Built to teach one lesson, it taught the opposite.",
    definition: "Something made to teach, warn or persuade ends up teaching or encouraging the opposite of its message.",
    conditions: ["The fix had a message or a lesson.", "The audience took away the reverse."],
    confusedWith: "The reward gets gamed, when the reversal comes from an incentive rather than from the message.",
    formal: ["Boomerang effect", "Psychological reactance", "Descriptive norm backfire"],
    questions: ["Could the audience take the opposite message from this?", "What will people enjoy about the thing we're warning against?"],
    sources: [
      "Brehm, A Theory of Psychological Reactance (1966)",
      "Cialdini, \"Crafting normative messages to protect the environment,\" Current Directions in Psychological Science (2003)",
      "Hornik and others, \"Effects of the National Youth Anti-Drug Media Campaign on Youths,\" American Journal of Public Health (2008)",
      "Byrne and Hart, \"The boomerang effect: A synthesis of findings and a preliminary theoretical framework,\" Communication Yearbook (2009)",
    ],
  },
  {
    key: "buffered", name: "The risk piles up",
    short: "Stop every small failure, and the risk saves up for one big one.",
    definition: "The fix prevents small, frequent failures so well that the risk they used to release builds up until a rare, much larger failure.",
    conditions: ["The fix suppresses small failures.", "Something accumulates behind it: fuel, development in harm's way, debt or deferred losses."],
    confusedWith: "Cheap now, paid later, which is about delay. Here the harm is held back and then released all at once.",
    formal: ["Levee effect", "Safe development paradox", "Fire suppression paradox", "Moral hazard"],
    questions: ["What small failures are we preventing, and what were they releasing?", "What happens on the day the protection fails?"],
    sources: [
      "White, Human Adjustment to Floods (1945)",
      "Burby, \"Hurricane Katrina and the Paradoxes of Government Disaster Policy: Bringing About Wise Governmental Decisions for Hazardous Areas,\" The Annals of the American Academy of Political and Social Science (2006)",
      "Calkin, Cohen, Finney and Thompson, \"How risk management can prevent future wildfire disasters in the wildland-urban interface,\" PNAS (2014)",
      "Pauly, \"The Economics of Moral Hazard: Comment,\" American Economic Review (1968)",
    ],
  },
];

// The other tags every case carries.
export const DIMENSIONS = {
  scale: { label: "Scale", help: "How far the harm reached.", multi: false, values: {
    local: "Local", regional: "Regional", national: "National", global: "Global" } },
  lag: { label: "Time lag", help: "How long from the fix to the harm being felt.", multi: false, values: {
    immediate: "Under a year", years: "Years", decades: "Decades", generations: "Generations" } },
  bearer: { label: "Who pays", help: "Who carried the cost. Can be more than one.", multi: true, values: {
    users: "The people it served", others: "Bystanders and other groups", future: "Future generations", nature: "Ecosystems and other species" } },
  reversibility: { label: "Reversibility", help: "How hard the harm is to undo.", multi: false, values: {
    reversible: "Reversible", slow: "Slow to undo", irreversible: "Irreversible" } },
};

// Time period comes from "began": the year the fix was invented or first demonstrated.
export const eraOf = (year) => (year ? `${Math.floor(year / 10) * 10}s` : "");
export const ERAS = [
  { key: "1800s", label: "Before 1900", from: 0, to: 1899 },
  { key: "early", label: "1900 to 1945", from: 1900, to: 1945 },
  { key: "postwar", label: "1946 to 1999", from: 1946, to: 1999 },
  { key: "now", label: "2000 on", from: 2000, to: 9999 },
];
export const periodOf = (year) => (year ? ERAS.find((e) => year >= e.from && year <= e.to)?.key || "" : "");

export const codeOf = (key) => CODEBOOK.find((p) => p.key === key);
