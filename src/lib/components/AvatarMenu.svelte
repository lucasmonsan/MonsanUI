<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import Avatar from './Avatar.svelte';
	import QuickActions from './QuickActions.svelte';

	let {
		src,
		name = '',
		alt = '',
		size = 'sm',
		shape = 'circle',
		ariaLabel,
		title,
		open = $bindable(false),
		align = 'right',
		width = 'max-content',
		children
	}: {
		src?: string;
		name?: string;
		alt?: string;
		size?: 'sm' | 'md' | 'lg';
		shape?: 'circle' | 'square';
		ariaLabel: string;
		title?: string;
		open?: boolean;
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		children?: Snippet;
	} = $props();
</script>

<QuickActions bind:open variant="dropdown" {align} {width} triggerLabel={ariaLabel}>
	{#snippet trigger()}
		<Avatar {src} {name} {alt} {size} {shape} {ariaLabel} {title} />
	{/snippet}

	{@render children?.()}
</QuickActions>
