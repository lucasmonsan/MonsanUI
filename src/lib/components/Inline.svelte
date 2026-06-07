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
	}

	let {
		children,
		gap = 'md',
		align = 'center',
		justify = 'start',
		wrap = false,
		fullWidth = false,
		growChildren = false,
		growFirstChild = false
	}: Props = $props();
</script>

<div
	class="monsan-inline gap-{gap} align-{align} justify-{justify}"
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
		flex: 1 1 auto;
		min-width: min(100%, 220px);
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
</style>
