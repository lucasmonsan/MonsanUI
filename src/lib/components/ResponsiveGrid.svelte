<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		minItemWidth?: 'xs' | 'sm' | 'md' | 'lg';
		gap?: 'sm' | 'md' | 'lg';
		align?: 'stretch' | 'start';
		columns?: 'auto' | '2' | '3' | '4';
		columnsBreakpoint?: 'md' | 'lg';
	}

	let {
		children,
		minItemWidth = 'md',
		gap = 'md',
		align = 'stretch',
		columns = 'auto',
		columnsBreakpoint = 'lg'
	}: Props = $props();
</script>

<div
	class="monsan-responsive-grid min-{minItemWidth} gap-{gap} align-{align} columns-{columns} columns-breakpoint-{columnsBreakpoint}"
>
	{@render children()}
</div>

<style>
	.monsan-responsive-grid {
		display: grid;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.min-xs {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
	}

	.min-sm {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
	}

	.min-md {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
	}

	.min-lg {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
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

	.align-stretch {
		align-items: stretch;
	}

	.align-start {
		align-items: start;
	}

	@media (min-width: 768px) {
		.columns-breakpoint-md.columns-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.columns-breakpoint-md.columns-3 {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.columns-breakpoint-md.columns-4 {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (min-width: 900px) {
		.columns-breakpoint-lg.columns-2 {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.columns-breakpoint-lg.columns-3 {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.columns-breakpoint-lg.columns-4 {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
