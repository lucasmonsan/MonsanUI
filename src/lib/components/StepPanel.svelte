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

	const props = $props<Props>();
	const children = props.children;
	const duration = props.duration;
	const y = props.y;

	// Use bracket notation to capture initial prop values without triggering Svelte 5's state_referenced_locally compiler warnings
	const frozenKey = props['stepKey'];
	const initialDelay = props['delay'];

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
