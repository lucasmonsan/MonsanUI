<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import ChevronDown from './icons/ChevronDown.svelte';

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
		disabled = false
	} = $props<{
		value: string | number;
		options: Option[];
		placeholder?: string;
		id?: string;
		showChevron?: boolean;
		textAlign?: 'left' | 'center' | 'right';
		disabled?: boolean;
	}>();

	let isOpen = $state(false);
	let selectedLabel = $derived(
		options.find((o: Option) => o.value === value)?.label || placeholder
	);

	function selectOption(val: string | number) {
		value = val;
		isOpen = false;
	}

	let selectEl = $state<HTMLElement>();

	// Fechar ao clicar fora
	function handleClickOutside(e: MouseEvent) {
		if (selectEl && !selectEl.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside, { capture: true });
		return () => document.removeEventListener('click', handleClickOutside, { capture: true });
	});
</script>

<div class="monsan-select-container" bind:this={selectEl}>
	<button
		{id}
		class="monsan-select-trigger align-{textAlign}"
		class:open={isOpen}
		class:has-chevron={showChevron}
		onclick={() => {
			if (!disabled) isOpen = !isOpen;
		}}
		type="button"
		{disabled}
	>
		<span class="trigger-label">{selectedLabel}</span>
		{#if showChevron}
			<span class="chevron-wrapper">
				<ChevronDown size={16} class="chevron-icon {isOpen ? 'rotated' : ''}" />
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div
			class="monsan-select-dropdown"
			transition:scale={{ duration: 150, start: 0.95, easing: backOut }}
		>
			{#each options as option (option.value)}
				<button
					class="monsan-select-option"
					class:selected={option.value === value}
					onclick={() => selectOption(option.value)}
					type="button"
				>
					{option.label}
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

	.monsan-select-trigger {
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
		display: flex;
		align-items: center;
		position: relative;
	}

	.monsan-select-trigger:focus:not(:disabled),
	.monsan-select-trigger.open:not(:disabled) {
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

	.trigger-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.align-left .trigger-label {
		text-align: left;
	}
	.align-left.has-chevron .trigger-label {
		padding-right: var(--space-lg);
	}

	.align-center .trigger-label {
		text-align: center;
	}
	.align-center.has-chevron .trigger-label {
		padding-left: var(--space-lg);
		padding-right: var(--space-lg);
	}

	.align-right .trigger-label {
		text-align: right;
	}
	.align-right.has-chevron .trigger-label {
		padding-left: var(--space-lg);
	}

	.chevron-wrapper {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	.chevron-icon {
		transition: transform 0.2s ease;
	}

	.chevron-icon.rotated {
		transform: rotate(180deg);
	}

	.monsan-select-dropdown {
		position: absolute;
		top: calc(100% + var(--space-xs, 4px));
		left: 0;
		width: 100%;
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		z-index: 100;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		padding: var(--space-xs);
		gap: var(--space-xs);
		overflow: hidden;
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.monsan-select-dropdown::-webkit-scrollbar {
		display: none;
	}

	.monsan-select-option {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--text-primary);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		font-weight: 700;
		font-size: var(--text-sm);
		transition: background 0.1s ease;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.monsan-select-option:hover {
		background: var(--bg-secondary);
	}

	.monsan-select-option.selected {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-select-option.selected {
		color: var(--text-primary);
	}
</style>
