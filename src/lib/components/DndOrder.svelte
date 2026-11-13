<script lang="ts">
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { i18n } from '../utils/i18n.svelte';
	import { getOccurrenceKey } from '../utils/listKeys.js';
	import GripVertical from './icons/GripVertical.svelte';

	interface Props {
		options: string[];
		value?: string[];
		disabled?: boolean;
		columns?: number;
		formatIndex?: (index: number) => string;
		itemLabel?: (item: string) => string;
		item?: Snippet<[item: string, index: number]>;
		beforeItem?: Snippet<[index: number]>;
		itemSurfaceColor?: (item: string) => string | undefined;
		itemSurfaceColorStrength?: 'subtle' | 'strong';
		onReorder?: (items: string[]) => void;
		onSelect?: (item: string) => void;
		showNumbers?: boolean;
	}

	let {
		options = [],
		value = $bindable([]),
		disabled = false,
		columns = 1,
		formatIndex = (idx) => `${idx + 1}`,
		itemLabel = (item) => item,
		item: renderItem,
		beforeItem,
		itemSurfaceColor,
		itemSurfaceColorStrength,
		onReorder,
		onSelect,
		showNumbers = true
	}: Props = $props();

	// Render the supplied initial order without turning it into a submitted value.
	// The bound value changes only after the user actually reorders an item.
	let items = $derived(Array.isArray(value) && value.length > 0 ? value : options);

	let draggedIndex = $state<number | null>(null);
	let isTouchDragging = $state(false);
	let lastReorderTime = $state(0);
	let prefersReducedMotion = $state(false);
	let listEl = $state<HTMLDivElement>();
	let originalOrder = $state<string[] | null>(null);
	let dropTargetIndex = $state<number | null>(null);
	const REORDER_COOLDOWN = 120;
	const interactiveTargetSelector = 'button, a, input, select, textarea';

	function isInteractiveTarget(target: EventTarget | null): boolean {
		return target instanceof Element && Boolean(target.closest(interactiveTargetSelector));
	}

	function contrastForeground(color: string | undefined): string | undefined {
		if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return undefined;
		const channels = [1, 3, 5].map(
			(index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
		);
		const luminance = channels
			.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
			.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
		return luminance > 0.179 ? '#171717' : '#ffffff';
	}

	function handleDragStart(e: DragEvent, index: number) {
		if (disabled || isInteractiveTarget(e.target)) {
			e.preventDefault();
			return;
		}
		draggedIndex = index;
		originalOrder = [...items];
		lastReorderTime = 0;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', index.toString());
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		if (disabled) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}

		if (draggedIndex === null || draggedIndex === index) return;
		dropTargetIndex = index;

		const now = Date.now();
		if (now - lastReorderTime < REORDER_COOLDOWN) return;

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const cursorX = e.clientX;
		const cursorY = e.clientY;

		const draggingForward = draggedIndex < index;

		let shouldReorder = draggingForward ? cursorY > centerY : cursorY < centerY;

		if (columns > 1) {
			const activeColumns = Math.max(1, columns);
			const draggedRow = Math.floor(draggedIndex / activeColumns);
			const targetRow = Math.floor(index / activeColumns);
			const sameRow = draggedRow === targetRow;
			shouldReorder = sameRow
				? draggingForward
					? cursorX > centerX
					: cursorX < centerX
				: draggingForward
					? cursorY > centerY
					: cursorY < centerY;
		}

		if (shouldReorder) {
			lastReorderTime = now;
			const newItems = [...items];
			const [removed] = newItems.splice(draggedIndex, 1);
			newItems.splice(index, 0, removed);
			value = [...newItems];
			draggedIndex = index;
		}
	}

	function handleDrop(e: DragEvent) {
		if (disabled) return;
		e.preventDefault();
		draggedIndex = null;
		dropTargetIndex = null;
		lastReorderTime = 0;
	}

	function handleDragEnd() {
		commitReorder();
		draggedIndex = null;
		dropTargetIndex = null;
		lastReorderTime = 0;
	}

	function handleTouchStart(e: TouchEvent, index: number) {
		if (disabled) return;
		if (isInteractiveTarget(e.target)) return;
		draggedIndex = index;
		originalOrder = [...items];
		lastReorderTime = 0;
		isTouchDragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (disabled || !isTouchDragging) return;

		e.preventDefault();

		const touch = e.touches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
		if (element) {
			const targetItem = element.closest('.dnd-item') as HTMLElement;
			if (targetItem) {
				const targetIndexAttr = targetItem.getAttribute('data-index');
				if (targetIndexAttr !== null) {
					const targetIndex = parseInt(targetIndexAttr, 10);
					if (draggedIndex !== null && targetIndex !== draggedIndex) {
						const mockDragEvent = {
							preventDefault: () => {},
							clientX: touch.clientX,
							clientY: touch.clientY,
							currentTarget: targetItem,
							target: targetItem
						} as unknown as DragEvent;
						handleDragOver(mockDragEvent, targetIndex);
					}
				}
			}
		}
	}

	function handleTouchEnd() {
		if (isTouchDragging) {
			commitReorder();
			isTouchDragging = false;
			draggedIndex = null;
			dropTargetIndex = null;
			lastReorderTime = 0;
		}
	}

	function handleItemClick(event: MouseEvent, item: string): void {
		if (isInteractiveTarget(event.target) || isTouchDragging) return;
		onSelect?.(item);
	}

	function commitReorder(): void {
		if (originalOrder && originalOrder.some((item, index) => item !== items[index])) {
			onReorder?.([...items]);
		}
		originalOrder = null;
	}

	let srAnnouncement = $state('');

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
		}

		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});

	function handleKeyDown(e: KeyboardEvent, index: number) {
		if (disabled) return;
		if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
			e.preventDefault();
			if (index > 0) {
				const newItems = [...items];
				const itemMoved = newItems[index];
				const [removed] = newItems.splice(index, 1);
				newItems.splice(index - 1, 0, removed);
				value = [...newItems];
				onReorder?.([...newItems]);

				srAnnouncement = i18n.t('dndOrder.movedUp', {
					item: itemLabel(itemMoved),
					position: index
				});

				setTimeout(() => {
					const el = listEl?.querySelector(`[data-index="${index - 1}"]`) as HTMLElement;
					el?.focus();
				}, 20);
			}
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
			e.preventDefault();
			if (index < items.length - 1) {
				const newItems = [...items];
				const itemMoved = newItems[index];
				const [removed] = newItems.splice(index, 1);
				newItems.splice(index + 1, 0, removed);
				value = [...newItems];
				onReorder?.([...newItems]);

				srAnnouncement = i18n.t('dndOrder.movedDown', {
					item: itemLabel(itemMoved),
					position: index + 2
				});

				setTimeout(() => {
					const el = listEl?.querySelector(`[data-index="${index + 1}"]`) as HTMLElement;
					el?.focus();
				}, 20);
			}
		}
	}
</script>

<div class="sr-only" aria-live="assertive" aria-atomic="true">
	{srAnnouncement}
</div>

<div
	bind:this={listEl}
	class="dnd-order-list"
	class:disabled
	role="listbox"
	style:grid-template-columns={`repeat(${columns}, minmax(0, 1fr))`}
>
	{#each items as item, index (getOccurrenceKey(items, index))}
		<div
			animate:flip={{ duration: prefersReducedMotion ? 0 : 250, easing: quintOut }}
			class="dnd-entry"
		>
			{#if beforeItem}
				<div class="dnd-item-leading">
					{@render beforeItem(index)}
				</div>
			{/if}
			<div
				class="dnd-item glass-panel"
				class:has-custom-surface={Boolean(itemSurfaceColor?.(item))}
				class:surface-subtle={itemSurfaceColorStrength === 'subtle'}
				class:surface-strong={itemSurfaceColorStrength === 'strong'}
				class:uses-surface-foreground={itemSurfaceColorStrength === undefined}
				class:dragging={draggedIndex === index && !isTouchDragging}
				class:touch-dragging={draggedIndex === index && isTouchDragging}
				class:drop-target={dropTargetIndex === index}
				draggable={!disabled && !isTouchDragging}
				data-index={index}
				style:--dnd-item-surface-color={itemSurfaceColor?.(item)}
				style:--dnd-item-surface-foreground={contrastForeground(itemSurfaceColor?.(item))}
				style:--monsan-surface-foreground={contrastForeground(itemSurfaceColor?.(item))}
				ondragstart={(e) => handleDragStart(e, index)}
				ondragover={(e) => handleDragOver(e, index)}
				ondrop={(e) => handleDrop(e)}
				ondragend={handleDragEnd}
				ontouchstart={(e) => handleTouchStart(e, index)}
				ontouchmove={handleTouchMove}
				ontouchend={handleTouchEnd}
				ontouchcancel={handleTouchEnd}
				role="option"
				aria-selected={draggedIndex === index}
				tabindex="0"
				onkeydown={(e) => handleKeyDown(e, index)}
				onclick={(event) => handleItemClick(event, item)}
				aria-label={i18n.t('dndOrder.itemLabel', {
					item: itemLabel(item),
					position: index + 1,
					total: items.length
				})}
			>
				<div class="drag-handle">
					<GripVertical size={18} />
				</div>
				<div class="item-content">
					{#if renderItem}
						{@render renderItem(item, index)}
					{:else}
						{itemLabel(item)}
					{/if}
				</div>
				{#if showNumbers}
					<div class="order-number">
						{formatIndex(index)}
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.dnd-order-list {
		display: grid;
		gap: var(--space-sm);
		width: 100%;
	}

	.disabled {
		opacity: 0.8;
		pointer-events: none;
	}

	.dnd-item {
		display: flex;
		align-items: center;
		padding: var(--space-sm);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: grab;
		transition:
			transform 0.2s cubic-bezier(0.2, 1, 0.3, 1),
			border-color 0.2s,
			box-shadow 0.2s;
		position: relative;
		pointer-events: auto;
		touch-action: none;
	}

	.dnd-entry {
		display: grid;
		gap: var(--space-xs);
		min-width: 0;
	}

	.dnd-item-leading {
		min-width: 0;
	}

	.dnd-item.has-custom-surface {
		background-color: var(--dnd-item-surface-color);
		color: var(--dnd-item-surface-foreground);
	}

	.dnd-item.has-custom-surface.surface-subtle {
		background-color: color-mix(in srgb, var(--dnd-item-surface-color) 10%, var(--bg-primary));
		color: var(--text-primary);
	}

	.dnd-item.has-custom-surface.surface-strong {
		background-color: color-mix(in srgb, var(--dnd-item-surface-color) 40%, var(--bg-primary));
		color: var(--text-primary);
	}

	.dnd-item.uses-surface-foreground :global(.monsan-text) {
		color: var(--dnd-item-surface-foreground) !important;
	}

	.dnd-item * {
		pointer-events: auto;
	}

	.dnd-item:active {
		cursor: grabbing;
	}

	.dnd-item.dragging {
		opacity: 0.1;
		border-style: dashed;
		background: var(--bg-secondary);
		z-index: 0;
	}

	.dnd-item.touch-dragging {
		opacity: 0.5;
		border-style: dashed;
		background: var(--bg-secondary);
		z-index: 0;
		pointer-events: none;
	}

	.dnd-item.drop-target:not(.dragging) {
		border-color: var(--accent-primary);
		box-shadow: 0 0 0 var(--border-width) var(--accent-primary);
	}

	.dnd-item:not(.disabled):not(.dragging):hover {
		border-color: var(--accent-primary);
		transform: translateX(4px);
		z-index: 5;
	}

	.drag-handle {
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		margin-right: var(--space-xs);
	}

	.item-content {
		flex: 1;
		font-size: var(--text-md);
		color: var(--text-primary);
	}

	.order-number {
		font-family: var(--font-display);
		font-weight: bold;
		color: var(--accent-primary);
		font-size: var(--text-md);
		background: var(--bg-secondary);
		padding: 2px var(--space-sm);
		border-radius: var(--radius-sm);
		min-width: 32px;
		height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.dnd-item {
			transition: none;
		}
	}
</style>
