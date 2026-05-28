<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
		variant?: 'default' | 'error';
	}

	let { children, onclick, variant = 'default' }: Props = $props();
</script>

<button type="button" class="monsan-menu-item {variant}" role="menuitem" {onclick}>
	{@render children()}
</button>

<style>
	.monsan-menu-item {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		box-shadow: none;
		background: transparent;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-sm);
		white-space: nowrap;
		text-align: left;
	}

	.monsan-menu-item:hover {
		background: var(--bg-secondary);
		transform: none;
		box-shadow: none;
	}

	.error {
		color: var(--error);
	}

	.error:hover {
		background: color-mix(in srgb, var(--error) 10%, var(--bg-primary));
	}
</style>
