<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';

	interface Props {
		children: Snippet;
		condensed?: boolean;
	}

	let { children, condensed = false }: Props = $props();
</script>

<div class="monsan-prompt-panel" class:condensed>
	<Panel variant="secondary" maxWidth="100%">
		{@render children()}
	</Panel>
</div>

<style>
	.monsan-prompt-panel {
		width: 100%;
		margin-bottom: var(--space-xl);
		box-sizing: border-box;
		transition:
			transform 0.3s ease-in-out,
			opacity 0.3s ease-in-out;
	}

	.condensed {
		transform: scale(0.95);
		opacity: 0.75;
	}
</style>
