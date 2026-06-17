<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import PageContainer from './PageContainer.svelte';

	interface Props {
		children: Snippet;
		routeKey?: string;
		maxWidth?: MaxWidthPreset;
		padding?: PaddingPreset;
		animate?: boolean;
	}

	let {
		children,
		routeKey = 'default',
		maxWidth = 'var(--container-max-width)',
		padding = 'app',
		animate = true
	}: Props = $props();
</script>

<section class="monsan-route-viewport">
	{#key routeKey}
		<div
			class="route-container"
			in:fade={animate ? { duration: 200, delay: 150 } : undefined}
			out:fade={animate ? { duration: 150 } : undefined}
		>
			<div class="page-content-wrapper">
				<PageContainer {maxWidth} {padding}>
					{@render children()}
				</PageContainer>
			</div>
		</div>
	{/key}
</section>

<style>
	.monsan-route-viewport {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		min-height: 100dvh;
		width: 100%;
		position: relative;
		overflow: hidden;
	}

	.route-container {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		max-width: 100%;
		display: flex;
		flex-direction: column;
		pointer-events: auto;
		overflow: hidden;
	}

	.page-content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
	}
</style>
