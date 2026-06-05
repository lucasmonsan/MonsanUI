<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import { resolveActionPanelWidth } from '$lib/utils/layout.js';
	import { i18n } from '../utils/i18n.svelte';

	let {
		open = $bindable(false),
		variant = 'dropdown',
		align = 'right',
		width = variant === 'dropdown' ? 'max-content' : '70%',
		triggerLabel,
		triggerBehavior = 'wrapper',
		panelLayout = 'vertical',
		placement = 'below',
		panelRole = 'menu',
		surface = variant === 'reveal' ? 'gradient' : 'panel',
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
		placement?: 'below' | 'before' | 'after';
		panelRole?: 'menu' | 'toolbar';
		surface?: 'panel' | 'gradient' | 'plain';
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

	$effect(() => {
		if (open && panelEl) {
			const listener = (e: MouseEvent) => {
				const target = e.target as HTMLElement;
				const clickedButton = target.closest('button, a');
				if (clickedButton && !clickedButton.closest('[data-menu-persistent]')) {
					queueMicrotask(() => {
						open = false;
					});
				}
			};
			panelEl.addEventListener('click', listener);
			return () => panelEl?.removeEventListener('click', listener);
		}
	});

	function menuTransition(node: HTMLElement) {
		if (variant === 'reveal') {
			return fly(node, { x: align === 'left' ? -50 : 50, duration: 200 });
		} else {
			return scale(node, { duration: 150, start: 0.95, easing: backOut });
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
			class="quick-actions-panel variant-{variant} align-{align} layout-{panelLayout} placement-{placement} surface-{surface}"
			style="--panel-width: {resolvedWidth};"
			role={panelRole}
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
		padding: var(--space-xs);
		gap: var(--space-xs);
		overflow: visible;
	}

	.quick-actions-panel.variant-dropdown.layout-vertical {
		flex-direction: column;
	}

	.quick-actions-panel.variant-dropdown.layout-horizontal {
		flex-direction: row;
		align-items: center;
	}

	.quick-actions-panel.variant-dropdown.placement-below {
		top: calc(100% + var(--space-xs));
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
		gap: var(--space-sm);
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
	}
</style>
