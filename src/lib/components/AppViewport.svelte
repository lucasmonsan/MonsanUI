<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolveMaxWidth, resolvePadding } from '$lib/utils/layout.js';

	interface Props {
		children: Snippet;
		header: Snippet;
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
		contentFade?: 'none' | 'top' | 'bottom' | 'both';
	}

	let {
		children,
		header,
		toolbar,
		footer,
		padding = 'app-authenticated',
		gap = 'md',
		toolbarGap = 'sm',
		contentGap = 'md',
		headerMaxWidth = 'content',
		contentMaxWidth = 'content',
		toolbarMaxWidth = 'content',
		footerMaxWidth = 'content',
		contentFade = 'none'
	}: Props = $props();

	let resolvedPadding = $derived(resolvePadding(padding));
	let resolvedHeaderMaxWidth = $derived(resolveMaxWidth(headerMaxWidth));
	let resolvedContentMaxWidth = $derived(resolveMaxWidth(contentMaxWidth));
	let resolvedToolbarMaxWidth = $derived(resolveMaxWidth(toolbarMaxWidth));
	let resolvedFooterMaxWidth = $derived(resolveMaxWidth(footerMaxWidth));
</script>

<section
	class="monsan-app-viewport gap-{gap}"
	style="--app-viewport-padding: {resolvedPadding}; --app-viewport-header-max-width: {resolvedHeaderMaxWidth}; --app-viewport-content-max-width: {resolvedContentMaxWidth}; --app-viewport-toolbar-max-width: {resolvedToolbarMaxWidth}; --app-viewport-footer-max-width: {resolvedFooterMaxWidth};"
>
	<div class="app-viewport-fixed toolbar-gap-{toolbar ? toolbarGap : 'none'}">
		<div class="app-viewport-header">
			{@render header()}
		</div>
		{#if toolbar}
			<div class="app-viewport-toolbar">
				{@render toolbar()}
			</div>
		{/if}
	</div>

	<div class="app-viewport-scroll content-gap-{contentGap} fade-{contentFade}">
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
		gap: 0;
	}

	.content-gap-sm .app-viewport-content {
		gap: var(--space-sm);
	}

	.content-gap-md .app-viewport-content {
		gap: var(--space-md);
	}

	.content-gap-lg .app-viewport-content {
		gap: var(--space-lg);
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
</style>
