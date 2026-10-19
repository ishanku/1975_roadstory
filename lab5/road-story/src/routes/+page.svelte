<!--
  +page.svelte — Road Story (CS171 Lab 5 reference solution)

  How it works
    1. ONE piece of shared state: `step` (the active scene index).
    2. Scrollama's onStepEnter is the ONLY code that sets `step`.
    3. measure, xDomain and highlightedYear are $derived from `step`
       and passed to <LineChart> as props.
    4. Each scene changes exactly ONE of those three settings.
-->
<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import scrollama from 'scrollama';
	import LineChart from '../lib/LineChart.svelte';

	// ---- Shared scene state -------------------------------------------------
	let step = $state(0); // current scene index, owned by Scrollama

	// ---- Data ---------------------------------------------------------------
	let deaths = $state([]);
	let loadError = $state(null);

	// ---- Scene table (mirrors STORYBOARD.md) ---------------------------------
	// Each row = graphic state for one scene. Compare neighbours: exactly one
	// field differs between scene N and scene N+1.
	const ZOOM = [2010, 2024];
	const scenes = [
		{ act: 'Exposition', measure: 'fatalities', xDomain: null, highlightedYear: null },
		{ act: 'Rising action', measure: 'fatalities', xDomain: null, highlightedYear: 2011 }, // + highlight
		{ act: 'Rising action', measure: 'rate_per_100m_vmt', xDomain: null, highlightedYear: 2011 }, // measure
		{ act: 'Climax', measure: 'rate_per_100m_vmt', xDomain: null, highlightedYear: 2020 }, // highlight moves
		{ act: 'Climax', measure: 'rate_per_100m_vmt', xDomain: ZOOM, highlightedYear: 2020 }, // zoom in
		{ act: 'Falling action', measure: 'fatalities', xDomain: ZOOM, highlightedYear: 2020 }, // measure
		{ act: 'Resolution', measure: 'fatalities', xDomain: null, highlightedYear: 2020 } // zoom out
	];

	// ---- Values the graphic reads, all derived from `step` -------------------
	let scene = $derived(scenes[step]);
	let measure = $derived(scene.measure);
	let xDomain = $derived(scene.xDomain);
	let highlightedYear = $derived(scene.highlightedYear);

	// Step elements, so the reader controls can scroll to them.
	let stepEls = $state([]);

	// Reader control: scroll to a step. Scrollama then sets `step` itself,
	// so there is still only one owner of the state.
	function goTo(i) {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		stepEls[i]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
	}

	onMount(() => {
		// Load the CSV in the browser and convert every column to a number.
		d3.csv('/us_road_deaths_by_year.csv', (d) => ({
			year: +d.year,
			fatalities: +d.fatalities,
			vmt_billions: +d.vmt_billions,
			rate_per_100m_vmt: +d.rate_per_100m_vmt,
			population: +d.population
		}))
			.then((rows) => (deaths = rows))
			.catch((err) => (loadError = err.message));

		// Scrollama is browser-only, so it is created here, never at module level.
		const scroller = scrollama();
		scroller
			.setup({ step: '.step', offset: 0.6 })
			.onStepEnter(({ index }) => {
				step = index; // scrolling updates the state
			});

		const onResize = () => scroller.resize();
		window.addEventListener('resize', onResize);

		// Cleanup when the page is destroyed.
		return () => {
			window.removeEventListener('resize', onResize);
			scroller.destroy();
		};
	});
</script>

<svelte:head>
	<title>Road deaths: count vs. rate, 1975–2024</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<header class="intro">
	<h1>Per mile, U.S. driving is about a third as deadly as in 1975. In 2020 the rate jumped back near its 2007 level.</h1>
	<p class="dek">
		Fifty years of U.S. road deaths, told two ways: how many people died, and how many died per mile
		driven. Scroll to move through the story.
	</p>
</header>

<section class="scrolly">
	<div class="graphic" aria-live="polite">
		{#if loadError}
			<p class="error">Could not load the data: {loadError}</p>
		{:else if deaths.length}
			<LineChart data={deaths} {measure} {xDomain} {highlightedYear} />
		{:else}
			<p class="loading">Loading data…</p>
		{/if}
	</div>

	<div class="steps">
		<!-- Scene 1 · Exposition: establish the graphic (count, full range) -->
		<div class="step" class:active={step === 0} bind:this={stepEls[0]}>
			<p class="act">Exposition</p>
			<p>
				In 1975, <strong>44,525</strong> people died in U.S. motor-vehicle traffic crashes. In 2024
				the count was <strong>39,254</strong>, a preliminary figure. In between, the yearly count
				rose and fell rather than moving in one direction.
			</p>
		</div>

		<!-- Scene 2 · Rising action: highlight 2011 -->
		<div class="step" class:active={step === 1} bind:this={stepEls[1]}>
			<p class="act">Rising action</p>
			<p>
				The count peaked at 51,093 in 1979. Its lowest point in this file came in
				<strong>2011: 32,479 deaths</strong>.
			</p>
		</div>

		<!-- Scene 3 · Rising action: change measure to the rate -->
		<div class="step" class:active={step === 2} bind:this={stepEls[2]}>
			<p class="act">Rising action</p>
			<p>
				Now the same years as a <strong>rate</strong>: deaths per 100 million vehicle-miles. It fell
				from 3.35 in 1975 to <strong>1.10 in 2011</strong>, about two-thirds lower. Miles driven
				more than doubled over those years, so the count fell much less than the rate.
			</p>
		</div>

		<!-- Scene 4 · Climax: move highlight to 2020 -->
		<div class="step" class:active={step === 3} bind:this={stepEls[3]}>
			<p class="act">Climax</p>
			<p>
				In 2020, Americans drove about 11% fewer miles than in 2019. The rate still rose, from 1.11
				to <strong>1.34</strong>, its highest level since 2007.
			</p>
		</div>

		<!-- Scene 5 · Climax: zoom to 2010–2024 -->
		<div class="step" class:active={step === 4} bind:this={stepEls[4]}>
			<p class="act">Climax, zoomed to 2010–2024</p>
			<p>
				This view shows only 2010–2024. From 2010 to 2019 the rate stayed between 1.08 and 1.19. It
				was 1.34 or higher from 2020 to 2022, peaking at 1.38 in 2021. By 2024 it had eased to
				1.19, which matches the highest year of 2010–2019.
			</p>
		</div>

		<!-- Scene 6 · Falling action: change measure back to the count -->
		<div class="step" class:active={step === 5} bind:this={stepEls[5]}>
			<p class="act">Falling action</p>
			<p>
				Counted as <strong>deaths</strong>, the same window shows 36,355 in 2019, 39,007 in 2020, and
				43,230 in 2021, the most since 2005. The 2024 count, 39,254, is still above 2019.
			</p>
		</div>

		<!-- Scene 7 · Resolution: zoom back out to the full range -->
		<div class="step" class:active={step === 6} bind:this={stepEls[6]}>
			<p class="act">Resolution</p>
			<p>
				Across all fifty years, the rate fell about 64% (3.35 to 1.19). The count fell about 12%,
				because Americans drove about 2.5 times as many miles. These figures count deaths only, not
				crashes or injuries. They do not show why the rate rose in 2020; that question needs other
				data.
			</p>
		</div>
	</div>
</section>

<!-- Reader controls (stretch goal): jump to a scene. It scrolls; Scrollama sets `step`. -->
<nav class="progress" aria-label="Story scenes">
	{#each scenes as s, i}
		<button
			class:current={step === i}
			aria-current={step === i ? 'step' : undefined}
			aria-label={`Scene ${i + 1}: ${s.act}`}
			onclick={() => goTo(i)}
		></button>
	{/each}
</nav>

<footer class="notes">
	<p>
		Sources: NHTSA Fatality Analysis Reporting System (deaths), Federal Highway Administration
		(vehicle-miles traveled). Rate = deaths ÷ (billions of vehicle-miles × 10). The 2024 count is a
		preliminary Annual Report File value; earlier years are FARS Final. Published headline numbers
		for recent years may differ by a few hundred because of these revisions.
	</p>
</footer>

<style>
	/* ---- Design tokens: asphalt ink, lane-marking yellow ---- */
	:global(:root) {
		--bg: #eef1f3;
		--ink: #1f2a33;
		--ink-soft: #56616b;
		--rule: #d3d9de;
		--signal: #d99a00;
		--card: rgba(238, 241, 243, 0.94);
		color-scheme: light;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #161c21;
			--ink: #e6eaed;
			--ink-soft: #9aa5ae;
			--rule: #2b353d;
			--signal: #f2b829;
			--card: rgba(22, 28, 33, 0.94);
			color-scheme: dark;
		}
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family: 'Public Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
		line-height: 1.55;
	}

	.intro {
		max-width: 46rem;
		padding: 18vh 1.5rem 10vh;
		margin: 0 auto;
	}
	h1 {
		font-size: clamp(1.8rem, 4vw, 2.9rem);
		line-height: 1.12;
		font-weight: 800;
		margin: 0 0 1rem;
		letter-spacing: -0.01em;
	}
	.dek {
		font-size: 1.15rem;
		color: var(--ink-soft);
		max-width: 38rem;
	}

	/* ---- Scrollytelling layout (from the lab handout) ---- */
	.scrolly {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
		align-items: start;
		padding: 0 1.5rem;
		max-width: 80rem;
		margin: 0 auto;
	}
	.graphic {
		position: sticky;
		top: 0;
		height: 100vh;
		padding: 6vh 0;
		box-sizing: border-box;
	}
	.step {
		min-height: 90vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		opacity: 0.35;
		transition: opacity 0.3s;
	}
	.step.active {
		opacity: 1;
	}
	.step p {
		margin: 0 0 0.5rem;
		font-size: 1.05rem;
		max-width: 30rem;
	}
	.step .act {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink-soft);
		border-left: 4px solid var(--signal);
		padding-left: 0.6rem;
	}
	.step:last-child {
		margin-bottom: 30vh;
	}
	.loading,
	.error {
		color: var(--ink-soft);
	}

	/* ---- Reader controls ---- */
	.progress {
		position: fixed;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.progress button {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--ink-soft);
		background: transparent;
		padding: 0;
		cursor: pointer;
	}
	.progress button.current {
		background: var(--signal);
		border-color: var(--signal);
	}
	.progress button:focus-visible {
		outline: 3px solid var(--ink);
		outline-offset: 2px;
	}

	.notes {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}

	/* ---- Narrow screens: graphic pinned on top, text cards scroll over it ---- */
	@media (max-width: 760px) {
		.scrolly {
			display: block;
		}
		.graphic {
			height: 58vh;
			padding: 1rem 0;
		}
		.steps {
			position: relative;
			z-index: 1;
		}
		.step {
			min-height: 80vh;
			justify-content: flex-end;
		}
		.step > * {
			background: var(--card);
		}
		.step p:not(.act) {
			padding: 0.75rem;
			border-radius: 6px;
		}
		.progress {
			display: none;
		}
	}
</style>
