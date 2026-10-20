# The Backfire story framework

How every Backfire Awards post is built, and the tests it must pass before it ships. An agent reviews
each draft carousel against this file. The model is the Midgley draft (`public/carousels/drafts/midgley.json`).

Our version of hook and resolve: **hook with the irony, earn it with the facts, resolve with the lesson.**
The joke gets the reader in. The ledger and the pattern are why they save it. The lesson is what they take home.

## The arc

A story has four movements. Length flexes with the story: a simple Murphy can take 4 cards, a big nominee 18.
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
| 11 | What's the pattern? | Required | The case's main pattern from the codebook (public/codebook.js), its meaning, and why patterns matter. It must match the main pattern in the case's tags. |
| 12 | How the pattern works | Optional | The mechanism in this story, if the pattern card doesn't carry it. |
| **The resolve** | | | |
| 13 | How you do this | Required | The same pattern in the reader's own work: a product, a company, an invention. |
| 14 | With hindsight | Recommended | The risks that were on the table, and what might have caught or softened them, using what builders have learned since. Tie each one to a question from the pattern's "Ask before you ship" list. |
| 15 | What if? | Optional | One plausible alternative future from a documented fork in the road: the choice that was made, the one that wasn't, and where it could have led. Labeled as speculation. |
| 16 | Lessons | Required | Two or three observations to take home. With hindsight feeds this card; don't repeat it. |
| 17 | The ending | Required | Site: the vote ("Worth it?"). Instagram: "Worth it? 💡 Yes 🤦 No, answer in the comments," then follow, like and share. The Midgley ends on its trophy. |

## The tests

A draft fails if any **blocking** test fails.

### The hook (blocking)
The cover decides whether anyone sees the rest. Write at least five candidate headlines, pick the best
against these tests, and keep the runner-up for an Instagram A/B test.
H1. It names something the reader already knows in the first few words (Monopoly, Facebook, DDT,
    Roundup, dynamite, lead, highways, plastic, the web), not an unknown name or an abstraction.
H2. It turns in one line: what it was meant to do against what happened, or a fact that sounds wrong
    but is true.
H3. It works without the subtitle. If a stranger needs the dek to get it, it fails.
H4. It is short enough to read at a glance on a phone: about eight words, under about 48 characters.
H5. It makes a reader think "wait, really?" A headline that is merely accurate fails.
H6. It is true at the headline level too: no claim the story can't back, no scope stretched.
H7. The cover sets up; the swipe pays off. The subtitle is one line of setup, under 90 characters,
    and does not reveal the backfire. Curiosity comes from a gap the reader wants to close
    (Loewenstein, Psychological Bulletin, 1994); a cover that tells the whole story closes it.
H8. Card 2 must hook on its own too. Instagram reportedly re-shows a carousel starting from the second
    slide to people who scrolled past it.
H9. Measure, then adjust: these rules hold until our own swipe-through numbers say otherwise.
The editor (Erik) approves every cover before it goes live.

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
8a. With hindsight names mitigations that existed or were proposed at the time, or says plainly that a
    mitigation is what we know now. No "they should have known."
8b. A What if card starts from a real, documented choice point, is labeled "What if" on the card,
    and never states the alternative as fact. It is fun because it is plausible, not because it is wild.

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
18. Card text fits at 375 pixels wide with room above the footer, measured in a browser on every published nominee (staging, not only the local copy). Body text is about 260 characters at most; about 200 on a card with a photo.
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
- The pattern card listed every pattern without saying why patterns matter (card 11).
