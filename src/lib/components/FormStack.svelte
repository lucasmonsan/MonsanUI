<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';

	interface Props extends HTMLFormAttributes {
		children: Snippet;
	}

	let { children, ...restProps }: Props = $props();
</script>

<form class="monsan-form-stack" {...restProps}>
	{@render children()}
</form>

<style>
	.monsan-form-stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		text-align: left;
		width: 100%;
	}

	.monsan-form-stack :global(.monsan-button) {
		width: 100%;
	}
</style>
