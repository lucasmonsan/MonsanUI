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
		onConfirm,
		onCancel
	} = $props<{
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}>();

	let activeConfirmText = $derived(confirmText ?? i18n.t('confirmDialog.confirm'));
	let activeCancelText = $derived(cancelText ?? i18n.t('confirmDialog.cancel'));

	function handleClose() {
		open = false;
		onCancel();
	}
</script>

<Dialog bind:open {title} onClose={handleClose} closeLabel={activeCancelText}>
	<div class="confirm-content">
		<p class="modal-body">{message}</p>

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
	</div>
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
		margin-top: var(--space-sm);
	}

	.modal-actions :global(button) {
		flex: 1;
		padding: var(--space-md);
		font-size: var(--text-md);
	}
</style>
