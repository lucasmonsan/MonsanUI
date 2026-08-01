<script lang="ts">
	import type { DataTableColumn, DataTableRow } from '$lib/types.js';

	interface Props {
		caption: string;
		columns: DataTableColumn[];
		rows: DataTableRow[];
		selectedIds?: string[];
		emptyLabel: string;
		emptyCellLabel: string;
		selectAllLabel: string;
		selectRowLabel: (row: DataTableRow) => string;
		page?: number;
		pageCount?: number;
		previousPageLabel: string;
		nextPageLabel: string;
		rowActionLabel?: (row: DataTableRow) => string;
		onSort?: (columnId: string) => void;
		onPageChange?: (page: number) => void;
		onRowActivate?: (row: DataTableRow) => void;
	}

	let {
		caption,
		columns,
		rows,
		selectedIds = $bindable([]),
		emptyLabel,
		emptyCellLabel,
		selectAllLabel,
		selectRowLabel,
		page = 1,
		pageCount = 1,
		previousPageLabel,
		nextPageLabel,
		rowActionLabel,
		onSort,
		onPageChange,
		onRowActivate
	}: Props = $props();

	let selectableRows = $derived(rows.filter((row) => row.selectable !== false));
	let allSelected = $derived(
		selectableRows.length > 0 && selectableRows.every((row) => selectedIds.includes(row.id))
	);

	function toggleAll() {
		selectedIds = allSelected ? [] : selectableRows.map((row) => row.id);
	}

	function toggleRow(row: DataTableRow) {
		if (row.selectable === false) return;
		selectedIds = selectedIds.includes(row.id)
			? selectedIds.filter((id) => id !== row.id)
			: [...selectedIds, row.id];
	}
</script>

{#if rows.length === 0}
	<div class="empty" role="status">{emptyLabel}</div>
{:else}
	<div class="table-scroll">
		<table>
			<caption>{caption}</caption>
			<thead>
				<tr>
					<th class="selection">
						<input
							type="checkbox"
							checked={allSelected}
							onchange={toggleAll}
							aria-label={selectAllLabel}
						/>
					</th>
					{#each columns as column (column.id)}
						<th class:align-end={column.align === 'end'} scope="col">
							{#if column.sortable && onSort}
								<button type="button" onclick={() => onSort?.(column.id)}>{column.label}</button>
							{:else}
								{column.label}
							{/if}
						</th>
					{/each}
					{#if onRowActivate && rowActionLabel}
						<th class="row-action"><span class="sr-only">{caption}</span></th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.id)}
					<tr>
						<td class="selection">
							<input
								type="checkbox"
								checked={selectedIds.includes(row.id)}
								disabled={row.selectable === false}
								onchange={() => toggleRow(row)}
								aria-label={selectRowLabel(row)}
							/>
						</td>
						{#each row.cells as cell, index (columns[index]?.id)}
							<td
								class:align-end={columns[index]?.align === 'end'}
								data-label={columns[index]?.label}
							>
								{cell ?? emptyCellLabel}
							</td>
						{/each}
						{#if onRowActivate && rowActionLabel}
							<td class="row-action" data-label={rowActionLabel(row)}>
								<button type="button" onclick={() => onRowActivate(row)}
									>{rowActionLabel(row)}</button
								>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	{#if pageCount > 1}
		<nav class="pagination" aria-label={caption}>
			<button type="button" disabled={page <= 1} onclick={() => onPageChange?.(page - 1)}>
				{previousPageLabel}
			</button>
			<span>{page} / {pageCount}</span>
			<button type="button" disabled={page >= pageCount} onclick={() => onPageChange?.(page + 1)}>
				{nextPageLabel}
			</button>
		</nav>
	{/if}
{/if}

<style>
	.table-scroll {
		overflow-x: auto;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg-primary);
	}
	caption {
		padding: var(--space-sm);
		text-align: left;
		font-weight: 800;
	}
	th,
	td {
		padding: var(--space-sm);
		border-top: var(--border-width) solid var(--border-color);
		text-align: left;
		vertical-align: middle;
	}
	th {
		background: var(--bg-secondary);
		font-size: var(--text-sm);
	}
	th button {
		border: 0;
		background: transparent;
		padding: 0;
		font: inherit;
		font-weight: 800;
		color: inherit;
	}
	.row-action {
		width: 1%;
		white-space: nowrap;
		text-align: right;
	}
	.row-action button {
		padding: var(--space-xs) var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		font: inherit;
		font-weight: 800;
		cursor: pointer;
	}
	.row-action button:hover {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}
	.row-action button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.selection {
		width: 1%;
	}
	.align-end {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.empty {
		padding: var(--space-lg);
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		text-align: center;
		color: var(--text-secondary);
	}
	.pagination {
		display: flex;
		justify-content: end;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}
	.pagination button {
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}
	@media (max-width: 640px) {
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
		}
		table,
		tbody,
		tr,
		td {
			display: block;
			width: 100%;
		}
		tr {
			border-top: var(--border-width) solid var(--border-color);
			padding: var(--space-sm);
		}
		td {
			border: 0;
			display: grid;
			grid-template-columns: minmax(7rem, 40%) 1fr;
			gap: var(--space-sm);
			padding: var(--space-xs) 0;
			text-align: right;
		}
		td::before {
			content: attr(data-label);
			text-align: left;
			font-weight: 800;
			color: var(--text-secondary);
		}
		td.selection {
			display: flex;
			justify-content: end;
		}
		td.selection::before {
			content: '';
		}
	}
</style>
