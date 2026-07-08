<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns?: 'one' | 'two' | 'three';
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
		box-sizing: border-box;
	}

	.full-height {
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
