<script lang="ts">
	import { tick } from 'svelte';
	import type { CommandPaletteCommand } from '$lib/types.js';
	import Dialog from './Dialog.svelte';

	interface Props {
		open?: boolean;
		commands: CommandPaletteCommand[];
		title: string;
		closeLabel: string;
		searchLabel: string;
		searchPlaceholder?: string;
		emptyLabel: string;
		onSelect: (command: CommandPaletteCommand) => void;
	}

	let {
		open = $bindable(false),
		commands,
		title,
		closeLabel,
		searchLabel,
		searchPlaceholder,
		emptyLabel,
		onSelect
	}: Props = $props();

	let query = $state('');
	let activeIndex = $state(0);
	let input = $state<HTMLInputElement>();
	let visibleCommands = $derived(
		commands.filter((command) => {
			const needle = query.trim().toLocaleLowerCase();
			return (
				!needle ||
				`${command.label} ${command.description ?? ''}`.toLocaleLowerCase().includes(needle)
			);
		})
	);

	$effect(() => {
		if (!open) return;
		query = '';
		activeIndex = 0;
		void tick().then(() => input?.focus());
	});

	$effect(() => {
		const handleKeydown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				open = !open;
			}
		};
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	function activate(command: CommandPaletteCommand) {
		if (command.disabled) return;
		open = false;
		onSelect(command);
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = Math.min(activeIndex + 1, Math.max(visibleCommands.length - 1, 0));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const command = visibleCommands[activeIndex];
			if (command) activate(command);
		}
	}
</script>

<Dialog bind:open {title} {closeLabel} size="md" compactHeader>
	<div class="command-palette">
		<input
			bind:this={input}
			bind:value={query}
			onkeydown={handleInputKeydown}
			aria-label={searchLabel}
			placeholder={searchPlaceholder}
			autocomplete="off"
		/>
		<div role="listbox" aria-label={searchLabel} class="command-list">
			{#if visibleCommands.length === 0}
				<p role="status">{emptyLabel}</p>
			{:else}
				{#each visibleCommands as command, index (command.id)}
					<button
						type="button"
						role="option"
						aria-selected={index === activeIndex}
						disabled={command.disabled}
						onclick={() => activate(command)}
						onmouseenter={() => (activeIndex = index)}
					>
						<span>
							<strong>{command.label}</strong>
							{#if command.description}<small>{command.description}</small>{/if}
						</span>
						{#if command.shortcut}<kbd>{command.shortcut}</kbd>{/if}
					</button>
				{/each}
			{/if}
		</div>
	</div>
</Dialog>

<style>
	.command-palette {
		display: grid;
		gap: var(--space-sm);
	}
	input {
		min-height: var(--control-height);
		width: 100%;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		padding: 0 var(--space-sm);
	}
	input:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}
	.command-list {
		display: grid;
		gap: var(--space-xs);
		max-height: min(55vh, 28rem);
		overflow-y: auto;
	}
	.command-list p {
		margin: 0;
		padding: var(--space-md);
		text-align: center;
		color: var(--text-secondary);
	}
	.command-list button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm);
		border-radius: var(--radius-sm);
		text-align: left;
	}
	.command-list button[aria-selected='true'] {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}
	.command-list span {
		display: grid;
		gap: 0.125rem;
	}
	.command-list small {
		color: inherit;
		opacity: 0.8;
	}
	kbd {
		border: var(--border-width) solid currentColor;
		border-radius: var(--radius-sm);
		padding: 0.1rem 0.3rem;
		font: inherit;
		font-size: var(--text-sm);
	}
</style>
