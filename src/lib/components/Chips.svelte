<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
		value?: string[];
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable([]),
		placeholder = 'Adicionar tag...',
		disabled = false,
		...rest
	}: Props = $props();

	let inputValue = $state('');
	let inputEl = $state<HTMLInputElement>();
	let containerEl = $state<HTMLDivElement>();
	let isFocused = $state(false);

	function addTag() {
		const cleanTag = inputValue.trim().replace(/,$/, '');
		if (cleanTag !== '' && !value.includes(cleanTag)) {
			value = [...value, cleanTag];
			inputValue = '';
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			addTag();
		} else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
			value = value.slice(0, -1);
		}
	}

	function removeTag(index: number, e: MouseEvent) {
		e.stopPropagation(); // Evita focar no input ao clicar para remover
		if (disabled) return;
		value = value.filter((_, i) => i !== index);
	}
</script>

<div
	bind:this={containerEl}
	role="presentation"
	class="monsan-chips-input-container "
	class:focused={isFocused}
	class:disabled
	onclick={() => !disabled && inputEl?.focus()}
>
	<div class="chips-list">
		{#each value as tag, index (tag)}
			<div class="chip-item">
				<span class="chip-text">{tag}</span>
				<button
					type="button"
					class="chip-remove-btn"
					{disabled}
					onclick={(e) => removeTag(index, e)}
					aria-label="Remover tag {tag}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="3"
						stroke="currentColor"
						class="chip-remove-icon"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}

		<input
			bind:this={inputEl}
			type="text"
			bind:value={inputValue}
			placeholder={value.length === 0 ? placeholder : ''}
			{disabled}
			class="chips-input"
			onfocus={() => (isFocused = true)}
			onblur={() => {
				isFocused = false;
				addTag(); // Adiciona se o usuário desfocar com texto digitado
			}}
			onkeydown={handleKeyDown}
			{...rest}
		/>
	</div>
</div>

<style>
	.monsan-chips-input-container {
		display: flex;
		width: 100%;
		min-height: var(--control-height);
		padding: var(--space-xs) var(--space-sm);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: text;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
		font-family: var(--font-body);
	}

	.monsan-chips-input-container:hover:not(.disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.monsan-chips-input-container.focused:not(.disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.monsan-chips-input-container.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Chips List Layout */
	.chips-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		align-items: center;
		width: 100%;
	}

	/* Individual Chip Item */
	.chip-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 4px var(--space-xs);
		background-color: var(--bg-secondary);
		border: 2px solid var(--border-color);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: bold;
		color: var(--text-primary);
		box-shadow: 1px 1px 0px var(--border-color);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out);
	}

	.chip-item:hover {
		transform: translate(-0.5px, -0.5px);
		box-shadow: 1.5px 1.5px 0px var(--border-color);
	}

	.chip-text {
		white-space: nowrap;
	}

	/* Chip Remove Button */
	.chip-remove-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 1px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		border-radius: var(--radius-full);
		transition:
			color 0.2s ease,
			background-color 0.2s ease;
	}

	.chip-remove-btn:hover:not(:disabled) {
		color: var(--accent-primary);
		background-color: rgba(0, 0, 0, 0.05);
	}

	.chip-remove-btn:disabled {
		cursor: not-allowed;
	}

	.chip-remove-icon {
		width: 12px;
		height: 12px;
	}

	/* Inner Input */
	.chips-input {
		flex: 1;
		min-width: 80px;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-body);
		font-size: var(--text-md);
		color: var(--text-primary);
		padding: 2px 0;
	}

	.chips-input:disabled {
		cursor: not-allowed;
	}
</style>
