<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: 'xs' | 'sm' | 'md' | 'lg';
		align?: 'start' | 'center' | 'end';
		justify?: 'start' | 'center' | 'between' | 'end';
		wrap?: boolean;
		fullWidth?: boolean;
		growChildren?: boolean;
		growFirstChild?: boolean;
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
		collapseBelow = 'never'
	}: Props = $props();
</script>

<div
	class="monsan-inline gap-{gap} align-{align} justify-{justify} collapse-{collapseBelow}"
	class:wrap
	class:full-width={fullWidth}
	class:grow-children={growChildren}
	class:grow-first-child={growFirstChild}
>
	{@render children()}
</div>

<style>
	.monsan-inline {
		display: flex;
		box-sizing: border-box;
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
		.collapse-sm.grow-first-child > :global(.monsan-button.square),
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
		.collapse-md.grow-first-child > :global(.monsan-button.square),
		.collapse-md.grow-first-child > :global(form:has(> .monsan-icon-button)),
		.collapse-md.grow-first-child > :global(form:has(> .monsan-button.square)) {
			flex: 0 0 auto;
			width: auto;
		}
	}
</style>
