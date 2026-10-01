<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';
	import { i18n } from '../utils/i18n.svelte.js';
	import { floatingPortal } from '../utils/floatingPortal.js';
	import { tick } from 'svelte';

	interface Option {
		value: string | number;
		label: string;
		description?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable([]),
		options = [],
		size = 'md',
		placeholder,
		id = '',
		disabled = false,
		width = 'full',
		formatSelected,
		dropdownAlign = 'auto',
		dropdownMatchWidth = false,
		dropdownMinWidth = 280,
		ariaLabel,
		searchable = false,
		searchPlaceholder
	} = $props<{
		value: (string | number)[];
		options: Option[];
		size?: 'sm' | 'md';
		placeholder?: string;
		id?: string;
		disabled?: boolean;
		width?: 'full' | 'auto';
		formatSelected?: (count: number) => string;
		dropdownAlign?: 'left' | 'right' | 'auto';
		dropdownMatchWidth?: boolean;
		dropdownMinWidth?: number;
		ariaLabel?: string;
		searchable?: boolean;
		searchPlaceholder?: string;
	}>();

	const fallbackId = `multiselect-${Math.random().toString(36).slice(2, 11)}`;

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let dropdownEl = $state<HTMLDivElement>();
	let searchEl = $state<HTMLInputElement>();
	let searchQuery = $state('');
	let activeIndex = $state(-1);
	let activePlaceholder = $derived(placeholder ?? i18n.t('select.placeholder'));
	let triggerId = $derived(id || fallbackId);
	let listboxId = $derived(`${triggerId}-listbox`);
	let filteredOptions = $derived.by(() => {
		const query = searchQuery.trim().toLocaleLowerCase();
		if (!searchable || !query) return options;
		return options.filter((option: Option) =>
			`${option.label} ${option.description ?? ''}`.toLocaleLowerCase().includes(query)
		);
	});
	let firstSelectedIndex = $derived(
		filteredOptions.findIndex((option: Option) =>
			option.disabled
				? false
				: option.value === ''
					? value.length === 0
					: value.includes(option.value)
		)
	);
	let activeDescendant = $derived(
		isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
	);

	function getBoundaryIndex(direction: 'first' | 'last') {
		if (filteredOptions.length === 0) return -1;
		if (direction === 'first')
			return filteredOptions.findIndex((option: Option) => !option.disabled);
		for (let index = filteredOptions.length - 1; index >= 0; index -= 1) {
			if (!filteredOptions[index].disabled) return index;
		}
		return -1;
	}

	function getInitialIndex(direction: 'first' | 'last' = 'first') {
		if (firstSelectedIndex >= 0) return firstSelectedIndex;
		return getBoundaryIndex(direction);
	}

	function moveActiveIndex(direction: 1 | -1) {
		if (filteredOptions.length === 0) return -1;

		for (let offset = 1; offset <= filteredOptions.length; offset++) {
			const baseIndex = activeIndex < 0 ? (direction === 1 ? -1 : 0) : activeIndex;
			const candidate =
				(baseIndex + direction * offset + filteredOptions.length) % filteredOptions.length;
			if (!filteredOptions[candidate].disabled) return candidate;
		}

		return -1;
	}

	async function openDropdown(direction: 'first' | 'last' = 'first') {
		if (disabled) return;
		isOpen = true;
		activeIndex = getInitialIndex(direction);
		if (searchable) {
			await tick();
			searchEl?.focus();
		}
	}

	function closeDropdown(focusTrigger = false) {
		isOpen = false;
		activeIndex = -1;
		searchQuery = '';
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function toggleDropdown() {
		if (disabled) return;
		if (isOpen) {
			closeDropdown();
		} else {
			void openDropdown();
		}
	}

	function handleOptionClick(option: Option) {
		if (disabled || option.disabled) return;
		const optValue = option.value;

		if (optValue === '') {
			value = [];
		} else {
			if (value.includes(optValue)) {
				value = value.filter((v: string | number) => v !== optValue);
			} else {
				value = [...value, optValue];
			}
		}
	}

	function handleOutsideClick(e: MouseEvent) {
		if (!isOpen) return;
		const target = e.target as HTMLElement;
		if (containerEl && !containerEl.contains(target) && !dropdownEl?.contains(target)) {
			closeDropdown();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (
			e.target === searchEl &&
			!['Escape', 'Enter', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)
		) {
			return;
		}
		if (e.key === 'Escape' && isOpen) {
			closeDropdown(true);
			e.preventDefault();
		} else if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			void openDropdown();
			e.preventDefault();
		} else if (!isOpen && e.key === 'ArrowUp') {
			void openDropdown('last');
			e.preventDefault();
		} else if (isOpen && e.key === 'ArrowDown') {
			activeIndex = moveActiveIndex(1);
			e.preventDefault();
		} else if (isOpen && e.key === 'ArrowUp') {
			activeIndex = moveActiveIndex(-1);
			e.preventDefault();
		} else if (isOpen && e.key === 'Home') {
			activeIndex = getBoundaryIndex('first');
			e.preventDefault();
		} else if (isOpen && e.key === 'End') {
			activeIndex = getBoundaryIndex('last');
			e.preventDefault();
		} else if (isOpen && (e.key === 'Enter' || e.key === ' ') && activeIndex >= 0) {
			handleOptionClick(filteredOptions[activeIndex]);
			e.preventDefault();
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick, { capture: true });
			return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
		}
	});

	$effect(() => {
		if (!isOpen && activeIndex !== -1) {
			activeIndex = -1;
		} else if (
			isOpen &&
			(activeIndex >= filteredOptions.length || filteredOptions[activeIndex]?.disabled)
		) {
			activeIndex = getInitialIndex();
		}
	});

	$effect(() => {
		const query = searchQuery;
		if (isOpen && typeof query === 'string') activeIndex = getInitialIndex();
	});

	let displayLabel = $derived.by(() => {
		const selectedValues = value.filter((v: string | number) => v !== '');
		if (selectedValues.length === 0) {
			const allOption = options.find((opt: Option) => opt.value === '');
			return allOption ? allOption.label : activePlaceholder;
		}

		const selectedOptions = options.filter(
			(opt: Option) => opt.value !== '' && selectedValues.includes(opt.value)
		);
		if (selectedOptions.length === 0) {
			const allOption = options.find((opt: Option) => opt.value === '');
			return allOption ? allOption.label : activePlaceholder;
		}

		if (selectedOptions.length === 1) {
			return selectedOptions[0].label;
		}

		if (formatSelected) {
			return formatSelected(selectedOptions.length);
		}

		return i18n.t('multiSelect.itemsSelected', { count: selectedOptions.length });
	});
</script>

<div
	bind:this={containerEl}
	class="monsan-multiselect-container width-{width}"
	onkeydown={handleKeyDown}
	role="none"
>
	<button
		bind:this={triggerEl}
		type="button"
		id={triggerId}
		class="monsan-multiselect-trigger"
		class:size-sm={size === 'sm'}
		class:open={isOpen}
		onclick={toggleDropdown}
		{disabled}
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={listboxId}
		aria-activedescendant={activeDescendant}
		aria-label={ariaLabel ?? activePlaceholder}
	>
		<span class="label-text">{displayLabel}</span>
		<span class="chevron-wrapper" class:open={isOpen}>
			<ChevronDown size={16} />
		</span>
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownEl}
			style="visibility: hidden"
			use:floatingPortal={{
				anchor: triggerEl,
				align: dropdownAlign,
				matchWidth: dropdownMatchWidth,
				minWidth: dropdownMinWidth
			}}
			class="monsan-multiselect-dropdown align-{dropdownAlign}"
		>
			{#if searchable}
				<input
					bind:this={searchEl}
					bind:value={searchQuery}
					class="multiselect-search"
					type="search"
					placeholder={searchPlaceholder ?? i18n.t('search.placeholder')}
					aria-label={searchPlaceholder ?? i18n.t('search.title')}
				/>
			{/if}
			<div
				id={listboxId}
				class="multiselect-options"
				role="listbox"
				aria-multiselectable="true"
				aria-label={activePlaceholder}
			>
				{#each filteredOptions as option, i (option.value + '-' + i)}
					{@const isOptionChecked =
						option.value === '' ? value.length === 0 : value.includes(option.value)}
					<button
						id={`${listboxId}-option-${i}`}
						type="button"
						class="multiselect-option"
						class:selected={isOptionChecked}
						class:active={i === activeIndex}
						onmouseenter={() => {
							if (!option.disabled) activeIndex = i;
						}}
						onclick={() => handleOptionClick(option)}
						title={option.description ? `${option.label} - ${option.description}` : option.label}
						disabled={option.disabled}
						role="option"
						aria-selected={isOptionChecked}
						aria-disabled={option.disabled}
					>
						<span class="option-copy">
							<span class="option-label">{option.label}</span>
							{#if option.description}
								<span class="option-description">{option.description}</span>
							{/if}
						</span>
					</button>
				{/each}
				{#if filteredOptions.length === 0}
					<div class="multiselect-empty" role="status">{i18n.t('search.noResults')}</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.monsan-multiselect-container {
		position: relative;
		width: 100%;
		font-family: var(--font-body);
	}

	.monsan-multiselect-container.width-auto {
		width: auto;
		min-width: min(100%, 110px);
		max-width: 180px;
		flex-shrink: 1;
	}

	.monsan-multiselect-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: var(--control-height);
		padding: 0 var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-family: inherit;
		font-size: var(--text-sm);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
		cursor: pointer;
		position: relative;
		user-select: none;
		text-align: left;
		box-sizing: border-box;
	}

	.monsan-multiselect-trigger.size-sm {
		height: calc(var(--control-height) * 0.8);
		padding: 0 var(--space-sm);
		font-size: var(--text-sm);
	}

	.monsan-multiselect-trigger:focus:not(:disabled),
	.monsan-multiselect-trigger:focus-visible:not(:disabled) {
		outline: none;
		border-color: var(--accent-primary);
	}

	.monsan-multiselect-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
		transform: none !important;
		box-shadow: var(--shadow-sm) !important;
	}

	.label-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: var(--space-sm);
	}

	.chevron-wrapper {
		display: flex;
		align-items: center;
		transition: transform 0.2s ease;
		color: var(--text-primary);
		flex-shrink: 0;
	}

	.chevron-wrapper.open {
		transform: rotate(180deg);
	}

	.monsan-multiselect-dropdown {
		min-width: 200px;
		max-height: 250px;
		overflow-y: auto;
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-xs);
		box-sizing: border-box;
	}

	.monsan-multiselect-dropdown.align-left {
		width: 100%;
	}

	.monsan-multiselect-dropdown.align-right {
		width: auto;
	}

	.multiselect-option {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width) solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text-primary);
		font-family: inherit;
		font-size: var(--text-sm);
		font-weight: 800;
		cursor: pointer;
		text-align: left;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.12s var(--ease-out),
			border-color 0.12s var(--ease-out);
		box-sizing: border-box;
	}

	.multiselect-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.multiselect-search {
		width: 100%;
		min-height: var(--control-height);
		padding: 0 var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-secondary);
		color: var(--text-primary);
		font: inherit;
		box-sizing: border-box;
	}

	.multiselect-search:focus-visible {
		outline: none;
		border-color: var(--accent-primary);
	}

	.multiselect-empty {
		padding: var(--space-md);
		color: var(--text-secondary);
		font-size: var(--text-sm);
		text-align: center;
	}

	.multiselect-option:hover:not(.selected):not(:disabled),
	.multiselect-option.active:not(.selected):not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.multiselect-option:focus-visible {
		outline: none;
		border-color: var(--accent-primary);
	}

	.multiselect-option.selected {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.multiselect-option.selected:hover:not(:disabled),
	.multiselect-option.selected.active:not(:disabled) {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.multiselect-option:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.option-copy {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: var(--space-xxs);
	}

	.option-label {
		overflow-wrap: anywhere;
		white-space: normal;
	}

	.option-description {
		color: var(--text-secondary);
		font-size: var(--text-xs);
		font-weight: 600;
		overflow-wrap: anywhere;
		white-space: normal;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-multiselect-trigger,
		.chevron-wrapper,
		.multiselect-option {
			transition: none;
		}
	}
</style>
