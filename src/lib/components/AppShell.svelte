<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import RotateCw from './icons/RotateCw.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		children: Snippet;
		header?: Snippet;
		top?: Snippet;
		bottom?: Snippet;
		footer?: Snippet;
		floatingAction?: Snippet;
		status?: Snippet;
		contentId?: string;
		resetKey?: string | number | boolean | null;
		fullHeight?: boolean;
		showTop?: boolean;
		viewportScroll?: boolean;
		showScrollFades?: boolean;
		/** Optional async handler invoked on pull-to-refresh. */
		onrefresh?: () => Promise<void> | void;
		/** Minimum ms between refreshes to protect against DB/network storms. Defaults to 10_000 (10s). */
		refreshCooldownMs?: number;
		/** Pull distance threshold in pixels before refresh triggers. Defaults to 80. */
		refreshThreshold?: number;
		/** Optional handler for horizontal swipe left (next item). */
		onswipeleft?: () => void;
		/** Optional handler for horizontal swipe right (previous item). */
		onswiperight?: () => void;
		/** Whether swipe gestures are disabled. Defaults to false. */
		swipeDisabled?: boolean;
	}

	let {
		children,
		header,
		top,
		bottom,
		footer,
		floatingAction,
		status,
		contentId = 'main-content',
		resetKey = null,
		fullHeight = false,
		showTop = true,
		viewportScroll = false,
		showScrollFades = true,
		onrefresh,
		refreshCooldownMs = 10_000,
		refreshThreshold = 80,
		onswipeleft,
		onswiperight,
		swipeDisabled = false
	}: Props = $props();

	let scrollEl = $state<HTMLElement>();
	let contentEl = $state<HTMLElement>();
	let hasOverflowTop = $state(false);
	let hasOverflowBottom = $state(false);

	let touchStartX = 0;
	let touchStartY = 0;
	let initialScrollTop = 0;
	let isTrackingTouch = false;
	let isPulling = $state(false);
	let pullDistance = $state(0);
	let isRefreshing = $state(false);
	let cooldownActive = $state(false);
	let lastRefreshTimestamp = 0;
	let gestureIntent: 'undecided' | 'vertical-scroll' | 'horizontal-swipe' | 'pull-down' =
		'undecided';

	function targetsInteractiveElement(target: EventTarget | null): boolean {
		return (
			target instanceof Element &&
			Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
		);
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1 || isRefreshing) return;
		if (targetsInteractiveElement(e.target)) return;

		const touch = e.touches[0];
		if (!touch) return;

		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		initialScrollTop = scrollEl ? scrollEl.scrollTop : 0;
		isTrackingTouch = true;
		gestureIntent = 'undecided';
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isTrackingTouch) return;

		const touch = e.touches[0];
		if (!touch) return;

		const deltaX = touch.clientX - touchStartX;
		const deltaY = touch.clientY - touchStartY;

		if (gestureIntent === 'undecided') {
			if (Math.hypot(deltaX, deltaY) < 10) return;

			if (Math.abs(deltaY) >= Math.abs(deltaX)) {
				if (deltaY > 0 && initialScrollTop <= 0 && Boolean(onrefresh)) {
					gestureIntent = 'pull-down';
					isPulling = true;
				} else {
					gestureIntent = 'vertical-scroll';
					isTrackingTouch = false;
				}
			} else {
				if ((onswipeleft || onswiperight) && !swipeDisabled) {
					gestureIntent = 'horizontal-swipe';
				} else {
					gestureIntent = 'vertical-scroll';
					isTrackingTouch = false;
				}
			}
		}

		if (gestureIntent === 'pull-down') {
			if (scrollEl && scrollEl.scrollTop > 0) {
				isPulling = false;
				pullDistance = 0;
				gestureIntent = 'vertical-scroll';
				isTrackingTouch = false;
				return;
			}

			if (e.cancelable) {
				e.preventDefault();
			}

			const rawPull = deltaY * 0.5;
			const maxPull = refreshThreshold * 1.5;
			pullDistance = Math.min(maxPull, Math.max(0, rawPull));
		}
	}

	async function handleTouchEnd(e: TouchEvent) {
		if (!isTrackingTouch) return;
		isTrackingTouch = false;

		if (gestureIntent === 'pull-down') {
			isPulling = false;

			if (pullDistance >= refreshThreshold && Boolean(onrefresh)) {
				const now = Date.now();
				if (now - lastRefreshTimestamp < refreshCooldownMs) {
					cooldownActive = true;
					pullDistance = 44;
					setTimeout(() => {
						cooldownActive = false;
						pullDistance = 0;
					}, 1200);
				} else {
					isRefreshing = true;
					pullDistance = 44;
					lastRefreshTimestamp = now;
					try {
						await onrefresh?.();
					} finally {
						isRefreshing = false;
						pullDistance = 0;
					}
				}
			} else {
				pullDistance = 0;
			}
		} else if (gestureIntent === 'horizontal-swipe') {
			const touch = e.changedTouches[0];
			if (touch) {
				const finalDeltaX = touch.clientX - touchStartX;
				const finalDeltaY = touch.clientY - touchStartY;
				if (Math.abs(finalDeltaX) >= 50 && Math.abs(finalDeltaX) > Math.abs(finalDeltaY) * 1.35) {
					if (finalDeltaX > 0) {
						onswiperight?.();
					} else {
						onswipeleft?.();
					}
				}
			}
		}

		gestureIntent = 'undecided';
	}

	function handleTouchCancel() {
		isTrackingTouch = false;
		isPulling = false;
		pullDistance = 0;
		gestureIntent = 'undecided';
	}

	function updateOverflowFade() {
		if (!scrollEl) {
			hasOverflowTop = false;
			hasOverflowBottom = false;
			return;
		}

		const threshold = 2;
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

			scrollEl.addEventListener('touchstart', handleTouchStart, { passive: true });
			scrollEl.addEventListener('touchmove', handleTouchMove, { passive: false });
			scrollEl.addEventListener('touchend', handleTouchEnd, { passive: true });
			scrollEl.addEventListener('touchcancel', handleTouchCancel, { passive: true });
		}

		if (contentEl) {
			resizeObserver.observe(contentEl);
		}

		window.addEventListener('resize', updateOverflowFade);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener('resize', updateOverflowFade);
			if (scrollEl) {
				scrollEl.removeEventListener('touchstart', handleTouchStart);
				scrollEl.removeEventListener('touchmove', handleTouchMove);
				scrollEl.removeEventListener('touchend', handleTouchEnd);
				scrollEl.removeEventListener('touchcancel', handleTouchCancel);
			}
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

<main
	class="monsan-app-shell {viewportScroll ? 'viewport-scroll' : ''}"
	class:has-floating-action={Boolean(floatingAction)}
	class:has-status={Boolean(status)}
>
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
		class:has-overflow-top={showScrollFades && hasOverflowTop}
		class:has-overflow-bottom={showScrollFades && hasOverflowBottom}
		tabindex="-1"
		onscroll={updateOverflowFade}
	>
		<div
			class="app-shell-scroll-top-edge"
			class:is-visible={showScrollFades && hasOverflowTop}
			aria-hidden="true"
		></div>
		{#if onrefresh}
			<div
				class="app-shell-pull-refresh"
				class:is-active={isPulling}
				class:is-ready={pullDistance >= refreshThreshold}
				class:is-refreshing={isRefreshing}
				style:height="{pullDistance}px"
				aria-hidden="true"
			>
				<div class="pull-refresh-indicator">
					{#if isRefreshing}
						<div class="pull-refresh-spinner"></div>
						<span class="pull-refresh-text">{i18n.t('pullToRefresh.refreshing')}</span>
					{:else if cooldownActive}
						<span class="pull-refresh-text">{i18n.t('pullToRefresh.upToDate')}</span>
					{:else}
						<div
							class="pull-refresh-icon"
							class:ready={pullDistance >= refreshThreshold}
							style:transform="rotate({Math.min(360, (pullDistance / refreshThreshold) * 360)}deg)"
						>
							<RotateCw size={16} />
						</div>
						<span class="pull-refresh-text">
							{pullDistance >= refreshThreshold
								? i18n.t('pullToRefresh.release')
								: i18n.t('pullToRefresh.pull')}
						</span>
					{/if}
				</div>
			</div>
		{/if}
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

	{#if floatingAction || status}
		<div class="app-shell-bottom-dock">
			{#if floatingAction}
				<div class="app-shell-floating-action">
					{@render floatingAction()}
				</div>
			{/if}
			{#if status}
				<div class="app-shell-status" role="status">
					{@render status()}
				</div>
			{/if}
		</div>
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
		overflow: visible;
	}

	.app-shell-bottom,
	.app-shell-footer {
		flex: 0 0 auto;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.app-shell-bottom-dock {
		position: absolute;
		inset-inline: 0;
		bottom: max(var(--space-md), env(safe-area-inset-bottom));
		z-index: 40;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		box-sizing: border-box;
		pointer-events: none;
	}

	.monsan-app-shell.has-status .app-shell-bottom-dock {
		bottom: 0;
	}

	.app-shell-floating-action {
		display: flex;
		justify-content: center;
		width: 100%;
		min-width: 0;
		padding-inline: var(--space-md);
		box-sizing: border-box;
		pointer-events: auto;
	}

	.app-shell-status {
		align-self: stretch;
		box-sizing: border-box;
		min-height: calc(var(--control-height) * 0.55);
		padding: var(--space-xxs) var(--space-sm) max(var(--space-xxs), env(safe-area-inset-bottom));
		border-top: var(--border-width) solid var(--border-color);
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.monsan-app-shell.has-floating-action .app-shell-content {
		padding-bottom: calc(var(--control-height) * 1.1 + var(--space-md));
	}

	.monsan-app-shell.has-floating-action.has-status .app-shell-content {
		padding-bottom: calc(
			var(--control-height) * 1.55 + var(--space-md) + env(safe-area-inset-bottom)
		);
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

	.app-shell-scroll-top-edge {
		position: sticky;
		top: 0;
		z-index: 5;
		display: block;
		height: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.18s var(--ease-out);
	}

	.app-shell-scroll-top-edge::before {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: var(--border-width);
		background: var(--border-color);
		content: '';
	}

	.app-shell-scroll-top-edge.is-visible {
		opacity: 1;
	}

	/*
	 * Opt-in workspace contract: descendants that use height: 100% (for example
	 * SplitPane and PortugolRunner) need a real containing height. Keep this
	 * out of the default content path so ordinary pages can keep their natural
	 * vertical flow and card shadows.
	 */
	.app-shell-content.full-height {
		flex: 1 1 auto;
		min-height: 0;
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
		padding-bottom: var(--space-md);
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

	.app-shell-pull-refresh {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		overflow: hidden;
		transition: height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		pointer-events: none;
		box-sizing: border-box;
	}

	.app-shell-pull-refresh.is-active {
		transition: none;
	}

	.pull-refresh-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-xxs) var(--space-sm);
		border-radius: var(--radius-full, 9999px);
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-sm);
		color: var(--text-primary);
		min-height: 28px;
		box-sizing: border-box;
		margin-block: var(--space-xxs);
	}

	.pull-refresh-spinner {
		width: 14px;
		height: 14px;
		background-color: var(--accent-primary);
		border: var(--border-width) solid var(--border-color);
		animation: brutalistRotate 1s infinite steps(8);
	}

	.pull-refresh-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.05s linear;
		color: var(--text-secondary);
	}

	.pull-refresh-icon.ready {
		color: var(--accent-primary);
	}

	.pull-refresh-text {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	@keyframes brutalistRotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.app-shell-scroll-top-edge,
		.app-shell-content::before,
		.app-shell-content::after,
		.app-shell-pull-refresh {
			transition: none;
		}

		.pull-refresh-spinner {
			animation: none;
		}
	}
</style>
