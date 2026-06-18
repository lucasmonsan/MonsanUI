<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		primary: Snippet;
		secondary: Snippet;
		gap?: 'sm' | 'md' | 'lg';
		secondaryMinWidth?: 'sm' | 'md' | 'lg';
		breakpoint?: 'md' | 'lg';
	}

	let {
		primary,
		secondary,
		gap = 'md',
		secondaryMinWidth = 'md',
		breakpoint = 'lg'
	}: Props = $props();
</script>

<div
	class="monsan-responsive-split gap-{gap} secondary-{secondaryMinWidth} breakpoint-{breakpoint}"
>
	<div class="responsive-split-primary">
		{@render primary()}
	</div>
	<div class="responsive-split-secondary">
		{@render secondary()}
	</div>
</div>

<style>
	.monsan-responsive-split {
		display: grid;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.responsive-split-primary,
	.responsive-split-secondary {
		min-width: 0;
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

	@media (min-width: 768px) {
		.breakpoint-md.secondary-sm {
			grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr);
			align-items: stretch;
		}

		.breakpoint-md.secondary-md {
			grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
			align-items: stretch;
		}

		.breakpoint-md.secondary-lg {
			grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
			align-items: stretch;
		}
	}

	@media (min-width: 900px) {
		.breakpoint-lg.secondary-sm {
			grid-template-columns: minmax(0, 2fr) minmax(220px, 1fr);
			align-items: stretch;
		}

		.breakpoint-lg.secondary-md {
			grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
			align-items: stretch;
		}

		.breakpoint-lg.secondary-lg {
			grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
			align-items: stretch;
		}
	}
</style>
