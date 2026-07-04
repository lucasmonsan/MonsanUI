<script lang="ts">
	import { onDestroy } from 'svelte';
	import X from '$lib/components/icons/X.svelte';
	import Button from './Button.svelte';
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
		closeOnOutsideClick = true,
		closeOnEscape = true,
		size = 'md',
		animation = 'pop',
		padding = 'var(--space-md)',
		compactHeader = false,
		showSubheader = true,
		showFooter = true,
		ariaDescribedby
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
		closeOnOutsideClick?: boolean;
		closeOnEscape?: boolean;
		size?: 'sm' | 'md' | 'lg';
		animation?: 'pop' | 'slide' | 'fade' | 'scale';
		padding?: PaddingPreset;
		compactHeader?: boolean;
		showSubheader?: boolean;
		showFooter?: boolean;
		ariaDescribedby?: string;
	}>();

	let resolvedPadding = $derived(resolvePadding(padding));

	const dialogId = Math.random().toString(36).substring(2, 9);
	const titleId = `dialog-${dialogId}-title`;
	const subheaderId = `dialog-${dialogId}-description`;
	const closeAnimationMs = 180;
	let dialogRef = $state<HTMLDialogElement>();
	let previousActiveElement: HTMLElement | null = null;
	let historyAdded = false;
	let mounted = $state(open);
	let closing = $state(false);
	let closeAnimationTimer: ReturnType<typeof setTimeout> | undefined;
	let activeDescribedby = $derived(
		ariaDescribedby ?? (subheader && showSubheader ? subheaderId : undefined)
	);

	function clearCloseAnimationTimer() {
		if (closeAnimationTimer) {
			clearTimeout(closeAnimationTimer);
			closeAnimationTimer = undefined;
		}
	}

	function finishCloseAnimation() {
		if (open) return;
		if (dialogRef?.open) {
			dialogRef.close();
		}
		restoreFocus();
		mounted = false;
		closing = false;
		closeAnimationTimer = undefined;
	}

	// Keep the native dialog mounted long enough for exit animation to play.
	$effect(() => {
		if (open) {
			clearCloseAnimationTimer();
			mounted = true;
			closing = false;
		} else if (mounted && !closing) {
			closing = true;
			clearCloseAnimationTimer();
			closeAnimationTimer = setTimeout(finishCloseAnimation, closeAnimationMs);
		}
	});

	// Control native dialog modal display state after the element is rendered.
	$effect(() => {
		if (mounted && dialogRef && !dialogRef.open) {
			if (
				document.activeElement instanceof HTMLElement &&
				!dialogRef.contains(document.activeElement)
			) {
				previousActiveElement = document.activeElement;
			}
			dialogRef.showModal();
		}
	});

	onDestroy(() => {
		clearCloseAnimationTimer();
		if (dialogRef?.open) {
			dialogRef.close();
		}
		restoreFocus();
	});

	function restoreFocus() {
		if (previousActiveElement?.isConnected) {
			previousActiveElement.focus();
		}
		previousActiveElement = null;
	}

	function close() {
		open = false;
		onClose?.();
	}

	function handleCancel(e: Event) {
		e.preventDefault();
		if (!closeOnEscape) {
			return;
		}
		close();
	}

	function handleNativeClose() {
		if (open) {
			close();
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (closeOnOutsideClick && e.target === dialogRef) {
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

{#if mounted}
	<dialog
		bind:this={dialogRef}
		oncancel={handleCancel}
		onclose={handleNativeClose}
		onpointerdown={handlePointerDown}
		class="dialog-wrapper"
		class:closing
		aria-labelledby={titleId}
		aria-describedby={activeDescribedby}
	>
		<!-- Dialog Content Container -->
		<div class="modal-container anim-{animation} size-{size}" class:closing role="document">
			<!-- Header -->
			<header class="modal-header" class:compact={compactHeader}>
				<h2 id={titleId}>{title}</h2>
				<div class="modal-header-actions">
					{#if headerActions}
						{@render headerActions()}
					{/if}
					<Button
						size="sm"
						square
						variant="secondary"
						title={closeLabel}
						ariaLabel={closeLabel}
						onclick={close}
					>
						<X size={18} />
					</Button>
				</div>
			</header>

			{#if subheader && showSubheader}
				<div id={subheaderId} class="modal-subheader">
					{@render subheader()}
				</div>
			{/if}

			<!-- Content -->
			<div class="modal-content" style:padding={resolvedPadding}>
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
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		border: none;
		padding: 0;
		margin: 0;
		overflow: visible;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: dialogBackdropIn 0.18s ease-out forwards;
	}

	:global(.monsan-low-end) .dialog-wrapper {
		backdrop-filter: none;
	}

	.dialog-wrapper.closing {
		pointer-events: none;
		animation: dialogBackdropOut 0.18s ease-in forwards;
	}

	.dialog-wrapper::backdrop {
		background: transparent;
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
		z-index: 1;
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

	.modal-container.anim-pop.closing {
		animation: popOut 0.18s ease-in forwards;
	}

	.modal-container.anim-slide.closing {
		animation: animSlideOut 0.18s ease-in forwards;
	}

	.modal-container.anim-fade.closing {
		animation: animFadeOutOnly 0.18s ease-in forwards;
	}

	.modal-container.anim-scale.closing {
		animation: animScaleOut 0.18s ease-in forwards;
	}

	@keyframes dialogBackdropIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes dialogBackdropOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
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

	@keyframes animSlideOut {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(80px);
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

	@keyframes animFadeOutOnly {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
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

	@keyframes animScaleOut {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.96);
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

	@keyframes popOut {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.96);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dialog-wrapper,
		.dialog-wrapper.closing,
		.anim-pop,
		.anim-slide,
		.anim-fade,
		.anim-scale,
		.modal-container.anim-pop.closing,
		.modal-container.anim-slide.closing,
		.modal-container.anim-fade.closing,
		.modal-container.anim-scale.closing {
			animation-duration: 0.01ms;
		}
	}

	@media (max-width: 600px) {
		.dialog-wrapper {
			padding: var(--space-md);
		}
	}
</style>
