<script lang="ts">
	import X from './icons/X.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		value?: string[];
		placeholder?: string;
		disabled?: boolean;
		id?: string;
		name?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		removeLabel?: (tag: string) => string;
		oninput?: (event: Event) => void;
	}

	let {
		value = $bindable([]),
		placeholder,
		disabled = false,
		id,
		name,
		ariaLabel,
		ariaDescribedby,
		removeLabel,
		oninput
	}: Props = $props();

	let inputValue = $state('');
	let inputEl = $state<HTMLInputElement>();
	let containerEl = $state<HTMLDivElement>();
	let isFocused = $state(false);
	let activePlaceholder = $derived(placeholder ?? i18n.t('chips.placeholder'));
	let activeRemoveLabel = $derived(
		removeLabel ?? ((tag: string) => i18n.t('chips.remove', { tag }))
	);

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
		e.stopPropagation();
		if (disabled) return;
		value = value.filter((_, i) => i !== index);
	}
</script>

<div
	bind:this={containerEl}
	role="presentation"
	class="monsan-chips-input-container"
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
					aria-label={activeRemoveLabel(tag)}
				>
					<X size={12} />
				</button>
			</div>
		{/each}

		<input
			bind:this={inputEl}
			type="text"
			bind:value={inputValue}
			{id}
			{name}
			placeholder={value.length === 0 ? activePlaceholder : ''}
			{disabled}
			aria-label={ariaLabel}
			aria-describedby={ariaDescribedby}
			class="chips-input"
			onfocus={() => (isFocused = true)}
			onblur={() => {
				isFocused = false;
				addTag();
			}}
			onkeydown={handleKeyDown}
			{oninput}
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

	.chips-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		align-items: center;
		width: 100%;
	}

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

	@media (prefers-reduced-motion: reduce) {
		.monsan-chips-input-container,
		.chip-item,
		.chip-remove-btn {
			transition: none;
		}
	}
</style>
