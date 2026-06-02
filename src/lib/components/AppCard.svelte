<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from './Badge.svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		description?: string;
		statusLabel?: string;
		statusVariant?: 'default' | 'primary' | 'secondary' | 'success' | 'due' | 'new' | 'warning';
		state?: 'active' | 'inactive';
		logo?: Snippet;
		meta?: Snippet;
		actions?: Snippet;
		titleId?: string;
	}

	let {
		title,
		description,
		statusLabel,
		statusVariant = 'default',
		state = 'active',
		logo,
		meta,
		actions,
		titleId
	}: Props = $props();

	let labelledBy = $derived(titleId || undefined);
	let fallbackLabel = $derived(titleId ? undefined : title);
</script>

<article
	class="monsan-app-card state-{state}"
	aria-labelledby={labelledBy}
	aria-label={fallbackLabel}
>
	<div class="app-card-main">
		{#if logo}
			<div class="app-card-logo" aria-hidden="true">
				{@render logo()}
			</div>
		{/if}

		<div class="app-card-copy">
			<div class="app-card-title-row">
				<Text tag="h2" id={titleId} size="lg" weight="bold" family="display" truncate>
					{title}
				</Text>
				{#if statusLabel}
					<Badge variant={statusVariant} noShrink>{statusLabel}</Badge>
				{/if}
			</div>

			{#if description}
				<Text tag="p" size="sm" variant="secondary">{description}</Text>
			{/if}

			{#if meta}
				<div class="app-card-meta">
					{@render meta()}
				</div>
			{/if}
		</div>
	</div>

	{#if actions}
		<div class="app-card-actions">
			{@render actions()}
		</div>
	{/if}
</article>

<style>
	.monsan-app-card {
		width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-secondary);
		color: var(--text-primary);
		box-sizing: border-box;
		transition:
			opacity 0.2s var(--ease-out),
			filter 0.2s var(--ease-out),
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	.state-inactive {
		opacity: 0.62;
		filter: grayscale(1);
	}

	.monsan-app-card:hover {
		transform: translate(-1px, -1px);
		box-shadow: var(--shadow-md);
	}

	.app-card-main {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		min-width: 0;
	}

	.app-card-logo {
		width: calc(var(--control-height) * 1.25);
		height: calc(var(--control-height) * 1.25);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-primary);
	}

	.app-card-copy {
		min-width: 0;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.app-card-title-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-sm);
		min-width: 0;
	}

	.app-card-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.app-card-actions {
		margin-top: auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-sm);
	}

	@media (max-width: 560px) {
		.app-card-main {
			flex-direction: column;
		}

		.app-card-title-row {
			flex-direction: column;
		}

		.app-card-actions {
			justify-content: stretch;
		}
	}
</style>
