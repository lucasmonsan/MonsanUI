<script lang="ts">
	interface Props {
		/** Primary compact context shown over a Panel border. */
		title: string;
		/** Optional secondary context shown below the primary title. */
		subtitle?: string;
	}

	let { title, subtitle }: Props = $props();
</script>

<div class="monsan-panel-plaque">
	<span class="plaque-title">{title}</span>
	{#if subtitle}
		<span class="plaque-subtitle">{subtitle}</span>
	{/if}
</div>

<style>
	.monsan-panel-plaque {
		display: grid;
		justify-items: center;
		gap: 1px;
		max-width: min(82vw, 24rem);
		padding: var(--space-xxs) var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-primary);
		box-shadow: var(--shadow-xs);
		text-align: center;
		line-height: 1.1;
	}

	.plaque-title {
		max-width: 100%;
		overflow: hidden;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.plaque-subtitle {
		max-width: 100%;
		overflow: hidden;
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-xxs);
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
