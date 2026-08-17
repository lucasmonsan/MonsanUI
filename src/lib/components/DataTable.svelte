<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import { popBackLayer, pushBackLayer } from '../utils/dialogStack.js';
	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';
	import type { DataTableColumn, DataTableRow } from '$lib/types.js';

	export interface DataTableMobileRowContext {
		selected: boolean;
		selectionMode: boolean;
		toggleSelection: () => void;
	}

	interface Props {
		caption: string;
		captionVisible?: boolean;
		columns: DataTableColumn[];
		rows: DataTableRow[];
		selectedIds?: string[];
		emptyLabel: string;
		emptyCellLabel: string;
		selectAllLabel: string;
		selectRowLabel: (row: DataTableRow) => string;
		selectionCheckboxSize?: 'sm' | 'md';
		page?: number;
		pageCount?: number;
		previousPageLabel?: string;
		nextPageLabel?: string;
		rowActionLabel?: (row: DataTableRow) => string;
		onSort?: (columnId: string) => void;
		onPageChange?: (page: number) => void;
		onRowActivate?: (row: DataTableRow) => void;
		mobileRow?: Snippet<[DataTableRow, DataTableMobileRowContext]>;
		mobileSelectionMode?: boolean;
		onMobileSelectionModeChange?: (active: boolean) => void;
		closeMobileSelectionOnBack?: boolean;
		longPressDuration?: number;
		groupBy?: (row: DataTableRow) => string | undefined;
		groupLabel?: (key: string, row: DataTableRow) => string;
		hasMore?: boolean;
		loadingMore?: boolean;
		loadMoreLabel?: string;
		loadingMoreLabel?: string;
		autoLoadStatusLabel?: string;
		loadCompleteLabel?: string;
		onLoadMore?: () => void | Promise<void>;
	}

	let {
		caption,
		captionVisible = true,
		columns,
		rows,
		selectedIds = $bindable([]),
		emptyLabel,
		emptyCellLabel,
		selectAllLabel,
		selectRowLabel,
		selectionCheckboxSize = 'sm',
		page = 1,
		pageCount = 1,
		previousPageLabel,
		nextPageLabel,
		rowActionLabel,
		onSort,
		onPageChange,
		onRowActivate,
		mobileRow,
		mobileSelectionMode = $bindable(false),
		onMobileSelectionModeChange,
		closeMobileSelectionOnBack = false,
		longPressDuration = 500,
		groupBy,
		groupLabel,
		hasMore = false,
		loadingMore = false,
		loadMoreLabel,
		loadingMoreLabel,
		autoLoadStatusLabel,
		loadCompleteLabel,
		onLoadMore
	}: Props = $props();

	let selectableRows = $derived(rows.filter((row) => row.selectable !== false));
	let allSelected = $derived(
		selectableRows.length > 0 && selectableRows.every((row) => selectedIds.includes(row.id))
	);
	let longPressTimer: ReturnType<typeof setTimeout> | undefined;
	let pointerStart: { x: number; y: number } | null = null;
	let suppressClick = false;
	let isClient = $state(false);
	let automaticLoadAvailable = $state(false);
	let automaticLoadPending = $state(false);
	let progressiveLoadStarted = $state(false);
	const selectionLayerId = `data-table-selection-${Math.random().toString(36).slice(2, 9)}`;
	let selectionLayerAdded = false;
	let isProgressivelyLoading = $derived(loadingMore || automaticLoadPending);
	let progressiveStatus = $derived(
		isProgressivelyLoading
			? (loadingMoreLabel ?? '')
			: hasMore
				? (autoLoadStatusLabel ?? '')
				: progressiveLoadStarted
					? (loadCompleteLabel ?? '')
					: ''
	);

	onMount(() => {
		isClient = true;
		automaticLoadAvailable = 'IntersectionObserver' in window;
	});

	function toggleAll() {
		selectedIds = allSelected ? [] : selectableRows.map((row) => row.id);
	}

	function toggleRow(row: DataTableRow) {
		if (row.selectable === false) return;
		selectedIds = selectedIds.includes(row.id)
			? selectedIds.filter((id) => id !== row.id)
			: [...selectedIds, row.id];
	}

	function setMobileSelectionMode(active: boolean) {
		if (mobileSelectionMode === active) return;
		mobileSelectionMode = active;
		onMobileSelectionModeChange?.(active);
	}

	function exitMobileSelection() {
		selectedIds = [];
		setMobileSelectionMode(false);
	}

	function rowGroup(row: DataTableRow): string | undefined {
		return groupBy?.(row);
	}

	function isGroupStart(row: DataTableRow, index: number): boolean {
		const group = rowGroup(row);
		return Boolean(group) && (index === 0 || group !== rowGroup(rows[index - 1]!));
	}

	let groupColumnSpan = $derived(columns.length + 1 + (onRowActivate && rowActionLabel ? 1 : 0));

	$effect(() => {
		if (mobileSelectionMode && selectedIds.length === 0) setMobileSelectionMode(false);
	});

	$effect(() => {
		if (!closeMobileSelectionOnBack || !mobileSelectionMode || selectionLayerAdded) return;
		pushBackLayer(selectionLayerId, exitMobileSelection, () => {
			exitMobileSelection();
			return true;
		});
		selectionLayerAdded = true;
		return () => {
			if (!selectionLayerAdded) return;
			popBackLayer(selectionLayerId);
			selectionLayerAdded = false;
		};
	});

	function clearLongPress() {
		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = undefined;
		pointerStart = null;
	}

	function startLongPress(event: PointerEvent, row: DataTableRow) {
		if (event.pointerType === 'mouse' || mobileSelectionMode || row.selectable === false) return;
		pointerStart = { x: event.clientX, y: event.clientY };
		longPressTimer = setTimeout(() => {
			setMobileSelectionMode(true);
			toggleRow(row);
			suppressClick = true;
			clearLongPress();
		}, longPressDuration);
	}

	function cancelLongPress(event?: PointerEvent) {
		if (
			event &&
			pointerStart &&
			Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) < 8
		) {
			return;
		}
		clearLongPress();
	}

	function handleMobileClick(event: MouseEvent) {
		if (!suppressClick) return;
		event.preventDefault();
		event.stopPropagation();
		suppressClick = false;
	}

	async function requestProgressiveLoad() {
		if (!hasMore || !onLoadMore || isProgressivelyLoading) return;

		progressiveLoadStarted = true;
		automaticLoadPending = true;
		try {
			await onLoadMore();
		} finally {
			await tick();
			automaticLoadPending = false;
		}
	}

	function observeProgressiveLoad(node: HTMLElement) {
		const supported = 'IntersectionObserver' in window;
		automaticLoadAvailable = supported;
		if (!supported) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void requestProgressiveLoad();
				}
			},
			{ rootMargin: '240px 0px' }
		);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

{#if rows.length === 0}
	<div class="empty" role="status">{emptyLabel}</div>
{:else}
	<div class="table-scroll" class:has-mobile-row={Boolean(mobileRow)}>
		<table>
			<caption class:sr-only={!captionVisible}>{caption}</caption>
			<thead>
				<tr>
					<th class="selection">
						<Checkbox
							size={selectionCheckboxSize}
							checked={allSelected}
							onchange={toggleAll}
							ariaLabel={selectAllLabel}
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
				{#each rows as row, index (row.id)}
					{#if isGroupStart(row, index)}
						<tr class="table-group-header"
							><th colspan={groupColumnSpan}
								>{groupLabel?.(rowGroup(row)!, row) ?? rowGroup(row)}</th
							></tr
						>
					{/if}
					<tr onclick={() => onRowActivate?.(row)} class:clickable={Boolean(onRowActivate)}>
						<td class="selection" onclick={(event) => event.stopPropagation()}>
							<Checkbox
								size={selectionCheckboxSize}
								checked={selectedIds.includes(row.id)}
								disabled={row.selectable === false}
								onchange={() => toggleRow(row)}
								ariaLabel={selectRowLabel(row)}
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
							<td
								class="row-action"
								data-label={rowActionLabel(row)}
								onclick={(event) => event.stopPropagation()}
							>
								<button type="button" onclick={() => onRowActivate?.(row)}
									>{rowActionLabel(row)}</button
								>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
		{#if mobileRow}
			<div class="mobile-list" aria-label={caption}>
				{#each rows as row, index (row.id)}
					{#if isGroupStart(row, index)}
						<div class="mobile-group-header">
							{groupLabel?.(rowGroup(row)!, row) ?? rowGroup(row)}
						</div>
					{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="mobile-row"
						onpointerdown={(event) => startLongPress(event, row)}
						onpointermove={cancelLongPress}
						onpointerup={clearLongPress}
						onpointercancel={clearLongPress}
						onclickcapture={handleMobileClick}
					>
						{@render mobileRow(row, {
							selected: selectedIds.includes(row.id),
							selectionMode: mobileSelectionMode,
							toggleSelection: () => toggleRow(row)
						})}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	{#if hasMore && onLoadMore}
		<div class="progressive-load">
			<div class="progressive-sentinel" use:observeProgressiveLoad aria-hidden="true"></div>
			{#if progressiveStatus}
				<span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
					{progressiveStatus}
				</span>
			{/if}
			{#if isClient && !automaticLoadAvailable && loadMoreLabel}
				<Button
					variant="secondary"
					size="sm"
					onclick={() => void requestProgressiveLoad()}
					disabled={isProgressivelyLoading}
				>
					{isProgressivelyLoading && loadingMoreLabel ? loadingMoreLabel : loadMoreLabel}
				</Button>
			{/if}
		</div>
	{:else if progressiveLoadStarted && progressiveStatus}
		<span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
			{progressiveStatus}
		</span>
	{/if}
	{#if pageCount > 1 && previousPageLabel && nextPageLabel}
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
	.table-group-header th {
		text-align: left;
		background: var(--bg-secondary);
		color: var(--text-secondary);
		font-family: var(--font-display);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	th button {
		border: 0;
		background: transparent;
		padding: 0;
		font: inherit;
		font-weight: 800;
		color: inherit;
	}
	tr.clickable {
		cursor: pointer;
	}
	tr.clickable:hover {
		background: var(--bg-secondary);
	}
	.row-action {
		width: 1%;
		white-space: nowrap;
		text-align: right;
	}
	.row-action button,
	.pagination button {
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}
	.row-action button {
		border: var(--border-width) solid var(--border-color);
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
	.progressive-load {
		display: grid;
		justify-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}
	.progressive-sentinel {
		width: 100%;
		height: 1px;
	}
	.mobile-list {
		display: none;
	}
	.mobile-group-header {
		display: none;
	}
	@media (max-width: 640px) {
		.table-scroll.has-mobile-row {
			overflow: visible;
			border: 0;
			border-radius: 0;
		}
		.table-scroll.has-mobile-row table {
			display: none;
		}
		.mobile-list {
			display: grid;
			gap: var(--space-sm);
		}
		.mobile-group-header {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			position: sticky;
			top: 0;
			z-index: 4;
			padding: var(--space-xs) 0;
			background: var(--bg-primary);
			color: var(--text-secondary);
			font-family: var(--font-display);
			font-size: var(--text-xs);
			font-weight: 800;
			letter-spacing: 0.08em;
		}
		.mobile-group-header::after {
			content: '';
			height: var(--border-width);
			flex: 1;
			background: var(--border-color);
		}
		.table-scroll:not(.has-mobile-row) thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
		}
		.table-scroll:not(.has-mobile-row) table,
		.table-scroll:not(.has-mobile-row) tbody,
		.table-scroll:not(.has-mobile-row) tr,
		.table-scroll:not(.has-mobile-row) td {
			display: block;
			width: 100%;
		}
		.table-scroll:not(.has-mobile-row) tr {
			border-top: var(--border-width) solid var(--border-color);
			padding: var(--space-sm);
		}
		.table-scroll:not(.has-mobile-row) td {
			border: 0;
			display: grid;
			grid-template-columns: minmax(7rem, 40%) 1fr;
			gap: var(--space-sm);
			padding: var(--space-xs) 0;
			text-align: right;
		}
		.table-scroll:not(.has-mobile-row) td::before {
			content: attr(data-label);
			text-align: left;
			font-weight: 800;
			color: var(--text-secondary);
		}
		.table-scroll:not(.has-mobile-row) td.selection {
			display: flex;
			justify-content: end;
		}
		.table-scroll:not(.has-mobile-row) td.selection::before {
			content: '';
		}
	}
</style>
