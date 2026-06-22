<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import { resolveActionPanelWidth } from '$lib/utils/layout.js';
	import { i18n } from '../utils/i18n.svelte';

	type PanelPlacement = 'below' | 'before' | 'after';
	type ResolvedPanelPlacement = PanelPlacement | 'above';

	let {
		open = $bindable(false),
		variant = 'dropdown',
		align = 'right',
		width = variant === 'dropdown' ? 'max-content' : '70%',
		triggerLabel,
		triggerBehavior = 'wrapper',
		panelLayout = 'vertical',
		placement = 'below',
		panelPadding = 'xs',
		panelGap = 'sm',
		panelRole = 'menu',
		surface = variant === 'reveal' ? 'gradient' : 'panel',
		panelShadow = 'default',
		containedReveal = false,
		trigger,
		children
	} = $props<{
		open?: boolean;
		variant?: 'dropdown' | 'reveal';
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		triggerLabel?: string;
		triggerBehavior?: 'wrapper' | 'child';
		panelLayout?: 'vertical' | 'horizontal';
		placement?: PanelPlacement;
		panelPadding?: 'xs' | 'sm' | 'md';
		panelGap?: 'xs' | 'sm' | 'md';
		panelRole?: 'menu' | 'toolbar';
		surface?: 'panel' | 'gradient' | 'plain';
		panelShadow?: 'default' | 'none';
		containedReveal?: boolean;
		trigger?: import('svelte').Snippet<[(event: MouseEvent) => void]>;
		children?: import('svelte').Snippet;
	}>();

	let resolvedWidth = $derived(resolveActionPanelWidth(width));

	let containerEl = $state<HTMLElement>();

	function toggle(e: MouseEvent) {
		e.stopPropagation();
		open = !open;
	}

	function handleOutsideClick(e: MouseEvent) {
		if (!open) return;
		const target = e.target as HTMLElement;
		if (containerEl && !containerEl.contains(target)) {
			open = false;
		}
	}

	let panelEl = $state<HTMLDivElement>();
	let activeTriggerLabel = $derived(triggerLabel ?? i18n.t('quickActions.open'));
	let resolvedPlacement = $state<ResolvedPanelPlacement>('below');
	let activePlacement = $derived(variant === 'dropdown' ? resolvedPlacement : placement);
	let panelMaxHeight = $state('none');

	function updateDropdownPlacement() {
		if (!open || variant !== 'dropdown' || !containerEl || !panelEl) return;

		resolvedPlacement = placement;
		panelMaxHeight = 'none';

		if (placement !== 'below') return;

		const gap = 8;
		const rect = containerEl.getBoundingClientRect();
		const panelHeight = panelEl.offsetHeight;
		const spaceBelow = window.innerHeight - rect.bottom - gap;
		const spaceAbove = rect.top - gap;

		if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
			resolvedPlacement = 'above';
			panelMaxHeight = `${Math.max(120, spaceAbove)}px`;
			return;
		}

		panelMaxHeight = `${Math.max(120, spaceBelow)}px`;
	}

	onMount(() => {
		document.addEventListener('click', handleOutsideClick, { capture: true });
		return () => document.removeEventListener('click', handleOutsideClick, { capture: true });
	});

	$effect(() => {
		if (open) {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					open = false;
				}
			};
			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		}
	});

	function handlePanelClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const clickedButton = target.closest('button, a');
		if (clickedButton && !clickedButton.closest('[data-menu-persistent]')) {
			queueMicrotask(() => {
				open = false;
			});
		}
	}

	$effect(() => {
		if (open) {
			void tick().then(updateDropdownPlacement);

			window.addEventListener('resize', updateDropdownPlacement);
			window.addEventListener('scroll', updateDropdownPlacement, true);

			return () => {
				window.removeEventListener('resize', updateDropdownPlacement);
				window.removeEventListener('scroll', updateDropdownPlacement, true);
			};
		}
	});

	function menuTransition(node: HTMLElement) {
		if (variant === 'reveal') {
			if (placement === 'below') {
				return fly(node, { y: 12, duration: 200 });
			}
			return fly(node, { x: align === 'left' ? -50 : 50, duration: 200 });
		} else {
			return fly(node, { y: resolvedPlacement === 'above' ? 6 : -6, duration: 150 });
		}
	}
</script>

<div
	bind:this={containerEl}
	class="monsan-quick-actions-wrapper"
	class:is-reveal={variant === 'reveal'}
	class:contained-reveal={containedReveal}
>
	{#if trigger}
		{#if triggerBehavior === 'wrapper'}
			<div
				class="quick-actions-trigger"
				onclick={toggle}
				onkeydown={(event) => {
					if (event.key === 'Enter' || event.key === ' ') {
						event.preventDefault();
						open = !open;
					}
				}}
				role="button"
				tabindex="0"
				aria-label={activeTriggerLabel}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				{@render trigger(toggle)}
			</div>
		{:else}
			<div class="quick-actions-trigger">
				{@render trigger(toggle)}
			</div>
		{/if}
	{/if}

	{#if open}
		<div
			bind:this={panelEl}
			class="quick-actions-panel variant-{variant} align-{align} layout-{panelLayout} placement-{activePlacement} surface-{surface} shadow-{panelShadow}"
			style:--panel-width={resolvedWidth}
			style:--panel-max-height={panelMaxHeight}
			style:--quick-actions-panel-padding={`var(--space-${panelPadding})`}
			style:--quick-actions-panel-gap={`var(--space-${panelGap})`}
			role={panelRole}
			onclick={handlePanelClick}
			transition:menuTransition
		>
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</div>

<style>
	.monsan-quick-actions-wrapper {
		position: relative;
		display: inline-block;
	}

	.monsan-quick-actions-wrapper.is-reveal:not(.contained-reveal) {
		display: contents;
	}

	.monsan-quick-actions-wrapper.contained-reveal {
		position: relative;
		display: inline-block;
	}

	.quick-actions-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0;
	}

	.quick-actions-trigger:hover,
	.quick-actions-trigger:active {
		transform: none;
		box-shadow: none;
	}

	.quick-actions-panel {
		z-index: 50;
		box-sizing: border-box;
		gap: var(--quick-actions-panel-gap);
	}

	.quick-actions-panel.variant-dropdown {
		position: absolute;
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		width: var(--panel-width);
		max-width: 90vw;
		display: flex;
		padding: var(--quick-actions-panel-padding);
		overflow: auto;
		max-height: var(--panel-max-height);
		scrollbar-width: none;
	}

	.quick-actions-panel.variant-dropdown.shadow-none {
		box-shadow: none;
	}

	.quick-actions-panel.variant-dropdown::-webkit-scrollbar {
		display: none;
	}

	.quick-actions-panel.variant-dropdown.layout-vertical {
		flex-direction: column;
	}

	.quick-actions-panel.variant-dropdown.layout-horizontal {
		flex-direction: row;
		align-items: center;
	}

	.quick-actions-panel.variant-dropdown.placement-below {
		top: calc(100% + var(--space-sm));
	}

	.quick-actions-panel.variant-dropdown.placement-above {
		bottom: calc(100% + var(--space-sm));
	}

	.quick-actions-panel.variant-dropdown.align-right {
		right: 0;
	}

	.quick-actions-panel.variant-dropdown.align-left {
		left: 0;
	}

	.quick-actions-panel.variant-dropdown.placement-before,
	.quick-actions-panel.variant-dropdown.placement-after {
		top: 0;
		right: auto;
		left: auto;
	}

	.quick-actions-panel.variant-dropdown.placement-before {
		right: calc(100% + var(--space-xs));
	}

	.quick-actions-panel.variant-dropdown.placement-after {
		left: calc(100% + var(--space-xs));
	}

	.quick-actions-panel.variant-reveal {
		position: absolute;
		top: 0;
		bottom: 0;
		height: 100%;
		width: var(--panel-width);
		max-width: calc(100vw - var(--space-md) * 2);
		display: flex;
		align-items: center;
		z-index: 10;
	}

	.quick-actions-panel.variant-reveal.layout-vertical {
		flex-direction: column;
		align-items: stretch;
		height: auto;
	}

	.quick-actions-panel.variant-reveal.layout-horizontal {
		flex-direction: row;
	}

	.quick-actions-panel.variant-reveal.align-right {
		right: 0;
		justify-content: flex-end;
		padding-right: var(--space-sm);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	.quick-actions-panel.variant-reveal.align-left {
		left: 0;
		justify-content: flex-start;
		padding-left: var(--space-sm);
		border-radius: var(--radius-md) 0 0 var(--radius-md);
	}

	.quick-actions-panel.variant-reveal.surface-gradient.align-right {
		background: linear-gradient(to left, var(--bg-primary) 65%, transparent);
	}

	.quick-actions-panel.variant-reveal.surface-gradient.align-left {
		background: linear-gradient(to right, var(--bg-primary) 65%, transparent);
	}

	.quick-actions-panel.variant-reveal.surface-plain {
		background: transparent;
		border-radius: 0;
		padding-right: 0;
		padding-left: 0;
	}

	.quick-actions-panel.variant-reveal.placement-before {
		right: calc(100% + var(--space-xs));
		left: auto;
	}

	.quick-actions-panel.variant-reveal.placement-after {
		right: auto;
		left: calc(100% + var(--space-xs));
	}

	.quick-actions-panel.variant-reveal.placement-below {
		right: 0;
		left: auto;
		top: calc(100% + var(--space-xs));
		bottom: auto;
		height: auto;
		width: max-content;
		max-width: calc(100vw - var(--space-md) * 2);
		align-items: stretch;
		padding: 0;
		border-radius: var(--radius-md);
	}

	.quick-actions-panel.variant-reveal.placement-below.align-left {
		left: 0;
		right: auto;
	}
</style>
