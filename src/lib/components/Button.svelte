<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
		size?: 'sm' | 'md';
		shape?: 'default' | 'pill';
		disabled?: boolean;
		block?: boolean;
		square?: boolean;
		title?: string;
		ariaLabel?: string;
		ariaBusy?: boolean;
		ariaExpanded?: boolean;
		ariaPressed?: boolean;
		ariaControls?: string;
		'aria-label'?: string;
		'aria-busy'?: boolean;
		deckTheme?: string;
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
		square = false,
		title,
		ariaLabel,
		ariaBusy,
		ariaExpanded,
		ariaPressed,
		ariaControls,
		'aria-label': ariaLabelAttr,
		'aria-busy': ariaBusyAttr,
		deckTheme
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	{title}
	aria-label={ariaLabel ?? ariaLabelAttr}
	aria-busy={ariaBusy ?? ariaBusyAttr}
	aria-expanded={ariaExpanded}
	aria-pressed={ariaPressed}
	aria-controls={ariaControls}
	data-deck-theme={deckTheme}
	class="monsan-button {variant} size-{size} shape-{shape} {block ? 'block' : ''} {square
		? 'square'
		: ''}"
>
	{@render children?.()}
</button>

<style>
	.monsan-button {
		font-family: inherit;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0;
		min-height: var(--control-height);
		height: auto;
		padding: var(--space-sm) var(--space-md);
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

	.square {
		padding: 0;
		width: var(--control-height);
		height: var(--control-height);
	}

	.size-sm {
		min-height: calc(var(--control-height) * 0.8);
		padding: var(--space-sm) var(--space-sm);
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
	.warning {
		background-color: var(--warning);
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
		background-color: var(--accent-primary);
	}
	:global([data-theme='dark']) .success {
		background-color: color-mix(in srgb, var(--success) 75%, black);
	}
	:global([data-theme='dark']) .error {
		background-color: color-mix(in srgb, var(--error) 75%, black);
	}
	:global([data-theme='dark']) .warning {
		background-color: color-mix(in srgb, var(--warning) 75%, black);
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
