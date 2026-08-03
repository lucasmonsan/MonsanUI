<script lang="ts">
	import Check from './icons/Check.svelte';

	interface Props {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		size?: 'sm' | 'md';
		id?: string;
		name?: string;
		value?: string;
		required?: boolean;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		onchange?: (event: Event) => void;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		label = '',
		size = 'md',
		id,
		name,
		value,
		required = false,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		onchange
	}: Props = $props();
</script>

<label
	class="monsan-checkbox-wrapper"
	class:size-sm={size === 'sm'}
	class:disabled
	class:unlabeled={!label}
>
	<input
		type="checkbox"
		bind:checked
		{id}
		{name}
		{value}
		{disabled}
		{required}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		{onchange}
		class="sr-only"
	/>
	<div class="checkbox-box" class:checked>
		{#if checked}
			<span class="check-icon">
				<Check size={size === 'sm' ? 11 : 16} />
			</span>
		{/if}
	</div>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.monsan-checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		gap: var(--space-md);
		cursor: pointer;
		user-select: none;
		font-family: var(--font-body);
		color: var(--text-primary);
		transition: opacity 0.2s ease;
	}

	.monsan-checkbox-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/*
	 * In a table cell an inline-flex element participates in line-box baseline
	 * calculation. The check SVG only exists when checked, so without a fixed
	 * baseline it could change the computed row height. Unlabeled checkboxes are
	 * controls only; normalize their line box while preserving labeled fields.
	 */
	.monsan-checkbox-wrapper.unlabeled {
		vertical-align: middle;
		line-height: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.checkbox-box {
		width: 24px;
		height: 24px;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--bg-primary);
		transition:
			background-color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.monsan-checkbox-wrapper.size-sm .checkbox-box {
		width: 18px;
		height: 18px;
		border-radius: 4px;
	}

	.check-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.monsan-checkbox-wrapper:hover:not(.disabled) .checkbox-box {
		border-color: var(--accent-primary);
	}

	.checkbox-box.checked {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.monsan-checkbox-wrapper:hover:not(.disabled) .checkbox-box.checked {
		border-color: var(--accent-primary);
	}

	input:focus-visible + .checkbox-box {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	input[aria-invalid='true'] + .checkbox-box {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
	}

	.checkbox-label {
		font-size: var(--text-md);
		font-weight: 500;
	}

	.monsan-checkbox-wrapper.size-sm .checkbox-label {
		font-size: var(--text-sm);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-checkbox-wrapper,
		.checkbox-box {
			transition: none;
		}
	}
</style>
