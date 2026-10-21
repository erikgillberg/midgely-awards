// Risks and mitigations per case: what was on the table, and what might have caught or softened it.
// This is the data that teaches pattern spotting, so every item says whether it was knowable then and cites a source.
//   risk:       { risk, pattern, knowable: "then" | "partly" | "later", evidence, source }
//   mitigation: { mitigation, risk (index into risks), existedThen, question (from the codebook), source }
// "verified" marks items whose facts and source were checked against the source itself.
import { CODEBOOK } from "./codebook.js";

const KEYS = CODEBOOK.map((p) => p.key);
const text = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

export function cleanRisks(list) {
  return (Array.isArray(list) ? list : []).slice(0, 8).map((r) => ({
    risk: text(r.risk, 400), pattern: KEYS.includes(r.pattern) ? r.pattern : "",
    knowable: ["then", "partly", "later"].includes(r.knowable) ? r.knowable : "later",
    evidence: text(r.evidence, 600), source: text(r.source, 400), verified: r.verified === true,
  })).filter((r) => r.risk);
}

export function cleanMitigations(list) {
  return (Array.isArray(list) ? list : []).slice(0, 8).map((m) => ({
    mitigation: text(m.mitigation, 400), risk: Number.isInteger(m.risk) ? m.risk : 0,
    existedThen: m.existedThen === true, question: text(m.question, 300), source: text(m.source, 400), verified: m.verified === true,
  })).filter((m) => m.mitigation);
}

// Drafted 2026-10-20 from each case's sourced story, then fact-checked against the sources (docs/risks-and-mitigations.md).
export const CASE_RISKS = [
 {
  "id": "midgley",
  "risks": [
   {
    "risk": "Lead from car exhaust settles into air, dust and soil and harms people who never chose the fuel, children most.",
    "pattern": "moved",
    "knowable": "then",
    "evidence": "Lead poisoning had been described for centuries. At the Surgeon General's conference on tetraethyl lead in May 1925, critics led by Yandell Henderson of Yale and Alice Hamilton warned that lead from exhaust could slowly poison the public. How much spread was measured only from the 1960s (Clair Patterson), and the IQ toll was estimated in 2022.",
    "source": "Kovarik, \"Ethyl-leaded gasoline: how a classic occupational disease became an international public health disaster,\" International Journal of Occupational and Environmental Health 11(4):384-397, 2005; McFarland, Hauer and Reuben, \"Half of US population exposed to adverse lead levels in early childhood,\" PNAS 119(11), 2022",
    "verified": true
   },
   {
    "risk": "Workers who make and handle the concentrated additive are poisoned.",
    "pattern": "moved",
    "knowable": "then",
    "evidence": "Midgley took time off in early 1923 to recover from lead poisoning. In October 1924 at least five workers making the additive at Standard Oil's Bayway refinery in New Jersey died and dozens more were hospitalized.",
    "source": "Kovarik, \"Ethyl-leaded gasoline: how a classic occupational disease became an international public health disaster,\" International Journal of Occupational and Environmental Health 11(4):384-397, 2005; LibreTexts Chemistry, \"Tetraethyllead: Toxicity\" case study",
    "verified": true
   },
   {
    "risk": "CFCs are so stable that they survive to the stratosphere, where sunlight frees chlorine that destroys ozone.",
    "pattern": "stable",
    "knowable": "later",
    "evidence": "Their stability was the selling point in 1928. The chemistry by which they destroy ozone was first described by Molina and Rowland in 1974, thirty years after Midgley died.",
    "source": "Molina and Rowland, \"Stratospheric sink for chlorofluoromethanes: chlorine atom-catalysed destruction of ozone,\" Nature 249:810-812, 1974",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Pause sales and put the health question to an independent public review before wide release.",
    "risk": 0,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Existed: the Ethyl Gasoline Corporation suspended sales on May 5, 1925, and Surgeon General Hugh Cumming convened a conference on May 20, 1925. The committee it appointed reported in January 1926 that there were no good grounds to ban the fuel, and sales resumed. Kovarik, \"Ethyl-leaded gasoline: how a classic occupational disease became an international public health disaster,\" International Journal of Occupational and Environmental Health 11(4):384-397, 2005",
    "verified": true
   },
   {
    "mitigation": "Choose an anti-knock fuel that does not put a poison into exhaust, such as ethanol blends.",
    "risk": 0,
    "existedThen": true,
    "question": "Where does the problem go after it leaves our boundary?",
    "source": "Existed: GM researchers studied ethanol as one of the best anti-knock fuels from the start of their work in 1916, before tetraethyl lead's effect was found in December 1921. Kovarik, \"Ethyl-leaded gasoline: how a classic occupational disease became an international public health disaster,\" International Journal of Occupational and Environmental Health 11(4):384-397, 2005",
    "verified": true
   },
   {
    "mitigation": "Set safety rules for making the additive, and stop production when workers fall sick.",
    "risk": 1,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Existed: the New Jersey labor commission shut down the Bayway plant in early November 1924, after the October deaths, and New York City, Philadelphia and New Jersey banned sales of leaded gasoline. Kovarik, \"Ethyl-leaded gasoline: how a classic occupational disease became an international public health disaster,\" International Journal of Occupational and Environmental Health 11(4):384-397, 2005",
    "verified": true
   },
   {
    "mitigation": "Before releasing a long-lived chemical at scale, test where it ends up and what breaks it down there.",
    "risk": 2,
    "existedThen": false,
    "question": "Where does it end up, and what breaks it down there?",
    "source": "",
    "verified": false
   }
  ]
 },
 {
  "id": "haber",
  "risks": [
   {
    "risk": "Once nitrogen is cheap, farms apply more than crops take up, and the extra washes into rivers and coasts and starves them of oxygen.",
    "pattern": "surplus",
    "knowable": "later",
    "evidence": "In 2005 about 100 million tonnes of factory nitrogen went on farms while people ate 17 million tonnes of nitrogen in food. The damage came into view after fertilizer use had grown many times over. A 2008 review says Haber could not have foreseen it.",
    "source": "Erisman, Sutton, Galloway, Klimont and Winiwarter, \"How a century of ammonia synthesis changed the world,\" Nature Geoscience 1:636-639, 2008, doi:10.1038/ngeo325; NOAA NCCOS, \"Below Average Summer 2025 'Dead Zone' Measured in Gulf,\" July 31, 2025",
    "verified": true
   },
   {
    "risk": "Extra nitrogen on fields leaves as nitrous oxide, a greenhouse gas.",
    "pattern": "moved",
    "knowable": "later",
    "evidence": "Farming made 74 percent of human-made nitrous oxide in the 2010s. Its role in climate was not understood when the process was invented.",
    "source": "Tian and others, \"Global nitrous oxide budget (1980 to 2020),\" Earth System Science Data 16:2543-2604, 2024",
    "verified": true
   },
   {
    "risk": "The same ammonia plants can supply nitric acid for explosives, ending a country's dependence on imported saltpeter for war.",
    "pattern": "moved",
    "knowable": "partly",
    "evidence": "Turning ammonia into nitric acid was already a known industrial step (the Ostwald process, patented 1902), and the use in explosives was plain by World War I, when a blockade cut Germany off from Chilean saltpeter. What was weighed in 1909 is not documented in these sources.",
    "source": "Erisman, Sutton, Galloway, Klimont and Winiwarter, \"How a century of ammonia synthesis changed the world,\" Nature Geoscience 1:636-639, 2008, doi:10.1038/ngeo325; Science History Institute, \"Fritz Haber\"",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Match fertilizer rates to what each crop can take up, and measure what leaves the field.",
    "risk": 0,
    "existedThen": false,
    "question": "If this works better than planned, where does the extra go?",
    "source": "",
    "verified": false
   },
   {
    "mitigation": "Track nitrogen in rivers and coasts and set limits on what a watershed can absorb.",
    "risk": 0,
    "existedThen": false,
    "question": "What absorbs the excess today, and how much more can it take?",
    "source": "Later practice, not then: NOAA dead zone monitoring, measured each summer since 1985, and the Hypoxia Task Force goal of a five-year average under 1,900 square miles by 2035 (NOAA NCCOS, July 31, 2025)",
    "verified": true
   },
   {
    "mitigation": "Count emissions from fields, not only from factories, when judging the fertilizer's cost.",
    "risk": 1,
    "existedThen": false,
    "question": "Where does the problem go after it leaves our boundary?",
    "source": "",
    "verified": false
   }
  ]
 },
 {
  "id": "nobel",
  "risks": [
   {
    "risk": "An explosive that is safe to carry and store is also easy to hide, transport and set off on purpose.",
    "pattern": "moved",
    "knowable": "partly",
    "evidence": "In 1867 the problem being solved was accidental explosions. Within his lifetime bombers used dynamite in Britain (1881 to 1885). What was weighed in 1867 is not documented in our sources.",
    "source": "Whelehan, The Dynamiters: Irish Nationalism and Political Violence in the Wider World, 1867-1900, Cambridge University Press, 2012",
    "verified": true
   },
   {
    "risk": "Armies take up a cheap, portable explosive for war.",
    "pattern": "moved",
    "knowable": "partly",
    "evidence": "Both sides used dynamite in the Franco-Prussian War of 1870 to 1871, three years after the 1867 patent, and France licensed a dynamite factory at Paulilles for the war. In 1887 Nobel patented ballistite, a smokeless powder for military projectiles.",
    "source": "Christopher Klein, History.com article on the invention of dynamite; Nobel Prize Outreach, \"Paul Barbe\"; Science History Institute, \"Alfred Nobel\"",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "License who may make, store and sell the explosive.",
    "risk": 0,
    "existedThen": true,
    "question": "Where does the problem go after it leaves our boundary?",
    "source": "Existed: Britain's Explosives Act 1875 (38 and 39 Vict. c. 17) licensed the making, storing and sale of explosives (legislation.gov.uk)",
    "verified": true
   },
   {
    "mitigation": "Make it a crime to hold explosives with intent to harm, and track sales to buyers.",
    "risk": 0,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Existed in part: Britain passed the Explosive Substances Act 1883 (46 and 47 Vict. c. 3) during the Fenian dynamite campaign, making it a crime to make or hold explosives with intent to endanger life (legislation.gov.uk). Sales tracking and chemical tagging came later.",
    "verified": true
   }
  ]
 },
 {
  "id": "franz",
  "risks": [
   {
    "risk": "Using one herbicide alone over huge areas selects for the rare weeds that survive it, until they take over.",
    "pattern": "resistance",
    "knowable": "partly",
    "evidence": "Weeds had already evolved resistance to other herbicides, triazines among them, by 1970. For glyphosate, Monsanto scientists wrote in 1997 that decades of use had produced no verified resistant weeds. The first resistant weed was found in 1996, the year glyphosate-tolerant soybeans launched, and use then rose almost 15-fold.",
    "source": "Ryan, \"Resistance of common groundsel to simazine and atrazine,\" Weed Science 18(5):614-616, 1970; Bradshaw, Padgette, Kimball and Wells, \"Perspectives on glyphosate resistance,\" Weed Technology 11:189-198, 1997; Heap and Duke, \"Overview of glyphosate-resistant weeds worldwide,\" Pest Management Science 74:1040-1049, 2018; Benbrook, \"Trends in glyphosate herbicide use in the United States and globally,\" Environmental Sciences Europe 28:3, 2016",
    "verified": true
   },
   {
    "risk": "Resistant weeds often survive other herbicides too, leaving farmers fewer tools.",
    "pattern": "resistance",
    "knowable": "later",
    "evidence": "By 2026, 62 weed species in 31 countries had evolved glyphosate resistance, often with resistance to other modes of action.",
    "source": "Alcantara-de la Cruz and others, \"Thirty years of glyphosate-resistant crops and weeds: current situation and future prospects,\" Pest Management Science 82(7):5987-6009, 2026, doi:10.1002/ps.70742",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Rotate or mix herbicides that work in different ways, and keep plowing, cover crops or other non-chemical controls in the mix.",
    "risk": 0,
    "existedThen": true,
    "question": "Are we relying on one control?",
    "source": "Existed: rotating herbicide modes of action was standard resistance advice before 1996; the industry's Herbicide Resistance Action Committee formed in 1989 (hracglobal.com)",
    "verified": true
   },
   {
    "mitigation": "Survey fields for survivors and report resistance early, before it spreads.",
    "risk": 1,
    "existedThen": true,
    "question": "What survives this, and what happens when that's all that's left?",
    "source": "Existed: the International Survey of Herbicide-Resistant Weeds (Heap, weedscience.org), begun in 1993, was tracking resistant weeds before glyphosate resistance appeared in 1996",
    "verified": true
   },
   {
    "mitigation": "Launch a crop built around one herbicide with a required resistance plan, as US regulators required refuges for insect-resistant Bt crops.",
    "risk": 0,
    "existedThen": true,
    "question": "Are we relying on one control?",
    "source": "Existed for insect resistance, not for herbicides: EPA has required insect resistance management plans, including non-Bt refuges, with Bt crop registrations since 1995 (US EPA, \"EPA's Regulation of Bacillus thuringiensis (Bt) Crops\")",
    "verified": true
   }
  ]
 },
 {
  "id": "muller",
  "risks": [
   {
    "risk": "A chemical built to last for months outdoors builds up in fatty tissue and moves up food chains, where it thins bird eggshells.",
    "pattern": "stable",
    "knowable": "partly",
    "evidence": "Lasting was the selling point. US wildlife biologists published a study of DDT's effects on fish and wildlife in 1946. Build-up up a food chain was documented at Clear Lake, California, for the related pesticide DDD in 1960. Eggshell thinning was measured in 1967 and 1968, after Muller died in 1965.",
    "source": "Cottam and Higgins, \"DDT: Its effect on fish and wildlife,\" US Fish and Wildlife Service Circular 11, 1946; Hunt and Bischoff, \"Inimical effects on wildlife of periodic DDD applications to Clear Lake,\" California Fish and Game 46, 1960; Ratcliffe, \"Decrease in eggshell weight in certain birds of prey,\" Nature 215:208-210, 1967; Hickey and Anderson, \"Chlorinated hydrocarbons and eggshell changes in raptorial and fish-eating birds,\" Science 162:271-273, 1968",
    "verified": true
   },
   {
    "risk": "Spraying one insecticide everywhere selects for resistant insects, until it stops working where it is needed most.",
    "pattern": "resistance",
    "knowable": "then",
    "evidence": "Resistant houseflies were reported in 1947 and DDT-resistant mosquitoes in Greece by 1951, before the world malaria eradication campaign began in 1955.",
    "source": "Najera, Gonzalez-Silva and Alonso, \"Some lessons for the future from the Global Malaria Eradication Programme (1955 to 1969),\" PLOS Medicine 8(1):e1000412, 2011, doi:10.1371/journal.pmed.1000412",
    "verified": true
   },
   {
    "risk": "Residues stay in soil and water for decades after use stops.",
    "pattern": "stable",
    "knowable": "later",
    "evidence": "EPA says residues of concern from historical use still remain, decades after the 1972 US cancellation.",
    "source": "US EPA, \"DDT: A Brief History and Status\"",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Study effects on fish and wildlife before spraying widely outdoors.",
    "risk": 0,
    "existedThen": true,
    "question": "Where does it end up, and what breaks it down there?",
    "source": "Existed: Cottam and Higgins, \"DDT: Its effect on fish and wildlife,\" US Fish and Wildlife Service Circular 11, 1946",
    "verified": true
   },
   {
    "mitigation": "Keep a long-lasting insecticide for indoor spraying against disease-carrying mosquitoes, and limit farm and outdoor use.",
    "risk": 0,
    "existedThen": false,
    "question": "How long does this last after we stop needing it?",
    "source": "Later policy, not then: the Stockholm Convention, in force 2004, restricts DDT to disease vector control",
    "verified": true
   },
   {
    "mitigation": "Use several controls against mosquitoes so no single chemical carries the whole campaign.",
    "risk": 1,
    "existedThen": true,
    "question": "Are we relying on one control?",
    "source": "Existed: malaria control before DDT combined drainage, larviciding and drugs, and integrated pest control was set out by Stern, Smith, van den Bosch and Hagen, \"The integrated control concept,\" Hilgardia 29(2):81-101, 1959, as the eradication campaign got under way",
    "verified": true
   },
   {
    "mitigation": "Screen new chemicals for how long they last and how they build up in animals before approval.",
    "risk": 2,
    "existedThen": false,
    "question": "How long does this last after we stop needing it?",
    "source": "Later practice, not then: Stockholm Convention (adopted 2001), Annex D screening criteria for persistence and bioaccumulation",
    "verified": true
   }
  ]
 },
 {
  "id": "baekeland",
  "risks": [
   {
    "risk": "A material that heat cannot melt and solvents cannot dissolve keeps its shape long after its use, wherever it ends up.",
    "pattern": "stable",
    "knowable": "later",
    "evidence": "Durability was the point in 1907. Plastic in the ocean was first noticed in the 1960s, and microplastics were named in 2004. Nothing in 1907 pointed to plastic waste at scale.",
    "source": "Science History Institute, \"History and Future of Plastics\"; Thompson and others, \"Lost at sea: where is all the plastic?\" Science 304:838, 2004",
    "verified": true
   },
   {
    "risk": "Once production grows from one factory to hundreds of millions of tons a year, most of the waste goes to landfills or the environment.",
    "pattern": "later",
    "knowable": "later",
    "evidence": "World production was about 2 million metric tons in 1950 and 380 million in 2015. By 2015, 79% of 6.3 billion metric tons of plastic waste sat in landfills or the environment.",
    "source": "Geyer, Jambeck and Law, \"Production, use, and fate of all plastics ever made,\" Science Advances 3(7):e1700782, 2017",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Plan where a durable material goes after its job, with takeback, reuse or disposal designed in.",
    "risk": 0,
    "existedThen": false,
    "question": "Where does it end up, and what breaks it down there?",
    "source": "",
    "verified": false
   },
   {
    "mitigation": "Make producers pay for collecting and handling their material's waste.",
    "risk": 1,
    "existedThen": false,
    "question": "What does this cost in twenty years, and who pays then?",
    "source": "Later practice, not then: extended producer responsibility laws, and the UN plastics treaty talks launched by UN Environment Assembly resolution 5/14 on March 2, 2022 (UN News, March 2, 2022)",
    "verified": true
   }
  ]
 },
 {
  "id": "borlaug",
  "risks": [
   {
    "risk": "High-yield seeds pay off only with plenty of water and fertilizer, so the harvest gain draws down groundwater over decades.",
    "pattern": "later",
    "knowable": "partly",
    "evidence": "That the new varieties depended on inputs was known in the 1960s. Punjab's water table was falling 18 cm a year by the mid-1980s and about a meter a year by 2010. Borlaug's 1970 warning was about population, not water.",
    "source": "Pingali, \"Green Revolution: Impacts, limits, and the path ahead,\" PNAS 109(31):12302-12308, 2012, doi:10.1073/pnas.0912953109; Perveen, Columbia Water Center, \"An alarming water crisis in India's food bowl,\" State of the Planet, December 15, 2010; Borlaug, \"The Green Revolution, Peace, and Humanity,\" Nobel lecture, December 11, 1970",
    "verified": true
   },
   {
    "risk": "When pumping costs a flat fee, each farmer pumps more, and the shared aquifer falls for everyone.",
    "pattern": "everyone",
    "knowable": "partly",
    "evidence": "The flat-fee power and guaranteed rice and wheat prices were policy choices made around the seeds, not by the breeders. Punjab was overdrawing groundwater by 45 percent beyond rain recharge by 2010.",
    "source": "Perveen, Columbia Water Center, \"An alarming water crisis in India's food bowl,\" State of the Planet, December 15, 2010",
    "verified": true
   },
   {
    "risk": "Heavy fertilizer and chemical use runs off fields and damages soil and water beyond the farms.",
    "pattern": "surplus",
    "knowable": "later",
    "evidence": "A 2012 review found serious impacts from water use, soil damage and chemical runoff, driven by policies that encouraged overuse of inputs.",
    "source": "Pingali, \"Green Revolution: Impacts, limits, and the path ahead,\" PNAS 109(31):12302-12308, 2012, doi:10.1073/pnas.0912953109",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Charge for water or power by use, or meter pumps, so pumping more costs more.",
    "risk": 1,
    "existedThen": false,
    "question": "What shared thing gets used up when it spreads?",
    "source": "Proposed later, not then: Perveen, Columbia Water Center, \"An alarming water crisis in India's food bowl,\" State of the Planet, December 15, 2010",
    "verified": true
   },
   {
    "mitigation": "Move some land away from rice and wheat toward crops that need less water.",
    "risk": 0,
    "existedThen": true,
    "question": "What would we decide if the bill came due today?",
    "source": "Proposed while the water table was already falling: Punjab's Johl Committee recommended in 1986 shifting at least 20 percent of wheat and rice land to other crops; it was not implemented (The Tribune, \"Why crop diversification has eluded Punjab\"). Columbia Water Center (Perveen, 2010) notes diversification largely failed because of guaranteed wheat and rice prices.",
    "verified": true
   },
   {
    "mitigation": "Measure groundwater levels from the start and tie pumping rules to them.",
    "risk": 0,
    "existedThen": false,
    "question": "What does this cost in twenty years, and who pays then?",
    "source": "",
    "verified": false
   }
  ]
 },
 {
  "id": "moses",
  "risks": [
   {
    "risk": "A new road makes each trip faster, so more people drive until it jams again.",
    "pattern": "everyone",
    "knowable": "then",
    "evidence": "In 1930 a transit executive told a St. Louis commission that widening streets simply produces more traffic. Caro documents Moses's own Long Island parkways jamming soon after they opened.",
    "source": "Fogelson, Downtown: Its Rise and Fall, 1880-1950, Yale University Press, 2001, and Caro, The Power Broker, Knopf, 1974, both as quoted in Wikipedia, \"Induced demand\"",
    "verified": true
   },
   {
    "risk": "Expressways through dense neighborhoods displace residents and leave neighbors with noise and air pollution.",
    "pattern": "moved",
    "knowable": "then",
    "evidence": "Displacement was part of the plan, since homes had to be cleared for the right of way. Caro estimated about 250,000 people displaced across Moses's projects. Health effects were named by officials later.",
    "source": "Harvard Joint Center for Housing Studies, \"From the archives: when New York's legendary power broker spoke at the Joint Center,\" citing Caro, The Power Broker, 1974; Governor of New York press release on the Cross Bronx Expressway reconnecting grant, January 25, 2024",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Before adding road capacity, test whether the new space will simply fill with new trips.",
    "risk": 0,
    "existedThen": true,
    "question": "What happens when everyone does this, not just us?",
    "source": "Existed: the 1930 St. Louis testimony that widening streets simply produces more traffic (Fogelson, Downtown: Its Rise and Fall, 1880-1950, 2001)",
    "verified": true
   },
   {
    "mitigation": "Charge drivers for using crowded roads at peak times.",
    "risk": 0,
    "existedThen": true,
    "question": "What shared thing gets used up when it spreads?",
    "source": "Existed as an idea: Pigou proposed taxing congested roads in The Economics of Welfare, 1920, and Vickrey set out peak road pricing in \"Pricing in Urban and Suburban Transport,\" American Economic Review 53(2):452-465, 1963, while Moses was still building expressways",
    "verified": true
   },
   {
    "mitigation": "Weigh routes by how many homes they take, and give the people displaced a say.",
    "risk": 1,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Proposed at the time: Caro documents East Tremont residents pressing for an alternative Cross Bronx route about a block south, along Crotona Park, that would have taken far fewer homes (Caro, The Power Broker, Knopf, 1974, chapter 37, \"One Mile\"; Wikipedia, \"Cross Bronx Expressway\")",
    "verified": true
   }
  ]
 },
 {
  "id": "zuckerberg",
  "risks": [
   {
    "risk": "Ranking posts by how likely they are to draw comments and reshares rewards posts that start fights as much as posts that connect people.",
    "pattern": "metric",
    "knowable": "partly",
    "evidence": "The 2018 goal was meaningful social interactions, scored by comments and reshares. Facebook's own researchers flagged the effect on politics and news by 2019. Outside research on the wider effect is contested.",
    "source": "Wall Street Journal, \"Facebook Tried to Make Its Platform a Healthier Place. It Got Angrier Instead,\" September 15, 2021, as quoted by Columbia Journalism Review, September 16, 2021; Guess and others, \"How do social media feed algorithms affect attitudes and behavior in an election campaign?\" Science 381:398-404, 2023",
    "verified": true
   },
   {
    "risk": "Publishers and political parties learn what the ranking rewards and tilt their posts toward outrage.",
    "pattern": "gamed",
    "knowable": "partly",
    "evidence": "An April 2019 internal report described European parties shifting toward negative posts. One Polish party described moving from an even split to 80% negative, by its own estimate.",
    "source": "Washington Post, \"Five points for anger, one for a 'like',\" October 26, 2021; Wall Street Journal, September 15, 2021, as quoted by Columbia Journalism Review, September 16, 2021",
    "verified": true
   },
   {
    "risk": "Weighting reshares spreads misinformation and toxic content, which travel disproportionately by reshare.",
    "pattern": "metric",
    "knowable": "later",
    "evidence": "Internal researchers wrote that misinformation, toxicity and violent content are inordinately prevalent among reshares. This was found after the change, not before.",
    "source": "Wall Street Journal, \"Facebook Tried to Make Its Platform a Healthier Place. It Got Angrier Instead,\" September 15, 2021, as quoted by Columbia Journalism Review, September 16, 2021 (cjr.org/the_media_today/journal-series-reveals-concerns-inaction-at-facebook.php)",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Put less weight on predicted comments and reshares for political and news posts.",
    "risk": 0,
    "existedThen": true,
    "question": "What could move this number without helping anyone?",
    "source": "Proposed by Facebook's data scientists in 2018 and 2019 (Wall Street Journal, September 15, 2021, via Columbia Journalism Review); adopted from 2021 (Meta Newsroom, \"Reducing Political Content in News Feed,\" February 10, 2021, updated August 31, 2021)",
    "verified": true
   },
   {
    "mitigation": "Check the number against the goal directly, for example by asking users whether an interaction was worthwhile.",
    "risk": 0,
    "existedThen": true,
    "question": "If this number goes up and nothing else changes, are we better off?",
    "source": "Existed: Facebook had run a user feed-rating panel since 2014 and in 2018 asked users whether interactions were meaningful (Bloomberg, \"Facebook Is Counting on User Surveys for a 'Meaningful' Feed,\" 2018)",
    "verified": true
   },
   {
    "mitigation": "Before launch, ask how a publisher could earn the most ranking with the least real conversation, and test for it.",
    "risk": 1,
    "existedThen": false,
    "question": "What's the cheapest way to earn this reward?",
    "source": "",
    "verified": false
   },
   {
    "mitigation": "Give angry reactions no extra weight in ranking.",
    "risk": 2,
    "existedThen": false,
    "question": "Would we be happy if people did exactly that?",
    "source": "Later change, not then: Facebook cut the angry reaction's ranking weight to zero in September 2020 (Washington Post, \"Five points for anger, one for a 'like',\" October 26, 2021)",
    "verified": true
   }
  ]
 },
 {
  "id": "berners-lee",
  "risks": [
   {
    "risk": "With no gatekeeper, anyone can put up a page that looks like a bank or a trusted source.",
    "pattern": "moved",
    "knowable": "partly",
    "evidence": "Abuse of open networks was not new: the first mass ad email went out on ARPANET in 1978 and the Morris worm crippled thousands of computers in 1988. The 1989 proposal was for one lab, and there were just over 500 known web servers at the end of 1993.",
    "source": "Berners-Lee, \"Information Management: A Proposal,\" CERN, March 1989; CERN, \"A short history of the Web\"",
    "verified": true
   },
   {
    "risk": "The job of checking what is true moves from editors to every reader, so misinformation that draws clicks spreads.",
    "pattern": "moved",
    "knowable": "later",
    "evidence": "Berners-Lee named this in 2017. The scale and the ad-funded click business that drives it came well after the design.",
    "source": "Berners-Lee, \"Three challenges for the web, according to its inventor,\" Web Foundation open letter, March 12, 2017",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Build a way for readers to check who runs a site into the system early.",
    "risk": 0,
    "existedThen": true,
    "question": "Where does the problem go after it leaves our boundary?",
    "source": "Existed in part: certificates that bind a name to a key were standardized in CCITT Recommendation X.509, 1988, a year before the proposal; the web adopted them for sites only with SSL in the mid-1990s",
    "verified": true
   },
   {
    "mitigation": "Give people tools and shared rules for judging sources and controlling their own data.",
    "risk": 1,
    "existedThen": false,
    "question": "Who isn't at the table who will feel this?",
    "source": "Later work, not then: Contract for the Web, November 2019 (contractfortheweb.org); Berners-Lee, \"One Small Step for the Web,\" Inrupt and Solid, September 2018",
    "verified": true
   }
  ]
 },
 {
  "id": "c259c539-a00a-493f-b83b-7ebe3b3b52c7",
  "risks": [
   {
    "risk": "Districts that bar apartments sort people by income and keep lower-income households out.",
    "pattern": "moved",
    "knowable": "then",
    "evidence": "New York's 1916 code let apartments into residence districts. In 1924 a federal judge struck down Euclid, Ohio's code, writing that its result was to classify the population and segregate them by income. The Supreme Court reversed him in 1926.",
    "source": "Ambler Realty Co. v. Village of Euclid, 297 F. 307 (N.D. Ohio 1924); Village of Euclid v. Ambler Realty Co., 272 U.S. 365 (1926)",
    "verified": true
   },
   {
    "risk": "Keeping homes, shops and jobs in separate zones makes people rely on cars once cities spread out.",
    "pattern": "later",
    "knowable": "later",
    "evidence": "Early 1900s cities were compact and walkable. The cost in driving came later, as cities grew outward under separated-use rules, among many other causes.",
    "source": "US EPA, Our Built and Natural Environments, EPA 231-R-01-002, 2001",
    "verified": true
   },
   {
    "risk": "Rules built to hold steady are hard to change, so they outlast the conditions they were written for and help hold down home building.",
    "pattern": "later",
    "knowable": "partly",
    "evidence": "The 1924 model act let owners of 20 percent of the affected land force a three-fourths vote of the council on any change, which made codes hard to amend. The housing shortage it feeds into came decades later.",
    "source": "A Standard State Zoning Enabling Act, US Department of Commerce, 1924, section 5; White House, \"Housing Supply Action Plan\" fact sheet, May 16, 2022",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Allow apartments in residence districts rather than banning them.",
    "risk": 0,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Proposed at the time: Bassett advised cities not to bar apartment buildings from residence districts and preferred one broad residence district with height and setback limits (Bassett, Zoning, National Municipal League, 1922, as summarized by Nairn, Planetizen and Smart Cities Dive); New York's 1916 code had no single-family district",
    "verified": true
   },
   {
    "mitigation": "Review zoning rules on a schedule and ask whether the problem they were written for still exists.",
    "risk": 2,
    "existedThen": false,
    "question": "What would we decide if the bill came due today?",
    "source": "",
    "verified": false
   },
   {
    "mitigation": "Judge a zoning rule by who it keeps out, as well as what it protects.",
    "risk": 0,
    "existedThen": true,
    "question": "Who isn't at the table who will feel this?",
    "source": "Existed: Ambler Realty Co. v. Village of Euclid, 297 F. 307 (N.D. Ohio 1924), reversed by Village of Euclid v. Ambler Realty Co., 272 U.S. 365 (1926)",
    "verified": true
   }
  ]
 },
 {
  "id": "magie",
  "risks": [
   {
    "risk": "If the way to win is to grab land and collect rent, players practice the very thing the game warns against.",
    "pattern": "flipped",
    "knowable": "partly",
    "evidence": "Her 1904 patent says the object is to obtain as much wealth or money as possible. The lesson rested on players noticing what that did to everyone else.",
    "source": "US Patent 748,626, Lizzie J. Magie, January 5, 1904",
    "verified": true
   },
   {
    "risk": "A message that lives in the commentary is lost when people copy the board and change the rules.",
    "pattern": "flipped",
    "knowable": "partly",
    "evidence": "Before 1935 players drew their own boards and changed street names and rules.",
    "source": "Jen Doll, History News Network (from The New Republic), February 5, 2015",
    "verified": true
   },
   {
    "risk": "A mass-market version keeps the race to riches and drops the argument entirely.",
    "pattern": "flipped",
    "knowable": "later",
    "evidence": "In 1935 Parker Brothers sold Monopoly with the object of becoming the wealthiest player. By 1936 her anti-monopolist rules were largely forgotten.",
    "source": "Hasbro, Monopoly instructions (classic rules); Doll, History News Network, February 5, 2015",
    "verified": true
   }
  ],
  "mitigations": [
   {
    "mitigation": "Put the lesson in the rules, with a version where everyone gains when wealth is shared, so players practice the alternative.",
    "risk": 0,
    "existedThen": true,
    "question": "Could the audience take the opposite message from this?",
    "source": "Existed: Magie's Prosperity rules in the 1932 Adgame edition of The Landlord's Game (History.com, \"Monopoly game inventor Elizabeth Magie\"; Wikipedia, \"History of the board game Monopoly\")",
    "verified": true
   },
   {
    "mitigation": "Ship the explanation with every copy so the message travels with the board.",
    "risk": 1,
    "existedThen": false,
    "question": "What will people enjoy about the thing we're warning against?",
    "source": "",
    "verified": false
   }
  ]
 }
];
