# Road Story: project context

## Stack
- SvelteKit (runs on Vite). Dev server: `npm run dev`, http://localhost:5173.
- Svelte 5 runes ($state, $derived, $props; not legacy `$:`).
- D3 for scales, axes, CSV loading, and path calculations. Svelte renders data
  marks in markup, using {#each} for repeated marks. D3 may draw axes in dedicated <g> elements.
- Scrollama for scroll steps. It is BROWSER-ONLY (Intersection Observer): call
  scrollama() inside onMount, never at module top level, or SSR crashes with
  "window is not defined".
- Imports use relative paths (`../lib/LineChart.svelte`); this SvelteKit 3 scaffold
  uses the `#lib` subpath alias, not `$lib`.

## Files
- src/routes/+page.svelte — owns `step`, the scene table, Scrollama setup, narration.
- src/lib/LineChart.svelte — renders one measure over year from props only.
- STORYBOARD.md — scene plan and narration; the page must match it.

## Scrollytelling architecture
- One shared scene state: `let step = $state(0)`. Scrollama's onStepEnter sets it to
  the active step index. Keep one owner for this value; in the core version, only onStepEnter updates it.
- Derive the measure, x-domain/zoom, and highlighted year from `step` in
  +page.svelte. Pass them to LineChart as measure, xDomain, and highlightedYear
  props alongside data. Keep step in the page; LineChart renders the supplied
  settings and never updates itself imperatively. Navigation controls scroll to a step rather than setting step.
- Layout: a `.graphic` div with `position: sticky; top: 0; height: 100vh`, and a
  `.steps` column of `<div class="step">` blocks (~90vh each), one per scene.

## Pacing
- The first step establishes the graphic. Each later step changes one thing:
  add a line, change a measure, zoom, or highlight a year. Split independent changes.

## Claims and evidence
- `fatalities` is a COUNT; `rate_per_100m_vmt` is RISK PER MILE. Every scene must
  make clear which one it shows. They can move in opposite directions.
- Check every trend against the relevant years. The presence of a column does not
  establish a cause. This dataset supports descriptions and comparisons, not causal claims.
- The files summarize deaths in fatal crashes; do not infer total crashes or injuries.
- 2024 is a preliminary Annual Report File value; earlier years are FARS Final.

## Data (in static/, load with d3.csv in onMount)
- us_road_deaths_by_year.csv: year, fatalities, vmt_billions, rate_per_100m_vmt,
  population. 1975–2024, 50 rows. Convert all to numbers.
- fatal_crashes_2022_when.csv (stretch): dimension (day_of_week|hour|month),
  bucket, sort_key, deaths.

## Git workflow
- After checking a working feature, remind me to `git add -A && git commit`.
- If a change breaks a scene, inspect the diff before deciding whether to restore it.

## Definition of done
- npm run dev, no console errors, including while scrolling.
- Sticky graphic and 5-7 core steps, one per storyboard scene. Compare count and rate.
  Each transition changes one thing.
- Factual claims supported by the CSV; no unsupported or overstated wording.
