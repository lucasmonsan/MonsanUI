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
		gap: var(--space-md);
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.monsan-filter-toolbar::-webkit-scrollbar {
		display: none;
	}

	.filter-toolbar-filters,
	.filter-toolbar-search-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		min-width: 0;
		box-sizing: border-box;
	}

	.filter-toolbar-filters {
		flex: 0 0 auto;
		flex-wrap: nowrap;
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
		gap: var(--space-sm);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.monsan-filter-toolbar {
			flex-direction: column;
			align-items: stretch;
			overflow-x: visible;
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
