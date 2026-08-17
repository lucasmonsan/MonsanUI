<script lang="ts">
	import Toast from './Toast.svelte';
	import type { Toast as ToastItem } from '$lib/types.js';

	interface Props {
		toasts: ToastItem[];
		position?: 'top-right' | 'bottom-center';
		role?: string;
		ariaLive?: 'polite' | 'assertive' | 'off';
		ariaLabel?: string;
		/** Accessible label for each dismissal control. */
		dismissLabel?: string;
		/** Called when a visible notification is dismissed or resolved. */
		onDismiss?: (toastId: string) => void;
		/** Limits simultaneous visible notifications. Defaults to three. */
		maxVisible?: number;
	}

	let {
		toasts,
		position = 'bottom-center',
		role = 'alert',
		ariaLive = 'assertive',
		ariaLabel,
		dismissLabel,
		onDismiss,
		maxVisible = 3
	}: Props = $props();

	let visibleToasts = $derived(toasts.slice(-Math.max(1, maxVisible)));

	function isPersistent(toast: ToastItem): boolean {
		return (
			toast.persistent === true ||
			toast.type === 'warning' ||
			toast.type === 'error' ||
			Boolean(toast.onAction)
		);
	}

	function dismiss(toast: ToastItem): void {
		onDismiss?.(toast.id);
	}

	async function resolveAction(toast: ToastItem): Promise<void> {
		await toast.onAction?.();
		dismiss(toast);
	}

	$effect(() => {
		const timers = visibleToasts.flatMap((toast) => {
			if (isPersistent(toast) || !onDismiss) return [];
			const duration = Math.max(0, toast.duration ?? 5000);
			return [window.setTimeout(() => dismiss(toast), duration)];
		});

		return () => timers.forEach((timer) => window.clearTimeout(timer));
	});
</script>

<section
	class="monsan-toast-viewport position-{position}"
	{role}
	aria-live={ariaLive}
	aria-atomic="false"
	aria-label={ariaLabel}
>
	{#each visibleToasts as toast (toast.id)}
		<Toast
			{toast}
			{role}
			{ariaLive}
			announce={false}
			{dismissLabel}
			onDismiss={onDismiss ? () => dismiss(toast) : undefined}
			onAction={toast.onAction ? () => void resolveAction(toast) : undefined}
		/>
	{/each}
</section>

<style>
	.monsan-toast-viewport {
		position: fixed;
		z-index: 1003;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		pointer-events: none;
		align-items: center;
		max-width: calc(
			100dvw - var(--space-md) * 2 - env(safe-area-inset-left) - env(safe-area-inset-right)
		);
	}

	.position-bottom-center {
		bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
		left: 50%;
		transform: translateX(-50%);
	}

	.position-top-right {
		top: calc(var(--space-md) + env(safe-area-inset-top));
		right: calc(var(--space-md) + env(safe-area-inset-right));
		align-items: flex-end;
	}
</style>
