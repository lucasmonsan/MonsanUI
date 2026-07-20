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
		variant = 'default',
		disabled = false
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
		variant?: 'default' | 'success' | 'archived';
		disabled?: boolean;
	}>();

	const contentId = $props.id();
	let headerIsTrigger = $derived(expandOn === 'header' || expandOn === 'card');

	function toggleExpanded() {
		expanded = !expanded;
	}

	function handleTriggerClick(e: MouseEvent) {
		e.stopPropagation();
		toggleExpanded();
	}

	function handleHeaderContentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('a, button, input, label, select, textarea, [role="button"]')) return;
		handleTriggerClick(e);
	}
</script>

{#snippet content()}
	<header class="card-header">
		{#if headerIsTrigger}
			{#if header}
				<div class="interactive-header">
					<button
						type="button"
						class="header-toggle-btn overlay-toggle"
						onclick={handleTriggerClick}
						aria-label={expanded ? indicatorTextExpanded : indicatorText}
						aria-expanded={expanded}
						aria-controls={contentId}
					></button>
					<!-- Mouse activation is paired with the adjacent keyboard-accessible toggle button. -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="interactive-header-content" onclick={handleHeaderContentClick}>
						{@render header()}
					</div>
				</div>
			{:else}
				<button
					type="button"
					class="header-toggle-btn"
					onclick={handleTriggerClick}
					aria-expanded={expanded}
					aria-controls={contentId}
				>
					<h3 class="card-title">{title}</h3>
				</button>
			{/if}
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

	<div
		id={contentId}
		class="expandable-content-wrapper"
		class:expanded
		aria-hidden={!expanded}
		inert={!expanded}
	>
		<div class="expandable-content-inner">
			<div class="card-body">
				{@render children()}
			</div>
		</div>
	</div>

	{#if showIndicator && (showText || showChevron)}
		<button
			type="button"
			class="card-indicator-footer clickable-indicator"
			onclick={handleTriggerClick}
			aria-expanded={expanded}
			aria-controls={contentId}
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
{/snippet}

<article
	class="monsan-expandable-card variant-{variant}"
	class:compact
	class:is-expanded={expanded}
	class:disabled
>
	{@render content()}
</article>

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

	.monsan-expandable-card.disabled {
		border-style: dashed;
	}

	/* Cabeçalho */
	.card-header {
		background: var(--bg-secondary);
		border-bottom: var(--border-width) solid var(--border-color);
	}

	.card-header-inner {
		padding: var(--space-sm) var(--space-md);
	}

	.header-toggle-btn {
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		padding: var(--space-sm) var(--space-md);
		margin: 0;
		cursor: pointer;
		display: block;
		font-family: inherit;
		color: inherit;
		transition: background-color 0.15s ease;
	}

	.interactive-header {
		position: relative;
	}

	.overlay-toggle {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.interactive-header-content {
		position: relative;
		z-index: 2;
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
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
		padding: var(--space-sm) var(--space-md);
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
		background: color-mix(in srgb, var(--success) 16%, var(--bg-secondary));
	}

	.monsan-expandable-card.variant-archived {
		border-color: color-mix(in srgb, var(--warning) 70%, var(--border-color));
		border-style: solid;
		box-shadow:
			inset 5px 0 0 color-mix(in srgb, var(--warning) 80%, var(--text-primary)),
			var(--shadow-sm);
	}

	.monsan-expandable-card.variant-archived .card-header {
		background: color-mix(in srgb, var(--warning) 18%, var(--bg-secondary));
	}

	.monsan-expandable-card.variant-archived .expandable-content-wrapper,
	.monsan-expandable-card.variant-archived .card-indicator-footer {
		background: color-mix(in srgb, var(--warning) 5%, var(--bg-primary));
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-expandable-card,
		.expandable-content-wrapper,
		.header-toggle-btn,
		.card-indicator-footer,
		.chevron-wrapper {
			transition: none;
		}
	}
</style>
