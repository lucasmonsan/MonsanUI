<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

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

	// Delay rendering of children for incoming transitions to prevent early height expansion
	let showChildren = $state(delay === 0);

	onMount(() => {
		if (delay > 0) {
			const timer = setTimeout(() => {
				showChildren = true;
			}, delay);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if showChildren}
	<div
		class="step-panel"
		in:fly|global={{ y, duration, delay: 0 }}
		out:fly|global={{ y: -y, duration }}
	>
		{@render children(frozenKey)}
	</div>
{/if}

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
