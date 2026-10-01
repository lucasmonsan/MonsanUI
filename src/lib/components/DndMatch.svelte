<script lang="ts">
	import { i18n } from '../utils/i18n.svelte';
	import { getOccurrenceKey } from '../utils/listKeys.js';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { scale } from 'svelte/transition';

	interface DndMatchLabels {
		poolTitle?: string;
		allClassified?: string;
		dropHere?: string;
	}

	interface Props {
		options: string[];
		buckets: string[];
		value?: Record<string, string[]> | null;
		disabled?: boolean;
		labels?: DndMatchLabels;
	}

	let {
		options = [],
		buckets = [],
		value = $bindable({}),
		disabled = false,
		labels = {}
	}: Props = $props();

	function isMatchValue(candidate: unknown): candidate is Record<string, string[]> {
		return (
			candidate !== null &&
			typeof candidate === 'object' &&
			!Array.isArray(candidate) &&
			Object.values(candidate).every(
				(items) => Array.isArray(items) && items.every((item) => typeof item === 'string')
			)
		);
	}

	let safeValue = $derived(isMatchValue(value) ? value : {});

	const mergedLabels = $derived({
		poolTitle: labels.poolTitle || i18n.t('dndMatch.poolTitle'),
		allClassified: labels.allClassified || i18n.t('dndMatch.allClassified'),
		dropHere: labels.dropHere || i18n.t('dndMatch.dropHere')
	});

	// Initialize value if it's null or invalid
	$effect(() => {
		if (!isMatchValue(value)) {
			const initialValue: Record<string, string[]> = {};
			buckets.forEach((b) => {
				initialValue[b] = [];
			});
			value = initialValue;
		} else {
			// Ensure all buckets exist in the value object
			let changed = false;
			const newValue = { ...value };
			buckets.forEach((b) => {
				if (!newValue[b]) {
					newValue[b] = [];
					changed = true;
				}
			});
			if (changed) value = newValue;
		}
	});

	// Items still in the pool (not in any bucket)
	let poolItems = $derived.by(() => {
		const usedItems = new SvelteSet<string>();
		Object.values(safeValue).forEach((arr) => {
			if (Array.isArray(arr)) arr.forEach((i) => usedItems.add(i));
		});
		return options.filter((opt) => !usedItems.has(opt));
	});

	let draggedItem = $state<{ item: string; source: string | 'pool' } | null>(null);
	let dropTarget = $state<string | 'pool' | null>(null);
	let isTouchDragging = $state(false);
	let selectedItem = $state<{ item: string; source: string | 'pool' } | null>(null);
	let prefersReducedMotion = $state(false);

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

	function moveItem(item: string, source: string | 'pool', target: string | 'pool') {
		if (source === target) return;

		const newValue = { ...safeValue };

		if (source !== 'pool') {
			newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
		}

		if (target !== 'pool') {
			if (!newValue[target]) newValue[target] = [];
			if (!newValue[target].includes(item)) {
				newValue[target] = [...newValue[target], item];
			}
		}

		value = newValue;
		announceMove(item, source, target);
	}

	function handleItemClick(item: string, source: string | 'pool') {
		if (disabled || isTouchDragging) return;
		selectedItem =
			selectedItem?.item === item && selectedItem?.source === source ? null : { item, source };
	}

	function handleAreaClick(target: string | 'pool') {
		if (disabled || !selectedItem) return;
		moveItem(selectedItem.item, selectedItem.source, target);
		selectedItem = null;
	}

	function handleDragStart(e: DragEvent, item: string, source: string | 'pool') {
		if (disabled) {
			e.preventDefault();
			return;
		}
		draggedItem = { item, source };
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', item);
		}
	}

	function handleDragOver(e: DragEvent, target: string | 'pool') {
		if (disabled) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dropTarget = target;
	}

	function handleDragLeave(e: DragEvent, target: string | 'pool') {
		if (disabled) return;
		if (dropTarget === target) {
			dropTarget = null;
		}
	}

	function handleDrop(e: DragEvent, target: string | 'pool') {
		if (disabled) return;
		e.preventDefault();
		dropTarget = null;

		if (draggedItem) {
			const { item, source } = draggedItem;

			// Se o destino é o mesmo da origem, não faz nada
			if (source === target) {
				draggedItem = null;
				return;
			}

			moveItem(item, source, target);
		}
		draggedItem = null;
	}

	function handleDragEnd() {
		draggedItem = null;
		dropTarget = null;
	}

	let touchStartX = 0;
	let touchStartY = 0;
	let touchHasMoved = false;

	function handleTouchStart(e: TouchEvent, item: string, source: string | 'pool') {
		if (disabled) return;
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		touchHasMoved = false;
		draggedItem = { item, source };
	}

	function handleTouchMove(e: TouchEvent) {
		if (disabled || !draggedItem) return;

		const touch = e.touches[0];
		const diffX = Math.abs(touch.clientX - touchStartX);
		const diffY = Math.abs(touch.clientY - touchStartY);

		if (!isTouchDragging && (diffX > 6 || diffY > 6)) {
			isTouchDragging = true;
			touchHasMoved = true;
		}

		if (isTouchDragging) {
			// Evita scroll da página durante o arraste no mobile
			if (e.cancelable) e.preventDefault();

			const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
			if (element) {
				const targetArea = element.closest('.bucket-area, .pool-area') as HTMLElement;
				if (targetArea) {
					const targetBucket = targetArea.getAttribute('data-bucket');
					if (targetBucket) {
						dropTarget = targetBucket;
					}
				} else {
					dropTarget = null;
				}
			}
		}
	}

	function handleTouchEnd() {
		if (!draggedItem) return;

		if (isTouchDragging && dropTarget) {
			const { item, source } = draggedItem;
			const target = dropTarget;

			if (source !== target) {
				moveItem(item, source, target);
			}
		} else if (!touchHasMoved) {
			const { item, source } = draggedItem;
			handleItemClick(item, source);
		}

		isTouchDragging = false;
		draggedItem = null;
		dropTarget = null;
	}

	let srAnnouncement = $state('');

	function announceMove(item: string, from: string | 'pool', to: string | 'pool') {
		const fromLabel = from === 'pool' ? mergedLabels.poolTitle : from;
		const toLabel = to === 'pool' ? mergedLabels.poolTitle : to;

		srAnnouncement = i18n.t('dndMatch.moved', { item, from: fromLabel, to: toLabel });
	}

	function handleKeyDown(e: KeyboardEvent, item: string, source: string | 'pool') {
		if (disabled) return;

		const newValue = { ...safeValue };

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (source === 'pool') {
				const target = buckets[0];
				if (target) {
					if (!newValue[target]) newValue[target] = [];
					newValue[target] = [...newValue[target], item];
					value = newValue;
					announceMove(item, 'pool', target);
				}
			} else {
				newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
				value = newValue;
				announceMove(item, source, 'pool');
			}
			return;
		}

		// Number keys 1-9 to place in specific buckets
		if (/^[1-9]$/.test(e.key)) {
			const bucketIdx = parseInt(e.key, 10) - 1;
			if (bucketIdx < buckets.length) {
				e.preventDefault();
				const target = buckets[bucketIdx];
				// Remove from current bucket if it is in one
				if (source !== 'pool') {
					newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
				}
				if (!newValue[target]) newValue[target] = [];
				if (!newValue[target].includes(item)) {
					newValue[target] = [...newValue[target], item];
				}
				value = newValue;
				announceMove(item, source, target);
			}
			return;
		}

		// 0 or Backspace or Escape to move back to pool
		if (e.key === '0' || e.key === 'Backspace' || e.key === 'Escape') {
			if (source !== 'pool') {
				e.preventDefault();
				newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
				value = newValue;
				announceMove(item, source, 'pool');
			}
			return;
		}

		// Arrow keys to cycle through areas (Pool -> Bucket 0 -> Bucket 1 -> ... -> Pool)
		const areas = ['pool', ...buckets];
		const currentAreaIdx = areas.indexOf(source);

		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			const nextAreaIdx = (currentAreaIdx + 1) % areas.length;
			const target = areas[nextAreaIdx];

			// Remove from source
			if (source !== 'pool') {
				newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
			}
			// Add to target
			if (target !== 'pool') {
				if (!newValue[target]) newValue[target] = [];
				if (!newValue[target].includes(item)) {
					newValue[target] = [...newValue[target], item];
				}
			}
			value = newValue;
			announceMove(item, source, target);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			const prevAreaIdx = (currentAreaIdx - 1 + areas.length) % areas.length;
			const target = areas[prevAreaIdx];

			// Remove from source
			if (source !== 'pool') {
				newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
			}
			// Add to target
			if (target !== 'pool') {
				if (!newValue[target]) newValue[target] = [];
				if (!newValue[target].includes(item)) {
					newValue[target] = [...newValue[target], item];
				}
			}
			value = newValue;
			announceMove(item, source, target);
		}
	}
</script>

<div class="sr-only" aria-live="assertive" aria-atomic="true">
	{srAnnouncement}
</div>

<div class="dnd-match-container" class:disabled>
	<!-- Pool Area -->
	<div
		class="pool-area"
		class:drop-target={dropTarget === 'pool'}
		data-bucket="pool"
		ondragover={(e) => handleDragOver(e, 'pool')}
		ondragleave={(e) => handleDragLeave(e, 'pool')}
		ondrop={(e) => handleDrop(e, 'pool')}
		onclick={() => handleAreaClick('pool')}
		onkeydown={(e) => {
			if ((e.key === 'Enter' || e.key === ' ') && selectedItem) {
				e.preventDefault();
				handleAreaClick('pool');
			}
		}}
		role="listbox"
		aria-label={mergedLabels.poolTitle}
		tabindex="-1"
	>
		<h4 class="area-title">{mergedLabels.poolTitle}</h4>
		<div class="items-grid">
			{#if poolItems.length === 0}
				<div transition:scale={{ duration: prefersReducedMotion ? 0 : 150 }} class="empty-msg">
					{mergedLabels.allClassified}
				</div>
			{/if}
			{#each poolItems as item, index (getOccurrenceKey(poolItems, index))}
				<div
					transition:scale={{ duration: prefersReducedMotion ? 0 : 150 }}
					class="dnd-chip glass-panel"
					class:dragging={draggedItem?.item === item && !isTouchDragging}
					class:touch-dragging={draggedItem?.item === item && isTouchDragging}
					class:selected={selectedItem?.item === item && selectedItem?.source === 'pool'}
					draggable={!disabled && !isTouchDragging}
					onclick={(e) => {
						e.stopPropagation();
						handleItemClick(item, 'pool');
					}}
					ondragstart={(e) => handleDragStart(e, item, 'pool')}
					ondragend={handleDragEnd}
					ontouchstart={(e) => handleTouchStart(e, item, 'pool')}
					ontouchmove={handleTouchMove}
					ontouchend={handleTouchEnd}
					ontouchcancel={handleTouchEnd}
					role="option"
					aria-selected={draggedItem?.item === item}
					tabindex="0"
					onkeydown={(e) => handleKeyDown(e, item, 'pool')}
					aria-label={i18n.t('dndMatch.availableOptionLabel', {
						item,
						count: buckets.length
					})}
				>
					<span>{item}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Buckets Area -->
	<div class="buckets-grid">
		{#each buckets as bucket, bucketIndex (getOccurrenceKey(buckets, bucketIndex))}
			<div
				class="bucket-area glass-panel"
				class:drop-target={dropTarget === bucket}
				data-bucket={bucket}
				ondragover={(e) => handleDragOver(e, bucket)}
				ondragleave={(e) => handleDragLeave(e, bucket)}
				ondrop={(e) => handleDrop(e, bucket)}
				onclick={() => handleAreaClick(bucket)}
				onkeydown={(e) => {
					if ((e.key === 'Enter' || e.key === ' ') && selectedItem) {
						e.preventDefault();
						handleAreaClick(bucket);
					}
				}}
				role="listbox"
				aria-label={bucket}
				tabindex="-1"
			>
				<h4 class="bucket-title">{bucket}</h4>
				<div class="bucket-content">
					{#if !safeValue[bucket] || safeValue[bucket].length === 0}
						<div transition:scale={{ duration: prefersReducedMotion ? 0 : 150 }} class="empty-msg">
							{mergedLabels.dropHere}
						</div>
					{/if}
					{#each safeValue[bucket] || [] as item, itemIndex (getOccurrenceKey(safeValue[bucket] || [], itemIndex))}
						<div
							transition:scale={{ duration: prefersReducedMotion ? 0 : 150 }}
							class="dnd-chip bucket-chip"
							class:dragging={draggedItem?.item === item && !isTouchDragging}
							class:touch-dragging={draggedItem?.item === item && isTouchDragging}
							class:selected={selectedItem?.item === item && selectedItem?.source === bucket}
							draggable={!disabled && !isTouchDragging}
							onclick={(e) => {
								e.stopPropagation();
								handleItemClick(item, bucket);
							}}
							ondragstart={(e) => handleDragStart(e, item, bucket)}
							ondragend={handleDragEnd}
							ontouchstart={(e) => handleTouchStart(e, item, bucket)}
							ontouchmove={handleTouchMove}
							ontouchend={handleTouchEnd}
							ontouchcancel={handleTouchEnd}
							role="option"
							aria-selected={draggedItem?.item === item}
							tabindex="0"
							onkeydown={(e) => handleKeyDown(e, item, bucket)}
							aria-label={i18n.t('dndMatch.classifiedOptionLabel', { item, bucket })}
						>
							{item}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.dnd-match-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
	}

	.disabled {
		opacity: 0.8;
		pointer-events: none;
	}

	.area-title,
	.bucket-title {
		font-size: calc(var(--text-sm) * 0.9);
		text-transform: uppercase;
		letter-spacing: 0;
		color: var(--text-secondary);
		height: calc(var(--text-sm) * 1.8);
		margin-bottom: var(--space-xs);
		text-align: center;
		line-height: 1.15;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pool-area {
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		padding: calc(var(--space-xs) * 0.25) var(--space-sm) var(--space-sm);
		background: rgba(0, 0, 0, 0.02);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		min-height: 82px;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.pool-area.drop-target {
		background-color: color-mix(in srgb, var(--accent-primary) 8%, var(--bg-primary));
		border-color: var(--accent-primary);
	}

	.items-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		justify-content: center;
		position: relative;
		flex: 1;
		min-height: 36px;
	}

	.buckets-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-sm);
		margin-top: 0;
	}

	.bucket-area:last-child:nth-child(odd) {
		grid-column: 1 / -1;
		justify-self: center;
		width: calc(50% - var(--space-sm) / 2);
	}

	.bucket-area {
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		padding: calc(var(--space-xs) * 0.25) var(--space-sm) var(--space-sm);
		min-height: 104px;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.bucket-area.drop-target {
		background-color: color-mix(in srgb, var(--success) 8%, var(--bg-secondary));
		border-color: var(--success);
	}

	.bucket-content {
		flex: 1 1 auto;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--space-xs);
		position: relative;
		align-items: flex-start;
		align-content: flex-start;
		min-height: 42px;
		padding: var(--space-xs);
		border: 1px dashed var(--border-color);
		border-radius: var(--radius-sm);
		background: rgba(0, 0, 0, 0.02);
	}

	.dnd-chip {
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: grab;
		font-family: var(--font-body);
		font-size: var(--text-md);
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
		user-select: none;
		transition:
			transform 0.1s,
			opacity 0.2s;
		/* Permite o clique no chip mas ignora o texto interno para evitar glitches no drag */
		pointer-events: auto;
		touch-action: none;
	}

	/* Ignora o texto interno durante o drag para não bugar a detecção da caixa */
	.dnd-chip > * {
		pointer-events: none;
	}

	.dnd-chip:active {
		cursor: grabbing;
	}

	.dnd-chip.dragging {
		opacity: 0.1;
	}

	.dnd-chip.touch-dragging {
		opacity: 0.5;
		pointer-events: none;
	}

	.dnd-chip.selected {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.bucket-chip {
		border-radius: var(--radius-sm);
		background: var(--bg-secondary);
		text-align: center;
		pointer-events: auto;
		flex: 1 1 90px;
		max-width: 100%;
	}

	.bucket-content .empty-msg {
		position: static;
		transform: none;
		width: 100%;
		padding: var(--space-xs) 0;
	}

	.empty-msg {
		color: var(--text-secondary);
		font-style: italic;
		font-size: var(--text-sm);
		text-align: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		pointer-events: none;
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

	@media (max-width: 700px) {
		.dnd-match-container {
			gap: var(--space-md);
		}

		.area-title,
		.bucket-title {
			margin-bottom: var(--space-sm);
		}

		.items-grid {
			flex-wrap: wrap;
			justify-content: center;
			gap: var(--space-sm);
		}

		.items-grid .dnd-chip {
			flex: 0 1 auto;
			min-width: auto;
			text-align: center;
		}

		.buckets-grid {
			display: flex;
			flex-direction: column;
			gap: var(--space-sm);
			margin-top: 0;
		}

		.bucket-area:last-child:nth-child(odd) {
			width: 100%;
		}

		.bucket-area {
			min-height: auto;
			text-align: left;
		}

		.bucket-title {
			margin-top: 0;
			margin-bottom: var(--space-xs);
			width: 100%;
			max-width: none;
			flex-shrink: 0;
			font-size: calc(var(--text-sm) * 0.85);
			word-break: break-word;
		}

		.bucket-content {
			min-height: 38px;
			align-items: center;
			align-content: center;
		}

		.bucket-chip {
			flex: 1 1 100px;
			max-width: 100%;
			font-size: var(--text-xs);
			padding: calc(var(--space-xs) * 0.8) var(--space-sm);
			margin: 0;
			text-align: center;
		}

		.empty-msg {
			position: static;
			transform: none;
			text-align: center;
			font-size: calc(var(--text-xs) * 0.9);
			color: var(--text-secondary);
			width: 100%;
			padding: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pool-area,
		.bucket-area,
		.dnd-chip {
			transition: none;
		}
	}
</style>
