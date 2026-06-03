<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		gap?: 'none' | 'sm' | 'md' | 'lg';
		scroll?: boolean;
		fade?: 'none' | 'top' | 'bottom' | 'both';
		padding?: 'none' | 'sm' | 'md';
	}

	let { children, gap = 'md', scroll = true, fade = 'none', padding = 'none' }: Props = $props();
</script>

<section
	class="monsan-content-region gap-{gap} fade-{fade} padding-{padding}"
	class:is-scrollable={scroll}
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
</style>
