<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolveMaxWidth, resolvePadding } from '$lib/utils/layout.js';

	interface Props {
		children?: Snippet;
		maxWidth?: MaxWidthPreset;
		padding?: PaddingPreset;
		animate?: boolean;
	}

	let {
		children,
		maxWidth = 'var(--container-max-width)',
		padding = '0',
		animate = true
	}: Props = $props();

	let resolvedMaxWidth = $derived(resolveMaxWidth(maxWidth));
	let resolvedPadding = $derived(resolvePadding(padding));

	onMount(() => {
		console.warn('[MonsanUI] <PageContainer> is deprecated. Please migrate to <AppShell> instead.');
	});
</script>

<div
	class="monsan-page-container"
	class:is-animated={animate}
	style:--page-container-max-width={resolvedMaxWidth}
	style:--page-container-padding={resolvedPadding}
>
	{@render children?.()}
</div>

<style>
	.monsan-page-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: var(--page-container-max-width);
		padding: var(--page-container-padding);
		margin: 0 auto;
		width: 100%;
		position: relative;
	}

	.is-animated {
		animation: monsan-page-enter 0.28s var(--ease-out) both;
	}

	@keyframes monsan-page-enter {
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
