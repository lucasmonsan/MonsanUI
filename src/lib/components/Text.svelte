<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
		/** Tag HTML a ser renderizada. Padrão: 'p' */
		tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label' | 'small';
		/** Família tipográfica do MonsanUI. Padrão: 'body' (Plus Jakarta Sans) */
		family?: 'body' | 'display';
		/** Tamanho do texto mapeado na escala. Padrão: 'md' */
		size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
		/** Peso da fonte. Padrão: 'normal' */
		weight?: 'normal' | 'medium' | 'semibold' | 'bold';
		/** Variante de cor do MonsanUI. Padrão: 'primary' */
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		truncate?: boolean;
	}

	let {
		children,
		tag = 'p',
		family = 'body',
		size = 'md',
		weight = 'normal',
		variant = 'primary',
		truncate = false,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<svelte:element
	this={tag}
	class="monsan-text {family} size-{size} weight-{weight} color-{variant} {className}"
	class:truncate
	{...restProps}
>
	{@render children()}
</svelte:element>

<style>
	.monsan-text {
		margin: 0;
		line-height: 1.5;
		box-sizing: border-box;
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
		display: block;
		min-width: 0;
		flex: 1 1 0;
	}
</style>
