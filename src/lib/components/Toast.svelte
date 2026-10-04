<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Toast as ToastItem } from '$lib/types.js';
	import Check from './icons/Check.svelte';
	import CircleAlert from './icons/CircleAlert.svelte';
	import TriangleAlert from './icons/TriangleAlert.svelte';
	import X from './icons/X.svelte';

	interface Props {
		toast: ToastItem;
		role?: string;
		ariaLive?: 'polite' | 'assertive' | 'off';
		announce?: boolean;
		dismissLabel?: string;
		onDismiss?: () => void;
		onAction?: () => void | Promise<void>;
	}

	let {
		toast,
		role = 'status',
		ariaLive = 'polite',
		announce = true,
		dismissLabel,
		onDismiss,
		onAction
	}: Props = $props();
	let prefersReducedMotion = $state(false);

	const colors: Record<ToastItem['type'], string> = {
		success: 'var(--success)',
		error: 'var(--error)',
		warning: 'var(--warning)',
		info: 'var(--info)'
	};

	let toastColor = $derived(colors[toast.type]);
	let resolvedOnAction = $derived(onAction ?? toast.onAction);

	function handleAction(): void {
		void resolvedOnAction?.();
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
		}

		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});
</script>

<div
	class="toast-item {toast.type}"
	role={announce ? role : undefined}
	aria-live={announce ? ariaLive : undefined}
	aria-atomic={announce ? 'true' : undefined}
	in:fly={{ y: prefersReducedMotion ? 0 : 20, duration: prefersReducedMotion ? 0 : 400 }}
	out:fly={{ y: prefersReducedMotion ? 0 : -20, duration: prefersReducedMotion ? 0 : 300 }}
	style:--toast-color={toastColor}
>
	<div class="toast-icon">
		{#if toast.type === 'success'}
			<Check size={20} />
		{:else if toast.type === 'error'}
			<CircleAlert size={20} />
		{:else if toast.type === 'warning'}
			<TriangleAlert size={20} />
		{:else}
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line
					x1="12"
					y1="8"
					x2="12.01"
					y2="8"
				></line></svg
			>
		{/if}
	</div>
	<p class="toast-message">{toast.message}</p>
	{#if toast.actionLabel && resolvedOnAction}
		<button type="button" class="toast-action" onclick={handleAction}>
			{toast.actionLabel}
		</button>
	{/if}
	{#if onDismiss && dismissLabel}
		<button type="button" class="toast-dismiss" aria-label={dismissLabel} onclick={onDismiss}>
			<X size={16} />
		</button>
	{/if}
</div>

<style>
	.toast-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
		min-width: 280px;
		max-width: 90vw;
		pointer-events: auto;
		border-left-width: 8px;
		border-left-color: var(--toast-color);
		overflow: hidden;
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--toast-color);
		flex-shrink: 0;
	}

	.toast-message {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
		margin: 0;
		flex: 1;
	}

	.toast-action {
		flex-shrink: 0;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-family: var(--font-display);
		font-size: var(--text-xs);
		font-weight: 700;
		line-height: 1;
		padding: var(--space-xs) var(--space-sm);
		cursor: pointer;
	}

	.toast-dismiss {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		margin: calc(var(--space-xxs) * -1) calc(var(--space-xxs) * -1) calc(var(--space-xxs) * -1) 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.toast-dismiss:hover,
	.toast-dismiss:focus-visible {
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
		color: var(--text-primary);
	}

	.toast-dismiss:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 1px;
	}

	.toast-action:hover,
	.toast-action:focus-visible {
		background: var(--accent);
		color: var(--accent-contrast);
	}

	.toast-item.warning {
		border-left-color: var(--warning);
	}
	.toast-item.warning .toast-icon {
		color: var(--warning);
	}
</style>
