<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		logo?: Snippet;
		actions?: Snippet;
		secondary?: Snippet;
		actionsLabel?: string;
		titleId?: string;
		maxWidth?: 'content' | 'wide' | 'full';
		size?: 'compact' | 'comfortable';
		border?: boolean;
		sticky?: boolean;
		horizontalPadding?: 'none' | 'default';
	}

	let {
		title,
		logo,
		actions,
		secondary,
		actionsLabel,
		titleId,
		maxWidth = 'wide',
		size = 'comfortable',
		border = true,
		sticky = false,
		horizontalPadding = 'default'
	}: Props = $props();
</script>

<header class="monsan-app-header" class:with-border={border} class:is-sticky={sticky}>
	<div class="app-header-inner max-{maxWidth} horizontal-{horizontalPadding}">
		<div class="app-header-primary size-{size}">
			<div class="app-header-brand">
				{#if logo}
					<div class="app-header-logo" aria-hidden="true">
						{@render logo()}
					</div>
				{/if}
				<Text
					tag="h1"
					id={titleId}
					size={size === 'compact' ? 'xl' : '2xl'}
					weight="bold"
					family="display"
					variant="primary"
					truncate
				>
					{title}
				</Text>
			</div>

			{#if actions}
				<div
					class="app-header-actions"
					role={actionsLabel ? 'group' : undefined}
					aria-label={actionsLabel}
				>
					{@render actions()}
				</div>
			{/if}
		</div>

		{#if secondary}
			<div class="app-header-secondary">
				{@render secondary()}
			</div>
		{/if}
	</div>
</header>

<style>
	.monsan-app-header {
		width: 100%;
		background: var(--bg-primary);
		color: var(--text-primary);
		box-sizing: border-box;
	}

	.is-sticky {
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.with-border {
		border-bottom: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-xs);
	}

	.app-header-inner {
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.app-header-primary {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		box-sizing: border-box;
	}

	.max-content {
		max-width: var(--container-max-width);
	}

	.max-wide {
		max-width: 1400px;
	}

	.max-full {
		max-width: none;
	}

	.size-compact {
		min-height: calc(var(--control-height) + var(--space-md));
		padding: var(--space-sm) var(--space-md);
	}

	.size-comfortable {
		min-height: calc(var(--control-height) + var(--space-lg));
		padding: var(--space-md) var(--space-lg);
	}

	.app-header-secondary {
		width: 100%;
		padding: 0 var(--space-lg) var(--space-sm);
		box-sizing: border-box;
	}

	.horizontal-none .app-header-primary,
	.horizontal-none .app-header-secondary {
		padding-left: 0;
		padding-right: 0;
	}

	.app-header-brand {
		min-width: 0;
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.app-header-logo {
		width: var(--control-height);
		height: var(--control-height);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-primary);
	}

	.app-header-actions {
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.size-comfortable,
		.size-compact {
			padding: var(--space-sm) var(--space-md);
		}

		.app-header-primary {
			align-items: flex-start;
		}

		.app-header-secondary {
			padding-right: var(--space-md);
			padding-left: var(--space-md);
		}

		.horizontal-none .app-header-primary,
		.horizontal-none .app-header-secondary {
			padding-right: 0;
			padding-left: 0;
		}

		.app-header-actions {
			flex-wrap: wrap;
		}
	}
</style>
