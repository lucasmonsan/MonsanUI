<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		logoSrc?: string;
		logoAlt?: string;
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
		subtitle,
		logoSrc,
		logoAlt = '',
		logo,
		actions,
		secondary,
		actionsLabel,
		titleId,
		maxWidth = 'content',
		size = 'comfortable',
		border = true,
		sticky = false,
		horizontalPadding = 'none'
	}: Props = $props();
</script>

<header
	class="monsan-app-header"
	class:with-border={border}
	class:is-sticky={sticky}
	class:has-secondary={secondary}
>
	<div class="app-header-inner max-{maxWidth} horizontal-{horizontalPadding}">
		<div class="app-header-primary size-{size}">
			<div class="app-header-brand">
				{#if logoSrc}
					<div class="app-header-logo" aria-hidden={logoAlt ? undefined : 'true'}>
						<img class="app-header-logo-image" src={logoSrc} alt={logoAlt} />
					</div>
				{:else if logo}
					<div class="app-header-logo" aria-hidden="true">
						{@render logo()}
					</div>
				{/if}
				<div class="app-header-title-group">
					<Text
						tag="h1"
						id={titleId}
						size={size === 'compact' ? 'xl' : '2xl'}
						weight="bold"
						family="display"
						variant="accent"
						truncate
					>
						{title}
					</Text>
					{#if subtitle}
						<Text tag="p" size="sm" weight="semibold" variant="secondary" truncate>
							{subtitle}
						</Text>
					{/if}
				</div>
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
		align-self: stretch;
		flex-shrink: 0;
		background: transparent;
		color: var(--text-primary);
		box-sizing: border-box;
	}

	.is-sticky {
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.with-border .app-header-inner {
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
		max-width: var(--container-max-width);
	}

	.max-full {
		max-width: none;
	}

	.size-compact {
		min-height: var(--control-height);
		padding: var(--space-xs) 0;
	}

	.size-comfortable {
		min-height: calc(var(--control-height) + var(--space-lg));
		padding: var(--space-md) 0;
	}

	.has-secondary .size-compact,
	.has-secondary .size-comfortable {
		padding-bottom: var(--space-xs);
	}

	.app-header-secondary {
		width: 100%;
		border-top: var(--border-width) solid var(--border-color);
		padding: calc(var(--space-xs) * 0.5) 0 0;
		box-sizing: border-box;
	}

	.horizontal-default .app-header-primary {
		padding-right: var(--space-lg);
		padding-left: var(--space-lg);
	}

	.horizontal-default .app-header-secondary {
		padding-right: var(--space-lg);
		padding-left: var(--space-lg);
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
		gap: var(--space-xs);
	}

	.app-header-logo {
		height: var(--control-height);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-primary);
	}

	.app-header-logo-image {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: contain;
		filter: var(--brand-logo-filter);
	}

	.app-header-title-group {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
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
			padding-top: var(--space-sm);
			padding-bottom: var(--space-sm);
		}

		.app-header-primary {
			align-items: flex-start;
		}

		.horizontal-default .app-header-primary,
		.horizontal-default .app-header-secondary {
			padding-right: var(--space-md);
			padding-left: var(--space-md);
		}

		.app-header-actions {
			flex-wrap: wrap;
		}
	}
</style>
