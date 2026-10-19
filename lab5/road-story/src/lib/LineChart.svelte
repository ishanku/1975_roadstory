<!--
  LineChart.svelte
  Draws ONE measure over year. It never changes itself: the page derives the
  scene settings from `step` and passes them in as props.

  Props
    data             rows already converted to numbers
    measure          "fatalities" (a COUNT) or "rate_per_100m_vmt" (RISK PER MILE)
    xDomain          null = full year range, or [startYear, endYear] to zoom
    highlightedYear  null = no highlight, or a year to mark and label
-->
<script>
	import * as d3 from 'd3';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let { data = [], measure = 'fatalities', xDomain = null, highlightedYear = null } = $props();

	// Labels and formats per measure. The axis label switches together with
	// the line, as part of the same "change measure" step.
	const MEASURES = {
		fatalities: {
			axis: 'Deaths per year (count)',
			short: 'deaths',
			fmtTick: d3.format(','),
			fmtValue: d3.format(',')
		},
		rate_per_100m_vmt: {
			axis: 'Deaths per 100 million vehicle-miles (rate)',
			short: 'deaths per 100 million vehicle-miles',
			fmtTick: d3.format('.1f'),
			fmtValue: d3.format('.2f')
		}
	};
	let info = $derived(MEASURES[measure]);

	// Size follows the container (bound below); margins are fixed.
	let width = $state(640);
	let height = $state(480);
	const margin = { top: 28, right: 28, bottom: 44, left: 76 };
	let innerW = $derived(Math.max(0, width - margin.left - margin.right));
	let innerH = $derived(Math.max(0, height - margin.top - margin.bottom));

	// Full year range from the data; a scene may zoom into part of it.
	let fullYears = $derived(d3.extent(data, (d) => d.year));
	let targetX = $derived(xDomain ?? fullYears);

	// y starts at zero and uses the max of the FULL series for this measure,
	// so zooming changes only x and small changes are not exaggerated.
	let targetYMax = $derived((d3.max(data, (d) => d[measure]) ?? 1) * 1.08);

	// One plotted value per year for the current measure.
	let targetValues = $derived(data.map((d) => d[measure]));

	// Tweens animate between scenes; reduced-motion readers get instant changes.
	let duration = 700;
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) duration = 0;
	});
	const xT = new Tween([1975, 2024], { duration: 700, easing: cubicInOut });
	const yMaxT = new Tween(1, { duration: 700, easing: cubicInOut });
	const valuesT = new Tween([], { duration: 700, easing: cubicInOut });

	// Send each new target to its tween. The first real values snap in so the
	// opening scene does not animate up from nothing.
	let first = true;
	$effect(() => {
		if (!data.length || targetX[0] == null) return;
		const opts = { duration: first ? 0 : duration };
		xT.set([...targetX], opts);
		yMaxT.set(targetYMax, opts);
		valuesT.set([...targetValues], opts);
		first = false;
	});

	// Scales built from the tweened domains.
	let x = $derived(d3.scaleLinear().domain(xT.current).range([0, innerW]));
	let y = $derived(d3.scaleLinear().domain([0, yMaxT.current]).range([innerH, 0]));

	// Line points: year from the data, value from the tween (same index).
	let points = $derived(
		data.map((d, i) => ({ year: d.year, value: valuesT.current[i] ?? d[measure] }))
	);

	// D3 computes the path string only; Svelte renders the <path> in markup.
	let linePath = $derived(
		d3
			.line()
			.x((p) => x(p.year))
			.y((p) => y(p.value))(points) ?? ''
	);

	// Tick values chosen by D3, rendered by Svelte.
	let xTicks = $derived(x.ticks(Math.max(2, Math.floor(innerW / 80))));
	let yTicks = $derived(y.ticks(5));

	// The highlighted row. The label shows the real CSV value, not the tween.
	let hl = $derived(highlightedYear == null ? null : data.find((d) => d.year === highlightedYear));
	let hlPoint = $derived(hl ? points.find((p) => p.year === hl.year) : null);
	let labelX = $derived(hlPoint ? Math.min(Math.max(x(hlPoint.year), 70), innerW - 70) : 0);

	// Screen-reader description of the current scene.
	let ariaLabel = $derived(
		`Line chart of ${info.short} by year, ${targetX[0]} to ${targetX[1]}` +
			(hl ? `. Highlighted: ${hl.year}, ${info.fmtValue(hl[measure])} ${info.short}.` : '.')
	);
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {width} {height} role="img" aria-label={ariaLabel}>
		<defs>
			<!-- Clip so years outside a zoomed window do not draw over the axes. -->
			<clipPath id="plot-clip">
				<rect x="-6" y="-24" width={innerW + 12} height={innerH + 30} />
			</clipPath>
		</defs>

		<g transform={`translate(${margin.left},${margin.top})`}>
			<!-- y grid lines and tick labels -->
			{#each yTicks as t (t)}
				<g transform={`translate(0,${y(t)})`}>
					<line class="grid" x1="0" x2={innerW} />
					<text class="tick" x="-10" dy="0.32em" text-anchor="end">{info.fmtTick(t)}</text>
				</g>
			{/each}

			<!-- x tick labels (years) -->
			{#each xTicks as t (t)}
				<text class="tick" x={x(t)} y={innerH + 24} text-anchor="middle">{t}</text>
			{/each}
			<line class="baseline" x1="0" x2={innerW} y1={innerH} y2={innerH} />

			<!-- y-axis title names the measure and its unit -->
			<text
				class="axis-title"
				transform={`translate(${-60},${innerH / 2}) rotate(-90)`}
				text-anchor="middle">{info.axis}</text
			>

			<g clip-path="url(#plot-clip)">
				<!-- the data line -->
				<path class="line" d={linePath} />

				<!-- one small mark per year, rendered with {#each} -->
				{#each points as p (p.year)}
					<circle class="dot" cx={x(p.year)} cy={y(p.value)} r="2.2" />
				{/each}

				<!-- highlight, shown only when the scene sets highlightedYear -->
				{#if hlPoint}
					<line
						class="hl-rule"
						x1={x(hlPoint.year)}
						x2={x(hlPoint.year)}
						y1={y(hlPoint.value)}
						y2={innerH}
					/>
					<circle class="hl-dot" cx={x(hlPoint.year)} cy={y(hlPoint.value)} r="6" />
					<text class="hl-label" x={labelX} y={Math.max(y(hlPoint.value) - 16, -6)} text-anchor="middle">
						{hl.year}: {info.fmtValue(hl[measure])}
					</text>
				{/if}
			</g>
		</g>
	</svg>
</div>

<style>
	.chart {
		width: 100%;
		height: 100%;
	}
	svg {
		display: block;
		overflow: visible;
	}
	.grid {
		stroke: var(--rule);
	}
	.baseline {
		stroke: var(--ink-soft);
	}
	.tick {
		fill: var(--ink-soft);
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
	}
	.axis-title {
		fill: var(--ink);
		font-size: 0.85rem;
		font-weight: 600;
	}
	.line {
		fill: none;
		stroke: var(--ink);
		stroke-width: 2.5;
		stroke-linejoin: round;
	}
	.dot {
		fill: var(--ink);
	}
	.hl-rule {
		stroke: var(--signal);
		stroke-width: 1.5;
		stroke-dasharray: 4 4;
	}
	.hl-dot {
		fill: var(--signal);
		stroke: var(--bg);
		stroke-width: 2;
	}
	.hl-label {
		fill: var(--ink);
		font-size: 0.95rem;
		font-weight: 700;
		paint-order: stroke;
		stroke: var(--bg);
		stroke-width: 5px;
		font-variant-numeric: tabular-nums;
	}
</style>
