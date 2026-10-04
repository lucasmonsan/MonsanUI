<script lang="ts">
	let {
		variant = 'default',
		noShrink = false,
		fullWidth = false,
		size = 'md',
		nowrap = false,
		title,
		ariaLabel,
		onSurface = false,
		children
	} = $props<{
		variant?: 'default' | 'primary' | 'secondary' | 'success' | 'due' | 'new' | 'warning';
		noShrink?: boolean;
		fullWidth?: boolean;
		size?: 'sm' | 'md';
		nowrap?: boolean;
		title?: string;
		ariaLabel?: string;
		onSurface?: boolean;
		children?: import('svelte').Snippet;
	}>();
</script>

<span
	class="monsan-badge variant-{variant} size-{size}"
	class:no-shrink={noShrink}
	class:full-width={fullWidth}
	class:nowrap
	class:on-surface={onSurface}
	{title}
	role={ariaLabel ? 'img' : undefined}
	aria-label={ariaLabel}
>
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
		box-shadow: var(--shadow-sm);
		line-height: 1.1;
		width: fit-content;
		min-width: 0;
		box-sizing: border-box;
		text-transform: uppercase;
		letter-spacing: 0;
		text-align: center;
		height: calc(var(--base) * 0.77 + 8px);
	}

	.size-sm {
		padding: 1px 5px;
		font-size: calc(var(--base) * 0.62);
		line-height: 1;
		height: calc(var(--base) * 0.62 + 6px);
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
		background: var(--secondary);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-secondary {
		color: var(--text-primary);
	}

	.monsan-badge.variant-success {
		background: var(--success);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-success {
		color: var(--text-primary);
	}

	.monsan-badge.variant-due {
		background: var(--error);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-due {
		color: var(--text-primary);
	}

	.monsan-badge.variant-new {
		background: var(--neutral);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .monsan-badge.variant-new {
		color: var(--text-primary);
	}

	.monsan-badge.variant-warning {
		background: var(--warning);
		color: var(--warning-contrast);
	}

	:global([data-theme='dark']) .monsan-badge.variant-warning {
		background: color-mix(in srgb, var(--warning) 75%, black);
		color: var(--text-primary);
	}
	.no-shrink {
		flex-shrink: 0;
	}

	.full-width {
		width: 100%;
	}

	.nowrap {
		white-space: nowrap;
	}

	.monsan-badge.on-surface {
		background: color-mix(in srgb, var(--monsan-surface-foreground) 16%, transparent);
		border-color: var(--monsan-surface-foreground);
		box-shadow: var(--shadow-sm);
		color: var(--monsan-surface-foreground);
	}
</style>
