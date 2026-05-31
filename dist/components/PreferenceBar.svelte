<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<footer class="monsan-preference-bar">
	{@render children()}
</footer>

<style>
	.monsan-preference-bar {
		display: flex;
		justify-content: center;
		gap: var(--space-md);
		padding-top: var(--space-lg);
		border-top: var(--border-width) solid color-mix(in srgb, var(--border-color) 35%, transparent);
		width: 100%;
	}
</style>
