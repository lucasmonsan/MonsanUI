<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		stepKey: string | number;
		animate?: boolean;
		duration?: number;
		y?: number;
	}

	let { children, stepKey, animate = true, duration = 1500, y = 8 }: Props = $props();
</script>

<div class="monsan-step-transition">
	{#key stepKey}
		<div
			class="step-panel"
			in:fly={animate ? { y, duration, delay: 2500 } : undefined}
			out:fly={animate ? { y: -y, duration } : undefined}
		>
			{@render children()}
		</div>
	{/key}
</div>

<style>
	.monsan-step-transition {
		display: grid;
		width: 100%;
		min-width: 0;
	}

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
