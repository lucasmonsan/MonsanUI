<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Check from './icons/Check.svelte';
	import CircleAlert from './icons/CircleAlert.svelte';
	import TriangleAlert from './icons/TriangleAlert.svelte';

	interface Toast {
		message: string;
		type: 'success' | 'error' | 'warning' | 'info';
		actionLabel?: string;
		onAction?: () => void;
	}

	interface Props {
		toast: Toast;
		role?: string;
		ariaLive?: 'polite' | 'assertive' | 'off';
	}

	let { toast, role = 'alert', ariaLive = 'assertive' }: Props = $props();
	let prefersReducedMotion = $state(false);

	const colors: Record<Toast['type'], string> = {
		success: 'var(--success)',
		error: 'var(--error)',
		warning: '#facc15',
		info: 'var(--info)'
	};

	let toastColor = $derived(colors[toast.type]);

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
	{role}
	aria-live={ariaLive}
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
	{#if toast.actionLabel && toast.onAction}
		<button type="button" class="toast-action" onclick={toast.onAction}>
			{toast.actionLabel}
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
		box-shadow:
			2px 2px 0px var(--border-color),
			0px 8px 24px rgba(0, 0, 0, 0.2);
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

	.toast-action:hover,
	.toast-action:focus-visible {
		background: var(--accent);
		color: var(--accent-contrast);
	}

	.toast-item.warning {
		border-left-color: #eab308;
	}
	.toast-item.warning .toast-icon {
		color: #eab308;
	}
</style>
