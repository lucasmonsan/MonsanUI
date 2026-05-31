<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'checked'> {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		size?: 'sm' | 'md';
	}

	let {
		checked = $bindable(false),
		disabled = false,
		label = '',
		size = 'md',
		...rest
	}: Props = $props();
</script>

<label
	class="monsan-checkbox-wrapper {size === 'sm' ? 'size-sm' : ''} {disabled
		? 'disabled'
		: ''} "
>
	<input type="checkbox" bind:checked {disabled} class="sr-only" {...rest} />
	<div class="checkbox-box" class:checked>
		{#if checked}
			<svg
				class="check-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
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

	/* Custom Checkbox Box */
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
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			background-color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	/* Sizes */
	.monsan-checkbox-wrapper.size-sm .checkbox-box {
		width: 18px;
		height: 18px;
		border-radius: 4px;
	}

	.monsan-checkbox-wrapper.size-sm .check-icon {
		width: 11px;
		height: 11px;
	}

	.check-icon {
		width: 16px;
		height: 16px;
	}

	/* Hover State */
	.monsan-checkbox-wrapper:hover:not(.disabled) .checkbox-box {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	/* Checked State */
	.checkbox-box.checked {
		background-color: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	.monsan-checkbox-wrapper:hover:not(.disabled) .checkbox-box.checked {
		border-color: var(--border-color);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	/* Focus State via Keyboard */
	input:focus-visible + .checkbox-box {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	/* Label Text */
	.checkbox-label {
		font-size: var(--text-md);
		font-weight: 500;
	}

	.monsan-checkbox-wrapper.size-sm .checkbox-label {
		font-size: var(--text-sm);
	}
</style>
