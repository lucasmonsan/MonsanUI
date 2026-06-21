<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';
	import { onMount } from 'svelte';

	interface Option {
		value: string | number;
		label: string;
	}

	let {
		value = $bindable(),
		options = [],
		placeholder = 'Selecione...',
		id = '',
		showChevron = true,
		textAlign = 'left',
		disabled = false,
		width = 'full'
	} = $props<{
		value: string | number;
		options: Option[];
		placeholder?: string;
		id?: string;
		showChevron?: boolean;
		textAlign?: 'left' | 'center' | 'right';
		disabled?: boolean;
		width?: 'full' | 'auto';
	}>();

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();

	let selectedOption = $derived(options.find((option: Option) => option.value === value));
	let displayLabel = $derived(selectedOption?.label ?? placeholder);

	function toggleDropdown() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	function selectOption(optionValue: string | number) {
		if (disabled) return;
		value = optionValue;
		isOpen = false;
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
		} else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && !isOpen) {
			isOpen = true;
			e.preventDefault();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleOutsideClick, { capture: true });
		return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
	});
</script>

<div
	bind:this={containerEl}
	class="monsan-select-container width-{width}"
	onkeydown={handleKeyDown}
	role="none"
>
	<button
		type="button"
		{id}
		class="monsan-select-trigger align-{textAlign}"
		class:has-chevron={showChevron}
		class:open={isOpen}
		onclick={toggleDropdown}
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="label-text">{displayLabel}</span>

		{#if showChevron}
			<span class="chevron-wrapper" class:open={isOpen}>
				<ChevronDown size={16} />
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="monsan-select-dropdown" role="listbox" aria-label={placeholder}>
			{#each options as option, i (option.value + '-' + i)}
				{@const isSelected = option.value === value}
				<button
					type="button"
					class="select-option"
					class:selected={isSelected}
					onclick={() => selectOption(option.value)}
					role="option"
					aria-selected={isSelected}
				>
					<span class="option-label">{option.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.monsan-select-container {
		position: relative;
		width: 100%;
		font-family: var(--font-body);
	}

	.monsan-select-container.width-auto {
		width: auto;
		min-width: min(100%, 140px);
	}

	.monsan-select-trigger {
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
		box-sizing: border-box;
	}

	.monsan-select-trigger:focus:not(:disabled),
	.monsan-select-trigger:focus-visible:not(:disabled) {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 3px 3px 0px var(--accent-primary);
		transform: translate(-1px, -1px);
	}

	.monsan-select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
		transform: none !important;
		box-shadow: var(--shadow-sm) !important;
	}

	.align-left {
		text-align: left;
		justify-content: space-between;
	}

	.align-center {
		text-align: center;
	}

	.align-right {
		text-align: right;
	}

	.label-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.chevron-wrapper {
		display: flex;
		align-items: center;
		transition: transform 0.2s ease;
		color: var(--text-primary);
		flex-shrink: 0;
		margin-left: var(--space-sm);
	}

	.chevron-wrapper.open {
		transform: rotate(180deg);
	}

	.monsan-select-dropdown {
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

	.select-option {
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

	.select-option:hover:not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.select-option:focus-visible {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 2px 2px 0px var(--accent-primary);
	}

	.select-option.selected {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.select-option.selected:hover:not(:disabled) {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
	}

	.option-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
