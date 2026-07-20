<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns?: 'one' | 'two' | 'three' | '1-2' | '2-1' | '1-3' | '3-1' | 'row-actions';
		gap?: 'sm' | 'md' | 'lg';
		responsive?: boolean;
		fullHeight?: boolean;
	}

	let {
		children,
		columns = 'two',
		gap = 'md',
		responsive = true,
		fullHeight = false
	}: Props = $props();
</script>

<div
	class="monsan-grid columns-{columns} gap-{gap}"
	class:responsive
	class:full-height={fullHeight}
>
	{@render children()}
</div>

<style>
	.monsan-grid {
		display: grid;
		align-content: start;
		box-sizing: border-box;
	}

	.full-height {
		align-content: stretch;
		height: 100%;
		min-height: 0;
	}

	.columns-one {
		grid-template-columns: minmax(0, 1fr);
	}
	.columns-two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.columns-three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.columns-1-2 {
		grid-template-columns: 1fr 2fr;
	}
	.columns-2-1 {
		grid-template-columns: 2fr 1fr;
	}
	.columns-1-3 {
		grid-template-columns: 1fr 3fr;
	}
	.columns-3-1 {
		grid-template-columns: 3fr 1fr;
	}
	.columns-row-actions {
		grid-template-columns: 1fr 100px var(--control-height);
		align-items: end;
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

	@media (max-width: 560px) {
		.responsive {
			grid-template-columns: minmax(0, 1fr);
		}
		.responsive.full-height {
			grid-template-columns: 100% !important;
			grid-template-rows: 40% 60% !important;
		}
	}
</style>
