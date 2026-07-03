<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		filters?: Snippet;
		search?: Snippet;
		actions?: Snippet;
	}

	let { filters, search, actions }: Props = $props();
</script>

<div class="monsan-filter-toolbar">
	{#if filters}
		<div class="filter-toolbar-filters">
			{@render filters()}
		</div>
	{/if}

	{#if search || actions}
		<div class="filter-toolbar-search-row">
			{#if search}
				<div class="filter-toolbar-search">
					{@render search()}
				</div>
			{/if}

			{#if actions}
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

	.filter-toolbar-filters :global(.monsan-select-container),
	.filter-toolbar-filters :global(.monsan-multiselect-container) {
		flex: 0 0 var(--filter-toolbar-control-width, 180px);
		width: var(--filter-toolbar-control-width, 180px);
		min-width: 0;
	}

	.filter-toolbar-filters :global(.monsan-select-dropdown),
	.filter-toolbar-filters :global(.monsan-multiselect-dropdown) {
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
			flex-direction: column;
			align-items: stretch;
		}

		.filter-toolbar-filters {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			width: 100%;
		}

		.filter-toolbar-filters :global(> :last-child:nth-child(odd)) {
			grid-column: 1 / -1;
		}

		.filter-toolbar-filters :global(.monsan-select-container),
		.filter-toolbar-filters :global(.monsan-multiselect-container) {
			width: 100%;
			min-width: 0;
		}

		.filter-toolbar-search-row {
			width: 100%;
			flex: 0 0 auto;
		}
	}
</style>
