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
		layout = 'horizontal',
		placement = 'before',
		variant = 'floating',
		children
	}: {
		src?: string;
		name?: string;
		alt?: string;
		size?: 'sm' | 'md' | 'lg' | 'control';
		shape?: 'circle' | 'square';
		ariaLabel: string;
		title?: string;
		open?: boolean;
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		layout?: 'vertical' | 'horizontal';
		placement?: 'below' | 'before' | 'after';
		variant?: 'floating' | 'dropdown';
		children?: Snippet;
	} = $props();
</script>

<QuickActions
	bind:open
	variant={variant === 'floating' ? 'reveal' : 'dropdown'}
	{align}
	{width}
	panelLayout={layout}
	{placement}
	panelRole="toolbar"
	surface={variant === 'floating' ? 'plain' : 'panel'}
	triggerLabel={ariaLabel}
	containedReveal={variant === 'floating'}
>
	{#snippet trigger()}
		<Avatar {src} {name} {alt} {size} {shape} {ariaLabel} {title} />
	{/snippet}

	{@render children?.()}
</QuickActions>
