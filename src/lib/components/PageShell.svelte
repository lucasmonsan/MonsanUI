<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolveMaxWidth, resolvePadding } from '$lib/utils/layout.js';

	interface Props {
		children: Snippet;
		maxWidth?: MaxWidthPreset;
		padding?: PaddingPreset;
		gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
		height?: 'auto' | 'fill' | 'viewport';
		overflow?: 'visible' | 'hidden';
		animate?: boolean;
		tag?: 'div' | 'main' | 'section';
	}

	let {
		children,
		maxWidth = 'full',
		padding = 'document',
		gap = 'md',
		height = 'fill',
		overflow = 'hidden',
		animate = true,
		tag = 'main'
	}: Props = $props();

	let resolvedMaxWidth = $derived(resolveMaxWidth(maxWidth));
	let resolvedPadding = $derived(resolvePadding(padding));
</script>

<svelte:element
	this={tag}
	class="monsan-page-shell gap-{gap} height-{height} overflow-{overflow}"
	class:is-animated={animate}
	style:--page-shell-max-width={resolvedMaxWidth}
	style:--page-shell-padding={resolvedPadding}
>
	{@render children()}
</svelte:element>

<style>
	.monsan-page-shell {
		width: 100%;
		max-width: var(--page-shell-max-width);
		margin: 0 auto;
		padding: var(--page-shell-padding);
		display: flex;
		flex-direction: column;
		min-width: 0;
		box-sizing: border-box;
		position: relative;
	}

	.height-auto {
		min-height: 0;
	}

	.height-fill {
		flex: 1;
		height: 100%;
		min-height: 0;
	}

	.height-viewport {
		height: 100dvh;
		min-height: 0;
	}

	.overflow-visible {
		overflow: visible;
	}

	.overflow-hidden {
		overflow: hidden;
	}

	.gap-none {
		gap: 0;
	}

	.gap-sm {
		gap: var(--space-sm);
	}

	.gap-md {
		gap: var(--space-md);
	}

	.gap-lg {
		gap: var(--space-lg);
	}

	.gap-xl {
		gap: var(--space-xl);
	}

	.is-animated {
		animation: monsan-page-shell-enter 0.28s var(--ease-out) both;
	}

	@keyframes monsan-page-shell-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-sm));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.is-animated {
			animation: none;
		}
	}
</style>
