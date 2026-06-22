<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Button from './Button.svelte';
	import { i18n } from '../utils/i18n.svelte';

	let {
		open = $bindable(false),
		title,
		message,
		confirmText,
		cancelText,
		closeOnBackNavigation = true,
		onConfirm,
		onCancel
	} = $props<{
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		closeOnBackNavigation?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}>();

	let activeConfirmText = $derived(confirmText ?? i18n.t('confirmDialog.confirm'));
	let activeCancelText = $derived(cancelText ?? i18n.t('confirmDialog.cancel'));
	const messageId = `confirm-dialog-${Math.random().toString(36).slice(2, 9)}-message`;

	function handleClose() {
		open = false;
		onCancel();
	}
</script>

<Dialog
	bind:open
	{title}
	onClose={handleClose}
	closeLabel={activeCancelText}
	{closeOnBackNavigation}
	ariaDescribedby={messageId}
>
	<div class="confirm-content">
		<p id={messageId} class="modal-body">{message}</p>
	</div>

	{#snippet footer()}
		<div class="modal-actions">
			<Button variant="secondary" onclick={handleClose} title={activeCancelText}>
				{activeCancelText}
			</Button>
			<Button
				variant="primary"
				onclick={() => {
					open = false;
					onConfirm();
				}}
				title={activeConfirmText}
			>
				{activeConfirmText}
			</Button>
		</div>
	{/snippet}
</Dialog>

<style>
	.confirm-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		text-align: center;
		width: 100%;
	}

	.modal-body {
		font-family: var(--font-body);
		font-size: var(--text-md);
		color: var(--text-primary);
		line-height: 1.6;
		margin: 0;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-md);
		width: 100%;
	}

	.modal-actions :global(button) {
		flex: 1;
		padding: var(--space-md);
		font-size: var(--text-md);
	}
</style>
