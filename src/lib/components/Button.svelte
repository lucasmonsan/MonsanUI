<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'error' | 'neutral';
		size?: 'sm' | 'md';
		shape?: 'default' | 'pill';
		disabled?: boolean;
		block?: boolean;
		class?: string;
		title?: string;
		'aria-label'?: string;
		[key: string]: unknown;
	}

	let {
		children,
		onclick,
		type = 'button',
		variant = 'primary',
		size = 'md',
		shape = 'default',
		disabled = false,
		block = false,
		class: className = '',
		title,
		'aria-label': ariaLabel,
		...restProps
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	{title}
	aria-label={ariaLabel}
	class="monsan-button {variant} size-{size} shape-{shape} {block ? 'block' : ''} {className}"
	{...restProps}
>
	{@render children?.()}
</button>

<style>
	.monsan-button {
		font-family: inherit;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0;
		height: var(--control-height);
		padding: 0 var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.1s ease;
		box-shadow: var(--shadow-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		font-size: var(--text-md);
	}

	.block {
		width: 100%;
	}

	.size-sm {
		height: calc(var(--control-height) * 0.8);
		padding: 0 var(--space-sm);
		font-size: var(--text-sm);
	}

	.shape-pill {
		border-radius: var(--radius-full);
	}

	/* Variantes de cores */
	.primary {
		background-color: var(--accent-primary);
		color: var(--bg-primary);
	}
	.secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}
	.success {
		background-color: var(--success);
		color: var(--bg-primary);
	}
	.error {
		background-color: var(--error);
		color: var(--bg-primary);
	}
	.neutral {
		background-color: var(--neutral);
		color: var(--bg-primary);
	}

	/* Ajustes para Tema Dark (Texto Claro e Fundo Escurecido) */
	:global([data-theme='dark']) .monsan-button:not(.secondary) {
		color: var(--text-primary);
	}
	:global([data-theme='dark']) .primary {
		background-color: color-mix(in srgb, var(--accent-primary) 75%, black);
	}
	:global([data-theme='dark']) .success {
		background-color: color-mix(in srgb, var(--success) 75%, black);
	}
	:global([data-theme='dark']) .error {
		background-color: color-mix(in srgb, var(--error) 75%, black);
	}
	:global([data-theme='dark']) .neutral {
		background-color: color-mix(in srgb, var(--neutral) 75%, black);
	}

	.monsan-button:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--text-primary);
	}

	.monsan-button:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.monsan-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}
</style>
