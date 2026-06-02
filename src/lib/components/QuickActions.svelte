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
		trigger,
		children
	} = $props<{
		open?: boolean;
		variant?: 'dropdown' | 'reveal';
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		triggerLabel?: string;
		trigger?: import('svelte').Snippet;
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
				if (clickedButton) {
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
>
	{#if trigger}
		<div
			class="quick-actions-trigger"
			onclick={toggle}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					open = !open;
				}
			}}
			role="button"
			tabindex="0"
			aria-label={activeTriggerLabel}
			aria-haspopup="menu"
			aria-expanded={open}
		>
			{@render trigger()}
		</div>
	{/if}

	{#if open}
		<div
			bind:this={panelEl}
			class="quick-actions-panel variant-{variant} align-{align}"
			style="--panel-width: {resolvedWidth};"
			role="menu"
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

	.monsan-quick-actions-wrapper.is-reveal {
		display: contents;
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
		top: calc(100% + var(--space-xs, 4px));
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		width: var(--panel-width);
		max-width: 90vw;
		display: flex;
		flex-direction: column;
		padding: var(--space-xs);
		gap: var(--space-xs);
		overflow: hidden;
	}

	.quick-actions-panel.variant-dropdown.align-right {
		right: 0;
	}

	.quick-actions-panel.variant-dropdown.align-left {
		left: 0;
	}

	.quick-actions-panel.variant-reveal {
		position: absolute;
		top: 0;
		bottom: 0;
		height: 100%;
		width: var(--panel-width);
		display: flex;
		align-items: center;
		z-index: 10;
		gap: var(--space-sm);
	}

	.quick-actions-panel.variant-reveal.align-right {
		right: 0;
		justify-content: flex-end;
		padding-right: var(--space-sm);
		background: linear-gradient(to left, var(--bg-primary) 65%, transparent);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	.quick-actions-panel.variant-reveal.align-left {
		left: 0;
		justify-content: flex-start;
		padding-left: var(--space-sm);
		background: linear-gradient(to right, var(--bg-primary) 65%, transparent);
		border-radius: var(--radius-md) 0 0 var(--radius-md);
	}
</style>
