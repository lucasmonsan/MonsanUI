<script lang="ts">
	import Button from './Button.svelte';
	import Badge from './Badge.svelte';
	import QuickActions from './QuickActions.svelte';
	import Copy from './icons/Copy.svelte';
	import Pencil from './icons/Pencil.svelte';
	import Trash from './icons/Trash.svelte';

	interface Props {
		deck: { id: string; name: string; cards?: import('../types.js').Card[] };
		index: number;
		folderColor?: string;
		isPopoverOpen?: boolean;
		isMenuOpen?: boolean;
		stats?: { newCount: number; dueCount: number };
		modes?: Array<{ id: string; label: string; iconPath?: string }>;
		labels?: {
			cards?: string;
			due?: string;
			new?: string;
			duplicate?: string;
			edit?: string;
			delete?: string;
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
		index,
		folderColor = 'default',
		isPopoverOpen = $bindable(false),
		isMenuOpen = $bindable(false),
		stats,
		modes,
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

	// Close popover and context menu when clicking outside the deck card
	$effect(() => {
		if (!isPopoverOpen && !isMenuOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const deckEl = document.getElementById(deck.id);
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
	id={deck.id}
	class="deck-card panel appear-animation {isPopoverOpen || isMenuOpen ? 'selected-for-play' : ''}"
	data-theme={folderColor}
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
	style="--delay: {index * 0.1}s; cursor: pointer; position: relative;"
>
	<div class="deck-info">
		<h3>{deck.name}</h3>
		<div class="deck-subtitle-row">
			<p>
				{deck.cards?.length ?? 0}
				{labels?.cards ?? 'cartas'}
			</p>
			<div class="deck-badges">
				{#if badgesSnippet}
					{@render badgesSnippet()}
				{:else if stats}
					{#if stats.dueCount > 0}
						<Badge variant="due">{stats.dueCount} {labels?.due ?? 'due'}</Badge>
					{/if}
					{#if stats.newCount > 0}
						<Badge variant="new">{stats.newCount} {labels?.new ?? 'new'}</Badge>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<!-- Menu de Contexto -->
	{#if actionsSnippet}
		{@render actionsSnippet()}
	{:else}
		<QuickActions bind:open={isMenuOpen} variant="reveal" align="right" width="70%">
			{#snippet trigger()}
				<button
					class="context-menu-btn"
					onclick={(e: MouseEvent) => {
						e.stopPropagation();
						onOpenMenu?.();
					}}
					aria-label="Mais opções"
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
					title={labels?.duplicate ?? 'Duplicate'}
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
					title={labels?.edit ?? 'Edit'}
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
					title={labels?.delete ?? 'Delete'}
				>
					<Trash size={20} />
				</Button>
			</div>
		</QuickActions>
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
				aria-label="Close popover"
			></button>
			<div class="popover-buttons">
				{#each modes as mode (mode.id)}
					<Button
						variant="primary"
						size="sm"
						onclick={() => {
							onStartSession?.(mode.id);
						}}
					>
						{mode.label}
					</Button>
				{/each}
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
	}

	.mode-popover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		box-sizing: border-box;
		box-shadow: var(--shadow-sm);
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

	.popover-buttons {
		position: relative;
		z-index: 2;
		display: flex;
		gap: var(--space-sm);
		width: 100%;
		justify-content: center;
	}

	.popover-buttons :global(button) {
		width: auto !important;
		min-width: 0 !important;
		flex: 0 1 auto !important;
		padding: var(--space-xs) var(--space-sm) !important;
	}

	.selected-for-play {
		z-index: 30 !important;
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
		position: absolute;
		right: var(--space-sm);
		top: 50%;
		transform: translateY(-50%);
	}

	.context-menu-btn:hover {
		color: var(--text-primary);
	}

	.context-buttons {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
		padding-right: var(--space-sm);
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
</style>
