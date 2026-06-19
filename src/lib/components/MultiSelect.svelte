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
				value = value.filter((v) => v !== optValue);
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
		const selectedValues = value.filter((v) => v !== '');
		if (selectedValues.length === 0) {
			const allOption = options.find((opt) => opt.value === '');
			return allOption ? allOption.label : placeholder;
		}

		const selectedOptions = options.filter(
			(opt) => opt.value !== '' && selectedValues.includes(opt.value)
		);
		if (selectedOptions.length === 0) {
			const allOption = options.find((opt) => opt.value === '');
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
					onclick={() => handleOptionClick(option.value)}
					role="option"
					aria-selected={isOptionChecked}
				>
					<div class="option-checkbox-box" class:checked={isOptionChecked}>
						{#if isOptionChecked}
							<svg
								class="check-icon"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
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
		padding: var(--space-xs) 0;
		box-sizing: border-box;
	}

	/* Option item styling */
	.multiselect-option {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--text-primary);
		font-family: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
		box-sizing: border-box;
	}

	.multiselect-option:hover:not(:disabled) {
		background: var(--bg-secondary);
	}

	.option-checkbox-box {
		width: 18px;
		height: 18px;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--bg-primary);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out),
			border-color 0.1s var(--ease-out);
		box-sizing: border-box;
	}

	.multiselect-option:hover:not(:disabled) .option-checkbox-box {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--accent-primary);
	}

	.option-checkbox-box.checked {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.multiselect-option:hover:not(:disabled) .option-checkbox-box.checked {
		border-color: var(--border-color);
		box-shadow: 2px 2px 0px var(--border-color);
	}

	.check-icon {
		width: 12px;
		height: 12px;
		flex-shrink: 0;
	}

	.option-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
