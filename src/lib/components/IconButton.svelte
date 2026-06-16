<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		label: string;
		title?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
		selected?: boolean;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		role?: 'menuitem';
	}

	let {
		children,
		label,
		title = label,
		type = 'button',
		variant = 'secondary',
		selected,
		disabled = false,
		onclick,
		role
	}: Props = $props();
</script>

<button
	{type}
	{title}
	{disabled}
	{onclick}
	{role}
	class="monsan-icon-button {variant}"
	class:selected
	aria-label={label}
	aria-pressed={selected}
>
	{@render children()}
</button>

<style>
	.monsan-icon-button {
		width: var(--control-height);
		height: var(--control-height);
		padding: 0;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-primary);
		background: var(--bg-secondary);
	}

	.primary,
	.selected {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.success {
		background: var(--success);
		color: var(--bg-primary);
	}

	.warning {
		background: var(--warning);
		color: var(--bg-primary);
	}

	.error {
		background: var(--error);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .primary,
	:global([data-theme='dark']) .success,
	:global([data-theme='dark']) .warning,
	:global([data-theme='dark']) .error {
		color: var(--text-primary);
	}

	.monsan-icon-button:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	.monsan-icon-button:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-icon-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
