<script lang="ts">
	import type { Snippet } from 'svelte';
	import Panel from './Panel.svelte';
	import StatusPill from './StatusPill.svelte';
	import Text from './Text.svelte';

	interface Props {
		title?: string;
		status?: string;
		statusTone?: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'accent';
		children: Snippet;
		actions?: Snippet;
		height?: 'sm' | 'md' | 'lg' | 'auto';
		statusLabel?: 'visible' | 'hidden';
		statusShape?: 'pill' | 'square';
		lined?: boolean;
	}

	let {
		title,
		status,
		statusTone = 'neutral',
		children,
		actions,
		height = 'md',
		statusLabel = 'visible',
		statusShape = 'pill',
		lined = false
	}: Props = $props();
</script>

<Panel variant="primary" maxWidth="100%" padding="0" overflow="hidden">
	<section class="monsan-console-panel height-{height}">
		{#if title || status || actions}
			<header class="console-header">
				<div class="console-title">
					{#if title}
						<Text tag="h3" family="display" size="md" weight="bold" transform="uppercase">
							{title}
						</Text>
					{/if}
					{#if status && statusLabel === 'visible'}
						<StatusPill tone={statusTone} pulse={statusTone === 'warning'}>
							{status}
						</StatusPill>
					{/if}
				</div>

				{#if actions || (status && statusLabel === 'hidden')}
					<div class="console-actions">
						{#if status && statusLabel === 'hidden'}
							<span
								class="console-status-indicator tone-{statusTone} shape-{statusShape}"
								aria-label={status}
								title={status}
							></span>
						{/if}
						{#if actions}
							{@render actions()}
						{/if}
					</div>
				{/if}
			</header>
		{/if}

		<div class="console-body" class:is-lined={lined}>
			{@render children()}
		</div>
	</section>
</Panel>

<style>
	.monsan-console-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		background: var(--bg-primary);
	}

	.height-sm {
		--console-height: 180px;
	}

	.height-md {
		--console-height: 260px;
	}

	.height-lg {
		--console-height: 420px;
	}

	.height-auto {
		--console-height: auto;
	}

	.console-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--border-width) solid var(--border-color);
		background: var(--bg-secondary);
		min-width: 0;
	}

	.console-title,
	.console-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}

	.console-title {
		flex: 1;
	}

	.console-title :global(.monsan-text) {
		white-space: nowrap;
	}

	.console-actions {
		justify-content: flex-end;
		flex-shrink: 0;
	}

	.console-body {
		min-height: 0;
		height: var(--console-height);
		overflow: auto;
		padding: var(--space-md);
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
		font-size: var(--text-sm);
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
		color: var(--text-primary);
		background: var(--bg-primary);
	}

	.console-body.is-lined {
		background:
			linear-gradient(
				color-mix(in srgb, var(--border-color) 18%, transparent) 1px,
				transparent 1px
			),
			var(--bg-primary);
		background-size: 100% 24px;
	}

	.console-status-indicator {
		display: inline-flex;
		flex-shrink: 0;
		width: 14px;
		height: 14px;
		border: var(--border-width) solid var(--border-color);
		box-shadow: 1px 1px 0 var(--text-primary);
		background: var(--neutral);
	}

	.shape-square {
		border-radius: var(--radius-sm);
	}

	.shape-pill {
		border-radius: var(--radius-full);
	}

	.tone-info {
		background: var(--accent-primary);
	}

	.tone-success {
		background: var(--success);
	}

	.tone-warning {
		background: var(--warning);
	}

	.tone-error {
		background: var(--error);
	}

	.tone-accent {
		background: var(--accent-primary);
	}

	@media (max-width: 560px) {
		.console-header {
			align-items: center;
			gap: var(--space-sm);
		}

		.console-actions {
			justify-content: flex-end;
			align-self: center;
		}
	}
</style>
