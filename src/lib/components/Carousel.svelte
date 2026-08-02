<script lang="ts">
	import ChevronLeft from './icons/ChevronLeft.svelte';

	type CarouselItem = { id: string } & Record<string, unknown>;

	interface Props {
		items: CarouselItem[];
		value?: string;
		ariaLabel: string;
		previousLabel: string;
		nextLabel: string;
		variant?: 'default' | 'bare';
		itemMaxWidth?: string;
		itemLabel: (item: CarouselItem, index: number) => string;
		children: import('svelte').Snippet<[CarouselItem, number, boolean]>;
		onChange?: (id: string) => void;
	}

	let {
		items,
		value = $bindable(''),
		ariaLabel,
		previousLabel,
		nextLabel,
		variant = 'default',
		itemMaxWidth = '680px',
		itemLabel,
		children,
		onChange
	}: Props = $props();

	let viewport = $state<HTMLElement>();
	let itemElements = $state<Record<string, HTMLElement>>({});
	let pointerStartX = $state<number | null>(null);
	let reducedMotion = $state(false);
	const carouselId = `carousel-${Math.random().toString(36).slice(2, 11)}`;

	let activeIndex = $derived(
		Math.max(
			0,
			items.findIndex((item) => item.id === value)
		)
	);
	let activeItem = $derived(items[activeIndex]);

	$effect(() => {
		if (!items.length) {
			value = '';
			return;
		}
		if (!items.some((item) => item.id === value)) value = items[0]?.id ?? '';
	});

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = query.matches;
		const update = (event: MediaQueryListEvent) => (reducedMotion = event.matches);
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	function select(id: string, focus = false) {
		if (!items.some((item) => item.id === id) || id === value) return;
		value = id;
		onChange?.(id);
		queueMicrotask(() => {
			const element = itemElements[id];
			element?.scrollIntoView({
				behavior: reducedMotion ? 'auto' : 'smooth',
				block: 'nearest',
				inline: 'center'
			});
			if (focus) element?.focus();
		});
	}

	function move(direction: -1 | 1, focus = false) {
		if (!items.length) return;
		const nextIndex = (activeIndex + direction + items.length) % items.length;
		const next = items[nextIndex];
		if (next) select(next.id, focus);
	}

	function handlePointerUp(event: PointerEvent) {
		if (pointerStartX === null) return;
		const distance = event.clientX - pointerStartX;
		pointerStartX = null;
		if (Math.abs(distance) < 40) return;
		move(distance < 0 ? 1 : -1);
	}

	function handleSlideClick(event: MouseEvent, id: string) {
		const target = event.target;
		if (
			target instanceof Element &&
			target.closest('a, button, input, select, textarea, [contenteditable="true"]')
		)
			return;
		select(id);
	}

	function swipeable(node: HTMLElement) {
		const handlePointerDown = (event: PointerEvent) => (pointerStartX = event.clientX);
		const handlePointerCancel = () => (pointerStartX = null);
		node.addEventListener('pointerdown', handlePointerDown);
		node.addEventListener('pointerup', handlePointerUp);
		node.addEventListener('pointercancel', handlePointerCancel);
		return {
			destroy() {
				node.removeEventListener('pointerdown', handlePointerDown);
				node.removeEventListener('pointerup', handlePointerUp);
				node.removeEventListener('pointercancel', handlePointerCancel);
			}
		};
	}

	function selectableSlide(node: HTMLElement, id: string) {
		const click = (event: MouseEvent) => handleSlideClick(event, id);
		node.addEventListener('click', click);
		return {
			destroy() {
				node.removeEventListener('click', click);
			}
		};
	}
</script>

<section
	class="monsan-carousel variant-{variant}"
	aria-label={ariaLabel}
	style:--carousel-item-max-width={itemMaxWidth}
>
	{#if variant === 'default'}
		<div class="carousel-controls">
			<button
				type="button"
				class="carousel-control"
				aria-label={previousLabel}
				onclick={() => move(-1)}
			>
				<ChevronLeft size={18} />
			</button>
			<span class="sr-only" aria-live="polite">
				{activeItem ? itemLabel(activeItem, activeIndex) : ''}
			</span>
			<button
				type="button"
				class="carousel-control next"
				aria-label={nextLabel}
				onclick={() => move(1)}
			>
				<ChevronLeft size={18} />
			</button>
		</div>
	{:else}
		<div class="sr-only">
			<button type="button" aria-label={previousLabel} onclick={() => move(-1)}
				>{previousLabel}</button
			>
			<button type="button" aria-label={nextLabel} onclick={() => move(1)}>{nextLabel}</button>
		</div>
	{/if}

	<div
		bind:this={viewport}
		class="carousel-viewport"
		role="group"
		aria-label={ariaLabel}
		use:swipeable
	>
		<div class="carousel-track">
			{#each items as item, index (item.id)}
				<div
					bind:this={itemElements[item.id]}
					class="carousel-slide"
					class:active={item.id === value}
					class:adjacent={Math.abs(index - activeIndex) === 1}
					id={`${carouselId}-item-${item.id}`}
					role="group"
					aria-current={item.id === value ? 'true' : undefined}
					aria-label={itemLabel(item, index)}
					use:selectableSlide={item.id}
				>
					{@render children(item, index, item.id === value)}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.monsan-carousel {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		min-width: 0;
	}

	.monsan-carousel.variant-bare {
		display: block;
	}
	.variant-bare .carousel-controls {
		display: none;
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

	.carousel-controls {
		display: contents;
	}

	.carousel-control {
		width: var(--control-height);
		height: var(--control-height);
		padding: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		cursor: pointer;
	}

	.carousel-control:hover {
		transform: translate(-1px, -1px);
		box-shadow: var(--shadow-md);
	}

	.carousel-control.next :global(svg) {
		transform: rotate(180deg);
	}

	.carousel-control:focus-visible,
	.carousel-slide:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.carousel-viewport {
		min-width: 0;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		touch-action: pan-y;
	}

	.carousel-viewport::-webkit-scrollbar {
		display: none;
	}

	.carousel-track {
		display: flex;
		align-items: stretch;
		gap: var(--space-sm);
		width: max-content;
		min-width: 100%;
		padding: var(--space-xs) calc(10% + var(--space-xs));
		box-sizing: border-box;
	}

	.carousel-slide {
		width: min(var(--carousel-item-max-width), 72vw);
		scroll-snap-align: center;
		opacity: 0.48;
		filter: saturate(0.72);
		transition:
			opacity 0.2s var(--ease-out),
			filter 0.2s var(--ease-out),
			transform 0.2s var(--ease-out);
		outline: none;
		cursor: pointer;
	}

	.variant-bare .carousel-track {
		padding-inline: max(
			var(--space-md),
			calc((100% - min(var(--carousel-item-max-width), 72vw)) / 2)
		);
	}

	.variant-bare .carousel-slide {
		width: min(var(--carousel-item-max-width), 72vw);
	}

	.carousel-slide.active {
		opacity: 1;
		filter: none;
		transform: none;
	}

	.carousel-slide.adjacent {
		opacity: 0.7;
	}

	@media (max-width: 640px) {
		.monsan-carousel {
			grid-template-columns: 1fr;
		}

		.carousel-controls {
			display: none;
		}

		.carousel-track {
			padding-inline: 11%;
		}

		.carousel-slide {
			width: 78vw;
		}

		.variant-bare .carousel-track {
			padding-inline: 0;
		}
		.variant-bare .carousel-slide {
			width: calc(100% - var(--space-md));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel-control:hover,
		.carousel-slide {
			transform: none;
			transition: none;
		}
	}
</style>
