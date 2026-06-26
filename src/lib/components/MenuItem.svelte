<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		variant?: 'default' | 'error';
		align?: 'left' | 'center' | 'right';
		disabled?: boolean;
		selected?: boolean;
		checked?: boolean;
		current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
	}

	let {
		children,
		href,
		onclick,
		variant = 'default',
		align = 'center',
		disabled = false,
		selected = false,
		checked,
		current
	}: Props = $props();

	let itemRole = $derived(checked === undefined ? 'menuitem' : 'menuitemradio');
	let isSelected = $derived(selected || checked === true);
</script>

{#if href && !disabled}
	<a
		class="monsan-menu-item {variant} align-{align}"
		class:selected={isSelected}
		role={itemRole}
		aria-checked={checked}
		aria-current={current}
		data-menu-item="true"
		{href}
		{onclick}
	>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		class="monsan-menu-item {variant} align-{align}"
		class:selected={isSelected}
		role={itemRole}
		aria-checked={checked}
		aria-current={current}
		data-menu-item="true"
		{disabled}
		{onclick}
	>
		{@render children()}
	</button>
{/if}

<style>
	.monsan-menu-item {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		padding: var(--space-sm) var(--space-md);
		min-height: calc(var(--control-height) * 0.85);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		box-shadow: none;
		background: transparent;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font: inherit;
		font-family: var(--font-body);
		font-weight: 800;
		font-size: var(--text-sm);
		line-height: 1;
		margin: 0;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.12s var(--ease-out),
			border-color 0.12s var(--ease-out);
	}

	.align-left {
		justify-content: flex-start;
		text-align: left;
	}

	.align-center {
		justify-content: center;
		text-align: center;
	}

	.align-right {
		justify-content: flex-end;
		text-align: right;
	}

	.monsan-menu-item:hover:not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.error {
		color: var(--error);
	}

	.selected {
		background: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.error:hover:not(:disabled) {
		background: color-mix(in srgb, var(--error) 12%, var(--bg-primary));
		border-color: var(--error);
	}

	.selected:hover:not(:disabled) {
		background: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.monsan-menu-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.monsan-menu-item:active:not(:disabled) {
		transform: none;
		box-shadow: none;
	}

	.monsan-menu-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-menu-item {
			transition: none;
		}
	}
</style>
