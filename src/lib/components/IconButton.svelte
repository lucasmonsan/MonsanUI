<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		label: string;
		title?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
		size?: 'sm' | 'md';
		selected?: boolean;
		/** Optional visible numeric counter. Zero and negative values are hidden. */
		count?: number;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		role?: 'menuitem';
		onSurface?: boolean;
	}

	let {
		children,
		label,
		title = label,
		type = 'button',
		variant = 'secondary',
		size = 'md',
		selected,
		count = 0,
		disabled = false,
		onclick,
		role,
		onSurface = false
	}: Props = $props();

	let visibleCount = $derived(Math.max(0, Math.trunc(count)));
	let accessibleLabel = $derived(visibleCount > 0 ? `${label}: ${visibleCount}` : label);
</script>

<button
	{type}
	{title}
	{disabled}
	{onclick}
	{role}
	class="monsan-icon-button {variant} size-{size}"
	class:selected
	class:on-surface={onSurface}
	aria-label={accessibleLabel}
	aria-pressed={selected}
>
	{@render children()}
	{#if visibleCount > 0}
		<span class="icon-button-count" aria-hidden="true">{visibleCount}</span>
	{/if}
</button>

<style>
	.monsan-icon-button {
		position: relative;
		width: var(--control-height);
		height: var(--control-height);
		padding: 0;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-primary);
		background: var(--bg-secondary);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out),
			border-color 0.1s var(--ease-out),
			color 0.1s var(--ease-out);
	}

	.icon-button-count {
		position: absolute;
		top: -0.45rem;
		right: -0.45rem;
		min-width: 1.1rem;
		height: 1.1rem;
		padding: 0 var(--space-xxs);
		border: var(--border-width) solid var(--border-color);
		border-radius: 999px;
		background: var(--error);
		color: var(--bg-primary);
		font-family: var(--font-display);
		font-size: 0.625rem;
		font-weight: 800;
		line-height: calc(1.1rem - var(--border-width) * 2);
		pointer-events: none;
	}

	.primary,
	.selected {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.success {
		background: var(--success);
		color: var(--bg-primary);
	}

	.warning {
		background: var(--warning);
		color: var(--warning-contrast);
	}

	.error {
		background: var(--error);
		color: var(--bg-primary);
	}

	.ghost {
		background: transparent !important;
		border-color: transparent !important;
		box-shadow: none !important;
		transform: none !important;
	}

	.monsan-icon-button.on-surface {
		background: color-mix(in srgb, var(--monsan-surface-foreground) 12%, transparent);
		border-color: var(--monsan-surface-foreground);
		box-shadow: 2px 2px 0 var(--monsan-surface-foreground);
		color: var(--monsan-surface-foreground);
	}

	.monsan-icon-button.ghost.on-surface:hover:not(:disabled) {
		background: color-mix(in srgb, var(--monsan-surface-foreground) 18%, transparent) !important;
	}

	.monsan-icon-button.ghost,
	.monsan-icon-button.ghost:hover:not(:disabled),
	.monsan-icon-button.ghost:active:not(:disabled) {
		box-shadow: none !important;
		transform: none !important;
	}

	.monsan-icon-button.ghost:hover:not(:disabled) {
		background: color-mix(in srgb, var(--text-primary) 8%, transparent) !important;
		border-color: transparent !important;
	}

	.monsan-icon-button.ghost:active:not(:disabled) {
		background: color-mix(in srgb, var(--text-primary) 12%, transparent) !important;
		border-color: transparent !important;
		opacity: 0.8;
	}

	:global([data-theme='dark']) .primary,
	:global([data-theme='dark']) .success,
	:global([data-theme='dark']) .warning,
	:global([data-theme='dark']) .error {
		color: var(--text-primary);
	}

	.monsan-icon-button:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.monsan-icon-button:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-icon-button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-icon-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-icon-button {
			transition: none;
		}
	}

	.size-sm {
		width: calc(var(--control-height) * 0.8);
		height: calc(var(--control-height) * 0.8);
		box-shadow: 2px 2px 0 var(--text-primary);
	}

	.size-sm:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0 var(--text-primary);
	}

	.size-sm:active:not(:disabled) {
		transform: translate(1px, 1px);
		box-shadow: none;
	}
</style>
