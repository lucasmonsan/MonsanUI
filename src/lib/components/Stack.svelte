<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		align?: 'stretch' | 'start' | 'center' | 'end';
		justify?: 'start' | 'center' | 'between';
		textAlign?: 'start' | 'center';
		fullWidth?: boolean;
		fullHeight?: boolean;
	}

	let {
		children,
		gap = 'md',
		align = 'stretch',
		justify = 'start',
		textAlign = 'start',
		fullWidth = false,
		fullHeight = false
	}: Props = $props();
</script>

<div
	class="monsan-stack gap-{gap} align-{align} justify-{justify} text-{textAlign}"
	class:full-width={fullWidth}
	class:full-height={fullHeight}
>
	{@render children()}
</div>

<style>
	.monsan-stack {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.full-width {
		width: 100%;
	}
	.full-height {
		height: 100%;
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
	.gap-xl {
		gap: var(--space-xl);
	}

	.align-stretch {
		align-items: stretch;
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

	.text-start {
		text-align: start;
	}
	.text-center {
		text-align: center;
	}
</style>
