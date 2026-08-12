<script lang="ts">
	interface Props {
		level?: number;
		active?: boolean;
		ariaLabel: string;
	}

	let { level = 0, active = false, ariaLabel }: Props = $props();
	let normalizedLevel = $derived(Math.min(1, Math.max(0, level)));
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
	{#each [0, 1, 2, 3, 4] as bar (bar)}
		<span data-bar={bar} style:--audio-level={normalizedLevel} aria-hidden="true"></span>
	{/each}
</div>

<style>
	.monsan-audio-level-meter {
		display: inline-flex;
		align-items: end;
		justify-content: center;
		gap: var(--space-xs);
		width: 6rem;
		height: 3rem;
		padding: var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
	}

	.monsan-audio-level-meter span {
		width: 0.45rem;
		height: 1.2rem;
		border-radius: var(--radius-sm);
		background: var(--text-secondary);
		transform: scaleY(max(0.14, var(--audio-level)));
		transform-origin: bottom;
		transition:
			transform 80ms ease-out,
			background-color 160ms ease-out;
	}

	.monsan-audio-level-meter span:nth-child(2),
	.monsan-audio-level-meter span:nth-child(4) {
		height: 1.75rem;
	}

	.monsan-audio-level-meter span:nth-child(3) {
		height: 2.25rem;
	}

	.monsan-audio-level-meter.active span {
		background: var(--accent-primary);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-audio-level-meter span {
			transition: none;
		}
	}
</style>
