<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';

	interface Props {
		children: Snippet;
		condensed?: boolean;
		spacing?: 'none' | 'bottom';
	}

	let { children, condensed = false, spacing = 'none' }: Props = $props();
</script>

<div class="monsan-prompt-panel spacing-{spacing}" class:condensed>
	<Panel variant="secondary" maxWidth="100%">
		{@render children()}
	</Panel>
</div>

<style>
	.monsan-prompt-panel {
		width: 100%;
		box-sizing: border-box;
		transition:
			transform 0.3s ease-in-out,
			opacity 0.3s ease-in-out;
	}

	.spacing-bottom {
		margin-bottom: var(--space-xl);
	}

	.condensed {
		transform: scale(0.95);
		opacity: 0.75;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-prompt-panel {
			transition: none;
		}
	}
</style>
