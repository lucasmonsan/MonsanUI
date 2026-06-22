<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolveMaxWidth, resolvePadding } from '$lib/utils/layout.js';

	interface Props {
		children: Snippet;
		header?: Snippet;
		toolbar?: Snippet;
		footer?: Snippet;
		padding?: PaddingPreset;
		gap?: 'none' | 'sm' | 'md' | 'lg';
		toolbarGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
		contentGap?: 'none' | 'sm' | 'md' | 'lg';
		headerMaxWidth?: MaxWidthPreset;
		contentMaxWidth?: MaxWidthPreset;
		toolbarMaxWidth?: MaxWidthPreset;
		footerMaxWidth?: MaxWidthPreset;
		contentFade?: 'none' | 'top' | 'bottom' | 'both' | 'auto';
		contentLayout?: 'default' | 'center';
		animate?: boolean;
	}

	let {
		children,
		header,
		toolbar,
		footer,
		padding = 'app',
		gap = 'md',
		toolbarGap = 'sm',
		contentGap = 'md',
		headerMaxWidth = 'content',
		contentMaxWidth = 'content',
		toolbarMaxWidth = 'content',
		footerMaxWidth = 'content',
		contentFade = 'auto',
		contentLayout = 'default',
		animate = true
	}: Props = $props();

	let resolvedPadding = $derived(resolvePadding(padding));
	let resolvedHeaderMaxWidth = $derived(resolveMaxWidth(headerMaxWidth));
	let resolvedContentMaxWidth = $derived(resolveMaxWidth(contentMaxWidth));
	let resolvedToolbarMaxWidth = $derived(resolveMaxWidth(toolbarMaxWidth));
	let resolvedFooterMaxWidth = $derived(resolveMaxWidth(footerMaxWidth));

	let scrollEl = $state<HTMLElement>();
	let hasOverflowTop = $state(false);
	let hasOverflowBottom = $state(false);

	function updateOverflowFade() {
		if (!scrollEl || contentFade !== 'auto') {
			hasOverflowTop = false;
			hasOverflowBottom = false;
			return;
		}

		const threshold = 1;
		hasOverflowTop = scrollEl.scrollTop > threshold;
		hasOverflowBottom =
			scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - threshold;
	}

	onMount(() => {
		void tick().then(updateOverflowFade);

		const resizeObserver = new ResizeObserver(updateOverflowFade);
		const mutationObserver = new MutationObserver(updateOverflowFade);

		if (scrollEl) {
			resizeObserver.observe(scrollEl);
			mutationObserver.observe(scrollEl, { childList: true, subtree: true });
		}

		window.addEventListener('resize', updateOverflowFade);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener('resize', updateOverflowFade);
		};
	});

	$effect(() => {
		if (contentFade !== 'auto') {
			hasOverflowTop = false;
			hasOverflowBottom = false;
		}
		void tick().then(updateOverflowFade);
	});
</script>

<section
	class="monsan-app-viewport gap-{gap}"
	class:is-animated={animate}
	style:--app-viewport-padding={resolvedPadding}
	style:--app-viewport-header-max-width={resolvedHeaderMaxWidth}
	style:--app-viewport-content-max-width={resolvedContentMaxWidth}
	style:--app-viewport-toolbar-max-width={resolvedToolbarMaxWidth}
	style:--app-viewport-footer-max-width={resolvedFooterMaxWidth}
>
	{#if header || toolbar}
		<div class="app-viewport-fixed toolbar-gap-{toolbar ? toolbarGap : 'none'}">
			{#if header}
				<div class="app-viewport-header">
					{@render header()}
				</div>
			{/if}

			{#if toolbar}
				<div class="app-viewport-toolbar">
					{@render toolbar()}
				</div>
			{/if}
		</div>
	{/if}

	<div
		bind:this={scrollEl}
		class="app-viewport-scroll content-gap-{contentGap} fade-{contentFade} content-layout-{contentLayout}"
		class:has-overflow-top={hasOverflowTop}
		class:has-overflow-bottom={hasOverflowBottom}
		onscroll={updateOverflowFade}
	>
		<div class="app-viewport-content">
			{@render children()}
		</div>
	</div>

	{#if footer}
		<div class="app-viewport-footer">
			{@render footer()}
		</div>
	{/if}
</section>

<style>
	.monsan-app-viewport {
		width: 100%;
		min-height: 100dvh;
		height: 100dvh;
		max-height: 100dvh;
		padding: var(--app-viewport-padding);
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		box-sizing: border-box;
		overflow: hidden;
	}

	.app-viewport-fixed {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		min-width: 0;
		position: relative;
		z-index: 20;
	}

	.app-viewport-header {
		width: 100%;
		max-width: var(--app-viewport-header-max-width);
		margin: 0 auto;
		box-sizing: border-box;
		flex: 0 0 auto;
	}

	.toolbar-gap-none {
		gap: 0;
	}

	.toolbar-gap-xs {
		gap: var(--space-xs);
	}

	.toolbar-gap-sm {
		gap: var(--space-sm);
	}

	.toolbar-gap-md {
		gap: var(--space-md);
	}

	.toolbar-gap-lg {
		gap: var(--space-lg);
	}

	.app-viewport-toolbar {
		width: 100%;
		max-width: var(--app-viewport-toolbar-max-width);
		margin: 0 auto;
		box-sizing: border-box;
		flex: 0 0 auto;
	}

	.app-viewport-scroll {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
		width: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
		box-sizing: border-box;
		position: relative;
		z-index: 0;
	}

	.app-viewport-scroll::-webkit-scrollbar {
		display: none;
	}

	.app-viewport-content {
		width: 100%;
		max-width: var(--app-viewport-content-max-width);
		min-height: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		min-width: 0;
		box-sizing: border-box;
	}

	.app-viewport-footer {
		width: 100%;
		max-width: var(--app-viewport-footer-max-width);
		margin: 0 auto;
		box-sizing: border-box;
		flex: 0 0 auto;
		position: relative;
		z-index: 10;
	}

	.is-animated .app-viewport-fixed {
		animation: monsan-app-viewport-fixed-enter 0.22s var(--ease-out) both;
	}

	.is-animated .app-viewport-scroll {
		animation: monsan-app-viewport-content-enter 0.26s var(--ease-out) 0.04s both;
	}

	.is-animated .app-viewport-footer {
		animation: monsan-app-viewport-footer-enter 0.22s var(--ease-out) 0.08s both;
	}

	@keyframes monsan-app-viewport-fixed-enter {
		from {
			opacity: 0;
			transform: translateY(calc(var(--space-xs) * -1));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes monsan-app-viewport-content-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-sm));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes monsan-app-viewport-footer-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-xs));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.content-gap-none .app-viewport-content {
		--app-viewport-content-gap: 0px;
		gap: 0;
	}

	.content-gap-sm .app-viewport-content {
		--app-viewport-content-gap: var(--space-sm);
		gap: var(--space-sm);
	}

	.content-gap-md .app-viewport-content {
		--app-viewport-content-gap: var(--space-md);
		gap: var(--space-md);
	}

	.content-gap-lg .app-viewport-content {
		--app-viewport-content-gap: var(--space-lg);
		gap: var(--space-lg);
	}

	.content-layout-center .app-viewport-content {
		align-items: center;
		justify-content: safe center;
	}

	.fade-top {
		mask-image: linear-gradient(to bottom, transparent 0, black var(--space-lg));
	}

	.fade-bottom {
		mask-image: linear-gradient(to bottom, black calc(100% - var(--space-lg)), transparent 100%);
	}

	.fade-both {
		mask-image: linear-gradient(
			to bottom,
			transparent 0,
			black var(--space-lg),
			black calc(100% - var(--space-lg)),
			transparent 100%
		);
	}

	.fade-auto .app-viewport-content::before,
	.fade-auto .app-viewport-content::after {
		content: '';
		position: sticky;
		left: 0;
		right: 0;
		z-index: 3;
		display: block;
		height: var(--space-xl);
		box-sizing: border-box;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.18s var(--ease-out);
	}

	.fade-auto .app-viewport-content::before {
		top: 0;
		margin-bottom: calc((var(--space-xl) + var(--app-viewport-content-gap, 0px)) * -1);
		border-top: var(--border-width) solid var(--border-color);
		background: linear-gradient(to bottom, var(--bg-primary), transparent);
	}

	.fade-auto .app-viewport-content::after {
		bottom: 0;
		margin-top: calc((var(--space-xl) + var(--app-viewport-content-gap, 0px)) * -1);
		border-bottom: var(--border-width) solid var(--border-color);
		background: linear-gradient(to top, var(--bg-primary), transparent);
	}

	.fade-auto.has-overflow-top .app-viewport-content::before,
	.fade-auto.has-overflow-bottom .app-viewport-content::after {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.is-animated .app-viewport-fixed,
		.is-animated .app-viewport-scroll,
		.is-animated .app-viewport-footer {
			animation: none;
		}
	}
</style>
