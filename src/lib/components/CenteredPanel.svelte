<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';

	interface Props {
		children: Snippet;
		maxWidth?: string;
		align?: 'center' | 'start';
		animate?: boolean;
	}

	let {
		children,
		maxWidth = 'var(--centered-panel-max-width, 512px)',
		align = 'center',
		animate = true
	}: Props = $props();
</script>

<div class="monsan-centered-panel" class:is-animated={animate}>
	<Panel tag="section" {maxWidth} class="centered-panel-surface">
		<div class="centered-panel-content align-{align}">
			{@render children()}
		</div>
	</Panel>
</div>

<style>
	.monsan-centered-panel {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--space-lg);
		width: 100%;
		box-sizing: border-box;
	}

	.monsan-centered-panel :global(.centered-panel-surface) {
		overflow: visible;
	}

	.centered-panel-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	.align-center {
		align-items: center;
		text-align: center;
	}

	.align-start {
		align-items: stretch;
		text-align: start;
	}

	.is-animated {
		animation: monsan-centered-panel-enter 0.32s var(--ease-out) both;
	}

	@keyframes monsan-centered-panel-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-md)) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.is-animated {
			animation: none;
		}
	}
</style>
