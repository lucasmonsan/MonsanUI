<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		minItemWidth?: 'sm' | 'md' | 'lg';
		gap?: 'sm' | 'md' | 'lg';
		align?: 'stretch' | 'start';
	}

	let { children, minItemWidth = 'md', gap = 'md', align = 'stretch' }: Props = $props();
</script>

<div class="monsan-responsive-grid min-{minItemWidth} gap-{gap} align-{align}">
	{@render children()}
</div>

<style>
	.monsan-responsive-grid {
		display: grid;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.min-sm {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
	}

	.min-md {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
	}

	.min-lg {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
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

	.align-stretch {
		align-items: stretch;
	}

	.align-start {
		align-items: start;
	}
</style>
