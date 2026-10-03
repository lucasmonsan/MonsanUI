<script lang="ts">
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';
	import QuickActions from './QuickActions.svelte';
	import Copy from './icons/Copy.svelte';
	import Pencil from './icons/Pencil.svelte';
	import Trash from './icons/Trash.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		/** Legacy Manki deck input. Prefer item for generic card usage. */
		deck?: { id: string; name: string; cards?: import('../types.js').Card[] };
		/** Generic identity and copy for non-study card collections. */
		item?: { id: string; title: string; subtitle?: string };
		index?: number;
		folderColor?: string;
		accentColor?: string;
		surfaceColor?: string;
		surfaceColorStrength?: 'subtle' | 'strong';
		isPopoverOpen?: boolean;
		isMenuOpen?: boolean;
		stats?: { newCount: number; dueCount: number };
		modes?: Array<{ id: string; label: string; iconPath?: string; description?: string }>;
		popoverTitle?: string;
		labels?: {
			cards?: string;
			due?: string;
			new?: string;
			duplicate?: string;
			edit?: string;
			delete?: string;
			moreOptions?: string;
			closePopover?: string;
			chooseMode?: string;
		};
		onSelect?: () => void;
		onContextMenu?: (e: MouseEvent) => void;
		onOpenMenu?: () => void;
		onDuplicate?: () => void;
		onEdit?: () => void;
		onDelete?: () => void;
		onStartSession?: (mode: string) => void;

		// Snippets
		badges?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
		popover?: import('svelte').Snippet;
	}

	let {
		deck,
		item,
		index = 0,
		folderColor = 'default',
		accentColor,
		surfaceColor,
		surfaceColorStrength = 'subtle',
		isPopoverOpen = $bindable(false),
		isMenuOpen = $bindable(false),
		stats,
		modes,
		popoverTitle,
		labels,
		onSelect,
		onContextMenu,
		onOpenMenu,
		onDuplicate,
		onEdit,
		onDelete,
		onStartSession,
		badges: badgesSnippet,
		actions: actionsSnippet,
		popover: popoverSnippet
	}: Props = $props();

	let isLongPress = false;
	let touchTimer: ReturnType<typeof setTimeout> | null = null;
	let deckEl = $state<HTMLDivElement>();
	let cardId = $derived(item?.id ?? deck?.id ?? `deck-${index}`);
	let cardTitle = $derived(item?.title ?? deck?.name ?? '');
	let cardSubtitle = $derived(
		item?.subtitle ??
			(deck ? `${deck.cards?.length ?? 0}${labels?.cards ?? i18n.t('deck.cards')}` : '')
	);
	let showDefaultActions = $derived(Boolean(deck));

	const l = $derived({
		cards: labels?.cards ?? i18n.t('deck.cards'),
		due: labels?.due ?? i18n.t('deck.due'),
		new: labels?.new ?? i18n.t('deck.new'),
		duplicate: labels?.duplicate ?? i18n.t('deck.duplicate'),
		edit: labels?.edit ?? i18n.t('deck.edit'),
		delete: labels?.delete ?? i18n.t('deck.delete'),
		moreOptions: labels?.moreOptions ?? i18n.t('deck.moreOptions'),
		closePopover: labels?.closePopover ?? i18n.t('deck.closePopover'),
		chooseMode: popoverTitle ?? labels?.chooseMode ?? i18n.t('deck.chooseMode')
	});

	$effect(() => {
		if (!isPopoverOpen && !isMenuOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (deckEl && !deckEl.contains(target)) {
				isPopoverOpen = false;
				isMenuOpen = false;
			}
		};

		document.addEventListener('click', handleClickOutside, { capture: true });
		return () => {
			document.removeEventListener('click', handleClickOutside, { capture: true });
		};
	});
</script>

<div
	bind:this={deckEl}
	id={cardId}
	class="deck-card panel appear-animation"
	class:has-accent={Boolean(accentColor)}
	class:has-custom-surface={Boolean(surfaceColor)}
	class:surface-subtle={surfaceColorStrength === 'subtle'}
	class:surface-strong={surfaceColorStrength === 'strong'}
	class:selected-for-play={isPopoverOpen || isMenuOpen}
	data-theme={surfaceColor ? undefined : folderColor}
	role="button"
	tabindex="0"
	onclick={() => {
		if (isLongPress) {
			isLongPress = false;
			return;
		}
		onSelect?.();
	}}
	oncontextmenu={(e) => {
		e.preventDefault();
		onContextMenu?.(e);
	}}
	ontouchstart={() => {
		isLongPress = false;
		touchTimer = setTimeout(() => {
			isLongPress = true;
			onContextMenu?.(new MouseEvent('contextmenu'));
		}, 500);
	}}
	ontouchend={() => {
		if (touchTimer) clearTimeout(touchTimer);
	}}
	ontouchmove={() => {
		if (touchTimer) clearTimeout(touchTimer);
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			onSelect?.();
		}
	}}
	style:--panel-accent={accentColor}
	style:--panel-surface={surfaceColor}
	style:--delay={`${index * 0.1}s`}
>
	<div class="deck-info">
		<h3>{cardTitle}</h3>
		<div class="deck-subtitle-row">
			{#if cardSubtitle}<p>{cardSubtitle}</p>{/if}
			<div class="deck-badges">
				{#if badgesSnippet}
					{@render badgesSnippet()}
				{:else if stats}
					{#if stats.dueCount > 0}
						<Badge variant="due">{stats.dueCount} {l.due}</Badge>
					{/if}
					{#if stats.newCount > 0}
						<Badge variant="new">{stats.newCount} {l.new}</Badge>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	{#if actionsSnippet}
		{@render actionsSnippet()}
	{:else if showDefaultActions}
		<div class="quick-actions-menu">
			<QuickActions
				bind:open={isMenuOpen}
				variant="reveal"
				align="right"
				width="max-content"
				placement="before"
				panelLayout="horizontal"
				surface="plain"
				containedReveal
			>
				{#snippet trigger()}
					<button
						type="button"
						class="context-menu-btn"
						onclick={(e: MouseEvent) => {
							e.stopPropagation();
							onOpenMenu?.();
						}}
						aria-label={l.moreOptions}
						aria-haspopup="menu"
						aria-expanded={isMenuOpen}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="1.5" />
							<circle cx="12" cy="5" r="1.5" />
							<circle cx="12" cy="19" r="1.5" />
						</svg>
					</button>
				{/snippet}

				<div class="context-buttons">
					<Button
						variant="secondary"
						size="sm"
						square
						onclick={(e: MouseEvent) => {
							e.stopPropagation();
							onDuplicate?.();
						}}
						title={l.duplicate}
						ariaLabel={l.duplicate}
					>
						<Copy size={20} />
					</Button>

					<Button
						variant="secondary"
						size="sm"
						square
						onclick={(e: MouseEvent) => {
							e.stopPropagation();
							onEdit?.();
						}}
						title={l.edit}
						ariaLabel={l.edit}
					>
						<Pencil size={20} />
					</Button>
					<Button
						variant="error"
						size="sm"
						square
						onclick={(e: MouseEvent) => {
							e.stopPropagation();
							onDelete?.();
						}}
						title={l.delete}
						ariaLabel={l.delete}
					>
						<Trash size={20} />
					</Button>
				</div>
			</QuickActions>
		</div>
	{/if}

	{#if popoverSnippet}
		{#if isPopoverOpen}
			{@render popoverSnippet()}
		{/if}
	{:else if modes}
		<div class="mode-popover" class:active={isPopoverOpen}>
			<button
				type="button"
				class="popover-backdrop"
				onclick={() => {
					isPopoverOpen = false;
				}}
				aria-label={l.closePopover}
			></button>
			<div class="popover-inner">
				<span class="popover-title">{l.chooseMode}</span>
				<div class="popover-buttons">
					{#each modes as mode (mode.id)}
						<Button
							variant="primary"
							size="sm"
							onclick={() => {
								onStartSession?.(mode.id);
							}}
							title={mode.description ?? mode.label}
							ariaLabel={mode.description ? `${mode.label} - ${mode.description}` : mode.label}
						>
							<span class="mode-btn-content">
								<span class="mode-btn-label">{mode.label}</span>
								{#if mode.description}
									<span class="mode-btn-desc">{mode.description}</span>
								{/if}
							</span>
						</Button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.deck-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		width: 100%;
		cursor: pointer;
	}

	.deck-card.has-accent {
		box-shadow:
			inset 4px 0 0 var(--panel-accent),
			var(--shadow-sm);
		padding-left: calc(var(--space-md) + 2px);
	}

	.deck-card.has-custom-surface {
		background-color: var(--panel-surface);
	}

	.deck-card.has-custom-surface.surface-subtle {
		background-color: color-mix(in srgb, var(--panel-surface) 10%, var(--bg-primary));
		color: var(--text-primary);
	}

	.deck-card.has-custom-surface.surface-strong {
		background-color: color-mix(in srgb, var(--panel-surface) 40%, var(--bg-primary));
		color: var(--text-primary);
	}

	.mode-popover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
		border: none;
		border-radius: inherit;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xs) var(--space-sm);
		box-sizing: border-box;
		box-shadow: none;
		opacity: 0;
		transform: scale(0.96) translateY(5px);
		pointer-events: none;
		visibility: hidden;
		transition:
			opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
			visibility 0.22s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.mode-popover.active {
		opacity: 1;
		transform: scale(1) translateY(0);
		pointer-events: auto;
		visibility: visible;
	}

	.popover-backdrop {
		position: absolute;
		inset: 0;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
		z-index: 1;
	}

	.popover-inner {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		width: 100%;
	}

	.popover-title {
		font-size: var(--text-xs);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
	}

	.popover-buttons {
		display: flex;
		gap: var(--space-xs);
		width: 100%;
		justify-content: center;
	}

	.popover-buttons :global(button) {
		width: auto !important;
		min-width: 0 !important;
		flex: 1 1 0 !important;
		padding: var(--space-xxs) var(--space-xs) !important;
	}

	.mode-btn-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		line-height: 1.1;
		width: 100%;
	}

	.mode-btn-label {
		font-weight: 800;
		font-size: var(--text-sm);
	}

	.mode-btn-desc {
		font-size: 10px;
		font-weight: 500;
		opacity: 0.85;
		white-space: nowrap;
		text-transform: none;
	}

	.selected-for-play {
		z-index: 30 !important;
	}

	.quick-actions-menu {
		position: absolute;
		right: var(--space-sm);
		top: 50%;
		transform: translateY(-50%);
	}

	.context-menu-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		transition: color 0.2s ease;
	}

	.context-menu-btn:hover {
		color: var(--text-primary);
	}

	.context-buttons {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
		width: auto;
	}

	.deck-card :global(.context-btn) {
		width: 32px !important;
		height: 32px !important;
		padding: 0 !important;
		min-width: 0 !important;
		aspect-ratio: 1 !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
	}

	.appear-animation {
		opacity: 0;
		transform: translateY(24px);
		animation: appear 0.2s forwards cubic-bezier(0.16, 1, 0.3, 1);
		animation-delay: calc(0.4s + var(--delay));
	}

	@keyframes appear {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.deck-info h3 {
		margin: 0;
		font-size: var(--text-lg);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.deck-info p {
		margin: 0;
		font-size: var(--text-sm);
		opacity: 0.7;
	}

	.deck-subtitle-row {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		margin-top: var(--space-xs);
	}

	.deck-badges {
		display: flex;
		gap: var(--space-xs);
	}

	:global(.btn-delete) {
		color: var(--error) !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.mode-popover,
		.context-menu-btn {
			transition: none;
		}

		.appear-animation {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
