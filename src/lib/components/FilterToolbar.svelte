<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		filters?: Snippet;
		search?: Snippet;
		actions?: Snippet;
		hasFilters?: boolean;
		hasSearch?: boolean;
		hasActions?: boolean;
	}

	let {
		filters,
		search,
		actions,
		hasFilters = Boolean(filters),
		hasSearch = Boolean(search),
		hasActions = Boolean(actions)
	}: Props = $props();
</script>

<div class="monsan-filter-toolbar">
	{#if filters && hasFilters}
		<div class="filter-toolbar-filters">
			{@render filters()}
		</div>
	{/if}

	{#if (search && hasSearch) || (actions && hasActions)}
		<div class="filter-toolbar-search-row">
			{#if search && hasSearch}
				<div class="filter-toolbar-search">
					{@render search()}
				</div>
			{/if}

			{#if actions && hasActions}
				<div class="filter-toolbar-actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.monsan-filter-toolbar {
		display: flex;
		align-items: center;
		gap: var(--filter-toolbar-gap, var(--space-sm));
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.filter-toolbar-filters,
	.filter-toolbar-search-row {
		display: flex;
		align-items: center;
		gap: var(--filter-toolbar-gap, var(--space-sm));
		min-width: 0;
		box-sizing: border-box;
	}

	.filter-toolbar-filters {
		flex: 0 0 auto;
		flex-wrap: nowrap;
	}

	.filter-toolbar-filters > :global(.monsan-select-container),
	.filter-toolbar-filters > :global(.monsan-multiselect-container),
	.filter-toolbar-filters > :global(.monsan-datepicker-container) {
		flex: 0 0 var(--filter-toolbar-control-width, 180px);
		width: var(--filter-toolbar-control-width, 180px);
		min-width: 0;
	}

	.filter-toolbar-filters > :global(.monsan-datepicker-container) :global(.datepicker-trigger) {
		width: 100%;
	}

	.filter-toolbar-filters > :global(.monsan-select-container) :global(.monsan-select-dropdown),
	.filter-toolbar-filters
		> :global(.monsan-multiselect-container)
		:global(.monsan-multiselect-dropdown) {
		width: 100%;
		min-width: 100%;
		max-width: 100%;
	}

	.filter-toolbar-search-row {
		flex: 1 0 260px;
		flex-wrap: nowrap;
	}

	.filter-toolbar-search {
		flex: 1 1 auto;
		min-width: 0;
	}

	.filter-toolbar-actions {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: var(--filter-toolbar-action-gap, var(--space-xs));
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.monsan-filter-toolbar {
			align-items: center;
			flex-direction: row;
		}

		.filter-toolbar-filters {
			display: flex;
			flex: 0 0 auto;
			width: auto;
		}

		.filter-toolbar-search-row {
			flex: 1 1 auto;
			width: auto;
		}

		.filter-toolbar-search {
			min-width: 0;
		}
	}
</style>
