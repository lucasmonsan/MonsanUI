<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value: string | number;
		label: string;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
		showLabel?: boolean;
		interactive?: boolean;
	}

	let {
		value,
		label,
		children,
		onclick,
		disabled = false,
		variant = 'primary',
		showLabel = false,
		interactive = Boolean(onclick)
	}: Props = $props();

	let isButton = $derived(Boolean(onclick || interactive));
</script>

{#if isButton}
	<button
		type="button"
		class="monsan-metric-button variant-{variant}"
		class:is-interactive={interactive}
		title={label}
		aria-label={`${label}: ${value}`}
		{disabled}
		{onclick}
	>
		{#if showLabel}
			<span class="metric-label">{label}</span>
			<span class="metric-separator" aria-hidden="true">:</span>
		{/if}
		<span class="metric-value">{value}</span>
		{#if children}
			<span class="metric-icon" aria-hidden="true">{@render children()}</span>
		{/if}
	</button>
{:else}
	<span
		class="monsan-metric-button variant-{variant}"
		title={label}
		aria-label={`${label}: ${value}`}
	>
		{#if showLabel}
			<span class="metric-label">{label}</span>
			<span class="metric-separator" aria-hidden="true">:</span>
		{/if}
		<span class="metric-value">{value}</span>
		{#if children}
			<span class="metric-icon" aria-hidden="true">{@render children()}</span>
		{/if}
	</span>
{/if}

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
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		transition:
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
		box-sizing: border-box;
		text-decoration: none;
		white-space: nowrap;
	}

	.is-interactive {
		cursor: pointer;
	}

	.variant-primary {
		background-color: var(--accent-primary);
		color: var(--bg-primary);
	}

	.variant-secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}

	.variant-success {
		background-color: var(--success);
		color: var(--bg-primary);
	}

	.variant-error {
		background-color: var(--error);
		color: var(--bg-primary);
	}

	.variant-warning {
		background-color: var(--warning);
		color: var(--warning-contrast);
	}

	.variant-neutral {
		background-color: var(--neutral);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .variant-primary,
	:global([data-theme='dark']) .variant-success,
	:global([data-theme='dark']) .variant-error,
	:global([data-theme='dark']) .variant-warning,
	:global([data-theme='dark']) .variant-neutral {
		color: var(--text-primary);
	}

	:global([data-theme='dark']) .variant-success {
		background-color: color-mix(in srgb, var(--success) 75%, black);
	}

	:global([data-theme='dark']) .variant-error {
		background-color: color-mix(in srgb, var(--error) 75%, black);
	}

	:global([data-theme='dark']) .variant-warning {
		background-color: color-mix(in srgb, var(--warning) 75%, black);
	}

	:global([data-theme='dark']) .variant-neutral {
		background-color: color-mix(in srgb, var(--neutral) 75%, black);
	}

	.metric-label {
		font-size: var(--text-xs);
		font-weight: 800;
		line-height: 1;
		text-transform: uppercase;
	}

	.metric-separator {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
		line-height: 1;
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

	.is-interactive:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.is-interactive:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.is-interactive:focus-visible {
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
