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
	}

	let { title, status, statusTone = 'neutral', children, actions, height = 'md' }: Props = $props();
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
					{#if status}
						<StatusPill tone={statusTone} pulse={statusTone === 'warning'}>
							{status}
						</StatusPill>
					{/if}
				</div>

				{#if actions}
					<div class="console-actions">
						{@render actions()}
					</div>
				{/if}
			</header>
		{/if}

		<div class="console-body">
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
		background:
			linear-gradient(
				color-mix(in srgb, var(--border-color) 18%, transparent) 1px,
				transparent 1px
			),
			var(--bg-primary);
		background-size: 100% 24px;
	}

	@media (max-width: 560px) {
		.console-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.console-actions {
			justify-content: flex-start;
		}
	}
</style>
