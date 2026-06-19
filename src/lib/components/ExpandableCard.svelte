<script lang="ts">
	import ChevronDown from './icons/ChevronDown.svelte';

	let {
		expanded = $bindable(false),
		title = '',
		header,
		children,
		showIndicator = true,
		indicatorText = 'Ver Mais',
		indicatorTextExpanded = 'Ocultar',
		showChevron = true,
		showText = true,
		expandOn = 'card', // 'card' | 'header' | 'indicator'
		compact = false,
		variant = 'default'
	} = $props<{
		expanded?: boolean;
		title?: string;
		header?: import('svelte').Snippet;
		children: import('svelte').Snippet;
		showIndicator?: boolean;
		indicatorText?: string;
		indicatorTextExpanded?: string;
		showChevron?: boolean;
		showText?: boolean;
		expandOn?: 'card' | 'header' | 'indicator';
		compact?: boolean;
		variant?: 'default' | 'success';
	}>();

	function handleCardClick(e: MouseEvent) {
		// Se clicar dentro de botões/links no conteúdo expandido, não deve fechar
		const target = e.target as HTMLElement;
		const interactive = target.closest(
			'.expandable-content-inner a, .expandable-content-inner button, .expandable-content-inner input, .expandable-content-inner select, .expandable-content-inner textarea, .expandable-content-inner [role="button"]'
		);
		if (interactive) return;

		if (expandOn === 'card') {
			expanded = !expanded;
		}
	}

	function handleIndicatorClick(e: MouseEvent) {
		e.stopPropagation();
		expanded = !expanded;
	}

	let cardEl = $state<HTMLDivElement>();
	$effect(() => {
		if (expandOn === 'card' && cardEl) {
			const listener = (e: MouseEvent) => {
				handleCardClick(e);
			};
			cardEl.addEventListener('click', listener);
			return () => cardEl?.removeEventListener('click', listener);
		}
	});
</script>

<div
	bind:this={cardEl}
	class="monsan-expandable-card variant-{variant}"
	class:compact
	class:is-expanded={expanded}
	class:clickable-card={expandOn === 'card'}
>
	<!-- Cabeçalho -->
	<header class="card-header">
		{#if expandOn === 'header'}
			<button
				type="button"
				class="header-toggle-btn"
				onclick={() => {
					expanded = !expanded;
				}}
				aria-expanded={expanded}
			>
				{#if header}
					{@render header()}
				{:else}
					<h3 class="card-title">{title}</h3>
				{/if}
			</button>
		{:else}
			<div class="card-header-inner">
				{#if header}
					{@render header()}
				{:else}
					<h3 class="card-title">{title}</h3>
				{/if}
			</div>
		{/if}
	</header>

	<!-- Conteúdo Expansível (Transição Suave de Altura) -->
	<div class="expandable-content-wrapper" class:expanded>
		<div class="expandable-content-inner">
			<div class="card-body">
				{@render children()}
			</div>
		</div>
	</div>

	<!-- Rodapé / Indicador -->
	{#if showIndicator && (showText || showChevron)}
		<button
			type="button"
			class="card-indicator-footer clickable-indicator"
			onclick={handleIndicatorClick}
		>
			<div class="indicator-container">
				{#if showText}
					<span class="indicator-text">
						{expanded ? indicatorTextExpanded : indicatorText}
					</span>
				{/if}
				{#if showChevron}
					<span class="chevron-wrapper" class:rotated={expanded}>
						<ChevronDown size={18} />
					</span>
				{/if}
			</div>
		</button>
	{/if}
</div>

<style>
	.monsan-expandable-card {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.15s var(--ease-out),
			box-shadow 0.15s var(--ease-out);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
		box-sizing: border-box;
	}

	.monsan-expandable-card.clickable-card {
		cursor: pointer;
	}

	.monsan-expandable-card.clickable-card:hover {
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0px var(--border-color);
	}

	/* Cabeçalho */
	.card-header {
		background: var(--bg-secondary);
		border-bottom: var(--border-width) solid var(--border-color);
	}

	.card-header-inner {
		padding: var(--space-md) var(--space-lg);
	}

	.header-toggle-btn {
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		padding: var(--space-md) var(--space-lg);
		margin: 0;
		cursor: pointer;
		display: block;
		font-family: inherit;
		color: inherit;
		transition: background-color 0.15s ease;
	}

	.header-toggle-btn:hover {
		background: color-mix(in srgb, var(--bg-secondary) 95%, var(--border-color));
	}

	.card-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-md);
		font-weight: 800;
		color: var(--text-primary);
	}

	/* Wrapper de Transição de Altura via CSS Grid moderníssimo */
	.expandable-content-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s cubic-bezier(0.25, 1, 0.5, 1);
		background: var(--bg-primary);
	}

	.expandable-content-wrapper.expanded {
		grid-template-rows: 1fr;
	}

	.expandable-content-inner {
		overflow: hidden;
	}

	.card-body {
		padding: var(--space-lg);
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-md);
		line-height: 1.6;
	}

	/* Rodapé Indicador */
	.card-indicator-footer {
		background: var(--bg-primary);
		border: none;
		border-top: var(--border-width) solid var(--border-color);
		border-radius: 0;
		width: 100%;
		padding: var(--space-sm) var(--space-lg);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		color: var(--text-secondary);
		transition: background-color 0.15s ease;
	}

	.card-indicator-footer:hover {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.indicator-container {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.indicator-text {
		font-family: inherit;
		font-weight: 800;
		text-transform: uppercase;
		font-size: var(--text-xs);
		letter-spacing: 0;
	}

	.chevron-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.chevron-wrapper.rotated {
		transform: rotate(180deg);
	}
	.compact .card-body {
		padding: var(--space-sm);
	}

	/* Variante Success */
	.monsan-expandable-card.variant-success .card-header {
		background: color-mix(in srgb, var(--success) 8%, var(--bg-secondary));
	}
</style>
