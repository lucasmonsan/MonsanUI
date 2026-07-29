<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		header?: Snippet;
		top?: Snippet;
		bottom?: Snippet;
		footer?: Snippet;
		contentId?: string;
		resetKey?: string | number | boolean | null;
		fullHeight?: boolean;
		showTop?: boolean;
		viewportScroll?: boolean;
	}

	let {
		children,
		header,
		top,
		bottom,
		footer,
		contentId = 'main-content',
		resetKey = null,
		fullHeight = false,
		showTop = true,
		viewportScroll = false
	}: Props = $props();

	let scrollEl = $state<HTMLElement>();
	let contentEl = $state<HTMLElement>();
	let hasOverflowTop = $state(false);
	let hasOverflowBottom = $state(false);

	function getScrollableContentBounds() {
		if (!scrollEl || !contentEl) {
			return null;
		}

		const children = Array.from(contentEl.children).filter(
			(child): child is HTMLElement => child instanceof HTMLElement
		);

		if (children.length === 0) {
			return null;
		}

		const scrollRect = scrollEl.getBoundingClientRect();
		let top = Number.POSITIVE_INFINITY;
		let bottom = Number.NEGATIVE_INFINITY;

		for (const child of children) {
			const childRect = child.getBoundingClientRect();
			top = Math.min(top, childRect.top - scrollRect.top + scrollEl.scrollTop);
			bottom = Math.max(bottom, childRect.bottom - scrollRect.top + scrollEl.scrollTop);
		}

		return { top, bottom };
	}

	function updateOverflowFade() {
		if (!scrollEl) {
			hasOverflowTop = false;
			hasOverflowBottom = false;
			return;
		}

		const threshold = 2;
		const contentBounds = getScrollableContentBounds();

		if (contentBounds) {
			const contentHeight = contentBounds.bottom - contentBounds.top;
			const hasMeaningfulOverflow = contentHeight > scrollEl.clientHeight + threshold;

			if (!hasMeaningfulOverflow) {
				hasOverflowTop = false;
				hasOverflowBottom = false;
				return;
			}
		}

		if (!contentBounds) {
			hasOverflowTop = scrollEl.scrollTop > threshold;
			hasOverflowBottom =
				scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - threshold;
			return;
		}

		hasOverflowTop = contentBounds.top < scrollEl.scrollTop - threshold;
		hasOverflowBottom =
			contentBounds.bottom > scrollEl.scrollTop + scrollEl.clientHeight + threshold;
	}

	onMount(() => {
		void tick().then(updateOverflowFade);

		const resizeObserver = new ResizeObserver(updateOverflowFade);
		const mutationObserver = new MutationObserver(updateOverflowFade);

		if (scrollEl) {
			resizeObserver.observe(scrollEl);
			mutationObserver.observe(scrollEl, { childList: true, subtree: true });
		}

		if (contentEl) {
			resizeObserver.observe(contentEl);
		}

		window.addEventListener('resize', updateOverflowFade);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener('resize', updateOverflowFade);
		};
	});

	$effect(() => {
		void tick().then(updateOverflowFade);
	});

	$effect(() => {
		const key = resetKey;
		if (key === null) {
			return;
		}

		void tick().then(() => {
			scrollEl?.scrollTo({ top: 0, left: 0 });
			updateOverflowFade();
		});
	});
</script>

<main class="monsan-app-shell {viewportScroll ? 'viewport-scroll' : ''}">
	{#if header}
		<header class="app-shell-header">
			<div class="app-shell-header-content">
				{@render header()}
			</div>
		</header>
	{/if}

	{#if top && showTop}
		<div class="app-shell-top">
			<div class="app-shell-top-content">
				{@render top()}
			</div>
		</div>
	{/if}

	<div
		id={contentId}
		bind:this={scrollEl}
		class="app-shell-scroll"
		class:has-overflow-top={hasOverflowTop}
		class:has-overflow-bottom={hasOverflowBottom}
		tabindex="-1"
		onscroll={updateOverflowFade}
	>
		<div bind:this={contentEl} class="app-shell-content" class:full-height={fullHeight}>
			{@render children()}
		</div>
	</div>

	{#if bottom}
		<div class="app-shell-bottom">
			{@render bottom()}
		</div>
	{/if}

	{#if footer}
		<footer class="app-shell-footer">
			{@render footer()}
		</footer>
	{/if}
</main>

<style>
	.monsan-app-shell {
		width: 100%;
		max-width: var(--container-max-width);
		height: 100%;
		min-height: 0;
		max-height: 100%;
		margin: 0 auto;
		padding: max(var(--space-md), env(safe-area-inset-top))
			max(var(--space-md), env(safe-area-inset-right))
			max(var(--space-md), env(safe-area-inset-bottom))
			max(var(--space-md), env(safe-area-inset-left));
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		box-sizing: border-box;
		overflow: hidden;
		min-width: 0;
		position: relative;
		z-index: 0;
	}

	.app-shell-header {
		flex: 0 0 auto;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		position: relative;
		z-index: 60;
	}

	.app-shell-top {
		flex: 0 0 auto;
		width: 100%;
		min-width: 0;
		padding-bottom: var(--space-sm);
		box-sizing: border-box;
		position: relative;
		z-index: 50;
	}

	.app-shell-bottom,
	.app-shell-footer {
		flex: 0 0 auto;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.app-shell-top-content > :global(* + *),
	.app-shell-bottom > :global(* + *) {
		padding-top: var(--space-sm);
		border-top: var(--border-width) solid var(--border-color);
	}

	.app-shell-header.app-shell-header :global(.monsan-app-header.with-border .app-header-inner) {
		border-bottom: 0;
		box-shadow: none;
	}

	.app-shell-top,
	.app-shell-header-content,
	.app-shell-top-content,
	.app-shell-bottom {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.app-shell-header-content,
	.app-shell-top-content {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.app-shell-header-content {
		border-bottom: var(--border-width) solid var(--border-color);
	}

	.app-shell-scroll {
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

	.app-shell-scroll::-webkit-scrollbar {
		display: none;
	}

	.full-height {
		height: 100%;
	}

	.app-shell-content {
		width: 100%;
		min-width: 0;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		box-sizing: border-box;
		position: relative;
	}

	.viewport-scroll {
		max-width: none;
	}

	.viewport-scroll .app-shell-content {
		width: min(100%, var(--container-max-width));
		margin-inline: auto;
	}

	.viewport-scroll .app-shell-header-content,
	.viewport-scroll .app-shell-top-content {
		width: min(100%, var(--container-max-width));
		margin-inline: auto;
	}

	.app-shell-content::before,
	.app-shell-content::after {
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

	.app-shell-content::before {
		top: 0;
		margin-bottom: calc((var(--space-xl) + var(--space-md)) * -1);
		border-top: var(--border-width) solid var(--border-color);
		background: linear-gradient(to bottom, var(--bg-primary), transparent);
	}

	.app-shell-content::after {
		bottom: 0;
		margin-top: calc((var(--space-xl) + var(--space-md)) * -1);
		border-bottom: var(--border-width) solid var(--border-color);
		background: linear-gradient(to top, var(--bg-primary), transparent);
	}

	.has-overflow-top .app-shell-content::before,
	.has-overflow-bottom .app-shell-content::after {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.app-shell-content::before,
		.app-shell-content::after {
			transition: none;
		}
	}
</style>
