<script lang="ts">
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { i18n } from '../utils/i18n.svelte';
	import GripVertical from './icons/GripVertical.svelte';

	interface Props {
		options: string[];
		value?: string[];
		disabled?: boolean;
		columns?: number;
		formatIndex?: (index: number) => string;
		showNumbers?: boolean;
	}

	let {
		options = [],
		value = $bindable([]),
		disabled = false,
		columns = 1,
		formatIndex = (idx) => `${idx + 1}`,
		showNumbers = true
	}: Props = $props();

	// If value is null, initialize it with the default options order
	$effect(() => {
		if (!value || !Array.isArray(value) || value.length === 0) {
			value = [...options];
		}
	});

	let items = $derived(Array.isArray(value) && value.length > 0 ? value : options);

	let draggedIndex = $state<number | null>(null);
	let isTouchDragging = $state(false);
	let lastReorderTime = $state(0);
	let prefersReducedMotion = $state(false);
	let listEl = $state<HTMLDivElement>();
	const REORDER_COOLDOWN = 120;

	function handleDragStart(e: DragEvent, index: number) {
		if (disabled) {
			e.preventDefault();
			return;
		}
		draggedIndex = index;
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
		lastReorderTime = 0;
	}

	function handleDragEnd() {
		draggedIndex = null;
		lastReorderTime = 0;
	}

	function handleTouchStart(e: TouchEvent, index: number) {
		if (disabled) return;
		draggedIndex = index;
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
			isTouchDragging = false;
			draggedIndex = null;
			lastReorderTime = 0;
		}
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

				srAnnouncement = i18n.t('dndOrder.movedUp', { item: itemMoved, position: index });

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

				srAnnouncement = i18n.t('dndOrder.movedDown', {
					item: itemMoved,
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
	{#each items as item, index (item)}
		<div
			animate:flip={{ duration: prefersReducedMotion ? 0 : 250, easing: quintOut }}
			class="dnd-item glass-panel"
			class:dragging={draggedIndex === index && !isTouchDragging}
			class:touch-dragging={draggedIndex === index && isTouchDragging}
			draggable={!disabled && !isTouchDragging}
			data-index={index}
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
			aria-label={i18n.t('dndOrder.itemLabel', {
				item,
				position: index + 1,
				total: items.length
			})}
		>
			<div class="drag-handle">
				<GripVertical size={18} />
			</div>
			<div class="item-content">
				{item}
			</div>
			{#if showNumbers}
				<div class="order-number">
					{formatIndex(index)}
				</div>
			{/if}
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
		padding: var(--space-md);
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

	.dnd-item * {
		pointer-events: none;
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

	.dnd-item:not(.disabled):not(.dragging):hover {
		border-color: var(--accent-primary);
		transform: translateX(4px);
		z-index: 5;
	}

	.drag-handle {
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		margin-right: var(--space-md);
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
		background: rgba(46, 196, 182, 0.1);
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
