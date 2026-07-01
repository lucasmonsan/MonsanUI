<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PaddingPreset } from '$lib/utils/layout.js';
	import Panel from './Panel.svelte';
	import Text from './Text.svelte';

	interface Props {
		title?: string;
		subtitle?: string;
		eyebrow?: string;
		children?: Snippet;
		top?: Snippet;
		body?: Snippet;
		bottom?: Snippet;
		actions?: Snippet;
		footer?: Snippet;
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		padding?: 'sm' | 'md' | 'lg';
		fullHeight?: boolean;
		interactive?: boolean;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		title,
		subtitle,
		eyebrow,
		children,
		top,
		body,
		bottom,
		actions,
		footer,
		variant = 'secondary',
		padding = 'md',
		fullHeight = false,
		interactive = false,
		onclick
	}: Props = $props();

	let panelPadding = $derived<PaddingPreset>(
		padding === 'sm' ? 'var(--space-sm)' : padding === 'lg' ? 'var(--space-lg)' : 'var(--space-md)'
	);

	let hasTop = $derived(Boolean(top || title || subtitle || eyebrow || actions));
	let hasBottom = $derived(Boolean(bottom || footer));
</script>

<Panel
	{variant}
	maxWidth="100%"
	padding={panelPadding}
	overflow="hidden"
	{fullHeight}
	interactive={interactive || Boolean(onclick)}
	{onclick}
>
	<article class="monsan-data-card" class:full-height={fullHeight}>
		{#if hasTop}
			<header class="data-card-top">
				<div class="data-card-copy">
					{#if top}
						{@render top()}
					{:else}
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
			{#if body}
				{@render body()}
			{:else}
				{@render children?.()}
			{/if}
		</div>

		{#if hasBottom}
			<footer class="data-card-bottom">
				{#if bottom}
					{@render bottom()}
				{:else}
					{@render footer?.()}
				{/if}
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

	.full-height {
		height: 100%;
	}

	.data-card-top,
	.data-card-bottom {
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
		flex: 1 1 auto;
	}

	.data-card-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-xs);
		flex-wrap: wrap;
		flex-shrink: 0;
	}

	.data-card-bottom {
		align-items: flex-end;
		flex-wrap: wrap;
	}

	@media (max-width: 520px) {
		.data-card-top {
			flex-direction: column;
		}

		.data-card-actions {
			justify-content: flex-start;
		}
	}
</style>
