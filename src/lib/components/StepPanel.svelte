<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet<[any]>;
		stepKey: string | number;
		duration: number;
		y: number;
		delay: number;
	}

	let { children, stepKey, duration, y, delay }: Props = $props();

	// Capture non-reactive snapshot of stepKey using Svelte 5 snapshot API
	const frozenKey = $state.snapshot(stepKey);
</script>

<div
	class="step-panel"
	in:fly|global={{ y, duration, delay }}
	out:fly|global={{ y: -y, duration }}
>
	{@render children(frozenKey)}
</div>

<style>
	.step-panel {
		grid-area: 1 / 1;
		width: 100%;
		min-width: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.step-panel {
			transition: none;
		}
	}
</style>
