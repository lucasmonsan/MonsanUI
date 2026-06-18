<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		variant?: 'default' | 'error';
		align?: 'left' | 'center' | 'right';
		disabled?: boolean;
	}

	let {
		children,
		href,
		onclick,
		variant = 'default',
		align = 'center',
		disabled = false
	}: Props = $props();
</script>

{#if href && !disabled}
	<a class="monsan-menu-item {variant} align-{align}" role="menuitem" {href} {onclick}>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		class="monsan-menu-item {variant} align-{align}"
		role="menuitem"
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
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-secondary);
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
		background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-secondary));
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.error {
		background: var(--error);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .error {
		color: var(--text-primary);
	}

	.error:hover:not(:disabled) {
		background: color-mix(in srgb, var(--error) 18%, var(--bg-primary));
	}

	.monsan-menu-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.monsan-menu-item:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-menu-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	:global([data-theme='light']) .error {
		color: var(--error);
		background: color-mix(in srgb, var(--error) 12%, var(--bg-primary));
	}
</style>
