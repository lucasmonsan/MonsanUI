<script lang="ts">
	import Check from '../icons/Check.svelte';

	interface Props {
		options: string[];
		value?: string[];
		disabled?: boolean;
		columns?: number;
		size?: 'sm' | 'md' | 'lg';
		ariaLabel?: string;
		ariaLabelledby?: string;
	}

	let {
		options = [],
		value = $bindable([]),
		disabled = false,
		columns = 1,
		size = 'lg',
		ariaLabel,
		ariaLabelledby
	}: Props = $props();

	let optionsListEl = $state<HTMLDivElement>();

	function toggleChoice(option: string) {
		if (disabled) return;
		if (!Array.isArray(value)) value = [];
		if (value.includes(option)) {
			value = value.filter((v: string) => v !== option);
		} else {
			value = [...value, option];
		}
	}

	function focusOption(index: number) {
		const optionButtons = Array.from(
			optionsListEl?.querySelectorAll<HTMLButtonElement>('.option-btn:not(:disabled)') ?? []
		);
		const target = optionButtons[index];
		target?.focus();
	}

	function handleOptionKeydown(event: KeyboardEvent, index: number) {
		if (disabled) return;

		let nextIndex: number | null = null;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			nextIndex = (index + 1) % options.length;
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			nextIndex = (index - 1 + options.length) % options.length;
		} else if (event.key === 'Home') {
			nextIndex = 0;
		} else if (event.key === 'End') {
			nextIndex = options.length - 1;
		}

		if (nextIndex === null) return;

		event.preventDefault();
		focusOption(nextIndex);
	}
</script>

<div
	bind:this={optionsListEl}
	class="options-list size-{size}"
	role="group"
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	style:--cols={String(columns)}
>
	{#each options as option, index (option)}
		{@const selected = Array.isArray(value) && value.includes(option)}
		<button
			type="button"
			class="option-btn"
			class:selected
			role="checkbox"
			aria-checked={selected}
			onclick={() => toggleChoice(option)}
			onkeydown={(event) => handleOptionKeydown(event, index)}
			{disabled}
		>
			<div class="checkbox-square">
				{#if selected}
					<span class="check-icon">
						<Check size="100%" />
					</span>
				{/if}
			</div>
			<span>{option}</span>
		</button>
	{/each}
</div>

<style>
	.options-list {
		display: grid;
		grid-template-columns: repeat(var(--cols, 1), 1fr);
		gap: var(--space-sm);
		width: 100%;
	}

	@media (max-width: 600px) {
		.options-list {
			grid-template-columns: 1fr !important;
		}
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		text-align: left;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
		cursor: pointer;
		font-family: var(--font-body);
	}

	.option-btn:hover:not(.selected):not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.option-btn.selected {
		background: var(--accent-primary);
		border-color: var(--text-primary);
		color: var(--bg-primary);
	}

	.option-btn.selected:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.checkbox-square {
		border-radius: 6px;
		border: 3px solid var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.option-btn.selected .checkbox-square {
		background: var(--bg-primary);
		border-color: var(--bg-primary);
		color: var(--accent-primary);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.8;
	}

	/* Sizes configuration */
	.options-list.size-lg .option-btn {
		padding: var(--space-lg);
		font-size: var(--text-lg);
	}
	.options-list.size-lg .checkbox-square {
		width: 24px;
		height: 24px;
	}
	.options-list.size-lg .check-icon {
		width: 14px;
		height: 14px;
	}

	.options-list.size-md .option-btn {
		padding: var(--space-md);
		font-size: var(--text-md);
	}
	.options-list.size-md .checkbox-square {
		width: 20px;
		height: 20px;
	}
	.options-list.size-md .check-icon {
		width: 12px;
		height: 12px;
	}

	.options-list.size-sm .option-btn {
		padding: var(--space-sm) var(--space-md);
		font-size: var(--text-sm);
		gap: var(--space-sm);
	}
	.options-list.size-sm .checkbox-square {
		width: 16px;
		height: 16px;
		border-radius: 4px;
	}
	.options-list.size-sm .check-icon {
		width: 10px;
		height: 10px;
	}

	@media (prefers-reduced-motion: reduce) {
		.option-btn {
			transition: none;
		}
	}
</style>
