<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Input from './Input.svelte';
	import type { SearchResultItem } from '../types.js';
	import FileText from './icons/FileText.svelte';
	import Folder from './icons/Folder.svelte';
	import { i18n } from '../utils/i18n.svelte';

	let {
		open = $bindable(false),
		items = [],
		onSelectResult,
		title,
		placeholder,
		noResultsMessage
	} = $props<{
		open: boolean;
		items: SearchResultItem[];
		onSelectResult?: (item: SearchResultItem) => void;
		title?: string;
		placeholder?: string;
		noResultsMessage?: string;
	}>();

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let inputEl = $state<{ focus: () => void }>();
	let activeTitle = $derived(title ?? i18n.t('search.title'));
	let activePlaceholder = $derived(placeholder ?? i18n.t('search.placeholder'));
	let activeNoResultsMessage = $derived(noResultsMessage ?? i18n.t('search.noResults'));

	const results = $derived<SearchResultItem[]>(
		searchQuery.trim() === ''
			? []
			: items.filter((item: SearchResultItem) =>
					item.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);

	$effect(() => {
		if (searchQuery !== undefined) {
			selectedIndex = 0;
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
			selectedIndex = results.length > 0 ? (selectedIndex + 1) % results.length : 0;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex =
				results.length > 0 ? (selectedIndex - 1 + results.length) % results.length : 0;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (results[selectedIndex]) {
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
		<Input
			type="text"
			bind:value={searchQuery}
			bind:this={inputEl}
			onkeydown={handleKeyDown}
			placeholder={activePlaceholder}
		/>

		{#if results.length > 0}
			<div class="results-list" role="listbox">
				{#each results as result, i (result.type + result.id)}
					<button
						class="result-item"
						class:selected={i === selectedIndex}
						onclick={() => selectResult(result)}
						role="option"
						aria-selected={i === selectedIndex}
						type="button"
					>
						<span class="result-type">
							{#if result.type === 'folder'}
								<Folder size={16} />
							{:else}
								<FileText size={16} />
							{/if}
						</span>
						<span class="result-name">{result.name}</span>
					</button>
				{/each}
			</div>
		{:else if searchQuery.trim() !== ''}
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

	.result-item.selected,
	.result-item:hover {
		background: var(--accent-primary);
		color: var(--bg-primary);
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

	.no-results {
		text-align: center;
		color: var(--text-secondary);
		padding: var(--space-md);
	}
</style>
