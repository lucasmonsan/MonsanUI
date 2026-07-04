<script lang="ts">
	import { spring } from 'svelte/motion';
	import type { HeightPreset, MaxWidthPreset } from '$lib/utils/layout.js';
	import { resolveHeight, resolveMaxWidth } from '$lib/utils/layout.js';

	let {
		flipped = $bindable(false),
		onFlip,
		onswipe,
		ondrag,
		ondragend,
		front,
		back,
		draggable = true,
		height = '256px',
		maxWidth = 'none'
	} = $props<{
		flipped?: boolean;
		onFlip?: () => void;
		onswipe?: (
			direction:
				| 'up'
				| 'down'
				| 'left'
				| 'right'
				| 'up-left'
				| 'up-right'
				| 'down-left'
				| 'down-right'
		) => void;
		ondrag?: (offset: { x: number; y: number }) => void;
		ondragend?: (offset: { x: number; y: number }) => void;
		front: import('svelte').Snippet;
		back: import('svelte').Snippet;
		draggable?: boolean;
		height?: HeightPreset;
		maxWidth?: MaxWidthPreset;
	}>();

	let resolvedHeight = $derived(resolveHeight(height));
	let resolvedMaxWidth = $derived(resolveMaxWidth(maxWidth));

	let isDragging = $state(false);
	let startX = $state(0);
	let startY = $state(0);

	const offset = spring({ x: 0, y: 0 }, { stiffness: 0.15, damping: 0.8 });
	const tilt = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.7 });

	$effect(() => {
		if (isDragging && ondrag) {
			ondrag({ x: $offset.x, y: $offset.y });
		}
	});

	function handleFlip() {
		if (Math.abs($offset.x) < 15 && Math.abs($offset.y) < 15) {
			flipped = !flipped;
			onFlip?.();
		}
	}

	function onPointerDown(e: PointerEvent) {
		if (!draggable) return;
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		e.preventDefault();
	}

	function onPointerMoveGlobal(e: PointerEvent) {
		if (!isDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		offset.set({ x: dx, y: dy });
	}

	function onPointerMoveLocal(e: PointerEvent) {
		if (isDragging) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		if (!rect) return;
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		tilt.set({ x: x * 8, y: -y * 8 });
	}

	function onPointerUpGlobal() {
		if (!isDragging) return;
		isDragging = false;

		const threshold = 100;
		const dist = Math.sqrt($offset.x * $offset.x + $offset.y * $offset.y);

		if (ondragend) {
			ondragend({ x: $offset.x, y: $offset.y });
		}

		if (dist > threshold && onswipe) {
			const angle = Math.atan2($offset.y, $offset.x) * (180 / Math.PI);
			let direction:
				| 'up'
				| 'down'
				| 'left'
				| 'right'
				| 'up-left'
				| 'up-right'
				| 'down-left'
				| 'down-right';

			if (angle > -22.5 && angle <= 22.5) {
				direction = 'right';
			} else if (angle > 22.5 && angle <= 67.5) {
				direction = 'down-right';
			} else if (angle > 67.5 && angle <= 112.5) {
				direction = 'down';
			} else if (angle > 112.5 && angle <= 157.5) {
				direction = 'down-left';
			} else if (angle > 157.5 || angle <= -157.5) {
				direction = 'left';
			} else if (angle > -157.5 && angle <= -112.5) {
				direction = 'up-left';
			} else if (angle > -112.5 && angle <= -67.5) {
				direction = 'up';
			} else {
				direction = 'up-right';
			}

			onswipe(direction);
		}

		offset.set({ x: 0, y: 0 });
		tilt.set({ x: 0, y: 0 });
	}

	let translation = $derived(
		`translate3d(${$offset.x}px, ${$offset.y}px, 0) rotateZ(${$offset.x * 0.05}deg)`
	);
	let tiltEffect = $derived(`rotateX(${$tilt.y}deg) rotateY(${$tilt.x}deg)`);

	let vignetteBaseColor = $derived(
		$offset.x > 20
			? 'var(--success-rgb, 46, 204, 113)'
			: $offset.x < -20
				? 'var(--error-rgb, 231, 76, 60)'
				: $offset.y < -20
					? 'var(--accent-primary-rgb, 61, 90, 128)'
					: '0, 0, 0'
	);

	let vignetteOpacity = $derived(
		Math.min(Math.max(Math.abs($offset.x), Math.abs($offset.y)) / 150, 0.4)
	);
</script>

<svelte:window
	onpointermove={isDragging ? onPointerMoveGlobal : null}
	onpointerup={isDragging ? onPointerUpGlobal : null}
	onpointercancel={isDragging ? onPointerUpGlobal : null}
/>

<div
	class="monsan-flipcard-container"
	style:--flipcard-height={resolvedHeight}
	style:max-width={resolvedMaxWidth}
	class:flipped
	onpointerdown={onPointerDown}
	onpointermove={onPointerMoveLocal}
	onpointerleave={() => !isDragging && tilt.set({ x: 0, y: 0 })}
	ondragstart={(e) => e.preventDefault()}
	role="button"
	aria-pressed={flipped}
	tabindex="0"
	onclick={handleFlip}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleFlip();
		}
	}}
>
	<div class="card-wrapper" style:transform={`${translation} ${tiltEffect}`}>
		<div
			class="card"
			class:flipped
			style:box-shadow={`0 0 30px rgba(${vignetteBaseColor}, ${vignetteOpacity}), var(--shadow-md)`}
		>
			<div class="face front">
				<div class="pattern"></div>
				<div class="face-content">
					{@render front()}
				</div>
			</div>
			<div class="face back">
				<div class="face-content">
					{@render back()}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.monsan-flipcard-container {
		perspective: 1200px;
		width: 100%;
		height: var(--flipcard-height);
		position: relative;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		outline: none;
		margin: 0 auto;
	}

	.card-wrapper {
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
	}

	.card {
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition:
			transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
			box-shadow 0.3s ease;
		cursor: pointer;
		border-radius: var(--radius-lg);
	}

	.card.flipped {
		transform: rotateY(180deg);
	}

	.face {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		transform-style: preserve-3d;
		display: flex;
		flex-direction: column;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
		background: var(--bg-primary);
		color: var(--text-primary);
		overflow: hidden;
		box-sizing: border-box;
	}

	.front .pattern {
		position: absolute;
		inset: 10px;
		background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
		background-size: 10px 10px;
		opacity: 0.08;
		pointer-events: none;
	}

	.back {
		transform: rotateY(180deg) translateZ(1px);
		background: var(--bg-secondary);
	}

	.face-content {
		position: relative;
		width: 100%;
		height: 100%;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: var(--space-lg);
		box-sizing: border-box;
		z-index: 2;
		overflow: auto;
		overflow-wrap: anywhere;
		transform: translateZ(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
