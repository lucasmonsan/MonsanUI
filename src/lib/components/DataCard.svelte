<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PaddingPreset } from '$lib/utils/layout.js';
	import Panel from './Panel.svelte';
	import Text from './Text.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		eyebrow?: string;
		children: Snippet;
		actions?: Snippet;
		footer?: Snippet;
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		padding?: 'sm' | 'md' | 'lg';
	}

	let {
		title,
		subtitle,
		eyebrow,
		children,
		actions,
		footer,
		variant = 'secondary',
		padding = 'md'
	}: Props = $props();

	let panelPadding = $derived<PaddingPreset>(
		padding === 'sm' ? 'var(--space-sm)' : padding === 'lg' ? 'var(--space-lg)' : 'var(--space-md)'
	);
</script>

<Panel {variant} maxWidth="100%" padding={panelPadding} overflow="hidden">
	<article class="monsan-data-card">
		{#if title || subtitle || eyebrow || actions}
			<header class="data-card-header">
				<div class="data-card-copy">
					{#if eyebrow}
						<Text
							tag="span"
							family="display"
							size="sm"
							weight="bold"
							variant="accent"
							transform="uppercase"
						>
							{eyebrow}
						</Text>
					{/if}
					{#if title}
						<Text tag="h3" family="display" size="lg" weight="bold">
							{title}
						</Text>
					{/if}
					{#if subtitle}
						<Text tag="p" size="sm" variant="secondary">
							{subtitle}
						</Text>
					{/if}
				</div>

				{#if actions}
					<div class="data-card-actions">
						{@render actions()}
					</div>
				{/if}
			</header>
		{/if}

		<div class="data-card-body">
			{@render children()}
		</div>

		{#if footer}
			<footer class="data-card-footer">
				{@render footer()}
			</footer>
		{/if}
	</article>
</Panel>

<style>
	.monsan-data-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.data-card-header,
	.data-card-footer {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-md);
		min-width: 0;
	}

	.data-card-copy,
	.data-card-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-width: 0;
	}

	.data-card-body {
		gap: var(--space-sm);
	}

	.data-card-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-xs);
		flex-wrap: wrap;
		flex-shrink: 0;
	}

	.data-card-footer {
		align-items: center;
		padding-top: var(--space-sm);
		border-top: 1px solid var(--border-color);
		flex-wrap: wrap;
	}

	@media (max-width: 520px) {
		.data-card-header {
			flex-direction: column;
		}

		.data-card-actions {
			justify-content: flex-start;
		}
	}
</style>
