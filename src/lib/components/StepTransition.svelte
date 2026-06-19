<script lang="ts">
	import type { Snippet } from 'svelte';
	import StepPanel from './StepPanel.svelte';

	interface Props {
		children: Snippet<[string | number]>;
		stepKey: string | number;
		animate?: boolean;
		duration?: number;
		y?: number;
	}

	let { children: childrenProp, stepKey, animate = true, duration = 200, y = 8 }: Props = $props();
</script>

<div class="monsan-step-transition">
	{#key stepKey}
		{#if animate}
			<StepPanel {stepKey} {duration} {y} delay={duration}>
				{#snippet children(frozenKey: string | number)}
					{@render childrenProp(frozenKey)}
				{/snippet}
			</StepPanel>
		{:else}
			<div class="step-panel">
				{@render childrenProp(stepKey)}
			</div>
		{/if}
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
</style>
