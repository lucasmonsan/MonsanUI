<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		logo?: Snippet;
		actions?: Snippet;
		actionsLabel?: string;
		titleId?: string;
		maxWidth?: 'content' | 'wide' | 'full';
		size?: 'compact' | 'comfortable';
		border?: boolean;
	}

	let {
		title,
		logo,
		actions,
		actionsLabel,
		titleId,
		maxWidth = 'wide',
		size = 'comfortable',
		border = true
	}: Props = $props();
</script>

<header class="monsan-app-header" class:with-border={border}>
	<div class="app-header-inner max-{maxWidth} size-{size}">
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
</header>

<style>
	.monsan-app-header {
		width: 100%;
		background: var(--bg-primary);
		color: var(--text-primary);
		box-sizing: border-box;
	}

	.with-border {
		border-bottom: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-xs);
	}

	.app-header-inner {
		width: 100%;
		margin: 0 auto;
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

		.app-header-inner {
			align-items: flex-start;
		}

		.app-header-actions {
			flex-wrap: wrap;
		}
	}
</style>
