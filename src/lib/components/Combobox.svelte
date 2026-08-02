<script lang="ts">
	import Search from './icons/Search.svelte';
	import X from './icons/X.svelte';

	export type ComboboxOption = { value: string; label: string; description?: string };

	interface Props {
		options: ComboboxOption[];
		value?: string;
		placeholder?: string;
		ariaLabel: string;
		noResultsLabel: string;
		clearLabel: string;
		id?: string;
		name?: string;
		disabled?: boolean;
		required?: boolean;
		onChange?: (value: string) => void;
	}

	let {
		options,
		value = $bindable(''),
		placeholder,
		ariaLabel,
		noResultsLabel,
		clearLabel,
		id,
		name,
		disabled = false,
		required = false,
		onChange
	}: Props = $props();

	const fallbackId = `combobox-${Math.random().toString(36).slice(2, 11)}`;
	let input = $state<HTMLInputElement>();
	let container = $state<HTMLElement>();
	let query = $state('');
	let open = $state(false);
	let focused = $state(false);
	let activeIndex = $state(-1);
	let inputId = $derived(id ?? fallbackId);
	let listboxId = $derived(`${inputId}-options`);
	let selected = $derived(options.find((option) => option.value === value));
	let filtered = $derived(
		options.filter((option) => {
			const needle = query.trim().toLocaleLowerCase();
			return !needle || `${option.label} ${option.value}`.toLocaleLowerCase().includes(needle);
		})
	);
	let activeDescendant = $derived(
		open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
	);

	$effect(() => {
		if (!focused) query = selected?.label ?? '';
		if (!options.some((option) => option.value === value)) value = '';
	});

	function choose(option: ComboboxOption) {
		value = option.value;
		query = option.label;
		open = false;
		activeIndex = -1;
		onChange?.(option.value);
		input?.focus();
	}

	function close() {
		open = false;
		activeIndex = -1;
		query = selected?.label ?? '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			open = true;
			activeIndex = filtered.length ? (activeIndex + 1 + filtered.length) % filtered.length : -1;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			open = true;
			activeIndex = filtered.length ? (activeIndex - 1 + filtered.length) % filtered.length : -1;
		} else if (event.key === 'Enter' && activeIndex >= 0 && filtered[activeIndex]) {
			event.preventDefault();
			choose(filtered[activeIndex]);
		} else if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	$effect(() => {
		if (!open) return;
		const outside = (event: MouseEvent) => {
			if (container && !container.contains(event.target as Node)) close();
		};
		document.addEventListener('click', outside, { capture: true });
		return () => document.removeEventListener('click', outside, { capture: true });
	});
</script>

<div bind:this={container} class="monsan-combobox">
	{#if name}<input type="hidden" {name} {value} />{/if}
	<div class="combobox-control" class:focused class:disabled>
		<span aria-hidden="true"><Search size={20} /></span>
		<input
			bind:this={input}
			type="text"
			id={inputId}
			bind:value={query}
			{placeholder}
			{disabled}
			{required}
			role="combobox"
			aria-label={ariaLabel}
			aria-autocomplete="list"
			aria-expanded={open}
			aria-controls={listboxId}
			aria-activedescendant={activeDescendant}
			onfocus={() => {
				focused = true;
				open = true;
				activeIndex = -1;
			}}
			onblur={(event) => {
				if (!container?.contains(event.relatedTarget as Node | null)) {
					focused = false;
					close();
				}
			}}
			oninput={() => {
				open = true;
				activeIndex = -1;
			}}
			onkeydown={handleKeydown}
		/>
		{#if query}
			<button
				type="button"
				aria-label={clearLabel}
				{disabled}
				onclick={() => {
					value = '';
					query = '';
					open = true;
					onChange?.('');
					input?.focus();
				}}
			>
				<X size={16} />
			</button>
		{/if}
	</div>

	{#if open && !disabled}
		<div id={listboxId} class="combobox-options" role="listbox" aria-label={ariaLabel}>
			{#if filtered.length === 0}
				<p class="combobox-empty">{noResultsLabel}</p>
			{:else}
				{#each filtered as option, index (option.value)}
					<button
						id={`${listboxId}-option-${index}`}
						type="button"
						role="option"
						aria-selected={option.value === value}
						class:active={index === activeIndex}
						onmousedown={(event) => event.preventDefault()}
						onclick={() => choose(option)}
					>
						<span>{option.label}</span>
						{#if option.description}<small>{option.description}</small>{/if}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.monsan-combobox {
		position: relative;
		width: 100%;
		font-family: var(--font-body);
	}
	.combobox-control {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-height: var(--control-height);
		padding: 0 var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
	}
	.combobox-control.focused {
		border-color: var(--accent-primary);
		box-shadow: 3px 3px 0 var(--accent-primary);
	}
	.combobox-control.disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.combobox-control input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;
	}
	.combobox-control button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.combobox-control button:focus-visible,
	.combobox-options button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}
	.combobox-options {
		position: absolute;
		z-index: var(--layer-popover, 70);
		top: calc(100% + var(--space-xs));
		left: 0;
		right: 0;
		max-height: min(18rem, 50dvh);
		overflow-y: auto;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		background: var(--bg-primary);
	}
	.combobox-options button {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		align-items: flex-start;
		padding: var(--space-sm) var(--space-md);
		border: 0;
		border-bottom: var(--border-width) solid var(--border-color);
		background: transparent;
		color: var(--text-primary);
		font: inherit;
		text-align: start;
		cursor: pointer;
	}
	.combobox-options button:last-child {
		border-bottom: 0;
	}
	.combobox-options button.active,
	.combobox-options button:hover {
		background: var(--bg-secondary);
	}
	.combobox-options small,
	.combobox-empty {
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--text-sm);
	}
	.combobox-empty {
		padding: var(--space-md);
	}
	@media (prefers-reduced-motion: reduce) {
		.combobox-control {
			transition: none;
		}
	}
</style>
