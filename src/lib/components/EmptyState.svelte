<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="monsan-empty-state">
	{@render children()}
</div>

<style>
	.monsan-empty-state {
		min-height: calc(var(--control-height) * 3);
		border: var(--border-width) dashed var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
		width: 100%;
		box-sizing: border-box;
	}
</style>
