<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { onMount, untrack } from 'svelte';

	interface Props {
		children: Snippet<[string | number]>;
		stepKey: string | number;
		duration: number;
		y: number;
		delay: number;
	}

	let { children, stepKey, duration, y, delay }: Props = $props();

	// Capture initial values using untrack to avoid compiler warnings about referencing reactive state locally
	const frozenKey = untrack(() => stepKey);
	const initialDelay = untrack(() => delay);

	// Delay rendering of children for incoming transitions to prevent early height expansion
	let showChildren = $state(initialDelay === 0);

	onMount(() => {
		if (initialDelay > 0) {
			const timer = setTimeout(() => {
				showChildren = true;
			}, initialDelay);
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
