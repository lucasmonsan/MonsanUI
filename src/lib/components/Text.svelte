<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Tag HTML a ser renderizada. Padrão: 'p' */
		tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label' | 'small';
		/** Família tipográfica do MonsanUI. Padrão: 'body' (Plus Jakarta Sans) */
		family?: 'body' | 'display';
		/** Tamanho do texto mapeado na escala. Padrão: 'md' */
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
		/** Peso da fonte. Padrão: 'normal' */
		weight?: 'normal' | 'medium' | 'semibold' | 'bold';
		/** Variante de cor do MonsanUI. Padrão: 'primary' */
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		truncate?: boolean;
		align?: 'left' | 'center' | 'right';
		transform?: 'none' | 'uppercase' | 'capitalize';
		id?: string;
		forId?: string;
		title?: string;
	}

	let {
		children,
		tag = 'p',
		family = 'body',
		size = 'md',
		weight = 'normal',
		variant = 'primary',
		truncate = false,
		align = 'left',
		transform = 'none',
		id,
		forId,
		title
	}: Props = $props();
</script>

<svelte:element
	this={tag}
	{id}
	for={tag === 'label' ? forId : undefined}
	{title}
	class="monsan-text {family} size-{size} weight-{weight} color-{variant} align-{align} transform-{transform}"
	class:truncate
>
	{@render children()}
</svelte:element>

<style>
	.monsan-text {
		margin: 0;
		line-height: 1.5;
		box-sizing: border-box;
		max-width: 100%;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	/* Família Tipográfica */
	.body {
		font-family: var(--font-body);
	}
	.display {
		font-family: var(--font-display);
		letter-spacing: 0;
		line-height: 1.2;
	}

	/* Escala de Tamanhos */
	.size-xs {
		font-size: var(--text-xs);
	}
	.size-sm {
		font-size: var(--text-sm);
	}
	.size-md {
		font-size: var(--text-md);
	}
	.size-lg {
		font-size: var(--text-lg);
	}
	.size-xl {
		font-size: var(--text-xl);
	}
	.size-2xl {
		font-size: var(--text-2xl);
	}
	.size-3xl {
		font-size: var(--text-3xl);
	}

	/* Peso da Fonte */
	.weight-normal {
		font-weight: 400;
	}
	.weight-medium {
		font-weight: 500;
	}
	.weight-semibold {
		font-weight: 600;
	}
	.weight-bold {
		font-weight: 800;
	}

	/* Cores (Mapeadas para a paleta MonsanUI) */
	.color-primary {
		color: var(--text-primary);
	}
	.color-secondary {
		color: var(--text-secondary);
	}
	.color-accent {
		color: var(--accent-primary);
	}
	.color-success {
		color: var(--success);
	}
	.color-error {
		color: var(--error);
	}
	.color-neutral {
		color: var(--neutral);
	}
	.align-left {
		text-align: left;
	}
	.align-center {
		text-align: center;
	}
	.align-right {
		text-align: right;
	}
	.transform-uppercase {
		text-transform: uppercase;
	}
	.transform-capitalize {
		text-transform: capitalize;
	}

	/* Ajustes finos de cores no Dark Mode */
	:global([data-theme='dark']) .color-accent {
		color: var(--accent-primary);
	}
	:global([data-theme='dark']) .color-success {
		color: var(--success);
	}
	:global([data-theme='dark']) .color-error {
		color: var(--error);
	}
	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: inline-block;
		max-width: 100%;
		vertical-align: bottom;
	}
</style>
