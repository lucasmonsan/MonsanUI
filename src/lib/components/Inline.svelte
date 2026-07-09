<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
		align?: 'start' | 'center' | 'end' | 'stretch';
		justify?: 'start' | 'center' | 'between' | 'end';
		wrap?: boolean;
		fullWidth?: boolean;
		growChildren?: boolean;
		growFirstChild?: boolean;
		growLastChild?: boolean;
		collapseBelow?: 'never' | 'sm' | 'md';
	}

	let {
		children,
		gap = 'md',
		align = 'center',
		justify = 'start',
		wrap = false,
		fullWidth = false,
		growChildren = false,
		growFirstChild = false,
		growLastChild = false,
		collapseBelow = 'never'
	}: Props = $props();
</script>

<div
	class="monsan-inline gap-{gap} align-{align} justify-{justify} collapse-{collapseBelow}"
	class:wrap
	class:full-width={fullWidth}
	class:grow-children={growChildren}
	class:grow-first-child={growFirstChild}
	class:grow-last-child={growLastChild}
>
	{@render children()}
</div>

<style>
	.monsan-inline {
		display: flex;
		box-sizing: border-box;
	}
	.monsan-inline > :global(svg) {
		flex-shrink: 0;
	}

	.wrap {
		flex-wrap: wrap;
	}
	.full-width {
		width: 100%;
	}
	.grow-children > :global(*) {
		flex: 1 1 0;
		min-width: 0;
	}
	.grow-first-child > :global(:first-child) {
		flex: 1 1 0;
		width: auto;
		min-width: 0;
	}
	.grow-first-child > :global(:not(:first-child)) {
		flex: 0 0 auto;
		width: auto;
	}

	.grow-first-child > :global(.monsan-button.square),
	.grow-first-child > :global(.monsan-icon-button) {
		width: var(--control-height);
		height: var(--control-height);
	}

	.grow-last-child > :global(:last-child) {
		flex: 1 1 0;
		width: auto;
		min-width: 0;
	}
	.grow-last-child > :global(:not(:last-child)) {
		flex: 0 0 auto;
		width: auto;
	}

	.grow-last-child > :global(.monsan-button.square),
	.grow-last-child > :global(.monsan-icon-button) {
		width: var(--control-height);
		height: var(--control-height);
	}

	.gap-xxs {
		gap: var(--space-xxs);
	}
	.gap-xs {
		gap: var(--space-xs);
	}
	.gap-sm {
		gap: var(--space-sm);
	}
	.gap-md {
		gap: var(--space-md);
	}
	.gap-lg {
		gap: var(--space-lg);
	}
	.align-start {
		align-items: flex-start;
	}
	.align-center {
		align-items: center;
	}
	.align-end {
		align-items: flex-end;
	}
	.align-stretch {
		align-items: stretch;
	}
	.justify-start {
		justify-content: flex-start;
	}
	.justify-center {
		justify-content: center;
	}
	.justify-between {
		justify-content: space-between;
	}
	.justify-end {
		justify-content: flex-end;
	}

	@media (max-width: 640px) {
		.collapse-sm {
			flex-wrap: wrap;
		}

		.collapse-sm.grow-first-child > :global(:first-child) {
			flex: 1 1 100%;
			width: 100%;
		}

		.collapse-sm.grow-first-child > :global(:not(:first-child)) {
			flex: 1 1 auto;
		}

		.collapse-sm.grow-first-child > :global(.monsan-icon-button),
		.collapse-sm.grow-first-child > :global(.monsan-button.square) {
			flex: 0 0 auto;
		}

		.collapse-sm.grow-first-child > :global(form:has(> .monsan-icon-button)),
		.collapse-sm.grow-first-child > :global(form:has(> .monsan-button.square)) {
			flex: 0 0 auto;
			width: auto;
		}
	}

	@media (max-width: 768px) {
		.collapse-md {
			flex-wrap: wrap;
		}

		.collapse-md.grow-first-child > :global(:first-child) {
			flex: 1 1 100%;
			width: 100%;
		}

		.collapse-md.grow-first-child > :global(:not(:first-child)) {
			flex: 1 1 auto;
		}

		.collapse-md.grow-first-child > :global(.monsan-icon-button),
		.collapse-md.grow-first-child > :global(.monsan-button.square) {
			flex: 0 0 auto;
		}

		.collapse-md.grow-first-child > :global(form:has(> .monsan-icon-button)),
		.collapse-md.grow-first-child > :global(form:has(> .monsan-button.square)) {
			flex: 0 0 auto;
			width: auto;
		}
	}
</style>
