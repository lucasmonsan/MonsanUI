<script lang="ts" generics="T">
	interface Props {
		group?: T;
		value: T;
		disabled?: boolean;
		label?: string;
		size?: 'sm' | 'md';
		id?: string;
		name?: string;
		required?: boolean;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		onchange?: (event: Event) => void;
	}

	let {
		group = $bindable(),
		value,
		disabled = false,
		label = '',
		size = 'md',
		id,
		name,
		required = false,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		onchange
	}: Props = $props();

	let checked = $derived(group === value);
</script>

<label class="monsan-radio-wrapper" class:size-sm={size === 'sm'} class:disabled>
	<input
		type="radio"
		bind:group
		{value}
		{id}
		{name}
		{disabled}
		{required}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		{onchange}
		class="sr-only"
	/>
	<div class="radio-circle" class:checked>
		<div class="radio-inner-dot" class:checked></div>
	</div>
	{#if label}
		<span class="radio-label">{label}</span>
	{/if}
</label>

<style>
	.monsan-radio-wrapper {
		display: inline-flex;
		align-items: center;
		gap: var(--space-md);
		cursor: pointer;
		user-select: none;
		font-family: var(--font-body);
		color: var(--text-primary);
		transition: opacity 0.2s ease;
	}

	.monsan-radio-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.6;
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

	.radio-circle {
		width: 24px;
		height: 24px;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-full);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.radio-inner-dot {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-full);
		background-color: var(--accent-primary);
		transform: scale(0) translate(-0.5px, 0px);
		transition: transform 0.2s var(--ease-out);
		transform-origin: center;
	}

	.radio-inner-dot.checked {
		transform: scale(1) translate(-0.5px, 0px);
	}

	.monsan-radio-wrapper.size-sm .radio-circle {
		width: 18px;
		height: 18px;
	}

	.monsan-radio-wrapper.size-sm .radio-inner-dot {
		width: 8px;
		height: 8px;
		transform: scale(0) translate(-0.5px, 0px);
	}

	.monsan-radio-wrapper.size-sm .radio-inner-dot.checked {
		transform: scale(1) translate(-0.5px, 0px);
	}

	.monsan-radio-wrapper:hover:not(.disabled) .radio-circle {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.radio-circle.checked {
		border-color: var(--border-color);
	}

	.monsan-radio-wrapper:hover:not(.disabled) .radio-circle.checked {
		border-color: var(--border-color);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	input:focus-visible + .radio-circle {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	input[aria-invalid='true'] + .radio-circle {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
	}

	.radio-label {
		font-size: var(--text-md);
		font-weight: 500;
	}

	.monsan-radio-wrapper.size-sm .radio-label {
		font-size: var(--text-sm);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-radio-wrapper,
		.radio-circle,
		.radio-inner-dot {
			transition: none;
		}
	}
</style>
