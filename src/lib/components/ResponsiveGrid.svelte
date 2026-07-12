<script lang="ts">
	import type { Snippet } from 'svelte';

	type MinItemWidth = 'xs' | 'sm' | 'md' | 'lg';
	type Gap = 'sm' | 'md' | 'lg';
	type Align = 'stretch' | 'start';
	type Columns = 'auto' | '1' | '2' | '3' | '4';
	type ColumnsBreakpoint = 'md' | 'lg';

	interface Props {
		children: Snippet;
		minItemWidth?: MinItemWidth;
		gap?: Gap;
		align?: Align;
		columns?: Columns;
		columnsBreakpoint?: ColumnsBreakpoint;
	}

	const MIN_ITEM_WIDTH_VALUES: Record<MinItemWidth, string> = {
		xs: '140px',
		sm: '180px',
		md: '240px',
		lg: '320px'
	};

	const GAP_VALUES: Record<Gap, string> = {
		sm: 'var(--space-sm)',
		md: 'var(--space-md)',
		lg: 'var(--space-lg)'
	};

	const ALIGN_VALUES: Record<Align, string> = {
		stretch: 'stretch',
		start: 'start'
	};

	const FIXED_COLUMN_VALUES: Record<Exclude<Columns, 'auto'>, string> = {
		'1': 'minmax(0, 1fr)',
		'2': 'repeat(2, minmax(0, 1fr))',
		'3': 'repeat(3, minmax(0, 1fr))',
		'4': 'repeat(4, minmax(0, 1fr))'
	};

	let {
		children,
		minItemWidth = 'md',
		gap = 'md',
		align = 'stretch',
		columns = 'auto',
		columnsBreakpoint = 'lg'
	}: Props = $props();

	let minItemWidthValue = $derived(MIN_ITEM_WIDTH_VALUES[minItemWidth]);
	let gapValue = $derived(GAP_VALUES[gap]);
	let alignValue = $derived(ALIGN_VALUES[align]);
	let fixedColumnsValue = $derived(columns === 'auto' ? '' : FIXED_COLUMN_VALUES[columns]);
</script>

<div
	class="monsan-responsive-grid columns-breakpoint-{columnsBreakpoint}"
	class:fixed-columns={columns !== 'auto'}
	style:--monsan-responsive-grid-min-width={minItemWidthValue}
	style:--monsan-responsive-grid-gap={gapValue}
	style:--monsan-responsive-grid-align={alignValue}
	style:--monsan-responsive-grid-fixed-columns={fixedColumnsValue}
>
	{@render children()}
</div>

<style>
	.monsan-responsive-grid {
		display: grid;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(100%, var(--monsan-responsive-grid-min-width)), 1fr)
		);
		gap: var(--monsan-responsive-grid-gap);
		align-items: var(--monsan-responsive-grid-align);
	}

	@media (min-width: 768px) {
		.columns-breakpoint-md.fixed-columns {
			grid-template-columns: var(--monsan-responsive-grid-fixed-columns);
		}
	}

	@media (min-width: 900px) {
		.columns-breakpoint-lg.fixed-columns {
			grid-template-columns: var(--monsan-responsive-grid-fixed-columns);
		}
	}

	@media (max-width: 640px) {
		.monsan-responsive-grid {
			gap: var(--monsan-responsive-grid-mobile-gap, var(--space-sm));
		}
	}
</style>
