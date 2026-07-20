<script lang="ts">
	import { floatingPortal } from '../utils/floatingPortal.js';

	let { text, position = 'top' } = $props<{
		text: string;
		position?: 'top' | 'bottom';
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
			open = !open;
		}
	}
</script>

<span
	bind:this={triggerEl}
	class="info-trigger"
	role="button"
	tabindex="0"
	aria-label={text}
	aria-expanded={open}
	onmouseenter={() => (open = true)}
	onmouseleave={() => (open = false)}
	onfocus={() => (open = true)}
	onblur={() => (open = false)}
	onclick={() => (open = true)}
	onkeydown={handleKeydown}
>
	?
</span>

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
	}

	.info-trigger:hover,
	.info-trigger:focus-visible {
		color: var(--text-primary);
		border-color: var(--text-primary);
		box-shadow: 1.5px 1.5px 0 var(--text-primary);
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
		white-space: normal;
		pointer-events: none;
	}
</style>
