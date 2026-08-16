<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import Badge from './Badge.svelte';

	interface Props {
		labels: string[];
		maxVisible?: number;
		onSurface?: boolean;
		fit?: boolean;
		moreLabel?: (hiddenLabels: readonly string[]) => string;
		children?: Snippet<[string]>;
	}

	let {
		labels,
		maxVisible = 3,
		onSurface = false,
		fit = false,
		moreLabel,
		children
	}: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let measureEl = $state<HTMLDivElement>();
	let fittedCount = $state(0);
	let resizeObserver: ResizeObserver | undefined;
	let pendingMeasure = false;
	let previousMeasureKey = '';

	let maximumVisible = $derived(Math.min(labels.length, Math.max(1, maxVisible)));
	let visibleCount = $derived(fit ? Math.min(fittedCount, maximumVisible) : maximumVisible);
	let visible = $derived(labels.slice(0, visibleCount));
	let hiddenLabels = $derived(labels.slice(visibleCount));
	let hiddenCount = $derived(hiddenLabels.length);

	function gapWidth(): number {
		if (!containerEl || typeof window === 'undefined') return 0;
		const gap = window.getComputedStyle(containerEl).gap;
		return Number.parseFloat(gap) || 0;
	}

	function widthOf(selector: string): number {
		const element = measureEl?.querySelector<HTMLElement>(selector);
		return element?.getBoundingClientRect().width ?? 0;
	}

	function updateFit() {
		pendingMeasure = false;
		if (!fit || !containerEl || !measureEl) {
			fittedCount = maximumVisible;
			return;
		}

		const available = containerEl.clientWidth;
		if (available <= 0 || labels.length === 0) {
			fittedCount = 0;
			return;
		}

		const gap = gapWidth();
		const widths = labels
			.slice(0, maximumVisible)
			.map((_, index) => widthOf(`[data-badge-measure="${index}"]`));
		const summaryWidth = widthOf('[data-badge-summary]');
		let consumed = 0;
		let count = 0;

		for (const width of widths) {
			const nextCount = count + 1;
			const remaining = labels.length - nextCount;
			const nextConsumed = consumed + width + (count > 0 ? gap : 0);
			const required = nextConsumed + (remaining > 0 ? gap + summaryWidth : 0);
			if (required > available) break;
			consumed = nextConsumed;
			count = nextCount;
		}

		fittedCount = count;
	}

	function scheduleFit() {
		if (pendingMeasure) return;
		pendingMeasure = true;
		void tick().then(updateFit);
	}

	$effect(() => {
		const measureKey = `${fit}:${maximumVisible}:${labels.join('\u001f')}`;
		if (measureKey !== previousMeasureKey) {
			previousMeasureKey = measureKey;
			scheduleFit();
		}
	});

	onMount(() => {
		if (!containerEl || typeof ResizeObserver === 'undefined') return;
		resizeObserver = new ResizeObserver(scheduleFit);
		resizeObserver.observe(containerEl);
		scheduleFit();
		return () => resizeObserver?.disconnect();
	});
</script>

<div bind:this={containerEl} class="monsan-badge-group" class:fit class:on-surface={onSurface}>
	{#each visible as label (label)}
		<span class="badge-fit-item" title={label}>
			{#if children}
				{@render children(label)}
			{:else}
				<Badge nowrap {onSurface}>{label}</Badge>
			{/if}
		</span>
	{/each}
	{#if hiddenCount > 0}
		<Badge nowrap {onSurface} title={hiddenLabels.join(', ')} ariaLabel={moreLabel?.(hiddenLabels)}
			>+{hiddenCount}</Badge
		>
	{/if}
</div>

{#if fit}
	<div bind:this={measureEl} class="badge-measurements" aria-hidden="true">
		{#each labels.slice(0, maximumVisible) as label, index (label)}
			<span class="badge-measurement" data-badge-measure={index}>
				{#if children}
					{@render children(label)}
				{:else}
					<Badge nowrap {onSurface}>{label}</Badge>
				{/if}
			</span>
		{/each}
		<span class="badge-measurement" data-badge-summary
			><Badge nowrap {onSurface}>+{labels.length}</Badge></span
		>
	</div>
{/if}

<style>
	.monsan-badge-group {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.badge-fit-item {
		display: inline-flex;
		min-width: 0;
	}

	.fit {
		overflow: hidden;
	}

	.fit .badge-fit-item {
		max-width: 100%;
	}

	.fit .badge-fit-item :global(.monsan-badge) {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge-measurements {
		position: fixed;
		inset: auto auto auto -10000px;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		width: max-content;
		visibility: hidden;
		pointer-events: none;
	}

	.badge-measurement {
		display: inline-flex;
	}
</style>
