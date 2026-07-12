<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';
	import { i18n } from '../utils/i18n.svelte.js';
	import { floatingPortal } from '../utils/floatingPortal.js';

	interface Option {
		value: string | number;
		label: string;
	}

	let {
		value = $bindable([]),
		options = [],
		placeholder,
		id = '',
		disabled = false,
		width = 'full',
		formatSelected,
		dropdownAlign = 'left'
	} = $props<{
		value: (string | number)[];
		options: Option[];
		placeholder?: string;
		id?: string;
		disabled?: boolean;
		width?: 'full' | 'auto';
		formatSelected?: (count: number) => string;
		dropdownAlign?: 'left' | 'right';
	}>();

	const fallbackId = `multiselect-${Math.random().toString(36).slice(2, 11)}`;

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let dropdownEl = $state<HTMLDivElement>();
	let activeIndex = $state(-1);
	let activePlaceholder = $derived(placeholder ?? i18n.t('select.placeholder'));
	let triggerId = $derived(id || fallbackId);
	let listboxId = $derived(`${triggerId}-listbox`);
	let firstSelectedIndex = $derived(
		options.findIndex((option: Option) =>
			option.value === '' ? value.length === 0 : value.includes(option.value)
		)
	);
	let activeDescendant = $derived(
		isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
	);

	function getInitialIndex(direction: 'first' | 'last' = 'first') {
		if (options.length === 0) return -1;
		if (firstSelectedIndex >= 0) return firstSelectedIndex;
		return direction === 'last' ? options.length - 1 : 0;
	}

	function openDropdown(direction: 'first' | 'last' = 'first') {
		if (disabled) return;
		isOpen = true;
		activeIndex = getInitialIndex(direction);
	}

	function closeDropdown(focusTrigger = false) {
		isOpen = false;
		activeIndex = -1;
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function toggleDropdown() {
		if (disabled) return;
		if (isOpen) {
			closeDropdown();
		} else {
			openDropdown();
		}
	}

	function handleOptionClick(optValue: string | number) {
		if (disabled) return;

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
		if (e.key === 'Escape' && isOpen) {
			closeDropdown(true);
			e.preventDefault();
		} else if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
			openDropdown();
			e.preventDefault();
		} else if (!isOpen && e.key === 'ArrowUp') {
			openDropdown('last');
			e.preventDefault();
		} else if (isOpen && e.key === 'ArrowDown') {
			activeIndex = options.length === 0 ? -1 : (activeIndex + 1) % options.length;
			e.preventDefault();
		} else if (isOpen && e.key === 'ArrowUp') {
			activeIndex =
				options.length === 0 ? -1 : activeIndex <= 0 ? options.length - 1 : activeIndex - 1;
			e.preventDefault();
		} else if (isOpen && e.key === 'Home') {
			activeIndex = options.length === 0 ? -1 : 0;
			e.preventDefault();
		} else if (isOpen && e.key === 'End') {
			activeIndex = options.length - 1;
			e.preventDefault();
		} else if (isOpen && (e.key === 'Enter' || e.key === ' ') && activeIndex >= 0) {
			handleOptionClick(options[activeIndex].value);
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
		} else if (isOpen && activeIndex >= options.length) {
			activeIndex = getInitialIndex();
		}
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
		class:open={isOpen}
		onclick={toggleDropdown}
		{disabled}
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-controls={listboxId}
		aria-activedescendant={activeDescendant}
	>
		<span class="label-text">{displayLabel}</span>
		<span class="chevron-wrapper" class:open={isOpen}>
			<ChevronDown size={16} />
		</span>
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownEl}
			use:floatingPortal={{
				anchor: triggerEl,
				align: dropdownAlign,
				matchWidth: dropdownAlign === 'left',
				minWidth: 200
			}}
			id={listboxId}
			class="monsan-multiselect-dropdown align-{dropdownAlign}"
			role="listbox"
			aria-multiselectable="true"
			aria-label={activePlaceholder}
		>
			{#each options as option, i (option.value + '-' + i)}
				{@const isOptionChecked =
					option.value === '' ? value.length === 0 : value.includes(option.value)}
				<button
					id={`${listboxId}-option-${i}`}
					type="button"
					class="multiselect-option"
					class:selected={isOptionChecked}
					class:active={i === activeIndex}
					onmouseenter={() => (activeIndex = i)}
					onclick={() => handleOptionClick(option.value)}
					role="option"
					aria-selected={isOptionChecked}
				>
					<span class="option-label">{option.label}</span>
				</button>
			{/each}
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
		min-width: min(100%, 160px);
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

	.monsan-multiselect-trigger:focus:not(:disabled),
	.monsan-multiselect-trigger:focus-visible:not(:disabled) {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 3px 3px 0px var(--accent-primary);
		transform: translate(-1px, -1px);
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

	.multiselect-option:hover:not(.selected):not(:disabled),
	.multiselect-option.active:not(.selected):not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.multiselect-option:focus-visible {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 2px 2px 0px var(--accent-primary);
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

	.option-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-multiselect-trigger,
		.chevron-wrapper,
		.multiselect-option {
			transition: none;
		}
	}
</style>
