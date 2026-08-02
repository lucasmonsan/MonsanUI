<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns: 'two' | 'three' | 'four';
		divided?: boolean;
	}

	let { children, columns, divided = true }: Props = $props();
</script>

<div class="monsan-metric-bar columns-{columns}" class:divided>
	{@render children()}
</div>

<style>
	.monsan-metric-bar {
		display: grid;
		width: 100%;
		min-width: 0;
		align-items: center;
	}
	.columns-two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.columns-three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.columns-four {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.divided > :global(:not(:first-child)) {
		border-left: var(--border-width) solid var(--border-color);
		padding-left: var(--space-xs);
	}
</style>
