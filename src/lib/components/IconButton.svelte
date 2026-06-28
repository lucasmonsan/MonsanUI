<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		label: string;
		title?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
		size?: 'sm' | 'md';
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
		size = 'md',
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
	class="monsan-icon-button {variant} size-{size}"
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
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out),
			border-color 0.1s var(--ease-out),
			color 0.1s var(--ease-out);
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

	.monsan-icon-button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-icon-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-icon-button {
			transition: none;
		}
	}

	.size-sm {
		width: calc(var(--control-height) * 0.8);
		height: calc(var(--control-height) * 0.8);
		box-shadow: 2px 2px 0 var(--text-primary);
	}

	.size-sm:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0 var(--text-primary);
	}

	.size-sm:active:not(:disabled) {
		transform: translate(1px, 1px);
		box-shadow: none;
	}
</style>
