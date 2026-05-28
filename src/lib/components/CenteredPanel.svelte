<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';

	interface Props {
		children: Snippet;
		maxWidth?: string;
	}

	let { children, maxWidth = '512px' }: Props = $props();
</script>

<div class="monsan-centered-panel">
	<Panel tag="section" {maxWidth} class="centered-panel-surface">
		{@render children()}
	</Panel>
</div>

<style>
	.monsan-centered-panel {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		padding: var(--space-lg);
		width: 100%;
		box-sizing: border-box;
	}

	.monsan-centered-panel :global(.centered-panel-surface) {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		text-align: center;
	}
</style>
