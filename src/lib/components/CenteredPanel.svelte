<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolvePadding } from '$lib/utils/layout.js';
	import Panel from './Panel.svelte';

	interface Props {
		children: Snippet;
		maxWidth?: MaxWidthPreset;
		align?: 'center' | 'start';
		animate?: boolean;
		fullHeight?: boolean;
		padding?: PaddingPreset;
	}

	let {
		children,
		maxWidth = 'var(--centered-panel-max-width, 512px)',
		align = 'center',
		animate = true,
		fullHeight = true,
		padding = 'none'
	}: Props = $props();

	let resolvedPadding = $derived(resolvePadding(padding));
</script>

<div
	class="monsan-centered-panel"
	class:is-animated={animate}
	class:is-full-height={fullHeight}
	style:padding={resolvedPadding}
>
	<Panel tag="section" {maxWidth}>
		<div class="centered-panel-content align-{align}">
			{@render children()}
		</div>
	</Panel>
</div>

<style>
	.monsan-centered-panel {
		display: flex;
		align-items: safe center;
		justify-content: center;
		width: 100%;
		min-height: 0;
		box-sizing: border-box;
		position: relative;
		z-index: 10;
		min-width: 0;
	}

	.is-full-height {
		flex: 1 1 auto;
		height: 100%;
	}

	.monsan-centered-panel :global(.centered-panel-surface) {
		overflow: visible;
	}

	.centered-panel-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
		min-width: 0;
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
