<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		/**
		 * Classes adicionais para customização
		 */
		class?: string;
		/**
		 * Largura máxima do container. Por padrão usa a variável CSS global `--container-max-width`.
		 */
		maxWidth?: string;
		/**
		 * Padding interno do container. Por padrão é 0, mas você pode passar `var(--space-md)` etc.
		 */
		padding?: string;
		/**
		 * Applies the shared MonsanUI page entrance motion.
		 */
		animate?: boolean;
	}

	let {
		children,
		class: className = '',
		maxWidth = 'var(--container-max-width)',
		padding = '0',
		animate = true
	}: Props = $props();
</script>

<div
	class="monsan-page-container {className}"
	class:is-animated={animate}
	style="--page-container-max-width: {maxWidth}; --page-container-padding: {padding};"
>
	{@render children?.()}
</div>

<style>
	.monsan-page-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: var(--page-container-max-width);
		padding: var(--page-container-padding);
		margin: 0 auto;
		width: 100%;
		position: relative;
	}

	.is-animated {
		animation: monsan-page-enter 0.28s var(--ease-out) both;
	}

	@keyframes monsan-page-enter {
		from {
			opacity: 0;
			transform: translateY(var(--space-sm));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.is-animated {
			animation: none;
		}
	}
</style>
