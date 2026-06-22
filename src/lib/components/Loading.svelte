<script lang="ts">
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		active?: boolean;
		message?: string;
	}

	let { active = false, message }: Props = $props();

	let containerEl = $state<HTMLDialogElement>();
	let previousActiveElement = $state<HTMLElement | null>(null);
	const messageId = `loading-${Math.random().toString(36).slice(2, 9)}-message`;

	$effect(() => {
		if (!active || !containerEl || typeof document === 'undefined') {
			return;
		}

		previousActiveElement =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		containerEl.showModal();
		containerEl.focus();

		return () => {
			if (containerEl?.open) {
				containerEl.close();
			}
			if (previousActiveElement?.isConnected) {
				previousActiveElement.focus();
			}
			previousActiveElement = null;
		};
	});

	let displayMessage = $derived(message ?? i18n.t('loading.message'));

	function preventDismiss(event: Event) {
		event.preventDefault();
	}
</script>

{#if active}
	<dialog
		bind:this={containerEl}
		class="monsan-loading-overlay"
		aria-labelledby={messageId}
		aria-busy="true"
		tabindex="-1"
		oncancel={preventDismiss}
	>
		<div class="loading-card" role="status" aria-live="polite" aria-atomic="true">
			<div class="spinner-box">
				<div class="brutalist-spinner"></div>
			</div>
			{#if displayMessage}
				<span id={messageId} class="loading-text">{displayMessage}</span>
			{/if}
		</div>
	</dialog>
{/if}

<style>
	.monsan-loading-overlay {
		position: fixed;
		inset: 0;
		width: 100dvw;
		height: 100dvh;
		max-width: none;
		max-height: none;
		margin: 0;
		border: 0;
		background-color: color-mix(in srgb, var(--bg-primary) 45%, transparent);
		backdrop-filter: blur(4px);
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		outline: none;
		animation: overlayFadeIn 0.2s var(--ease-out);
	}

	.monsan-loading-overlay[open] {
		display: flex;
	}

	.monsan-loading-overlay:not([open]) {
		display: none;
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.loading-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: var(--space-xl) var(--space-2xl);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		animation: cardPopIn 0.25s cubic-bezier(0.34, 1.3, 0.64, 1);
		max-width: 90%;
		text-align: center;
	}

	@keyframes cardPopIn {
		from {
			transform: scale(0.9) translateY(10px);
			opacity: 0;
		}
		to {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.spinner-box {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.brutalist-spinner {
		width: 32px;
		height: 32px;
		background-color: var(--accent-primary);
		border: var(--border-width) solid var(--border-color);
		animation: brutalistRotate 1s infinite steps(8);
	}

	@keyframes brutalistRotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-weight: 800;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-loading-overlay,
		.loading-card,
		.brutalist-spinner {
			animation: none;
		}
	}
</style>
