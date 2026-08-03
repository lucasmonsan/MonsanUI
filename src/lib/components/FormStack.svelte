<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		method?: 'GET' | 'POST' | 'dialog';
		action?: string;
		onsubmit?: (event: SubmitEvent) => void;
		/** Opt-in compact rhythm for dense dialogs and short forms. */
		density?: 'default' | 'compact';
	}

	let { children, method, action, onsubmit, density = 'default' }: Props = $props();
</script>

<form class="monsan-form-stack density-{density}" {method} {action} {onsubmit}>
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
	.monsan-form-stack.density-compact {
		gap: var(--space-sm);
	}
	.monsan-form-stack.density-compact :global(.monsan-form-field) {
		gap: var(--space-xxs);
	}
</style>
