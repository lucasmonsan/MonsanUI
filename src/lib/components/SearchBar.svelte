<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import Search from './icons/Search.svelte';
	import X from './icons/X.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		suggestions?: string[];
		id?: string;
		name?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		ariaLabel?: string;
		ariaDescribedby?: string;
		clearLabel?: string;
		oninput?: (event: Event) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		placeholder,
		disabled = false,
		suggestions = [],
		id,
		name,
		autocomplete,
		ariaLabel,
		ariaDescribedby,
		clearLabel,
		oninput,
		onfocus,
		onblur
	}: Props = $props();

	let inputEl = $state<HTMLInputElement>();
	let containerEl = $state<HTMLDivElement>();
	let isFocused = $state(false);
	let showSuggestions = $state(false);
	let prefersReducedMotion = $state(false);
	let activePlaceholder = $derived(placeholder ?? i18n.t('searchBar.placeholder'));
	let activeClearLabel = $derived(clearLabel ?? i18n.t('searchBar.clear'));

	let filteredSuggestions = $derived(
		value.trim() === ''
			? []
			: suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
	);

	let displayDropdown = $derived(showSuggestions && filteredSuggestions.length > 0 && !disabled);

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
		}

		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});

	function handleOutsideClick(event: MouseEvent) {
		if (containerEl && !containerEl.contains(event.target as Node)) {
			showSuggestions = false;
		}
	}

	function selectSuggestion(s: string) {
		value = s;
		showSuggestions = false;
		inputEl?.focus();
	}

	function handleFocus(event: FocusEvent) {
		isFocused = true;
		showSuggestions = true;
		onfocus?.(event);
	}

	function handleBlur(event: FocusEvent) {
		isFocused = false;
		onblur?.(event);
	}

	function handleInput(event: Event) {
		showSuggestions = true;
		oninput?.(event);
	}

	$effect(() => {
		if (showSuggestions) {
			document.addEventListener('click', handleOutsideClick, { capture: true });
			return () => {
				document.removeEventListener('click', handleOutsideClick, { capture: true });
			};
		}
	});
</script>

<div bind:this={containerEl} class="monsan-searchbar-container">
	<div class="searchbar-wrapper" class:focused={isFocused} class:disabled>
		<span class="search-icon">
			<Search size={20} />
		</span>

		<input
			bind:this={inputEl}
			type="text"
			bind:value
			{id}
			{name}
			placeholder={activePlaceholder}
			{disabled}
			{autocomplete}
			aria-label={ariaLabel}
			aria-describedby={ariaDescribedby}
			class="search-input"
			onfocus={handleFocus}
			onblur={handleBlur}
			oninput={handleInput}
		/>

		{#if value}
			<button
				type="button"
				class="clear-btn"
				{disabled}
				onclick={() => {
					value = '';
					showSuggestions = true;
					inputEl?.focus();
				}}
				aria-label={activeClearLabel}
			>
				<X size={16} />
			</button>
		{/if}
	</div>

	{#if displayDropdown}
		<div
			class="suggestions-dropdown panel"
			transition:scale={{
				duration: prefersReducedMotion ? 0 : 150,
				easing: backOut,
				start: prefersReducedMotion ? 1 : 0.98
			}}
		>
			{#each filteredSuggestions as suggestion (suggestion)}
				<button type="button" class="suggestion-item" onclick={() => selectSuggestion(suggestion)}>
					{suggestion}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.monsan-searchbar-container {
		position: relative;
		width: 100%;
		font-family: var(--font-body);
	}

	.searchbar-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		height: var(--control-height);
		padding: 0 var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.searchbar-wrapper:hover:not(.disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.searchbar-wrapper.focused:not(.disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.searchbar-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.search-icon {
		width: 20px;
		height: 20px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		height: 100%;
		background: transparent;
		border: none;
		outline: none;
		font-family: var(--font-body);
		font-size: var(--text-md);
		color: var(--text-primary);
		min-width: 0;
	}

	.search-input:disabled {
		cursor: not-allowed;
	}

	.clear-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		border-radius: var(--radius-sm);
		transition: color 0.2s ease;
		flex-shrink: 0;
	}

	.clear-btn:hover:not(:disabled) {
		color: var(--accent-primary);
	}

	.clear-btn:disabled {
		cursor: not-allowed;
	}

	.suggestions-dropdown {
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		z-index: 1000;
		width: 100%;
		max-height: 220px;
		overflow-y: auto;
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		padding: var(--space-xs);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.suggestion-item {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		text-align: left;
		color: var(--text-primary);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}

	.suggestion-item:hover {
		background-color: var(--bg-secondary);
		color: var(--accent-primary);
		font-weight: bold;
	}

	@media (prefers-reduced-motion: reduce) {
		.searchbar-wrapper,
		.clear-btn,
		.suggestion-item {
			transition: none;
		}
	}
</style>
