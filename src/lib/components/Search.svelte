<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Input from './Input.svelte';
	import type { SearchResultItem } from '../types.js';
	import FileText from './icons/FileText.svelte';
	import Folder from './icons/Folder.svelte';
	import { i18n } from '../utils/i18n.svelte';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		items = [],
		onSelectResult,
		title,
		placeholder,
		noResultsMessage,
		loading = false,
		loadingMessage,
		controls,
		inlineControlsOnMobile = false,
		result: resultSnippet
	} = $props<{
		open: boolean;
		items: SearchResultItem[];
		onSelectResult?: (item: SearchResultItem) => void;
		title?: string;
		placeholder?: string;
		noResultsMessage?: string;
		loading?: boolean;
		loadingMessage?: string;
		controls?: Snippet;
		/** Keeps the query input and optional controls on one row on narrow screens. */
		inlineControlsOnMobile?: boolean;
		result?: Snippet<[SearchResultItem, boolean]>;
	}>();

	const fallbackId = `search-${Math.random().toString(36).slice(2, 11)}`;

	let searchQuery = $state('');
	let selectedIndex = $state(-1);
	let inputEl = $state<{ focus: () => void }>();
	let activeTitle = $derived(title ?? i18n.t('search.title'));
	let activePlaceholder = $derived(placeholder ?? i18n.t('search.placeholder'));
	let activeNoResultsMessage = $derived(noResultsMessage ?? i18n.t('search.noResults'));
	let activeLoadingMessage = $derived(loadingMessage ?? i18n.t('loading.message'));
	let inputId = $derived(`${fallbackId}-input`);
	let listboxId = $derived(`${fallbackId}-results`);
	let hasQuery = $derived(searchQuery.trim() !== '');

	const results = $derived<SearchResultItem[]>(
		!hasQuery
			? []
			: items.filter((item: SearchResultItem) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);
	let hasResults = $derived(results.length > 0);
	let isExpanded = $derived(hasQuery && (hasResults || loading));
	let activeDescendant = $derived(
		hasResults && selectedIndex >= 0 ? `${listboxId}-option-${selectedIndex}` : undefined
	);

	$effect(() => {
		if (hasResults) {
			selectedIndex = selectedIndex >= results.length ? 0 : Math.max(selectedIndex, 0);
		} else if (selectedIndex !== -1) {
			selectedIndex = -1;
		}
	});

	$effect(() => {
		if (open && inputEl) {
			setTimeout(() => inputEl?.focus(), 50);
		}
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = hasResults ? (selectedIndex + 1) % results.length : -1;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = hasResults
				? selectedIndex <= 0
					? results.length - 1
					: selectedIndex - 1
				: -1;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIndex >= 0 && results[selectedIndex]) {
				selectResult(results[selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
		}
	}

	function selectResult(result: SearchResultItem) {
		open = false;
		onSelectResult?.(result);
	}
</script>

<Dialog bind:open title={activeTitle}>
	<div class="search-container" role="search">
		<div
			class="search-input-row"
			class:has-controls={Boolean(controls)}
			class:inline-controls-on-mobile={inlineControlsOnMobile && controls}
		>
			<div class="search-input">
				<Input
					type="text"
					bind:value={searchQuery}
					bind:this={inputEl}
					onkeydown={handleKeyDown}
					id={inputId}
					role="combobox"
					ariaAutocomplete="list"
					ariaExpanded={isExpanded}
					ariaControls={listboxId}
					ariaActivedescendant={activeDescendant}
					placeholder={activePlaceholder}
				/>
			</div>

			{#if controls}
				<div class="search-controls">{@render controls()}</div>
			{/if}
		</div>

		{#if loading && hasQuery}
			<p class="search-status" role="status" aria-live="polite">{activeLoadingMessage}</p>
		{/if}

		{#if hasResults}
			<div id={listboxId} class="results-list" role="listbox" aria-label={activeTitle}>
				{#each results as result, i (result.type + result.id)}
					<button
						id={`${listboxId}-option-${i}`}
						class="result-item"
						class:selected={i === selectedIndex}
						onmousedown={(event) => event.preventDefault()}
						onclick={() => selectResult(result)}
						role="option"
						aria-selected={i === selectedIndex}
						type="button"
					>
						{#if resultSnippet}
							{@render resultSnippet(result, i === selectedIndex)}
						{:else}
							<span class="result-type">
								{#if result.type === 'folder'}
									<Folder size={16} />
								{:else}
									<FileText size={16} />
								{/if}
							</span>
							<span class="result-name">{result.name}</span>
						{/if}
					</button>
				{/each}
			</div>
		{:else if hasQuery && !loading}
			<p class="no-results">{activeNoResultsMessage}</p>
		{/if}
	</div>
</Dialog>

<style>
	.search-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}
	.search-input-row,
	.search-input {
		display: contents;
	}

	.search-controls {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.search-input-row.has-controls {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}

	.search-input-row.has-controls .search-input {
		display: block;
		flex: 1 1 65%;
		min-width: 0;
	}

	.search-input-row.has-controls .search-controls {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex: 0 1 35%;
		min-width: 0;
	}

	.search-input-row.has-controls .search-controls :global(.monsan-select-container) {
		min-width: 0;
	}

	@media (max-width: 640px) {
		.search-input-row.has-controls:not(.inline-controls-on-mobile) {
			display: contents;
		}

		.search-input-row.has-controls:not(.inline-controls-on-mobile) .search-input {
			display: contents;
		}

		.search-input-row.inline-controls-on-mobile {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			min-width: 0;
		}

		.inline-controls-on-mobile .search-input {
			display: block;
			flex: 1 1 auto;
			min-width: 0;
		}

		.inline-controls-on-mobile .search-controls {
			flex: 0 1 48%;
			min-width: 0;
		}

		.inline-controls-on-mobile .search-controls :global(.monsan-select-container) {
			min-width: 0;
		}
	}

	.results-list {
		display: flex;
		flex-direction: column;
		border: 2px solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		max-height: 300px;
		overflow-y: auto;
	}

	.result-item {
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		border: none;
		border-bottom: 1px solid var(--border-color);
		background: transparent;
		color: var(--text-primary);
		text-align: left;
		width: 100%;
		font-family: inherit;
		font-size: var(--text-base);
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-item:hover {
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		outline: none;
	}

	.result-item.selected {
		background: var(--accent-primary);
		color: var(--bg-primary);
		--text-primary: var(--bg-primary);
		--text-secondary: color-mix(in srgb, var(--bg-primary) 82%, transparent);
		outline: none;
	}

	.result-type {
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
	}

	.result-name {
		font-weight: bold;
	}

	.search-status,
	.no-results {
		text-align: center;
		color: var(--text-secondary);
		padding: var(--space-md);
		margin: 0;
	}
</style>
