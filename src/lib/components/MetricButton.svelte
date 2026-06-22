<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string | number;
		label: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
	}

	let { value, label, children, onclick, disabled = false }: Props = $props();
</script>

<button
	type="button"
	class="monsan-metric-button"
	title={label}
	aria-label={`${label}: ${value}`}
	{disabled}
	{onclick}
>
	<span class="metric-value">{value}</span>
	{#if children}
		<span class="metric-icon" aria-hidden="true">{@render children()}</span>
	{/if}
</button>

<style>
	.monsan-metric-button {
		min-width: var(--control-height);
		height: var(--control-height);
		padding: var(--space-xs) var(--space-sm);
		display: inline-flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		background: var(--accent-primary);
		color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition:
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	:global([data-theme='dark']) .monsan-metric-button {
		background-color: var(--accent-primary);
		color: var(--text-primary);
	}

	.metric-value {
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-weight: 800;
		line-height: 1;
	}

	.metric-icon {
		display: flex;
		align-items: center;
	}

	.monsan-metric-button:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.monsan-metric-button:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-metric-button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-metric-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-metric-button {
			transition: none;
		}
	}
</style>
