<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		method?: 'GET' | 'POST' | 'dialog';
		action?: string;
		onsubmit?: (event: SubmitEvent) => void;
	}

	let { children, method, action, onsubmit }: Props = $props();
</script>

<form class="monsan-form-stack" {method} {action} {onsubmit}>
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
