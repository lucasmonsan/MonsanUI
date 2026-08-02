<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';
	import IconButton from './IconButton.svelte';
	import CheckIcon from './icons/Check.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import SlidersHorizontalIcon from './icons/SlidersHorizontal.svelte';
	import XIcon from './icons/X.svelte';

	interface Props {
		open?: boolean;
		title: string;
		triggerLabel: string;
		applyLabel: string;
		clearLabel: string;
		cancelLabel: string;
		closeLabel: string;
		activeCount?: number;
		activeCountLabel?: string;
		disabled?: boolean;
		/** Hide the built-in trigger when a shared external control owns the dialog state. */
		showTrigger?: boolean;
		/** Uses icon-only footer controls that stay on one line on narrow screens. */
		compactActions?: boolean;
		children: Snippet;
		summary?: Snippet;
		headerActions?: Snippet;
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
		closeLabel,
		activeCount = 0,
		activeCountLabel,
		disabled = false,
		showTrigger = true,
		compactActions = false,
		children,
		summary,
		headerActions: headerActionsContent,
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

{#if showTrigger}
	<div class="monsan-filter-dialog-trigger">
		<Button
			variant="secondary"
			{disabled}
			ariaLabel={triggerAriaLabel}
			ariaExpanded={open}
			iconOnlyBelow="sm"
			onclick={showDialog}
		>
			<SlidersHorizontalIcon size={16} />
			<span class="monsan-button-label">{triggerLabel}</span>
			{#if activeCount > 0}
				<span class="filter-dialog-count" aria-hidden="true">
					<Badge size="sm" variant="primary">{activeCount}</Badge>
				</span>
			{/if}
		</Button>
		{#if summary}
			<div class="filter-dialog-summary">
				{@render summary()}
			</div>
		{/if}
	</div>
{/if}

<Dialog
	bind:open
	{title}
	{closeLabel}
	size="md"
	contentGrow={false}
	compactHeader
	closeOnBackNavigation={false}
	onClose={onCancel}
	headerActions={headerActionsContent}
>
	{@render children()}

	{#snippet footer()}
		<div class="filter-dialog-footer" class:compact-actions={compactActions}>
			{#if compactActions}
				<IconButton size="sm" variant="secondary" label={clearLabel} onclick={onClear}>
					<RotateCwIcon size={16} />
				</IconButton>
				<div class="filter-dialog-primary-actions">
					<IconButton size="sm" variant="secondary" label={cancelLabel} onclick={cancel}>
						<XIcon size={16} />
					</IconButton>
					<IconButton size="sm" variant="primary" label={applyLabel} onclick={apply}>
						<CheckIcon size={16} />
					</IconButton>
				</div>
			{:else}
				<Button variant="secondary" size="sm" onclick={onClear}>{clearLabel}</Button>
				<div class="filter-dialog-primary-actions">
					<Button variant="secondary" size="sm" onclick={cancel}>{cancelLabel}</Button>
					<Button variant="primary" size="sm" onclick={apply}>{applyLabel}</Button>
				</div>
			{/if}
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

	.filter-dialog-footer.compact-actions {
		flex-wrap: nowrap;
	}

	@media (max-width: 480px) {
		.monsan-filter-dialog-trigger {
			align-items: flex-start;
			flex-direction: column;
		}

		.filter-dialog-footer:not(.compact-actions) {
			align-items: stretch;
			flex-direction: column;
		}

		.filter-dialog-primary-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.filter-dialog-count {
			display: none;
		}
	}
</style>
