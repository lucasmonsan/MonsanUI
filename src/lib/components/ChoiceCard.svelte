<script lang="ts">
	import type { Component } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		description?: string;
		actionLabel?: string;
		variant?: 'default' | 'accent';
		disabled?: boolean;
		onclick?: () => void;
		icon?: Component<{ size?: number }>;
		ariaLabel?: string;
	}

	let {
		title,
		description,
		actionLabel,
		variant = 'default',
		disabled = false,
		onclick,
		icon,
		ariaLabel
	}: Props = $props();

	const resolvedAriaLabel = $derived(
		ariaLabel ?? (actionLabel ? `${title}. ${actionLabel}` : title)
	);
</script>

<button
	type="button"
	class="monsan-choice-card {variant}"
	{disabled}
	aria-label={resolvedAriaLabel}
	{onclick}
>
	{#if icon}
		{@const Icon = icon}
		<div class="choice-icon" aria-hidden="true">
			<Icon size={24} />
		</div>
	{/if}
	<Text tag="span" size="md" weight="bold">{title}</Text>
	{#if description}
		<Text tag="span" size="sm" variant="secondary">{description}</Text>
	{/if}
	{#if actionLabel}
		<span class="choice-action">
			{actionLabel}
			<span aria-hidden="true">-></span>
		</span>
	{/if}
</button>

<style>
	.monsan-choice-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-sm);
		width: 100%;
		min-height: 100%;
		padding: var(--space-lg);
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.15s var(--ease-out),
			filter 0.15s var(--ease-out),
			background-color 0.15s ease;
	}

	.monsan-choice-card:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.monsan-choice-card:active:not(:disabled) {
		transform: scale(0.98);
	}

	.monsan-choice-card:focus-visible {
		outline: var(--border-width) solid var(--accent-primary);
		outline-offset: var(--space-xs);
	}

	.monsan-choice-card:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.accent {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.accent :global(.monsan-text) {
		color: inherit;
	}

	.choice-icon {
		display: inline-flex;
		color: currentColor;
	}

	.choice-action {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: auto;
		font-size: var(--text-sm);
		font-weight: 800;
		color: currentColor;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-choice-card {
			transition: none;
		}
	}
</style>
