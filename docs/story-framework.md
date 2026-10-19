# The Backfire story framework

How every Backfire Awards post is built, and the tests it must pass before it ships. An agent reviews
each draft carousel against this file. The model is the Midgley draft (`public/carousels/drafts/midgley.json`).

Our version of hook and resolve: **hook with the irony, earn it with the facts, resolve with the lesson.**
The joke gets the reader in. The ledger and the pattern are why they save it. The lesson is what they take home.

## The arc

A story has four movements. Length flexes with the story: a simple Murphy can take 4 cards, a big nominee 16.
Instagram allows 20.

| # | Card | Required? | Its job |
|---|---|---|---|
| **Hook** | | | |
| 1 | Cover: headline and dek | Required | Stop the scroll. Name the thing and the stake in two sentences, with one sourced fact. |
| **The story** | | | |
| 2 | The bright idea | Required | The problem it was solving, in the world before. Credit first. |
| 3 | It worked | Required | The concrete success. |
| 4 | Wait, what? | Optional | A true, documented detail that turns the story. Use it only if one exists. |
| 5 | The backfire | Required | What went wrong, with one sourced number or concrete harm. |
| 6 | Second act | Optional | When the same person or idea did it again. |
| 7 | Could anyone have seen it coming? | Required | Knowable, partly, or unforeseeable, and how we know. |
| 8 | The cleanup | Optional | What it took to undo, and how long. |
| **The postmortem** | | | |
| 9 | The ledger: worth it? | Required | What it gave against what it cost, side by side. The verdict is the reader's. |
| 10 | Credit for trying | Required when a person is named | What we owe them: the real problem they took on, and what the rest of us learned. |
| 11 | What's the pattern? | Required | One of the nine patterns, its meaning, and why patterns matter. |
| 12 | How the pattern works | Optional | The mechanism in this story, if the pattern card doesn't carry it. |
| **The resolve** | | | |
| 13 | How you do this | Required | The same pattern in ordinary life or work. |
| 14 | Lessons | Required | Two or three observations to take home. |
| 15 | The ending | Required | Site: the vote ("Worth it?"). Instagram: "Worth it? 💡 Yes 🤦 No, answer in the comments," then follow, like and share. The Midgley ends on its trophy. |

## The tests

A draft fails if any **blocking** test fails.

### Truth (blocking)
1. Every fact, date and number has a source a reader could check. No myths, even popular ones.
2. Numbers keep their scope: "Americans alive in 2015," not "everyone."
3. Nothing rounds in our favor, and nothing contradicts another page on the site.
4. Never use a death, a suicide or a victim as a punchline.

### Fairness (blocking)
5. Credit the solution before the harm.
6. Judge decisions, not people: no motives, character or private life.
7. The ledger is balanced. If the costs are specific and sourced, the gains must be too.
8. The foresight card is honest about what was knowable then, not what is obvious now.

### Story (blocking)
9. Cold open: a stranger reading only the cover can say what this is and why it matters.
10. The cover names the thing (lead, Freon, Monopoly) in its first sentence.
11. Each card earns the next. No card repeats another card's line. Time runs forward, except for the foresight card.
12. The "How you do this" example has the same mechanism as the pattern, not merely a similar outcome.

### Voice (should fix)
13. Deadpan, not snide. The facts carry the irony.
14. Lessons are observations, not orders. No "you should," no slogans, no lines written to be pull quotes.
15. Plain words a reader without the background can follow.
16. US English. No em or en dashes. Year ranges as "1889 to 1944."
17. Avoid: villain, evil, idiot; claims about motives; undocumented effects.

### Fit and format (should fix)
18. Card text fits at 375 pixels wide with room above the footer. Body text is about 260 characters at most.
19. Every image has alt text and a credit line with its license.
20. Would someone save it? There must be a lesson worth keeping. Would someone share it? The hook must work without the rest.

## What the reviewer returns

```
VERDICT: SHIP or DO NOT SHIP
CARDS: each card title in order, with the arc beat it serves
MISSING BEATS: required cards that are absent
BLOCKING: failed tests, by number, with the card and a suggested rewrite
SHOULD FIX: the same, for the should-fix tests
FACT CHECK: each claim, its source, and whether it holds
```

## Why these rules exist

The tests come from mistakes the Midgley draft made or nearly made:

- The popular story that Midgley was killed by his own invention conflicts with the coroner, who ruled his death a suicide (test 4).
- The first pitch for the post said "dropping global IQs"; the study measured Americans alive in 2015 (test 2).
- A ledger listed sourced costs against vague gains (test 7).
- A workplace example showed the problem coming back, not moving (test 12).
- "Before your next fix" read as preachy (test 14).
- The pattern card listed all nine patterns without saying why patterns matter (card 11).
