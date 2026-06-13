<script lang="ts">
	import X from '$lib/components/icons/X.svelte';
	import type { PaddingPreset } from '$lib/utils/layout.js';
	import { resolvePadding } from '$lib/utils/layout.js';
	import { pushDialog, popDialog } from '../utils/dialogStack.js';

	let {
		open = $bindable(false),
		title,
		children,
		onClose,
		headerActions,
		subheader,
		footer,
		closeLabel = 'Fechar',
		closeOnBackNavigation = true,
		size = 'md',
		animation = 'pop',
		padding = 'var(--space-md)',
		compactHeader = false,
		showSubheader = true,
		showFooter = true
	} = $props<{
		open: boolean;
		title: string;
		children: import('svelte').Snippet;
		onClose?: () => void;
		headerActions?: import('svelte').Snippet;
		subheader?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		closeLabel?: string;
		closeOnBackNavigation?: boolean;
		size?: 'sm' | 'md' | 'lg';
		animation?: 'pop' | 'slide' | 'fade' | 'scale';
		padding?: PaddingPreset;
		compactHeader?: boolean;
		showSubheader?: boolean;
		showFooter?: boolean;
	}>();

	let resolvedPadding = $derived(resolvePadding(padding));

	const dialogId = Math.random().toString(36).substring(2, 9);
	let dialogRef = $state<HTMLDialogElement>();
	let historyAdded = false;

	// Control native dialog modal display state
	$effect(() => {
		if (dialogRef) {
			if (open) {
				if (!dialogRef.open) {
					dialogRef.showModal();
				}
			} else {
				if (dialogRef.open) {
					dialogRef.close();
				}
			}
		}
	});

	function close() {
		open = false;
		onClose?.();
	}

	function handleCancel(e: Event) {
		e.preventDefault();
		close();
	}

	function handleNativeClose() {
		if (open) {
			close();
		}
	}

	// Back button/gesture navigation handler using dialogStack
	$effect(() => {
		if (!closeOnBackNavigation) return;
		if (open && !historyAdded) {
			pushDialog(dialogId, close);
			historyAdded = true;
		} else if (!open && historyAdded) {
			popDialog(dialogId);
			historyAdded = false;
		}

		return () => {
			if (historyAdded) {
				popDialog(dialogId);
				historyAdded = false;
			}
		};
	});
</script>

{#if open}
	<dialog
		bind:this={dialogRef}
		oncancel={handleCancel}
		onclose={handleNativeClose}
		class="dialog-wrapper"
		aria-labelledby="modal-title"
	>
		<!-- Backdrop overlay button -->
		<button
			type="button"
			class="modal-backdrop animate-fade-in"
			onclick={close}
			aria-label={closeLabel}
		></button>

		<!-- Dialog Content Container -->
		<div class="modal-container anim-{animation} size-{size}" role="document">
			<!-- Header -->
			<header class="modal-header" class:compact={compactHeader}>
				<h2 id="modal-title">{title}</h2>
				<div class="modal-header-actions">
					{#if headerActions}
						{@render headerActions()}
					{/if}
					<button type="button" class="close-btn" onclick={close} aria-label={closeLabel}>
						<X size={24} />
					</button>
				</div>
			</header>

			{#if subheader && showSubheader}
				<div class="modal-subheader">
					{@render subheader()}
				</div>
			{/if}

			<!-- Content -->
			<div class="modal-content" style="padding: {resolvedPadding}">
				{@render children()}
			</div>

			{#if footer && showFooter}
				<footer class="modal-footer">
					{@render footer()}
				</footer>
			{/if}
		</div>
	</dialog>
{/if}

<style>
	.dialog-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		max-width: 100vw;
		max-height: 100vh;
		background: transparent;
		border: none;
		padding: 0;
		margin: 0;
		overflow: visible;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog-wrapper::backdrop {
		background: transparent;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 1000;
		border: none;
		margin: 0;
		padding: 0;
		outline: none;
		cursor: pointer;
	}

	.modal-container {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1001;
		max-height: min(85vh, calc(100dvh - var(--space-md) * 2));
		overflow: hidden;
	}

	.modal-container.size-sm {
		max-width: 400px;
	}

	.modal-container.size-md {
		max-width: 500px;
	}

	.modal-container.size-lg {
		max-width: 800px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md);
		border-bottom: var(--border-width) solid var(--border-color);
		background: var(--bg-secondary);
	}

	.modal-header.compact {
		padding: var(--space-sm) var(--space-md);
	}

	.modal-header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.modal-header h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 900;
		color: var(--text-primary);
	}

	.modal-header.compact h2 {
		font-size: var(--text-lg);
	}

	.close-btn {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		cursor: pointer;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--base) * 2.3);
		height: calc(var(--base) * 2.3);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out);
		box-shadow: var(--shadow-sm);
	}

	.close-btn:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.close-btn:active {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.modal-content {
		padding: var(--space-md);
		background: var(--bg-primary);
		color: var(--text-primary);
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
	}

	.modal-subheader,
	.modal-footer {
		flex: 0 0 auto;
		background: var(--bg-primary);
	}

	.modal-subheader {
		padding: var(--space-md);
		border-bottom: var(--border-width) solid var(--border-color);
	}

	.modal-footer {
		padding: var(--space-sm) var(--space-md);
		border-top: var(--border-width) solid var(--border-color);
	}

	/* Keyframes and classes for selectable dialog animations */
	.anim-pop {
		animation: popInSpring 0.3s cubic-bezier(0.34, 1.15, 0.64, 1) forwards;
	}
	.anim-slide {
		animation: animSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.anim-fade {
		animation: animFadeInOnly 0.18s ease-out forwards;
	}
	.anim-scale {
		animation: animScaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes animSlideIn {
		from {
			opacity: 0;
			transform: translateY(120px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes animFadeInOnly {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes animScaleIn {
		from {
			opacity: 0;
			transform: scale(0.3);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes popInSpring {
		0% {
			opacity: 0;
			transform: scale(0.96);
		}
		70% {
			transform: scale(1.01);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (max-width: 600px) {
		.dialog-wrapper {
			padding: var(--space-md);
		}
	}
</style>
