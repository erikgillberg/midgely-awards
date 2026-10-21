# Risks and mitigations

For every case: the risks that were on the table when the fix was chosen, and what might have caught or softened each one. This is the part of the database that teaches pattern spotting, so each item is labeled and sourced. Stored on `nominees.risks` and `nominees.mitigations` (schema v17); the data and its cleaners are in `public/case-risks.js`.

## Shape
- **Risk:** `{ risk, pattern, knowable, evidence, source, verified }`
  - `pattern` is a codebook key.
  - `knowable` is `then` (identifiable at decision time), `partly`, or `later` (only visible in hindsight).
- **Mitigation:** `{ mitigation, risk, existedThen, question, source, verified }`
  - `risk` is the index of the risk it answers.
  - `existedThen` is true only when the mitigation existed or was proposed at the time, with a citation.
  - `question` is copied from the pattern's "Ask before you ship" list.

## How version 1 was made (October 20, 2026)
1. One research pass drafted 66 items across the 12 cases from each case's sourced story.
2. A second pass checked every claim and source online. It corrected dates and citations, completed references, and set `verified`.
3. 8 mitigations are marked `verified: false`. Each is hindsight (`existedThen: false`) with no citation, kept on purpose as our own recommendation.

The second pass also caught one error in a published story. It and the other fixes are below.

| Case | Before | After |
|---|---|---|
| Nobel | "four years after the patent" | Dynamite reached the Franco-Prussian War in 1870, three years after the 1867 patent. Fixed in the story and the record. |
| Zuckerberg | "late 2020" | The angry-reaction weight went to zero in September 2020. |
| Muller | Food-chain build-up first measured in 1967 and 1968 | It was documented at Clear Lake in 1960 (DDD); 1967 and 1968 is when eggshell thinning was measured. The story already says that. |

## Not public yet
The fields are stored, but `/api/state` doesn't return them and no page shows them. They go public after the editor's review. They will appear as the "With hindsight" card in each story (docs/story-framework.md) and in the future teardowns of today's products.

## Open
- **Bassett:** a quoted note from the 1924 model act could not be found in a readable copy. It is not in the published story. Check it before it is ever used.
- **Henderson:** his exact 1925 warning about lead in exhaust needs Public Health Bulletin No. 158 to confirm the wording.
