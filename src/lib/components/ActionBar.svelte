<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type IconComponent = Component<{ size?: number; class?: string }>;

	interface ActionItem {
		id: string;
		label: string;
		icon?: IconComponent;
		flex?: number | string;
		onlyIcon?: boolean;
		folderTheme?: string;
		title?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		items = [],
		class: className = '',
		item: itemSnippet
	} = $props<{
		items: ActionItem[];
		class?: string;
		item?: Snippet<[ActionItem, number]>;
	}>();

	let containerEl = $state<HTMLElement>();

	function handleKeyDown(e: KeyboardEvent) {
		if (!containerEl) return;
		const target = e.target as HTMLElement;
		if (!target.closest('.monsan-action-bar-item')) return;

		const activeItems = Array.from(
			containerEl.querySelectorAll('.monsan-action-bar-item:not([disabled])')
		) as HTMLElement[];

		const currentIndex = activeItems.indexOf(target);
		if (currentIndex === -1) return;

		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			const idx = (currentIndex + 1) % activeItems.length;
			activeItems[idx].focus();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			const idx = (currentIndex - 1 + activeItems.length) % activeItems.length;
			activeItems[idx].focus();
		}
	}
</script>

<div
	bind:this={containerEl}
	class="monsan-action-bar {className}"
	role="toolbar"
	tabindex="-1"
	aria-label="Barra de Ações"
	onkeydown={handleKeyDown}
>
	{#each items as action, index (action.id)}
		{#if itemSnippet}
			{@render itemSnippet(action, index)}
		{:else}
			<button
				type="button"
				class="monsan-action-bar-item"
				class:only-icon={action.onlyIcon}
				class:disabled={action.disabled}
				style="flex: {action.flex ?? 1};"
				data-deck-theme={action.folderTheme}
				onclick={action.onclick}
				title={action.title ?? action.label}
				disabled={action.disabled}
				tabindex={index === 0 ? 0 : -1}
			>
				{#if action.icon}
					<span class="action-item-icon">
						<!-- Render standard icon components -->
						<action.icon size={18} />
					</span>
				{/if}
				{#if !action.onlyIcon}
					<span class="action-item-label">
						{action.label}
					</span>
				{/if}
			</button>
		{/if}
	{/each}
</div>

<style>
	.monsan-action-bar {
		display: flex;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm) 0;
		box-sizing: border-box;
	}

	.monsan-action-bar-item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		height: var(--control-height);
		padding: 0 var(--space-md);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.2s var(--ease-out);
		cursor: pointer;
		box-sizing: border-box;
	}

	.monsan-action-bar-item.only-icon {
		flex: 0 0 auto !important;
		padding: 0;
		width: var(--control-height);
	}

	.monsan-action-bar-item:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.monsan-action-bar-item:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-action-bar-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: var(--shadow-sm) !important;
		transform: none !important;
	}

	.action-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.action-item-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 480px) {
		.monsan-action-bar-item {
			padding: 0 var(--space-xs);
		}
		.monsan-action-bar-item.only-icon {
			padding: 0;
		}
	}
</style>
