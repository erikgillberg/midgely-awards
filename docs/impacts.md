# Impacts over time

The goal: quantify and graph what each fix gave and what it cost, year by year, so every backfire can be weighed over its whole life. The data also has to be good enough to train a model on.

## Where it lives
- **`public/case-impacts.js`** is the source of truth. Edit the data there and bump `IMPACTS_VERSION`. On deploy, the worker copies it into three tables:
  - `impact_series`: one measured quantity, in one unit, for one fix of a case. It records direction (harm, benefit or context), unit, kind (flow, level or cumulative), geography, method and source.
  - `impact_points`: one row per series per year. Each row holds the value, the low and high range when the source gives one, a projected flag, an estimate flag, a note and a source.
  - `impact_money`: dollar estimates of harms and benefits, each with its dollar year, period and source.
- **`GET /api/impacts?n=<nominee>`** returns a case's series with their points, plus its dollar estimates. Leave out `n` to get every case. The data is public and every point is sourced.
- **The chart** is DB-06 on /dashboards, "Impact over time", one panel per case that has data. It can move onto each teardown's page later.

## Rules
1. Every point has a source. Projections and estimates are flagged, and ranges are kept when the source gives them.
2. One unit per series. Different units never share an axis: each series gets its own small chart on a shared timeline.
3. Dollar figures come from separate studies with different scopes and years, so they are listed side by side and never added up. A net figure needs one study that counts both sides on the same basis.
4. Nothing is interpolated. A gap in the data stays a gap.
5. Each case can carry dated turning points (`events`, for example the Montreal Protocol in 1987), which are drawn across all of its charts.

## Next
- Data for the other 11 cases, starting with those that have official time series: Haber (nitrogen use, Gulf dead zone area), Baekeland (plastic production), Muller (DDT use, eagle counts) and Franz (glyphosate use, resistant weed species).
- Where one study supports it, a net-benefit view in dollars per year.

## Vote limit
A "Worth it?" vote counts once per post per visitor per day, by a salted hash of the IP address. A browser can change or take back its own vote. Readers who share a network (an office, a school, a mobile carrier) share the limit, so a second person there waits a day. That is the accepted trade-off for a site without accounts.
