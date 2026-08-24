<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronLeftIcon from './icons/ChevronLeft.svelte';
	import ChevronRightIcon from './icons/ChevronRight.svelte';
	import IconButton from './IconButton.svelte';

	interface Props {
		/** Primary floating action or menu kept at the navigator centre. */
		children: Snippet;
		/** Whether a preceding item is available. */
		hasPrevious: boolean;
		/** Whether a following item is available. */
		hasNext: boolean;
		/** Localized accessible name for the preceding control. */
		previousLabel: string;
		/** Localized accessible name for the following control. */
		nextLabel: string;
		/** Prevents both side controls and the compact swipe gesture. */
		disabled?: boolean;
		/** Selects the preceding item. */
		onPrevious: () => void;
		/** Selects the following item. */
		onNext: () => void;
	}

	let {
		children,
		hasPrevious,
		hasNext,
		previousLabel,
		nextLabel,
		disabled = false,
		onPrevious,
		onNext
	}: Props = $props();

	let gestureStart: { pointerId: number; x: number; y: number } | null = null;

	function isCompactViewport(): boolean {
		return typeof window !== 'undefined' && window.matchMedia('(max-width: 40rem)').matches;
	}

	function targetsInteractiveControl(target: EventTarget | null): boolean {
		return (
			target instanceof Element &&
			Boolean(target.closest('button, a, input, select, textarea, [contenteditable="true"]'))
		);
	}

	function clearGesture(event?: PointerEvent): void {
		if (
			event?.currentTarget instanceof HTMLElement &&
			event.currentTarget.hasPointerCapture(event.pointerId)
		) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		gestureStart = null;
	}

	function beginGesture(event: PointerEvent): void {
		if (
			disabled ||
			!isCompactViewport() ||
			event.isPrimary === false ||
			targetsInteractiveControl(event.target)
		) {
			return;
		}
		gestureStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function completeGesture(event: PointerEvent): void {
		const start = gestureStart;
		if (!start || start.pointerId !== event.pointerId) return;
		const deltaX = event.clientX - start.x;
		const deltaY = event.clientY - start.y;
		clearGesture(event);
		if (Math.abs(deltaX) < 44 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.35) return;
		if (deltaX > 0 && hasPrevious) onPrevious();
		if (deltaX < 0 && hasNext) onNext();
	}
</script>

<div
	class="monsan-floating-action-navigator"
	class:is-disabled={disabled}
	role="presentation"
	onpointerdown={beginGesture}
	onpointerup={completeGesture}
	onpointercancel={(event) => clearGesture(event)}
>
	<div class="floating-action-navigator-side previous">
		{#if hasPrevious && !disabled}
			<IconButton size="sm" variant="ghost" label={previousLabel} onclick={onPrevious}>
				<ChevronLeftIcon size={18} />
			</IconButton>
		{/if}
	</div>
	<div class="floating-action-navigator-primary">
		{@render children()}
	</div>
	<div class="floating-action-navigator-side next">
		{#if hasNext && !disabled}
			<IconButton size="sm" variant="ghost" label={nextLabel} onclick={onNext}>
				<ChevronRightIcon size={18} />
			</IconButton>
		{/if}
	</div>
</div>

<style>
	.monsan-floating-action-navigator {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-width: 0;
		min-height: calc(var(--control-height) * 1.3);
		touch-action: pan-y;
	}

	.floating-action-navigator-primary {
		display: flex;
		justify-content: center;
		width: 100%;
		min-width: 0;
	}

	.floating-action-navigator-side {
		display: none;
	}

	@media (max-width: 40rem) {
		.floating-action-navigator-side {
			position: absolute;
			top: 50%;
			display: flex;
			align-items: center;
			transform: translateY(-50%);
			opacity: 0.72;
		}

		.floating-action-navigator-side.previous {
			left: 0;
		}

		.floating-action-navigator-side.next {
			right: 0;
		}

		.monsan-floating-action-navigator.is-disabled .floating-action-navigator-side {
			opacity: 0;
		}
	}
</style>
