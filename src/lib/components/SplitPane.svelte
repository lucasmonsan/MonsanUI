<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		left: Snippet;
		right: Snippet;
		ratio?: number;
		ratioMobile?: number;
		persistKey?: string;
	}

	let {
		left,
		right,
		ratio = $bindable(50),
		ratioMobile = $bindable(40),
		persistKey
	}: Props = $props();

	let isDragging = $state(false);

	onMount(() => {
		if (persistKey) {
			const saved = localStorage.getItem(`${persistKey}-ratio`);
			if (saved) {
				ratio = parseFloat(saved);
			}
			const savedMobile = localStorage.getItem(`${persistKey}-ratio-mobile`);
			if (savedMobile) {
				ratioMobile = parseFloat(savedMobile);
			}
		}
	});

	function startResize(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		isDragging = true;
		if (e instanceof MouseEvent) {
			document.addEventListener('mousemove', handleResize);
			document.addEventListener('mouseup', stopResize);
		} else {
			document.addEventListener('touchmove', handleResize, { passive: false });
			document.addEventListener('touchend', stopResize);
		}
	}

	function handleResize(e: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		const container = document.querySelector('.monsan-split-pane');
		if (container) {
			const rect = container.getBoundingClientRect();
			const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
			const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

			if (window.innerWidth <= 560) {
				const newHeight = ((clientY - rect.top) / rect.height) * 100;
				ratioMobile = Math.max(15, Math.min(newHeight, 75));
				if (persistKey) {
					localStorage.setItem(`${persistKey}-ratio-mobile`, ratioMobile.toString());
				}
			} else {
				const newWidth = ((clientX - rect.left) / rect.width) * 100;
				ratio = Math.max(20, Math.min(newWidth, 80));
				if (persistKey) {
					localStorage.setItem(`${persistKey}-ratio`, ratio.toString());
				}
			}
		}
	}

	function stopResize() {
		isDragging = false;
		document.removeEventListener('mousemove', handleResize);
		document.removeEventListener('mouseup', stopResize);
		document.removeEventListener('touchmove', handleResize);
		document.removeEventListener('touchend', stopResize);
	}
</script>

<div
	class="monsan-split-pane"
	style="--split-ratio: {ratio}%; --split-ratio-mobile: {ratioMobile}%;"
>
	<div class="split-pane-left">
		{@render left()}
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="split-pane-resize-bar"
		class:dragging={isDragging}
		onmousedown={startResize}
		ontouchstart={startResize}
		role="separator"
	></div>

	<div class="split-pane-right">
		{@render right()}
	</div>
</div>

<style>
	.monsan-split-pane {
		display: grid;
		grid-template-columns: var(--split-ratio, 50%) 12px calc(100% - var(--split-ratio, 50%) - 12px);
		width: 100%;
		height: 100%;
		min-height: 0;
		box-sizing: border-box;
	}

	.split-pane-left,
	.split-pane-right {
		min-width: 0;
		min-height: 0;
		height: 100%;
		width: 100%;
	}

	.split-pane-resize-bar {
		grid-column: 2;
		width: 12px;
		cursor: col-resize;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		position: relative;
		opacity: 0.25;
		transition: opacity 0.2s ease;
	}

	.split-pane-resize-bar:hover,
	.split-pane-resize-bar.dragging {
		opacity: 1;
	}

	.split-pane-resize-bar::before {
		content: '';
		width: 1px;
		height: 100%;
		background-image: linear-gradient(to bottom, var(--border-color) 60%, transparent 40%);
		background-size: 1px 10px;
	}

	.split-pane-resize-bar:hover::before,
	.split-pane-resize-bar.dragging::before {
		background-image: none;
		background-color: var(--accent-primary);
		width: 2px;
	}

	@media (max-width: 560px) {
		.monsan-split-pane {
			grid-template-columns: minmax(0, 1fr) !important;
			grid-template-rows: var(--split-ratio-mobile, 40%) 12px calc(
					100% - var(--split-ratio-mobile, 40%) - 12px
				);
			height: 100%;
		}

		.split-pane-left {
			grid-row: 1;
			grid-column: 1;
		}

		.split-pane-resize-bar {
			grid-row: 2;
			grid-column: 1;
			width: 100%;
			height: 12px;
			cursor: row-resize;
		}

		.split-pane-resize-bar::before {
			width: 100%;
			height: 1px;
			background-image: linear-gradient(to right, var(--border-color) 60%, transparent 40%);
			background-size: 10px 1px;
		}

		.split-pane-resize-bar:hover::before,
		.split-pane-resize-bar.dragging::before {
			background-image: none;
			background-color: var(--accent-primary);
			height: 2px;
			width: 100%;
		}

		.split-pane-right {
			grid-row: 3;
			grid-column: 1;
		}
	}
</style>
