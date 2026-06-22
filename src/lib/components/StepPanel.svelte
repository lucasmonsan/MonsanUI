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

	let showChildren = $state(initialDelay === 0);
	let prefersReducedMotion = $state(false);

	let effectiveDuration = $derived(prefersReducedMotion ? 0 : duration);
	let effectiveY = $derived(prefersReducedMotion ? 0 : y);

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
			if (event.matches) {
				showChildren = true;
			}
		}

		motionQuery.addEventListener('change', updateMotionPreference);

		if (initialDelay > 0) {
			if (motionQuery.matches) {
				showChildren = true;
				return () => {
					motionQuery.removeEventListener('change', updateMotionPreference);
				};
			}

			const timer = setTimeout(() => {
				showChildren = true;
			}, initialDelay);
			return () => {
				clearTimeout(timer);
				motionQuery.removeEventListener('change', updateMotionPreference);
			};
		}

		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});
</script>

{#if showChildren}
	<div
		class="step-panel"
		in:fly|global={{ y: effectiveY, duration: effectiveDuration, delay: 0 }}
		out:fly|global={{ y: -effectiveY, duration: effectiveDuration }}
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
