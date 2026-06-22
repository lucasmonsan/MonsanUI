<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: 'none' | 'sm' | 'md' | 'lg';
		scroll?: boolean;
		fade?: 'none' | 'top' | 'bottom' | 'both' | 'auto';
		padding?: 'none' | 'sm' | 'md';
	}

	let { children, gap = 'md', scroll = true, fade = 'auto', padding = 'none' }: Props = $props();

	let regionEl = $state<HTMLElement>();
	let hasOverflowTop = $state(false);
	let hasOverflowBottom = $state(false);

	function updateOverflowFade() {
		if (!regionEl || fade !== 'auto' || !scroll) {
			hasOverflowTop = false;
			hasOverflowBottom = false;
			return;
		}

		const threshold = 1;
		hasOverflowTop = regionEl.scrollTop > threshold;
		hasOverflowBottom =
			regionEl.scrollTop + regionEl.clientHeight < regionEl.scrollHeight - threshold;
	}

	onMount(() => {
		void tick().then(updateOverflowFade);

		const resizeObserver = new ResizeObserver(updateOverflowFade);
		const mutationObserver = new MutationObserver(updateOverflowFade);

		if (regionEl) {
			resizeObserver.observe(regionEl);
			mutationObserver.observe(regionEl, { childList: true, subtree: true });
		}

		window.addEventListener('resize', updateOverflowFade);

		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener('resize', updateOverflowFade);
		};
	});

	$effect(() => {
		if (fade !== 'auto') {
			hasOverflowTop = false;
			hasOverflowBottom = false;
		}
		void tick().then(updateOverflowFade);
	});
</script>

<section
	bind:this={regionEl}
	class="monsan-content-region gap-{gap} fade-{fade} padding-{padding}"
	class:is-scrollable={scroll}
	class:has-overflow-top={hasOverflowTop}
	class:has-overflow-bottom={hasOverflowBottom}
	onscroll={updateOverflowFade}
>
	{@render children()}
</section>

<style>
	.monsan-content-region {
		flex: 1;
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
		box-sizing: border-box;
		position: relative;
	}

	.is-scrollable {
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
	}

	.is-scrollable::-webkit-scrollbar {
		display: none;
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

	.padding-none {
		padding: 0;
	}

	.padding-sm {
		padding: var(--space-sm);
	}

	.padding-md {
		padding: var(--space-md);
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

	.fade-auto::before,
	.fade-auto::after {
		content: '';
		position: sticky;
		left: 0;
		right: 0;
		z-index: 3;
		display: block;
		height: var(--space-xl);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.18s var(--ease-out);
	}

	.fade-auto::before {
		top: 0;
		margin-bottom: calc(var(--space-xl) * -1);
		border-top: var(--border-width) solid var(--border-color);
		background: linear-gradient(to bottom, var(--bg-primary), transparent);
	}

	.fade-auto::after {
		bottom: 0;
		margin-top: calc(var(--space-xl) * -1);
		border-bottom: var(--border-width) solid var(--border-color);
		background: linear-gradient(to top, var(--bg-primary), transparent);
	}

	.fade-auto.has-overflow-top::before,
	.fade-auto.has-overflow-bottom::after {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade-auto::before,
		.fade-auto::after {
			transition: none;
		}
	}
</style>
