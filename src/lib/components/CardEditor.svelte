<script lang="ts">
	import { autoResizeAction } from '../utils/actions.js';
	import Input from './Input.svelte';
	import Textarea from './Textarea.svelte';
	import GripVertical from './icons/GripVertical.svelte';
	import ChevronUp from './icons/ChevronUp.svelte';
	import ChevronDown from './icons/ChevronDown.svelte';
	import Copy from './icons/Copy.svelte';
	import Trash from './icons/Trash.svelte';
	import Minus from './icons/Minus.svelte';
	import Plus from './icons/Plus.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Field {
		id: string;
		label: string;
		placeholder?: string;
		type: 'text' | 'textarea';
		rows?: number;
		optional?: boolean;
	}

	interface Props {
		value: Record<string, unknown>;
		index: number;
		totalCards: number;
		onMove: (index: number, direction: -1 | 1) => void;
		onDuplicate: (index: number) => void;
		onRemove: (index: number) => void;
		isDragging?: boolean;
		onDragStart?: (index: number) => void;
		onDragOver?: (event: DragEvent, index: number) => void;
		onDragEnd?: () => void;
		dragDisabled?: boolean;
		fields?: Field[];
		labels?: {
			cardNumber?: (n: number) => string;
			moveUp?: string;
			moveDown?: string;
			duplicateCard?: string;
			deleteCard?: string;
			addOptionalField?: (label: string) => string;
			removeOptionalField?: (label: string) => string;
		};
	}

	let {
		value = $bindable(),
		index,
		totalCards,
		onMove,
		onDuplicate,
		onRemove,
		isDragging = false,
		onDragStart,
		onDragOver,
		onDragEnd,
		dragDisabled = false,
		fields,
		labels
	}: Props = $props();

	let isTouchDragging = $state(false);
	let dragAllowed = $state(false);

	const defaultFields: Field[] = $derived([
		{
			id: 'front',
			label: i18n.t('cardEditor.frontLabel'),
			placeholder: i18n.t('cardEditor.frontPlaceholder'),
			type: 'textarea',
			rows: 1
		},
		{
			id: 'back',
			label: i18n.t('cardEditor.backLabel'),
			placeholder: i18n.t('cardEditor.backPlaceholder'),
			type: 'textarea',
			rows: 2
		},
		{
			id: 'hint',
			label: i18n.t('cardEditor.hintLabel'),
			placeholder: i18n.t('cardEditor.hintPlaceholder'),
			type: 'text',
			optional: true
		}
	]);

	const activeFields = $derived(fields ?? defaultFields);

	function handleDragStart(e: DragEvent) {
		if (!dragAllowed) {
			e.preventDefault();
			return;
		}

		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', index.toString());
		}
		onDragStart?.(index);
	}

	function handleTouchStart(e: TouchEvent) {
		const target = e.target as HTMLElement;
		const header = target.closest('.card-header');
		const interactive = target.closest('button, input, textarea, a, select');

		if (!header || interactive) {
			return;
		}
		isTouchDragging = true;
		onDragStart?.(index);
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isTouchDragging) return;

		e.preventDefault();

		const touch = e.touches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
		if (element) {
			const targetItem = element.closest('.card-editor-item') as HTMLElement;
			if (targetItem) {
				const targetIndexAttr = targetItem.getAttribute('data-index');
				if (targetIndexAttr !== null) {
					const targetIndex = parseInt(targetIndexAttr, 10);
					if (targetIndex !== index) {
						const mockDragEvent = {
							preventDefault: () => {},
							clientX: touch.clientX,
							clientY: touch.clientY,
							currentTarget: targetItem,
							target: targetItem
						} as unknown as DragEvent;
						onDragOver?.(mockDragEvent, targetIndex);
					}
				}
			}
		}
	}

	function handleTouchEnd() {
		if (isTouchDragging) {
			isTouchDragging = false;
			onDragEnd?.();
		}
	}

	const l = $derived({
		cardNumber:
			labels?.cardNumber ?? ((n: number) => i18n.t('cardEditor.cardNumber', { number: n })),
		moveUp: labels?.moveUp ?? i18n.t('cardEditor.moveUp'),
		moveDown: labels?.moveDown ?? i18n.t('cardEditor.moveDown'),
		duplicateCard: labels?.duplicateCard ?? i18n.t('cardEditor.duplicateCard'),
		deleteCard: labels?.deleteCard ?? i18n.t('cardEditor.deleteCard'),
		addOptionalField:
			labels?.addOptionalField ??
			((label: string) => i18n.t('cardEditor.addOptionalField', { label })),
		removeOptionalField:
			labels?.removeOptionalField ??
			((label: string) => i18n.t('cardEditor.removeOptionalField', { label }))
	});

	function getVisibilityKey(field: Field) {
		return field.id === 'hint' ? 'isHintVisible' : `is_${field.id}_visible`;
	}

	function isFieldVisible(field: Field) {
		if (!field.optional) return true;
		const key = getVisibilityKey(field);
		return !!value[key];
	}

	function toggleFieldVisibility(field: Field) {
		const key = getVisibilityKey(field);
		const isVisible = !value[key];
		value = {
			...value,
			[key]: isVisible,
			...(isVisible ? {} : { [field.id]: '' })
		};
	}

	function getFieldValue(fieldId: string) {
		const fieldValue = value[fieldId];
		return typeof fieldValue === 'string' ? fieldValue : '';
	}

	function setFieldValue(fieldId: string, nextValue: string) {
		value = { ...value, [fieldId]: nextValue };
	}

	function handleFieldInput(fieldId: string, event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		setFieldValue(fieldId, target.value);
	}

	let headerEl = $state<HTMLDivElement>();
	$effect(() => {
		if (!headerEl) return;

		const onMouseDown = (e: MouseEvent) => {
			const interactive = (e.target as HTMLElement).closest('button, input, textarea, a, select');
			dragAllowed = !interactive;
		};

		headerEl.addEventListener('mousedown', onMouseDown);
		headerEl.addEventListener('touchstart', handleTouchStart);
		headerEl.addEventListener('touchmove', handleTouchMove);
		headerEl.addEventListener('touchend', handleTouchEnd);
		headerEl.addEventListener('touchcancel', handleTouchEnd);

		return () => {
			headerEl?.removeEventListener('mousedown', onMouseDown);
			headerEl?.removeEventListener('touchstart', handleTouchStart);
			headerEl?.removeEventListener('touchmove', handleTouchMove);
			headerEl?.removeEventListener('touchend', handleTouchEnd);
			headerEl?.removeEventListener('touchcancel', handleTouchEnd);
		};
	});
</script>

<div
	class="card-editor-item"
	role="listitem"
	class:dragging={isDragging && !isTouchDragging}
	class:touch-dragging={isTouchDragging}
	draggable={dragDisabled ? undefined : !isTouchDragging}
	data-index={index}
	ondragstart={handleDragStart}
	ondragover={(e) => {
		onDragOver?.(e, index);
	}}
	ondragend={() => {
		onDragEnd?.();
	}}
>
	<div bind:this={headerEl} class="card-header">
		<div class="header-left">
			<div class="drag-handle" role="presentation">
				<GripVertical size={16} />
			</div>
			<h3>{l.cardNumber(index + 1)}</h3>
		</div>
		<div class="card-actions">
			{#if index > 0}
				<button
					type="button"
					class="btn-icon"
					title={l.moveUp}
					aria-label={l.moveUp}
					onclick={() => onMove(index, -1)}
				>
					<ChevronUp size={14} />
				</button>
			{/if}
			{#if index < totalCards - 1}
				<button
					type="button"
					class="btn-icon"
					title={l.moveDown}
					aria-label={l.moveDown}
					onclick={() => onMove(index, 1)}
				>
					<ChevronDown size={14} />
				</button>
			{/if}
			<button
				type="button"
				class="btn-icon"
				title={l.duplicateCard}
				aria-label={l.duplicateCard}
				onclick={() => onDuplicate(index)}
			>
				<Copy size={14} />
			</button>
			{#if totalCards > 1}
				<button
					type="button"
					class="btn-icon btn-delete"
					onclick={() => onRemove(index)}
					title={l.deleteCard}
					aria-label={l.deleteCard}
				>
					<Trash size={14} />
				</button>
			{/if}
		</div>
	</div>

	<div class="inputs-stack">
		{#each activeFields as field (field.id)}
			{#if field.optional}
				<div class="hint-group">
					<div class="hint-header">
						<label for="{field.id}-{index}">{field.label}</label>
						<button
							type="button"
							class="btn-toggle-hint-icon"
							title={isFieldVisible(field)
								? l.removeOptionalField(field.label)
								: l.addOptionalField(field.label)}
							aria-label={isFieldVisible(field)
								? l.removeOptionalField(field.label)
								: l.addOptionalField(field.label)}
							onclick={() => toggleFieldVisibility(field)}
						>
							{#if isFieldVisible(field)}
								<Minus size={14} />
							{:else}
								<Plus size={14} />
							{/if}
						</button>
					</div>
					<div class="hint-input-wrapper" class:expanded={isFieldVisible(field)}>
						<div class="hint-input-inner">
							<div class="hint-slide-wrapper">
								{#if field.type === 'textarea'}
									<Textarea
										id="{field.id}-{index}"
										value={getFieldValue(field.id)}
										oninput={(event) => handleFieldInput(field.id, event)}
										placeholder={field.placeholder}
										rows={field.rows ?? 1}
										use={autoResizeAction}
										size="sm"
									/>
								{:else}
									<Input
										id="{field.id}-{index}"
										type="text"
										value={getFieldValue(field.id)}
										oninput={(event) => handleFieldInput(field.id, event)}
										placeholder={field.placeholder}
										size="sm"
									/>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="input-group">
					<label for="{field.id}-{index}">{field.label}</label>
					{#if field.type === 'textarea'}
						<Textarea
							id="{field.id}-{index}"
							value={getFieldValue(field.id)}
							oninput={(event) => handleFieldInput(field.id, event)}
							placeholder={field.placeholder}
							rows={field.rows ?? 1}
							use={autoResizeAction}
							size="sm"
						/>
					{:else}
						<Input
							id="{field.id}-{index}"
							type="text"
							value={getFieldValue(field.id)}
							oninput={(event) => handleFieldInput(field.id, event)}
							placeholder={field.placeholder}
							size="sm"
						/>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.card-editor-item {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		overflow: visible;
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
		transition:
			background-color 0.3s var(--ease-out),
			border-color 0.3s var(--ease-out),
			opacity 0.2s ease;
	}

	.card-editor-item.dragging {
		opacity: 0.3;
		border: 2px dashed var(--accent-primary);
		background: var(--bg-secondary);
		box-shadow: none;
	}

	.card-editor-item.touch-dragging {
		opacity: 0.5;
		border: 2px dashed var(--accent-primary);
		background: var(--bg-secondary);
		box-shadow: none;
		pointer-events: none;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-secondary);
		border-bottom: 2px solid var(--border-color);
		padding: var(--space-sm) var(--space-lg);
		min-height: 44px;
		border-top-left-radius: calc(var(--radius-md) - var(--border-width));
		border-top-right-radius: calc(var(--radius-md) - var(--border-width));
		cursor: grab;
		user-select: none;
	}

	.card-header:active {
		cursor: grabbing;
	}

	.drag-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		cursor: grab;
	}

	.card-header h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 900;
		color: var(--text-primary);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.card-actions {
		display: flex;
		gap: var(--space-xs);
	}

	.btn-icon {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-primary);
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out);
		box-shadow: var(--shadow-sm);
		padding: 0;
	}

	.btn-icon:hover {
		filter: brightness(1.08);
	}

	.btn-icon:active {
		transform: scale(0.96);
	}

	.btn-icon.btn-delete {
		color: var(--error);
	}

	.btn-icon.btn-delete:hover {
		background: color-mix(in srgb, var(--error) 10%, var(--bg-primary));
		border-color: var(--error);
		filter: brightness(1.08);
	}

	.inputs-stack {
		padding: var(--space-md) var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.input-group label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-xs);
		color: var(--text-primary);
	}

	.hint-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.hint-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.hint-header label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-xs);
		color: var(--text-primary);
	}

	.btn-toggle-hint-icon {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-primary);
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out);
		box-shadow: var(--shadow-sm);
		padding: 0;
	}

	.btn-toggle-hint-icon:hover {
		filter: brightness(1.08);
	}

	.btn-toggle-hint-icon:active {
		transform: scale(0.96);
	}

	.hint-input-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s cubic-bezier(0.2, 1, 0.3, 1);
		overflow: hidden;
	}

	.hint-input-wrapper.expanded {
		grid-template-rows: 1fr;
	}

	.hint-input-inner {
		min-height: 0;
	}

	.hint-slide-wrapper {
		padding-top: var(--space-xs);
	}

	@media (prefers-reduced-motion: reduce) {
		.card-editor-item,
		.btn-icon,
		.btn-toggle-hint-icon,
		.hint-input-wrapper {
			transition: none;
		}
	}
</style>
