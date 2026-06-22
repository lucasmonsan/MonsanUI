<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	type ControlContext = {
		describedby: string | undefined;
		invalid: boolean;
	};

	interface Props {
		label: string;
		forId: string;
		helper?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		helperId?: string;
		errorId?: string;
		children?: Snippet;
		control?: Snippet<[ControlContext]>;
	}

	let {
		label,
		forId,
		helper,
		error,
		required = false,
		disabled = false,
		helperId,
		errorId,
		children,
		control
	}: Props = $props();

	let resolvedHelperId = $derived(helper ? (helperId ?? `${forId}-helper`) : undefined);
	let resolvedErrorId = $derived(error ? (errorId ?? `${forId}-error`) : undefined);
	let describedby = $derived(
		[resolvedHelperId, resolvedErrorId].filter(Boolean).join(' ') || undefined
	);
	let invalid = $derived(Boolean(error));
</script>

<div class="monsan-form-field" class:is-disabled={disabled} class:is-invalid={invalid}>
	<label for={forId}>
		<Text tag="span" size="sm" weight="bold" variant="secondary">
			{label}{#if required}<span class="required-mark" aria-hidden="true">*</span>{/if}
		</Text>
	</label>

	{#if control}
		{@render control({ describedby, invalid })}
	{:else}
		{@render children?.()}
	{/if}

	{#if helper}
		<p id={resolvedHelperId} class="field-message helper-message">{helper}</p>
	{/if}

	{#if error}
		<p id={resolvedErrorId} class="field-message error-message" role="alert">{error}</p>
	{/if}
</div>

<style>
	.monsan-form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		width: 100%;
	}

	label {
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.is-disabled {
		opacity: 0.7;
	}

	.required-mark {
		color: var(--error);
		margin-left: var(--space-xs);
	}

	.field-message {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		line-height: 1.35;
	}

	.helper-message {
		color: var(--text-secondary);
	}

	.error-message {
		color: var(--error);
		font-weight: 700;
	}
</style>
