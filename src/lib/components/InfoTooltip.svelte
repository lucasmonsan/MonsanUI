<script lang="ts">
	import type { Snippet } from 'svelte';
	import { floatingPortal } from '../utils/floatingPortal.js';

	let {
		text,
		position = 'top',
		children,
		iconOnly = false,
		tone = 'neutral',
		ariaLabel,
		onactivate
	} = $props<{
		text: string;
		position?: 'top' | 'bottom';
		children?: Snippet;
		iconOnly?: boolean;
		tone?: 'neutral' | 'success' | 'warning' | 'error';
		ariaLabel?: string;
		onactivate?: () => void;
	}>();

	let triggerEl = $state<HTMLElement>();
	let open = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			open = false;
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (onactivate) {
				onactivate();
			} else {
				open = !open;
			}
		}
	}

	function handleClick() {
		if (onactivate) {
			onactivate();
			return;
		}
		open = true;
	}
</script>

<button
	type="button"
	bind:this={triggerEl}
	class="info-trigger"
	class:iconOnly
	class:toneSuccess={tone === 'success'}
	class:toneWarning={tone === 'warning'}
	class:toneError={tone === 'error'}
	aria-label={ariaLabel ?? text}
	aria-expanded={open}
	onmouseenter={() => (open = true)}
	onmouseleave={() => (open = false)}
	onfocus={() => (open = true)}
	onblur={() => (open = false)}
	onclick={handleClick}
	onkeydown={handleKeydown}
>
	{#if children}
		{@render children()}
	{:else}
		?
	{/if}
</button>

{#if open}
	<span
		class="info-tooltip"
		role="tooltip"
		style="visibility: hidden"
		use:floatingPortal={{
			anchor: triggerEl,
			align: 'auto',
			placement: position,
			maxWidth: 220,
			offset: 8,
			zIndex: 1003
		}}
	>
		{text}
	</span>
{/if}

<style>
	.info-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex: 0 0 18px;
		padding: 0;
		border: var(--border-width) solid var(--border-color);
		box-shadow: 1px 1px 0 var(--text-primary);
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-family: var(--font-body);
		font-weight: bold;
		color: var(--text-secondary);
		cursor: help;
		margin-left: var(--space-xs);
		vertical-align: middle;
		user-select: none;
		position: relative;
		z-index: 1;
		pointer-events: auto;
	}

	.info-trigger:not(.iconOnly):hover,
	.info-trigger:not(.iconOnly):focus-visible {
		color: var(--text-primary);
		border-color: var(--text-primary);
		box-shadow: 1.5px 1.5px 0 var(--text-primary);
		outline: none;
	}

	.info-trigger.iconOnly {
		width: calc(var(--control-height) * 0.8);
		height: calc(var(--control-height) * 0.8);
		flex-basis: calc(var(--control-height) * 0.8);
		margin: 0;
		border-color: transparent;
		box-shadow: none;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.info-trigger.iconOnly.toneSuccess {
		color: var(--success);
	}

	.info-trigger.iconOnly.toneWarning {
		color: var(--warning);
	}

	.info-trigger.iconOnly.toneError {
		color: var(--error);
	}

	.info-trigger.iconOnly:hover,
	.info-trigger.iconOnly:focus-visible {
		border-color: transparent;
		box-shadow: none;
		background: color-mix(in srgb, currentColor 12%, transparent);
		outline: none;
	}

	.info-tooltip {
		display: block;
		box-sizing: border-box;
		background-color: var(--text-primary);
		color: var(--bg-primary);
		text-align: center;
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-md);
		font-size: var(--text-xs);
		font-family: var(--font-body);
		font-weight: 500;
		line-height: 1.35;
		text-transform: none;
		letter-spacing: normal;
		white-space: pre-line;
		pointer-events: none;
	}
</style>
