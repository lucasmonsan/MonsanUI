<script lang="ts">
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		/** Exibe ou oculta o loading */
		active?: boolean;
		/** Mensagem customizada. Se não fornecida, usa o i18n padrão */
		message?: string;
		[key: string]: unknown;
	}

	let { active = false, message, ...restProps }: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let previousActiveElement = $state<HTMLElement | null>(null);

	// Focus trapping para acessibilidade (a11y)
	$effect(() => {
		if (active) {
			if (typeof document !== 'undefined') {
				previousActiveElement = document.activeElement as HTMLElement;
				// Aguarda renderização e foca o container
				const timer = setTimeout(() => {
					containerEl?.focus();
				}, 50);

				const handleFocus = (e: FocusEvent) => {
					if (containerEl && !containerEl.contains(e.target as Node)) {
						e.preventDefault();
						containerEl.focus();
					}
				};

				document.addEventListener('focusin', handleFocus);
				return () => {
					clearTimeout(timer);
					document.removeEventListener('focusin', handleFocus);
					previousActiveElement?.focus();
				};
			}
		}
	});

	let displayMessage = $derived(message ?? i18n.t('loading.message'));
</script>

{#if active}
	<div
		bind:this={containerEl}
		class="monsan-loading-overlay"
		role="status"
		aria-busy={active ? 'true' : 'false'}
		aria-live="polite"
		tabindex="-1"
		{...restProps}
	>
		<div class="loading-card">
			<div class="spinner-box">
				<div class="brutalist-spinner"></div>
			</div>
			{#if displayMessage}
				<span class="loading-text">{displayMessage}</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.monsan-loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background-color: rgba(45, 36, 34, 0.45);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md);
		outline: none;
		animation: overlayFadeIn 0.2s var(--ease-out);
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
</style>
