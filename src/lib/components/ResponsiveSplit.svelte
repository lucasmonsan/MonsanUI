<script lang="ts">
	import type { Snippet } from 'svelte';

	type Gap = 'sm' | 'md' | 'lg';
	type SecondaryMinWidth = 'sm' | 'md' | 'lg';
	type Breakpoint = 'md' | 'lg';

	interface Props {
		primary: Snippet;
		secondary: Snippet;
		gap?: Gap;
		secondaryMinWidth?: SecondaryMinWidth;
		breakpoint?: Breakpoint;
	}

	const GAP_VALUES: Record<Gap, string> = {
		sm: 'var(--space-sm)',
		md: 'var(--space-md)',
		lg: 'var(--space-lg)'
	};

	const SECONDARY_MIN_WIDTH_VALUES: Record<SecondaryMinWidth, string> = {
		sm: '220px',
		md: '280px',
		lg: '340px'
	};

	let {
		primary,
		secondary,
		gap = 'md',
		secondaryMinWidth = 'md',
		breakpoint = 'lg'
	}: Props = $props();

	let gapValue = $derived(GAP_VALUES[gap]);
	let secondaryMinWidthValue = $derived(SECONDARY_MIN_WIDTH_VALUES[secondaryMinWidth]);
</script>

<div
	class="monsan-responsive-split breakpoint-{breakpoint}"
	style:--monsan-responsive-split-gap={gapValue}
	style:--monsan-responsive-split-secondary-min-width={secondaryMinWidthValue}
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
		gap: var(--monsan-responsive-split-gap);
	}

	.responsive-split-primary,
	.responsive-split-secondary {
		min-width: 0;
	}

	@media (min-width: 768px) {
		.breakpoint-md {
			grid-template-columns:
				minmax(0, 2fr)
				minmax(var(--monsan-responsive-split-secondary-min-width), 1fr);
			align-items: stretch;
		}
	}

	@media (min-width: 900px) {
		.breakpoint-lg {
			grid-template-columns:
				minmax(0, 2fr)
				minmax(var(--monsan-responsive-split-secondary-min-width), 1fr);
			align-items: stretch;
		}
	}
</style>
