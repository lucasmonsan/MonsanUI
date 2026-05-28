<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<header class="monsan-section-heading">
	<Text tag="h2" family="display" size="xl" weight="bold">
		{@render children()}
	</Text>
</header>

<style>
	.monsan-section-heading {
		border-bottom: var(--border-width) solid var(--text-primary);
		padding-bottom: var(--space-xs);
		width: 100%;
	}
</style>
