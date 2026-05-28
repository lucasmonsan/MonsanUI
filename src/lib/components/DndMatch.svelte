<script lang="ts">
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
		value?: Record<string, string[]>;
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

	const mergedLabels = $derived({
		poolTitle: labels.poolTitle || 'Opções Disponíveis',
		allClassified: labels.allClassified || 'Nenhuma opção restante',
		dropHere: labels.dropHere || 'Solte aqui'
	});

	// Initialize value if it's null or invalid
	$effect(() => {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
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
		if (!value || typeof value !== 'object') return options;
		const usedItems = new SvelteSet<string>();
		Object.values(value).forEach((arr) => {
			if (Array.isArray(arr)) arr.forEach((i) => usedItems.add(i));
		});
		return options.filter((opt) => !usedItems.has(opt));
	});

	let draggedItem = $state<{ item: string; source: string | 'pool' } | null>(null);
	let dropTarget = $state<string | 'pool' | null>(null);
	let isTouchDragging = $state(false);

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

			const newValue = { ...value };

			// 1. Remover da origem (se for um bucket)
			if (source !== 'pool') {
				newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
			}

			// 2. Adicionar ao destino (se for um bucket)
			if (target !== 'pool') {
				if (!newValue[target]) newValue[target] = [];
				// Garante que não duplique (embora a lógica de remoção já trate isso)
				if (!newValue[target].includes(item)) {
					newValue[target] = [...newValue[target], item];
				}
			}

			value = newValue;
		}
		draggedItem = null;
	}

	function handleDragEnd() {
		draggedItem = null;
		dropTarget = null;
	}

	function handleTouchStart(e: TouchEvent, item: string, source: string | 'pool') {
		if (disabled) return;
		draggedItem = { item, source };
		isTouchDragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (disabled || !isTouchDragging) return;

		// Evita scroll da página durante o arraste no mobile
		e.preventDefault();

		const touch = e.touches[0];
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

	function handleTouchEnd() {
		if (!isTouchDragging) return;
		isTouchDragging = false;

		if (draggedItem && dropTarget) {
			const { item, source } = draggedItem;
			const target = dropTarget;

			if (source !== target) {
				const newValue = { ...value };

				// 1. Remover da origem
				if (source !== 'pool') {
					newValue[source] = (newValue[source] || []).filter((i: string) => i !== item);
				}

				// 2. Adicionar ao destino
				if (target !== 'pool') {
					if (!newValue[target]) newValue[target] = [];
					if (!newValue[target].includes(item)) {
						newValue[target] = [...newValue[target], item];
					}
				}

				value = newValue;
			}
		}

		draggedItem = null;
		dropTarget = null;
	}

	import { i18n } from '../utils/i18n.svelte';

	let srAnnouncement = $state('');

	function announceMove(item: string, from: string | 'pool', to: string | 'pool') {
		const locale = i18n?.locale || 'pt';
		const fromLabel = from === 'pool' ? mergedLabels.poolTitle : from;
		const toLabel = to === 'pool' ? mergedLabels.poolTitle : to;

		if (locale === 'pt') {
			srAnnouncement = `Item "${item}" movido de "${fromLabel}" para "${toLabel}".`;
		} else if (locale === 'es') {
			srAnnouncement = `Elemento "${item}" movido de "${fromLabel}" a "${toLabel}".`;
		} else {
			srAnnouncement = `Item "${item}" moved from "${fromLabel}" to "${toLabel}".`;
		}
	}

	function handleKeyDown(e: KeyboardEvent, item: string, source: string | 'pool') {
		if (disabled) return;

		const newValue = { ...value };

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
		role="listbox"
		aria-label={mergedLabels.poolTitle}
		tabindex="-1"
	>
		<h4 class="area-title">{mergedLabels.poolTitle}</h4>
		<div class="items-grid">
			{#if poolItems.length === 0}
				<div transition:scale={{ duration: 150 }} class="empty-msg">
					{mergedLabels.allClassified}
				</div>
			{/if}
			{#each poolItems as item (item)}
				<div
					transition:scale={{ duration: 150 }}
					class="dnd-chip glass-panel"
					class:dragging={draggedItem?.item === item && !isTouchDragging}
					class:touch-dragging={draggedItem?.item === item && isTouchDragging}
					draggable={!disabled && !isTouchDragging}
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
					aria-label={i18n?.locale === 'pt'
						? `${item}. Opção disponível. Use as setas esquerda e direita ou números de 1 a ${buckets.length} para mover para uma categoria.`
						: i18n?.locale === 'es'
							? `${item}. Opción disponible. Use las flechas izquierda y derecha o los números de 1 a ${buckets.length} para mover a una categoría.`
							: `${item}. Available option. Use left and right arrow keys or numbers 1 to ${buckets.length} to move to a category.`}
				>
					<span>{item}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Buckets Area -->
	<div class="buckets-grid">
		{#each buckets as bucket (bucket)}
			<div
				class="bucket-area glass-panel"
				class:drop-target={dropTarget === bucket}
				data-bucket={bucket}
				ondragover={(e) => handleDragOver(e, bucket)}
				ondragleave={(e) => handleDragLeave(e, bucket)}
				ondrop={(e) => handleDrop(e, bucket)}
				role="listbox"
				aria-label={bucket}
				tabindex="-1"
			>
				<h4 class="bucket-title">{bucket}</h4>
				<div class="bucket-content">
					{#if !value || !value[bucket] || value[bucket].length === 0}
						<div transition:scale={{ duration: 150 }} class="empty-msg">
							{mergedLabels.dropHere}
						</div>
					{/if}
					{#each value[bucket] || [] as item (item)}
						<div
							transition:scale={{ duration: 150 }}
							class="dnd-chip bucket-chip"
							class:dragging={draggedItem?.item === item && !isTouchDragging}
							class:touch-dragging={draggedItem?.item === item && isTouchDragging}
							draggable={!disabled && !isTouchDragging}
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
							aria-label={i18n?.locale === 'pt'
								? `${item}. Classificado em ${bucket}. Use as setas esquerda e direita, ou 0, Escape ou Backspace para retornar à pilha de opções disponíveis.`
								: i18n?.locale === 'es'
									? `${item}. Clasificado en ${bucket}. Use las flechas izquierda y derecha, o 0, Escape o Backspace para volver a la pila de opciones disponibles.`
									: `${item}. Classified in ${bucket}. Use left and right arrow keys, or 0, Escape or Backspace to return to available options.`}
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
		gap: var(--space-xl);
		width: 100%;
	}

	.disabled {
		opacity: 0.8;
		pointer-events: none;
	}

	.area-title,
	.bucket-title {
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: 0;
		color: var(--text-secondary);
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.pool-area {
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.02);
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
		min-height: 100px;
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
		gap: var(--space-md);
		justify-content: center;
		position: relative;
		flex: 1;
		min-height: 36px;
	}

	.buckets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-lg);
		margin-top: var(--space-md);
	}

	.bucket-area {
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		min-height: 200px;
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
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		position: relative;
	}

	.dnd-chip {
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: grab;
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

	.bucket-chip {
		border-radius: var(--radius-sm);
		background: var(--bg-secondary);
		text-align: center;
		pointer-events: auto;
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
</style>
