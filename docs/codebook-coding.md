# How cases are coded

The codebook lives in `public/codebook.js` (version 0.1, October 2026). It defines the ten patterns and the
four other dimensions every case carries. The Table page shows it, search filters on it, and the database
stores it. This file records how the tags were made, how well the coders agreed, and what was decided.

## What a case carries

| Field | Values | Notes |
|---|---|---|
| `patterns` | 1 to 3 pattern keys, main pattern first | A case can carry more than one pattern. The main one drives the story's pattern card. |
| `scale` | local, regional, national, global | How far the harm reached. |
| `lag` | immediate, years, decades, generations | Time from the fix to the harm being felt. |
| `bearer` | users, others, future, nature (any number) | Who carried the cost. |
| `reversibility` | reversible, slow, irreversible | How hard the harm is to undo. |
| `began` | a year | The year the fix was invented or first demonstrated. Time period is derived from it. |

Tags are stored on the `nominees` table (schema v16) and set by `CASE_TAGS` in `public/_worker.js`. The admin
API accepts the same fields, so later cases can be tagged without a deploy.

## Method, version 0.1

1. Two coders tagged all twelve cases independently, from the codebook and each case's sourced story
   (`public/carousels/<slug>.json`). Neither saw the other's work. Each wrote a reason for every call.
2. A separate reviewer checked every citation and formal term in the codebook against the literature. Its
   fixes are applied: Goodhart's and Campbell's laws moved from "Chasing the wrong number" to "The reward gets
   gamed"; the rebound effect moved to "Solve a shortage"; risk compensation and "self-defeating prophecy"
   were dropped as poor fits; moral hazard moved to "The risk piles up"; the resistance and commons
   definitions were tightened; missing sources were added.
3. Agreement was measured per field, then an editor settled the disagreements below.

**Limitation, stated plainly:** both coders were AI passes run from the same model and the same sources. Their
agreement is an upper bound, not evidence of reliability. Version 1.0 needs at least two human coders working
blind, with Cohen's kappa of 0.7 or better on the main pattern before the tags are called reliable.

## Agreement

| Field | Measure | Result |
|---|---|---|
| Main pattern | Percent agreement, Cohen's kappa | 92%, 0.90 |
| All patterns | Mean Jaccard overlap | 0.90 |
| Scale | Percent agreement, kappa | 100%, 1.00 |
| Time lag | Percent agreement, kappa | 83%, 0.72 |
| Who pays | Mean Jaccard overlap | 0.97 |
| Reversibility | Percent agreement, kappa | 100%, 1.00 |
| Began | Exact year | 11 of 12 |

## Decisions on disagreements

| Case | Field | Coder A | Coder B | Decision and reason |
|---|---|---|---|---|
| Bassett | Main pattern | The problem moves | Cheap now, paid later | **The problem moves.** A federal judge warned of segregation by income in 1924, so delay is not why the harm was missed, which fails the second condition of "Cheap now, paid later." |
| Bassett | Also | Great for one, bad for all | The problem moves | **Great for one, bad for all.** Each town gains by zoning for itself; the regional housing shortage comes from the total. |
| Midgley | Also | none | Too stable to go away | **Too stable to go away.** Midgley's case covers both of his fixes, and the CFCs lasted long enough to reach the ozone layer. Multiple tags exist for exactly this. |
| Borlaug | Began | 1966 | 1963 | **1963,** the first trials in India, following the "first demonstrated" rule. |
| Müller | Time lag | Decades | Years | **Decades.** DDT came into use in the 1940s; eggshell thinning was documented in the late 1960s. |
| Müller | Who pays | adds users | without users | **Include users.** Mosquito resistance undercut the malaria programs DDT served. |
| Zuckerberg | Time lag | Years | Under a year | **Years.** The harms of the 2018 feed change were reported over the following years. |

## Open items

1. **Two published stories name a different main pattern than the coding.** Until the editor decides, the
   stored tags put the story's pattern first, so the site never contradicts a published card: Borlaug is
   tagged later, everyone; Bassett later, moved, everyone. Borlaug's and Bassett's pattern
   cards say "Cheap now, paid later." The coding says "Great for one, bad for all" (Borlaug) and "The problem
   moves" (Bassett). The editor decides: change the cards, or recode.
2. Human coders for version 1.0, and a coder guide with worked examples per pattern.
3. Structured fields for the new story cards, so the database can hold them: `risks` (what was on the table),
   `mitigations` (what might have caught or softened each one, and whether it existed then) and `whatIf`
   (the documented fork and the alternative). These are the fields that make the database useful for
   training a model to spot backfires in a new design.
