<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string | number;
		label: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { value, label, children, onclick }: Props = $props();
</script>

<button class="monsan-metric-button" title={label} aria-label={`${label}: ${value}`} {onclick}>
	<span class="metric-value">{value}</span>
	{#if children}
		<span class="metric-icon" aria-hidden="true">{@render children()}</span>
	{/if}
</button>

<style>
	.monsan-metric-button {
		min-width: calc(var(--control-height) * 1.25);
		height: calc(var(--control-height) * 1.25);
		padding: var(--space-xs);
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		background: var(--accent-primary);
		color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.metric-value {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 800;
		line-height: 1;
	}

	.metric-icon {
		display: flex;
		align-items: center;
	}

	.monsan-metric-button:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.monsan-metric-button:active {
		transform: translate(2px, 2px);
		box-shadow: none;
	}
</style>
