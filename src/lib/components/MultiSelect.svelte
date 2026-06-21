<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';
	import { onMount } from 'svelte';
	import { i18n } from '../utils/i18n.svelte.js';

	interface Option {
		value: string | number;
		label: string;
	}

	let {
		value = $bindable([]),
		options = [],
		placeholder = 'Selecione...',
		id = '',
		disabled = false,
		width = 'full',
		formatSelected
	} = $props<{
		value: (string | number)[];
		options: Option[];
		placeholder?: string;
		id?: string;
		disabled?: boolean;
		width?: 'full' | 'auto';
		formatSelected?: (count: number) => string;
	}>();

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();

	function toggleDropdown() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	function handleOptionClick(optValue: string | number) {
		if (disabled) return;

		if (optValue === '') {
			// Clicked "All" option (empty value represents "all" or reset)
			value = [];
		} else {
			// Toggle value
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
		if (containerEl && !containerEl.contains(target)) {
			isOpen = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'Escape' && isOpen) {
			isOpen = false;
			e.preventDefault();
		} else if ((e.key === 'Enter' || e.key === ' ') && !isOpen) {
			isOpen = true;
			e.preventDefault();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleOutsideClick, { capture: true });
		return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
	});

	// Compute display label
	let displayLabel = $derived.by(() => {
		// Filter out the placeholder option (value === '') when counting selections
		const selectedValues = value.filter((v: string | number) => v !== '');
		if (selectedValues.length === 0) {
			const allOption = options.find((opt: Option) => opt.value === '');
			return allOption ? allOption.label : placeholder;
		}

		const selectedOptions = options.filter(
			(opt: Option) => opt.value !== '' && selectedValues.includes(opt.value)
		);
		if (selectedOptions.length === 0) {
			const allOption = options.find((opt: Option) => opt.value === '');
			return allOption ? allOption.label : placeholder;
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
		type="button"
		{id}
		class="monsan-multiselect-trigger"
		class:open={isOpen}
		onclick={toggleDropdown}
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="label-text">{displayLabel}</span>
		<span class="chevron-wrapper" class:open={isOpen}>
			<ChevronDown size={16} />
		</span>
	</button>

	{#if isOpen}
		<div
			class="monsan-multiselect-dropdown"
			role="listbox"
			aria-multiselectable="true"
			aria-label={placeholder}
		>
			{#each options as option, i (option.value + '-' + i)}
				{@const isOptionChecked =
					option.value === '' ? value.length === 0 : value.includes(option.value)}
				<button
					type="button"
					class="multiselect-option"
					class:selected={isOptionChecked}
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
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		width: 100%;
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

	/* Option item styling */
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

	.multiselect-option:hover:not(:disabled) {
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

	.multiselect-option.selected:hover:not(:disabled) {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
	}

	.option-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
