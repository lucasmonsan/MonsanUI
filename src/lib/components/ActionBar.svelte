<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Badge from './Badge.svelte';

	type IconComponent = Component<{ size?: number }>;

	interface ActionItem {
		id: string;
		label: string;
		subtitle?: string;
		/** Secondary text shown on the same line as the label. */
		inlineSubtitle?: string;
		icon?: IconComponent;
		flex?: 1 | 2 | 3;
		onlyIcon?: boolean;
		folderTheme?: string;
		/** Optional custom color for a domain item. It is blended into a readable surface. */
		surfaceColor?: string;
		/** Controls how prominently an optional custom surface color is blended. */
		surfaceColorStrength?: 'subtle' | 'strong';
		/** Align the action contents inside its available width. */
		align?: 'center' | 'start';
		/** Optional compact count displayed after the action label. */
		badge?: number;
		/** Accessible description of the count, appended to the action label. */
		badgeLabel?: string;
		/** Keep the icon while hiding label and count below this breakpoint. */
		compactBelow?: 'sm';
		title?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		items = [],
		ariaLabel,
		item: itemSnippet
	} = $props<{
		items: ActionItem[];
		ariaLabel: string;
		item?: Snippet<[ActionItem, number]>;
	}>();

	let containerEl = $state<HTMLElement>();

	function actionLabel(action: ActionItem): string {
		return action.inlineSubtitle ? `${action.label} - ${action.inlineSubtitle}` : action.label;
	}

	function actionAriaLabel(action: ActionItem): string {
		const label = actionLabel(action);
		return action.badge && action.badge > 0 && action.badgeLabel
			? `${label}. ${action.badgeLabel}`
			: label;
	}

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
	class="monsan-action-bar"
	role="toolbar"
	tabindex="-1"
	aria-label={ariaLabel}
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
				class:align-start={action.align === 'start'}
				class:has-surface={Boolean(action.surfaceColor)}
				class:surface-strong={action.surfaceColorStrength === 'strong'}
				class:compact-below-sm={action.compactBelow === 'sm'}
				class:has-subtitle={Boolean(action.subtitle)}
				class:has-inline-subtitle={Boolean(action.inlineSubtitle)}
				class:disabled={action.disabled}
				class:flex-1={(action.flex ?? 1) === 1}
				class:flex-2={action.flex === 2}
				class:flex-3={action.flex === 3}
				data-deck-theme={action.folderTheme}
				style:--action-surface={action.surfaceColor}
				onclick={action.onclick}
				title={action.title ?? actionLabel(action)}
				aria-label={actionAriaLabel(action)}
				disabled={action.disabled}
				tabindex={index === 0 ? 0 : -1}
			>
				{#if action.icon}
					<span class="action-item-icon">
						<action.icon size={18} />
					</span>
				{/if}
				{#if !action.onlyIcon}
					<span class="action-item-label">
						<span>{action.label}</span>
						{#if action.inlineSubtitle}<small class="inline-subtitle">
								- {action.inlineSubtitle}</small
							>{/if}
						{#if action.subtitle}<small>{action.subtitle}</small>{/if}
					</span>
				{/if}
				{#if action.badge && action.badge > 0}
					<span class="action-item-badge" aria-hidden="true">
						<Badge size="sm" variant="primary">{action.badge}</Badge>
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

	.monsan-action-bar-item.has-subtitle {
		height: auto;
		min-height: var(--control-height);
		padding-block: var(--space-xs);
	}

	.monsan-action-bar-item.has-surface {
		background: color-mix(in srgb, var(--action-surface) 10%, var(--bg-primary));
	}

	.monsan-action-bar-item.has-surface.surface-strong {
		background: color-mix(in srgb, var(--action-surface) 32%, var(--bg-primary));
	}

	.monsan-action-bar-item.align-start {
		justify-content: flex-start;
	}

	.flex-1 {
		flex: 1;
	}

	.flex-2 {
		flex: 2;
	}

	.flex-3 {
		flex: 3;
	}

	.monsan-action-bar-item.only-icon {
		flex: 0 0 auto;
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

	.monsan-action-bar-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-action-bar-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: var(--shadow-sm);
		transform: none;
	}

	.action-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.action-item-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.action-item-label small {
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--text-secondary);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.action-item-label .inline-subtitle {
		margin-inline-start: var(--space-xxs);
		white-space: nowrap;
	}

	.monsan-action-bar-item.has-inline-subtitle .action-item-label {
		flex-direction: row;
		gap: 0;
	}

	.action-item-badge {
		display: flex;
		align-items: center;
		flex: 0 0 auto;
	}

	@media (max-width: 480px) {
		.monsan-action-bar-item {
			padding: 0 var(--space-xs);
		}
		.monsan-action-bar-item.only-icon {
			padding: 0;
		}
	}

	@media (max-width: 600px) {
		.monsan-action-bar-item.compact-below-sm {
			flex: 0 0 var(--control-height);
			width: var(--control-height);
			padding: 0;
		}

		.monsan-action-bar-item.compact-below-sm .action-item-label,
		.monsan-action-bar-item.compact-below-sm .action-item-badge {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-action-bar-item {
			transition: none;
		}
	}
</style>
