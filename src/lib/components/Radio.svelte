<script lang="ts" generics="T">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'group' | 'value'> {
		group?: T;
		value: T;
		disabled?: boolean;
		label?: string;
		size?: 'sm' | 'md';
	}

	let {
		group = $bindable(),
		value,
		disabled = false,
		label = '',
		size = 'md',
		...rest
	}: Props = $props();

	let checked = $derived(group === value);
</script>

<label
	class="monsan-radio-wrapper {size === 'sm' ? 'size-sm' : ''} {disabled
		? 'disabled'
		: ''} "
>
	<input type="radio" bind:group {value} {disabled} class="sr-only" {...rest} />
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

	/* Hidden native input for accessibility */
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

	/* Custom Radio Circle */
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

	/* Sizes */
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

	/* Hover State */
	.monsan-radio-wrapper:hover:not(.disabled) .radio-circle {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	/* Checked State */
	.radio-circle.checked {
		border-color: var(--border-color);
	}

	.monsan-radio-wrapper:hover:not(.disabled) .radio-circle.checked {
		border-color: var(--border-color);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	/* Focus State via Keyboard */
	input:focus-visible + .radio-circle {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	/* Label Text */
	.radio-label {
		font-size: var(--text-md);
		font-weight: 500;
	}

	.monsan-radio-wrapper.size-sm .radio-label {
		font-size: var(--text-sm);
	}
</style>
