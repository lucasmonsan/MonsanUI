<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="monsan-inline-notice">
	{@render children()}
</div>

<style>
	.monsan-inline-notice {
		padding-top: var(--space-sm);
		border-top: 1px dashed var(--text-primary);
		word-break: break-word;
		overflow-wrap: break-word;
		text-align: left;
	}
</style>
