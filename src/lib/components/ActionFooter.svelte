<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		position?: 'static' | 'sticky' | 'fixed';
		align?: 'start' | 'center' | 'end' | 'between' | 'split';
		wrap?: boolean;
		surface?: 'plain' | 'raised';
		mobileBlockLast?: boolean;
	}

	let {
		children,
		position = 'sticky',
		align = 'between',
		wrap = true,
		surface = 'plain',
		mobileBlockLast = false
	}: Props = $props();
</script>

<footer
	class="monsan-action-footer position-{position} align-{align} surface-{surface}"
	class:wrap
	class:mobile-block-last={mobileBlockLast}
>
	{@render children()}
</footer>

<style>
	.monsan-action-footer {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		box-sizing: border-box;
		padding: var(--space-sm) 0;
	}

	.wrap {
		flex-wrap: wrap;
	}

	.position-static {
		position: static;
	}

	.position-sticky {
		position: sticky;
		bottom: 0;
		z-index: 20;
		background: var(--bg-primary);
	}

	.position-fixed {
		position: fixed;
		left: 50%;
		bottom: var(--space-md);
		z-index: 1000;
		transform: translateX(-50%);
		width: min(calc(100% - var(--space-md) * 2), var(--container-max-width));
	}

	.align-start {
		justify-content: flex-start;
	}

	.align-center {
		justify-content: center;
	}

	.align-end {
		justify-content: flex-end;
	}

	.align-between {
		justify-content: space-between;
	}

	.align-split {
		display: grid;
		grid-template-columns: auto minmax(0, auto) auto;
		justify-content: space-between;
		column-gap: var(--space-sm);
	}

	.align-split > :global(:nth-child(1)) {
		justify-self: start;
		min-width: 0;
	}

	.align-split > :global(:nth-child(2)) {
		justify-self: center;
		min-width: 0;
	}

	.align-split > :global(:nth-child(3)) {
		justify-self: end;
		min-width: 0;
	}

	.surface-raised {
		padding: var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
	}

	@media (max-width: 640px) {
		.mobile-block-last > :global(:last-child) {
			width: 100%;
		}

		.mobile-block-last > :global(:last-child.monsan-button),
		.mobile-block-last > :global(:last-child .monsan-button) {
			width: 100%;
		}
	}
</style>
