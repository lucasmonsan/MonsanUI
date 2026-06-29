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
		shape = 'square',
		ariaLabel,
		title,
		open = $bindable(false),
		align = 'right',
		width = 'max-content',
		layout = 'horizontal',
		placement = 'before',
		variant = 'floating',
		panelShadow = 'default',
		panelPadding = 'xs',
		panelGap = 'xs',
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
		panelShadow?: 'default' | 'none';
		panelPadding?: 'xs' | 'sm' | 'md';
		panelGap?: 'xs' | 'sm' | 'md';
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
	panelRole="menu"
	surface={variant === 'floating' ? 'plain' : 'panel'}
	{panelShadow}
	{panelPadding}
	{panelGap}
	triggerLabel={ariaLabel}
	triggerBehavior="child"
	containedReveal={variant === 'floating'}
>
	{#snippet trigger(toggle)}
		<Avatar {src} {name} {alt} {size} {shape} {ariaLabel} {title} onclick={toggle} />
	{/snippet}

	{@render children?.()}
</QuickActions>
