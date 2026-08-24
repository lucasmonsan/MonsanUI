<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { popBackLayer, pushBackLayer, waitForBackLayerHistory } from '../utils/dialogStack.js';
	import type { FloatingActionMenuItem } from './floating-action-menu.js';
	import PlusIcon from './icons/Plus.svelte';

	interface Props {
		items: readonly FloatingActionMenuItem[];
		openLabel: string;
		closeLabel: string;
		open?: boolean;
	}

	let { items, openLabel, closeLabel, open = $bindable(false) }: Props = $props();

	let root = $state<HTMLElement>();
	let backLayerAdded = false;
	let menuVisible = $state(open);
	let isClosing = $state(false);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const backLayerId = `floating-action-menu-${Math.random().toString(36).slice(2, 9)}`;
	let hasActions = $derived(items.length > 0);
	let triggerLabel = $derived(open ? closeLabel : openLabel);

	function close(): void {
		open = false;
	}

	function toggle(): void {
		if (!hasActions) return;
		open = !open;
	}

	async function select(item: FloatingActionMenuItem): Promise<void> {
		if (item.disabled) return;
		close();
		// The menu owns a browser-history entry. Let its close consume that entry
		// before an action opens a Dialog or another temporary layer; otherwise a
		// later modal close could navigate to the page that preceded the app.
		await tick();
		await waitForBackLayerHistory();
		requestAnimationFrame(item.onSelect);
	}

	function clearCloseTimer(): void {
		if (closeTimer) clearTimeout(closeTimer);
		closeTimer = undefined;
	}

	function closeDuration(): number {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
	}

	onMount(() => {
		const handlePointerDown = (event: PointerEvent) => {
			if (open && root && !root.contains(event.target as Node)) close();
		};
		document.addEventListener('pointerdown', handlePointerDown, true);
		return () => {
			clearCloseTimer();
			document.removeEventListener('pointerdown', handlePointerDown, true);
		};
	});

	$effect(() => {
		if (open && hasActions) {
			clearCloseTimer();
			menuVisible = true;
			isClosing = false;
			return;
		}

		if (!menuVisible || isClosing) return;
		isClosing = true;
		closeTimer = setTimeout(() => {
			menuVisible = false;
			isClosing = false;
			closeTimer = undefined;
		}, closeDuration());
	});

	$effect(() => {
		if (!open) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			close();
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	});

	$effect(() => {
		if (!open || backLayerAdded) return;
		pushBackLayer(backLayerId, close);
		backLayerAdded = true;
		return () => {
			if (!backLayerAdded) return;
			popBackLayer(backLayerId);
			backLayerAdded = false;
		};
	});
</script>

<div
	bind:this={root}
	class="monsan-floating-action-menu"
	class:is-open={open}
	class:is-closing={isClosing}
>
	{#if menuVisible && hasActions}
		<div class="floating-action-items" role="menu" aria-label={openLabel} aria-hidden={isClosing}>
			{#each items as item, index (item.id)}
				{@const Icon = item.icon}
				<button
					type="button"
					class="floating-action-item position-{index} variant-{item.variant ?? 'secondary'}"
					role="menuitem"
					disabled={item.disabled || !open}
					onclick={() => void select(item)}
				>
					<Icon size={20} />
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	{/if}

	<button
		type="button"
		class="floating-action-trigger"
		aria-label={triggerLabel}
		aria-expanded={open}
		aria-haspopup="menu"
		disabled={!hasActions}
		onclick={toggle}
	>
		<PlusIcon size={28} />
	</button>
</div>

<style>
	.monsan-floating-action-menu {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--control-height) * 1.3);
		height: calc(var(--control-height) * 1.3);
	}

	.floating-action-trigger {
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
		padding: 0;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--accent-primary);
		color: var(--bg-primary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out);
	}

	.is-open .floating-action-trigger {
		transform: rotate(45deg);
	}

	.floating-action-trigger:hover:not(:disabled) {
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.floating-action-trigger:active:not(:disabled) {
		box-shadow: none;
	}

	.floating-action-trigger:focus-visible,
	.floating-action-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.floating-action-trigger:disabled,
	.floating-action-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.floating-action-items {
		position: absolute;
		bottom: calc(100% + var(--space-sm));
		left: 50%;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(3, max-content);
		align-items: end;
		justify-content: center;
		gap: var(--space-sm);
		width: min(calc(100vw - var(--space-sm) * 2), 22rem);
		transform: translateX(-50%);
	}

	.floating-action-item {
		--item-offset-y: 0px;
		--item-enter-x: 0px;
		--item-enter-y: calc(var(--control-height) * 2);
		min-width: 0;
		min-height: calc(var(--control-height) * 1.1);
		padding: var(--space-xs) var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		display: grid;
		justify-items: center;
		align-content: center;
		gap: var(--space-xxs);
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 800;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
		cursor: pointer;
		transform: translateY(var(--item-offset-y));
		animation: floating-action-item-enter 0.22s var(--ease-out) both;
		transition:
			transform 0.14s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out);
	}

	.floating-action-item.position-0 {
		--item-offset-y: var(--space-sm);
		--item-enter-x: calc(var(--control-height) * 1.5);
	}

	.floating-action-item.position-1 {
		--item-offset-y: calc(var(--space-lg) * -1);
		--item-enter-y: calc(var(--control-height) * 2 + var(--space-lg));
	}

	.floating-action-item.position-2 {
		--item-offset-y: var(--space-sm);
		--item-enter-x: calc(var(--control-height) * -1.5);
	}

	.floating-action-item.variant-primary {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.floating-action-item.variant-success {
		background: var(--success);
		color: var(--bg-primary);
	}

	.floating-action-item.variant-warning {
		background: var(--warning);
		color: var(--warning-contrast);
	}

	.floating-action-item.variant-neutral {
		background: var(--neutral);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .floating-action-item.variant-primary,
	:global([data-theme='dark']) .floating-action-item.variant-success,
	:global([data-theme='dark']) .floating-action-item.variant-neutral {
		color: var(--text-primary);
	}

	.floating-action-item:hover:not(:disabled) {
		transform: translate(-1px, calc(var(--item-offset-y) - 1px));
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.floating-action-item:active:not(:disabled) {
		transform: translate(2px, calc(var(--item-offset-y) + 2px));
		box-shadow: none;
	}

	.is-closing .floating-action-item {
		animation: floating-action-item-exit 0.22s var(--ease-out) both;
	}

	@keyframes floating-action-item-enter {
		from {
			opacity: 0;
			transform: translate(var(--item-enter-x), var(--item-enter-y)) scale(0.82);
		}

		to {
			opacity: 1;
			transform: translate(0, var(--item-offset-y)) scale(1);
		}
	}

	@keyframes floating-action-item-exit {
		from {
			opacity: 1;
			transform: translate(0, var(--item-offset-y)) scale(1);
		}

		to {
			opacity: 0;
			transform: translate(var(--item-enter-x), var(--item-enter-y)) scale(0.82);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.floating-action-trigger,
		.floating-action-item {
			transition: none;
			animation: none;
		}
	}
</style>
