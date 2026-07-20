<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';
	import SlidersHorizontalIcon from './icons/SlidersHorizontal.svelte';

	interface Props {
		open?: boolean;
		title: string;
		triggerLabel: string;
		applyLabel: string;
		clearLabel: string;
		cancelLabel: string;
		closeLabel?: string;
		activeCount?: number;
		activeCountLabel?: string;
		disabled?: boolean;
		children: Snippet;
		summary?: Snippet;
		onOpen?: () => void;
		onApply: () => void;
		onClear: () => void;
		onCancel?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		triggerLabel,
		applyLabel,
		clearLabel,
		cancelLabel,
		closeLabel = cancelLabel,
		activeCount = 0,
		activeCountLabel,
		disabled = false,
		children,
		summary,
		onOpen,
		onApply,
		onClear,
		onCancel
	}: Props = $props();

	let triggerAriaLabel = $derived(
		activeCount > 0 && activeCountLabel ? `${triggerLabel}. ${activeCountLabel}` : triggerLabel
	);

	function showDialog() {
		onOpen?.();
		open = true;
	}

	function cancel() {
		open = false;
		onCancel?.();
	}

	function apply() {
		onApply();
		open = false;
	}
</script>

<div class="monsan-filter-dialog-trigger">
	<Button
		variant="secondary"
		size="sm"
		{disabled}
		ariaLabel={triggerAriaLabel}
		ariaExpanded={open}
		onclick={showDialog}
	>
		<SlidersHorizontalIcon size={16} />
		<span>{triggerLabel}</span>
		{#if activeCount > 0}
			<Badge size="sm" variant="primary" ariaLabel={activeCountLabel}>{activeCount}</Badge>
		{/if}
	</Button>
	{#if summary}
		<div class="filter-dialog-summary">
			{@render summary()}
		</div>
	{/if}
</div>

<Dialog bind:open {title} {closeLabel} size="md" onClose={onCancel}>
	{@render children()}

	{#snippet footer()}
		<div class="filter-dialog-footer">
			<Button variant="secondary" size="sm" onclick={onClear}>{clearLabel}</Button>
			<div class="filter-dialog-primary-actions">
				<Button variant="secondary" size="sm" onclick={cancel}>{cancelLabel}</Button>
				<Button variant="primary" size="sm" onclick={apply}>{applyLabel}</Button>
			</div>
		</div>
	{/snippet}
</Dialog>

<style>
	.monsan-filter-dialog-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}

	.filter-dialog-summary {
		min-width: 0;
	}

	.filter-dialog-footer,
	.filter-dialog-primary-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.filter-dialog-footer {
		justify-content: space-between;
		width: 100%;
	}

	@media (max-width: 480px) {
		.monsan-filter-dialog-trigger {
			align-items: flex-start;
			flex-direction: column;
		}

		.filter-dialog-footer {
			align-items: stretch;
			flex-direction: column;
		}

		.filter-dialog-primary-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
