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
		info?: string;
		tooltipPosition?: 'top' | 'bottom';
		children?: Snippet;
		control?: Snippet<[ControlContext]>;
		labelAddon?: Snippet;
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
		info,
		tooltipPosition = 'top',
		children,
		control,
		labelAddon
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
		<Text tag="span" size="xs" weight="bold" variant="secondary">
			{label}{#if required}<span class="required-mark" aria-hidden="true">*</span>{/if}
			{#if info}
				<span class="info-trigger" role="img" aria-label={info}>
					?
					<span class="info-tooltip position-{tooltipPosition}">{info}</span>
				</span>
			{/if}
			{#if labelAddon}
				{@render labelAddon()}
			{/if}
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
		letter-spacing: 0.05em;
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

	.info-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border: var(--border-width) solid var(--border-color);
		box-shadow: 1px 1px 0 var(--text-primary);
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
		font-size: 11px;
		font-family: var(--font-body);
		font-weight: bold;
		color: var(--text-secondary);
		cursor: help;
		position: relative;
		margin-left: var(--space-xs);
		vertical-align: middle;
		user-select: none;
	}

	.info-trigger:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
		box-shadow: 1.5px 1.5px 0 var(--text-primary);
		transform: translate(-0.5px, -0.5px);
		z-index: 50;
	}

	.info-tooltip {
		visibility: hidden;
		position: absolute;
		background-color: var(--text-primary);
		color: var(--bg-primary);
		text-align: center;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-family: var(--font-body);
		font-weight: 500;
		text-transform: none;
		letter-spacing: normal;
		white-space: normal;
		width: max-content;
		max-width: 220px;
		z-index: 100;
		box-shadow: var(--shadow-md);
		opacity: 0;
		transition: opacity 0.2s var(--ease-out);
		pointer-events: none;
		border: 1px solid var(--border-color);
	}

	.info-tooltip.position-top {
		bottom: 150%;
		left: 50%;
		transform: translateX(-50%);
	}

	.info-tooltip.position-bottom {
		top: 150%;
		left: 50%;
		transform: translateX(-50%);
	}

	.info-trigger:hover .info-tooltip {
		visibility: visible;
		opacity: 1;
	}

	label :global(span > span) {
		color: var(--text-secondary);
		font-size: 10px;
		margin-right: 2px;
		text-transform: none;
		font-weight: 500;
		vertical-align: middle;
	}

	label :global(span > button) {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: 1px 5px;
		font-size: 10px;
		color: var(--text-secondary);
		cursor: pointer;
		font-family: var(--font-body);
		font-weight: 500;
		line-height: 1.2;
		transition: all 0.1s var(--ease-out);
		box-shadow: 1px 1px 0 var(--text-primary);
		vertical-align: middle;
		margin-left: var(--space-xs);
		text-transform: none;
	}

	label :global(span > button:hover) {
		color: var(--text-primary);
		border-color: var(--text-primary);
		box-shadow: 1.5px 1.5px 0 var(--text-primary);
		transform: translate(-0.5px, -0.5px);
	}

	label :global(span > button:active) {
		transform: translate(1px, 1px);
		box-shadow: none;
	}
</style>
