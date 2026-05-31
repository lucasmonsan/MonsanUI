<script lang="ts">
	let {
		variant = 'default',
		noShrink = false,
		children
	} = $props<{
		variant?: 'default' | 'primary' | 'secondary' | 'due' | 'new' | 'warning';
		noShrink?: boolean;
		children?: import('svelte').Snippet;
	}>();
</script>

<span class="monsan-badge variant-{variant}" class:no-shrink={noShrink}>
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	.monsan-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: 2px 6px;
		border-radius: var(--radius-sm, 4px);
		font-family: var(--font-body);
		font-size: calc(var(--base) * 0.7);
		font-weight: 800;
		border: var(--border-width) solid var(--border-color);
		box-shadow: 1px 1px 0px var(--text-primary);
		line-height: 1.1;
		width: fit-content;
		box-sizing: border-box;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.monsan-badge.variant-default {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.monsan-badge.variant-primary {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-primary {
		color: var(--text-primary);
	}

	.monsan-badge.variant-secondary {
		background: #9d4edd;
		color: #fdfbf7;
	}

	:global([data-theme='dark']) .monsan-badge.variant-secondary {
		background: #b388ff;
		color: #2a2423;
	}

	.monsan-badge.variant-due {
		background: var(--error);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-due {
		color: var(--text-primary);
	}

	.monsan-badge.variant-new {
		background: #3d5a80;
		color: #fdfbf7;
	}

	:global([data-theme='dark']) .monsan-badge.variant-new {
		background: #8ecae6;
		color: #2a2423;
	}

	.monsan-badge.variant-warning {
		background: #eab308;
		color: #2a2423;
	}

	:global([data-theme='dark']) .monsan-badge.variant-warning {
		background: #facc15;
		color: #2a2423;
	}

	.no-shrink {
		flex-shrink: 0;
	}
</style>
