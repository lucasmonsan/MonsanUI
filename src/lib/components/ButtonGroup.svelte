<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		direction?: 'row' | 'column';
	}

	let { children, direction = 'column' }: Props = $props();
</script>

<div class="monsan-button-group {direction}">
	{@render children()}
</div>

<style>
	.monsan-button-group {
		display: flex;
		gap: var(--space-md);
		width: 100%;
	}

	.column {
		flex-direction: column;
	}

	.row {
		flex-direction: row;
	}

	.monsan-button-group :global(.monsan-button) {
		flex: 1;
		width: 100%;
	}
</style>
