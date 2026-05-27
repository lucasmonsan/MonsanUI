<script lang="ts">
	interface Props {
		pattern?: 'grid' | 'dots' | 'diagonal' | 'lines' | 'horizontal';
		local?: boolean;
		animate?: boolean;
		direction?: 'up' | 'down' | 'left' | 'right' | 'diagonal' | 'diagonal-reverse';
	}

	let { pattern = 'grid', local = false, animate = true, direction = 'diagonal' }: Props = $props();
</script>

<div
	class="background-grid pattern-{pattern} direction-{direction}"
	class:is-local={local}
	class:is-animated={animate}
></div>

<style>
	.background-grid {
		top: -40px;
		left: -40px;
		z-index: -1;
		pointer-events: none;
		will-change: transform;
		opacity: 0.65;
	}

	/* Fixed full screen mode */
	.background-grid:not(.is-local) {
		position: fixed;
		width: calc(100dvw + 40px);
		height: calc(100dvh + 40px);
	}

	/* Local relative box mode */
	.background-grid.is-local {
		position: absolute;
		right: -40px;
		bottom: -40px;
		width: auto;
		height: auto;
	}

	/* Patterns styling */
	.pattern-grid {
		background-size: 40px 40px;
		background-image:
			linear-gradient(to right, var(--grid-color) 1.5px, transparent 1.5px),
			linear-gradient(to bottom, var(--grid-color) 1.5px, transparent 1.5px);
	}

	.pattern-dots {
		background-size: 24px 24px;
		background-image: radial-gradient(var(--grid-color) 2px, transparent 2px);
	}

	.pattern-diagonal {
		background-size: 40px 40px;
		background-image:
			linear-gradient(
				45deg,
				transparent 48%,
				var(--grid-color) 48%,
				var(--grid-color) 52%,
				transparent 52%
			),
			linear-gradient(
				-45deg,
				transparent 48%,
				var(--grid-color) 48%,
				var(--grid-color) 52%,
				transparent 52%
			);
	}

	.pattern-lines {
		background-size: 40px 40px;
		background-image: linear-gradient(to right, var(--grid-color) 1.5px, transparent 1.5px);
	}

	.pattern-horizontal {
		background-size: 40px 40px;
		background-image: linear-gradient(to bottom, var(--grid-color) 1.5px, transparent 1.5px);
	}

	/* Animation toggling and directions mapping using GPU translation */
	.is-animated {
		animation-duration: 12s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	/* Grid, Diagonal, Lines & Horizontal pattern sizing cycle is 40px */
	.pattern-grid.is-animated.direction-up,
	.pattern-diagonal.is-animated.direction-up,
	.pattern-lines.is-animated.direction-up,
	.pattern-horizontal.is-animated.direction-up {
		animation-name: scrollUp40;
	}
	.pattern-grid.is-animated.direction-down,
	.pattern-diagonal.is-animated.direction-down,
	.pattern-lines.is-animated.direction-down,
	.pattern-horizontal.is-animated.direction-down {
		animation-name: scrollDown40;
	}
	.pattern-grid.is-animated.direction-left,
	.pattern-diagonal.is-animated.direction-left,
	.pattern-lines.is-animated.direction-left,
	.pattern-horizontal.is-animated.direction-left {
		animation-name: scrollLeft40;
	}
	.pattern-grid.is-animated.direction-right,
	.pattern-diagonal.is-animated.direction-right,
	.pattern-lines.is-animated.direction-right,
	.pattern-horizontal.is-animated.direction-right {
		animation-name: scrollRight40;
	}
	.pattern-grid.is-animated.direction-diagonal,
	.pattern-diagonal.is-animated.direction-diagonal,
	.pattern-lines.is-animated.direction-diagonal,
	.pattern-horizontal.is-animated.direction-diagonal {
		animation-name: scrollDiag40;
	}
	.pattern-grid.is-animated.direction-diagonal-reverse,
	.pattern-diagonal.is-animated.direction-diagonal-reverse,
	.pattern-lines.is-animated.direction-diagonal-reverse,
	.pattern-horizontal.is-animated.direction-diagonal-reverse {
		animation-name: scrollDiagRev40;
	}

	/* Dots pattern sizing cycle is 24px */
	.pattern-dots.is-animated.direction-up {
		animation-name: scrollUp24;
	}
	.pattern-dots.is-animated.direction-down {
		animation-name: scrollDown24;
	}
	.pattern-dots.is-animated.direction-left {
		animation-name: scrollLeft24;
	}
	.pattern-dots.is-animated.direction-right {
		animation-name: scrollRight24;
	}
	.pattern-dots.is-animated.direction-diagonal {
		animation-name: scrollDiag24;
	}
	.pattern-dots.is-animated.direction-diagonal-reverse {
		animation-name: scrollDiagRev24;
	}

	/* Keyframes for 40px cycle */
	@keyframes scrollUp40 {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-40px);
		}
	}
	@keyframes scrollDown40 {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(40px);
		}
	}
	@keyframes scrollLeft40 {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-40px);
		}
	}
	@keyframes scrollRight40 {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(40px);
		}
	}
	@keyframes scrollDiag40 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(40px, 40px);
		}
	}
	@keyframes scrollDiagRev40 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(-40px, -40px);
		}
	}

	/* Keyframes for 24px cycle */
	@keyframes scrollUp24 {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-24px);
		}
	}
	@keyframes scrollDown24 {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(24px);
		}
	}
	@keyframes scrollLeft24 {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-24px);
		}
	}
	@keyframes scrollRight24 {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(24px);
		}
	}
	@keyframes scrollDiag24 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(24px, 24px);
		}
	}
	@keyframes scrollDiagRev24 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(-24px, -24px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.background-grid {
			animation: none !important;
		}
	}
</style>
