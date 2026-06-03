<script lang="ts">
	import Toast from './Toast.svelte';

	interface ToastItem {
		id: string;
		message: string;
		type: 'success' | 'error' | 'warning' | 'info';
	}

	interface Props {
		toasts: ToastItem[];
		position?: 'top-right' | 'bottom-center';
		role?: string;
		ariaLive?: 'polite' | 'assertive' | 'off';
	}

	let {
		toasts,
		position = 'bottom-center',
		role = 'alert',
		ariaLive = 'assertive'
	}: Props = $props();
</script>

<section class="monsan-toast-viewport position-{position}" aria-live={ariaLive} aria-atomic="false">
	{#each toasts as toast (toast.id)}
		<Toast {toast} {role} {ariaLive} />
	{/each}
</section>

<style>
	.monsan-toast-viewport {
		position: fixed;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		pointer-events: none;
		align-items: center;
		max-width: calc(100dvw - var(--space-md) * 2);
	}

	.position-bottom-center {
		bottom: var(--space-md);
		left: 50%;
		transform: translateX(-50%);
	}

	.position-top-right {
		top: var(--space-md);
		right: var(--space-md);
		align-items: flex-end;
	}
</style>
