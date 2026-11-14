<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import { popBackLayer, pushBackLayer } from '../utils/dialogStack.js';
	import Button from './Button.svelte';
	import Checkbox from './Checkbox.svelte';
	import ChevronDownIcon from './icons/ChevronDown.svelte';
	import type { DataTableColumn, DataTableRow } from '$lib/types.js';

	export interface DataTableMobileRowContext {
		selected: boolean;
		selectionMode: boolean;
		toggleSelection: () => void;
	}

	export interface DataTableGroupLabel {
		leading: string;
		trailing?: string;
	}

	type MobileGroup = {
		key: string;
		group: string;
		heading: DataTableGroupLabel;
	};

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
		groupLabel?: (key: string, row: DataTableRow) => string | DataTableGroupLabel;
		collapsibleGroups?: boolean;
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
		collapsibleGroups = false,
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
	let prefersReducedMotion = $state(false);
	let mobileListElement = $state<HTMLDivElement>();
	let activeMobileGroupIndex = $state(0);
	let mobileStickyVisible = $state(false);
	let mobileScrollRoot: HTMLElement | null = null;
	let mobileGroupFrame: number | undefined;
	const mobileGroupHeaderNodes = new SvelteMap<number, HTMLElement>();
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
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;
		const updateMotionPreference = (event: MediaQueryListEvent) => {
			prefersReducedMotion = event.matches;
		};
		motionQuery.addEventListener('change', updateMotionPreference);
		return () => motionQuery.removeEventListener('change', updateMotionPreference);
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

	function groupHeading(row: DataTableRow): DataTableGroupLabel {
		const group = rowGroup(row) ?? '';
		const label = groupLabel?.(group, row) ?? group;
		return typeof label === 'string' ? { leading: label } : label;
	}

	function isGroupStart(row: DataTableRow, index: number): boolean {
		const group = rowGroup(row);
		return Boolean(group) && (index === 0 || group !== rowGroup(rows[index - 1]!));
	}

	const collapsedGroups = new SvelteSet<string>();

	function toggleGroup(key: string) {
		if (collapsedGroups.has(key)) collapsedGroups.delete(key);
		else collapsedGroups.add(key);
	}

	function isRowCollapsed(row: DataTableRow): boolean {
		const group = rowGroup(row);
		return Boolean(collapsibleGroups && group && collapsedGroups.has(group));
	}

	let mobileGroupPresentation = $derived.by(() => {
		const groups: MobileGroup[] = [];
		const indexByRowId = new SvelteMap<string, number>();
		let previousGroup: string | undefined;

		for (const [index, row] of rows.entries()) {
			const group = rowGroup(row);
			if (group && group !== previousGroup) {
				groups.push({ key: `${group}-${index}`, group, heading: groupHeading(row) });
			}
			if (group) indexByRowId.set(row.id, groups.length - 1);
			previousGroup = group;
		}

		return { groups, indexByRowId };
	});

	let activeMobileGroup = $derived(
		mobileGroupPresentation.groups[activeMobileGroupIndex] ?? mobileGroupPresentation.groups[0]
	);

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

	$effect(() => {
		const groupCount = mobileGroupPresentation.groups.length;
		if (!mobileListElement || groupCount === 0) {
			mobileStickyVisible = false;
			return;
		}

		mobileScrollRoot = mobileListElement.closest('.app-shell-scroll');
		const handleScroll = () => {
			clearLongPress();
			scheduleMobileGroupUpdate();
		};
		const handleResize = () => scheduleMobileGroupUpdate();
		mobileScrollRoot?.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize);
		scheduleMobileGroupUpdate();

		return () => {
			mobileScrollRoot?.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
			if (mobileGroupFrame) cancelAnimationFrame(mobileGroupFrame);
			mobileGroupFrame = undefined;
			mobileScrollRoot = null;
		};
	});

	function clearLongPress() {
		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = undefined;
		pointerStart = null;
	}

	function registerMobileGroupHeader(node: HTMLElement, groupIndex: number | undefined) {
		if (groupIndex === undefined) return;
		mobileGroupHeaderNodes.set(groupIndex, node);
		scheduleMobileGroupUpdate();
		return {
			destroy() {
				if (mobileGroupHeaderNodes.get(groupIndex) === node) {
					mobileGroupHeaderNodes.delete(groupIndex);
				}
			}
		};
	}

	function scheduleMobileGroupUpdate() {
		if (!isClient || mobileGroupFrame) return;
		mobileGroupFrame = requestAnimationFrame(() => {
			mobileGroupFrame = undefined;
			updateMobileGroupHeading();
		});
	}

	function updateMobileGroupHeading() {
		if (!mobileListElement || mobileGroupHeaderNodes.size === 0) {
			mobileStickyVisible = false;
			return;
		}

		const rootTop = mobileScrollRoot?.getBoundingClientRect().top ?? 0;
		mobileStickyVisible = mobileListElement.getBoundingClientRect().top < rootTop;
		let nextGroupIndex = 0;
		for (const [groupIndex, node] of [...mobileGroupHeaderNodes.entries()].sort(
			([left], [right]) => left - right
		)) {
			if (node.getBoundingClientRect().top > rootTop + 1) break;
			nextGroupIndex = groupIndex;
		}
		activeMobileGroupIndex = nextGroupIndex;
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

{#snippet renderGroupHeading(heading: DataTableGroupLabel, isCollapsed = false)}
	{#if collapsibleGroups}
		<span class="group-collapse-icon" class:collapsed={isCollapsed} aria-hidden="true">
			<ChevronDownIcon size={14} />
		</span>
	{/if}
	<span class="group-heading-label">
		<span class="group-heading-outline" aria-hidden="true">{heading.leading}</span>
		<span class="group-heading-text">{heading.leading}</span>
	</span>
	<span class="group-heading-line"></span>
	{#if heading.trailing}
		<span class="group-heading-label">
			<span class="group-heading-outline" aria-hidden="true">{heading.trailing}</span>
			<span class="group-heading-text">{heading.trailing}</span>
		</span>
	{/if}
{/snippet}

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
						{@const group = rowGroup(row) ?? ''}
						{@const heading = groupHeading(row)}
						{@const isCollapsed = collapsedGroups.has(group)}
						<tr class="table-group-header">
							<th colspan={groupColumnSpan}>
								{#if collapsibleGroups}
									<button
										type="button"
										class="group-heading-button"
										onclick={() => toggleGroup(group)}
										aria-expanded={!isCollapsed}
									>
										<span class="group-heading">
											{@render renderGroupHeading(heading, isCollapsed)}
										</span>
									</button>
								{:else}
									<span class="group-heading">
										{@render renderGroupHeading(heading)}
									</span>
								{/if}
							</th>
						</tr>
					{/if}
					{#if !isRowCollapsed(row)}
						<tr
							onclick={() => onRowActivate?.(row)}
							class:clickable={Boolean(onRowActivate)}
							class:muted={row.muted}
						>
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
					{/if}
				{/each}
			</tbody>
		</table>
		{#if mobileRow}
			<div bind:this={mobileListElement} class="mobile-list" aria-label={caption}>
				{#if mobileStickyVisible && activeMobileGroup}
					<div class="mobile-group-sticky" aria-hidden={collapsibleGroups ? undefined : 'true'}>
						{#key activeMobileGroup.key}
							{#if collapsibleGroups}
								<button
									type="button"
									class="group-heading-button mobile-group-heading-active"
									onclick={() => toggleGroup(activeMobileGroup.group)}
									aria-expanded={!collapsedGroups.has(activeMobileGroup.group)}
									in:fade={{ duration: prefersReducedMotion ? 0 : 160 }}
									out:fade={{ duration: prefersReducedMotion ? 0 : 120 }}
								>
									{@render renderGroupHeading(
										activeMobileGroup.heading,
										collapsedGroups.has(activeMobileGroup.group)
									)}
								</button>
							{:else}
								<div
									class="mobile-group-heading-active"
									in:fade={{ duration: prefersReducedMotion ? 0 : 160 }}
									out:fade={{ duration: prefersReducedMotion ? 0 : 120 }}
								>
									{@render renderGroupHeading(activeMobileGroup.heading)}
								</div>
							{/if}
						{/key}
					</div>
				{/if}
				{#each rows as row, index (row.id)}
					{#if isGroupStart(row, index)}
						{@const group = rowGroup(row) ?? ''}
						{@const heading = groupHeading(row)}
						{@const isCollapsed = collapsedGroups.has(group)}
						<div
							class="mobile-group-header"
							use:registerMobileGroupHeader={mobileGroupPresentation.indexByRowId.get(row.id)}
						>
							{#if collapsibleGroups}
								<button
									type="button"
									class="group-heading-button"
									onclick={() => toggleGroup(group)}
									aria-expanded={!isCollapsed}
								>
									<span class="group-heading">
										{@render renderGroupHeading(heading, isCollapsed)}
									</span>
								</button>
							{:else}
								{@render renderGroupHeading(heading)}
							{/if}
						</div>
					{/if}
					{#if !isRowCollapsed(row)}
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
					{/if}
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
	td {
		border-bottom: var(--border-width) solid var(--border-color);
	}
	th {
		background: var(--bg-secondary);
		font-size: var(--text-sm);
	}
	.table-group-header th {
		text-align: left;
		border-top: 0;
		background: transparent;
		color: var(--text-secondary);
		font-family: var(--font-display);
		font-size: var(--text-md);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.group-heading {
		width: 100%;
	}
	.group-heading-button {
		display: block;
		width: 100%;
		border: 0;
		background: transparent;
		padding: 0;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}
	.group-heading-button:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}
	.group-heading-button.mobile-group-heading-active {
		display: flex;
	}
	.mobile-group-sticky .group-heading-button {
		pointer-events: auto;
	}
	.group-collapse-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s cubic-bezier(0.2, 1, 0.3, 1);
	}
	.group-collapse-icon.collapsed {
		transform: rotate(-90deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.group-collapse-icon {
			transition: none;
		}
	}
	.group-heading,
	.mobile-group-header,
	.mobile-group-heading-active {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		--group-heading-color: var(--text-secondary);
		color: var(--group-heading-color);
	}
	.group-heading-line {
		flex: 1;
		height: 0;
		border-top: var(--border-width) solid currentColor;
		opacity: 0.5;
	}
	.group-heading-label,
	.group-heading-text {
		user-select: none;
		-webkit-user-select: none;
	}
	.group-heading-label {
		position: relative;
		display: inline-grid;
		white-space: nowrap;
	}
	.group-heading-outline,
	.group-heading-text {
		grid-area: 1 / 1;
	}
	.group-heading-text {
		position: relative;
		z-index: 1;
	}
	.group-heading-outline {
		z-index: 0;
		color: var(--bg-primary);
		pointer-events: none;
		text-shadow:
			-2px -2px 0 var(--bg-primary),
			0 -2px 0 var(--bg-primary),
			2px -2px 0 var(--bg-primary),
			-2px 0 0 var(--bg-primary),
			2px 0 0 var(--bg-primary),
			-2px 2px 0 var(--bg-primary),
			0 2px 0 var(--bg-primary),
			2px 2px 0 var(--bg-primary);
		user-select: none;
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
	tr.muted > td {
		opacity: 0.6;
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
	.mobile-group-sticky {
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
			padding: var(--space-xs) 0;
			background: transparent;
			color: var(--text-secondary);
			font-family: var(--font-display);
			font-size: var(--text-md);
			font-weight: 800;
			letter-spacing: 0.08em;
		}
		.mobile-group-sticky {
			display: block;
			position: sticky;
			top: 0;
			z-index: 4;
			align-self: start;
			height: 0;
			margin-bottom: calc(var(--space-sm) * -1);
			pointer-events: none;
		}
		.mobile-group-sticky .group-heading-button {
			pointer-events: auto;
		}
		.mobile-group-sticky::before {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			height: calc(var(--control-height) * 1.15);
			background: linear-gradient(
				to bottom,
				var(--bg-primary) 0%,
				var(--bg-primary) 56%,
				transparent 100%
			);
			content: '';
		}
		.mobile-group-heading-active {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			z-index: 1;
			padding: var(--space-xs) 0;
			font-family: var(--font-display);
			font-size: var(--text-md);
			font-weight: 800;
			letter-spacing: 0.08em;
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
