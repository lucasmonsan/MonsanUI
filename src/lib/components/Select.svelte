<script lang="ts">
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
</script>

<div class="monsan-select-container width-{width}">
	<select
		{id}
		class="monsan-select-trigger align-{textAlign}"
		class:has-chevron={showChevron}
		bind:value
		{disabled}
	>
		{#if placeholder && !options.some((option: Option) => option.value === value)}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as option, i (option.value + '-' + i)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	{#if showChevron}
		<span class="chevron-wrapper">
			<ChevronDown size={16} />
		</span>
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
		width: 100%;
		height: var(--control-height);
		padding: 0 var(--space-md);
		padding-right: calc(var(--space-md) + 24px);
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
		appearance: none;
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
	}

	.align-center {
		text-align: center;
	}

	.align-right {
		text-align: right;
	}

	.chevron-wrapper {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		pointer-events: none;
		transition: transform 0.2s ease;
	}
</style>
