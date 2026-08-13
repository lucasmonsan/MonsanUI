<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		navigation?: Snippet;
		filters?: Snippet;
		search?: Snippet;
		mobileSearch?: Snippet;
		actions?: Snippet;
		hasFilters?: boolean;
		hasSearch?: boolean;
		hasActions?: boolean;
	}

	let {
		filters,
		navigation,
		search,
		mobileSearch,
		actions,
		hasFilters = Boolean(filters),
		hasSearch = Boolean(search),
		hasActions = Boolean(actions)
	}: Props = $props();
</script>

<div class="monsan-filter-toolbar" class:has-mobile-search={Boolean(mobileSearch)}>
	{#if navigation}
		<div class="filter-toolbar-navigation">{@render navigation()}</div>
	{/if}
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
			{#if mobileSearch}
				<div class="filter-toolbar-mobile-search">{@render mobileSearch()}</div>
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
	.filter-toolbar-navigation,
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

	.filter-toolbar-navigation {
		flex: 0 1 auto;
		min-width: 0;
	}

	.filter-toolbar-mobile-search {
		display: none;
		flex: 0 0 auto;
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

		.has-mobile-search .filter-toolbar-search {
			display: none;
		}

		.filter-toolbar-mobile-search {
			display: flex;
		}
	}
</style>
