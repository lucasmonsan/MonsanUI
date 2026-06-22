<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		separated?: boolean;
	}

	let { children, separated = false }: Props = $props();
</script>

<footer class="monsan-preference-bar" class:separated>
	{@render children()}
</footer>

<style>
	.monsan-preference-bar {
		display: flex;
		justify-content: center;
		gap: var(--space-md);
		width: 100%;
	}

	.separated {
		padding-top: var(--space-lg);
		border-top: var(--border-width) solid color-mix(in srgb, var(--border-color) 35%, transparent);
	}
</style>
