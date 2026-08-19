<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
		size?: 'sm' | 'md' | 'compact';
		shape?: 'default' | 'pill';
		disabled?: boolean;
		block?: boolean;
		square?: boolean;
		label?: string;
		iconOnlyBelow?: 'sm' | 'md';
		title?: string;
		ariaLabel?: string;
		ariaBusy?: boolean;
		ariaExpanded?: boolean;
		ariaPressed?: boolean;
		ariaControls?: string;
		'aria-label'?: string;
		'aria-busy'?: boolean;
		deckTheme?: string;
		casing?: 'uppercase' | 'none';
		minWidth?: string;
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
		label,
		iconOnlyBelow,
		title,
		ariaLabel,
		ariaBusy,
		ariaExpanded,
		ariaPressed,
		ariaControls,
		'aria-label': ariaLabelAttr,
		'aria-busy': ariaBusyAttr,
		deckTheme,
		casing = 'uppercase',
		minWidth
	}: Props = $props();

	const responsiveIconClass = $derived(iconOnlyBelow ? `icon-only-${iconOnlyBelow}` : '');
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
	style:min-width={minWidth}
	class="monsan-button {variant} size-{size} shape-{shape} casing-{casing} {responsiveIconClass}"
	class:block
	class:square
>
	{@render children?.()}
	{#if label}
		<span class="monsan-button-label">{label}</span>
	{/if}
</button>

<style>
	.monsan-button {
		font-family: inherit;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.monsan-button.casing-none {
		text-transform: none;
	}

	.monsan-button {
		min-height: var(--control-height);
		height: auto;
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out),
			border-color 0.1s var(--ease-out),
			color 0.1s var(--ease-out);
		box-shadow: var(--shadow-sm);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		font-size: var(--text-md);
		line-height: 1;
	}

	.monsan-button-label {
		display: inline-flex;
		align-items: center;
		line-height: 1;
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
		height: calc(var(--control-height) * 0.8);
		min-height: calc(var(--control-height) * 0.8);
		padding: 0 var(--space-sm);
		font-size: var(--text-sm);
		line-height: 1;
	}

	.size-compact {
		min-height: 0;
		padding: var(--space-sm);
		font-size: var(--text-sm);
		line-height: 1.1;
	}

	.size-sm.square {
		width: calc(var(--control-height) * 0.8);
		height: calc(var(--control-height) * 0.8);
		min-height: calc(var(--control-height) * 0.8);
		padding: 0;
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
		color: var(--warning-contrast);
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

	.monsan-button:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-button {
			transition: none;
		}
	}

	@media (max-width: 600px) {
		.icon-only-sm {
			width: var(--control-height);
			height: var(--control-height);
			min-height: var(--control-height);
			padding: 0;
		}

		.icon-only-sm :global(.monsan-button-label) {
			display: none;
		}
	}

	@media (max-width: 900px) {
		.icon-only-md {
			width: var(--control-height);
			height: var(--control-height);
			min-height: var(--control-height);
			padding: 0;
		}

		.icon-only-md :global(.monsan-button-label) {
			display: none;
		}
	}
</style>
