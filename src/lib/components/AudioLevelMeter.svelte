<script lang="ts">
	interface Props {
		level?: number;
		bars?: number;
		active?: boolean;
		ariaLabel: string;
	}

	let { level = 0, bars = 7, active = false, ariaLabel }: Props = $props();

	let normalizedLevel = $derived(Math.min(1, Math.max(0, level)));
	let barCount = $derived(Math.max(3, Math.min(12, Math.round(bars))));
	let indices = $derived(Array.from({ length: barCount }, (_, index) => index));

	function heightFor(index: number): number {
		const center = (barCount - 1) / 2;
		const proximity = 1 - Math.abs(index - center) / Math.max(center, 1);
		return 0.2 + normalizedLevel * (0.38 + proximity * 0.62);
	}
</script>

<div
	class="monsan-audio-level-meter"
	class:active
	role="meter"
	aria-label={ariaLabel}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow={Math.round(normalizedLevel * 100)}
>
	{#each indices as index (index)}
		<span class="audio-level-bar" style:--audio-level-height={heightFor(index)} aria-hidden="true"
		></span>
	{/each}
</div>

<style>
	.monsan-audio-level-meter {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		width: 100%;
		height: 56px;
		padding: var(--space-sm);
		box-sizing: border-box;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		box-shadow: var(--shadow-sm);
	}

	.audio-level-bar {
		display: block;
		width: 8px;
		height: calc(18% + var(--audio-level-height) * 82%);
		min-height: 8px;
		background: var(--text-secondary);
		border: var(--border-width) solid var(--border-color);
		transition:
			height 90ms linear,
			background-color 120ms var(--ease-out);
	}

	.monsan-audio-level-meter.active .audio-level-bar {
		background: var(--accent-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.audio-level-bar {
			transition: none;
		}
	}
</style>
