<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		tone?: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'accent';
		pulse?: boolean;
		dot?: boolean;
		noShrink?: boolean;
	}

	let { children, tone = 'neutral', pulse = false, dot = true, noShrink = false }: Props = $props();
</script>

<span class="monsan-status-pill tone-{tone}" class:is-pulsing={pulse} class:no-shrink={noShrink}>
	{#if dot}
		<span class="status-dot" aria-hidden="true"></span>
	{/if}
	<span class="status-label">
		{@render children()}
	</span>
</span>

<style>
	.monsan-status-pill {
		--status-color: var(--neutral);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		width: fit-content;
		max-width: 100%;
		padding: 3px 8px;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--status-color) 12%, var(--bg-primary));
		color: var(--text-primary);
		box-shadow: 1px 1px 0 var(--text-primary);
		font-family: var(--font-display);
		font-size: var(--text-xs);
		font-weight: 800;
		line-height: 1.1;
		text-transform: uppercase;
		box-sizing: border-box;
	}

	.no-shrink {
		flex-shrink: 0;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--status-color);
		border: 1px solid var(--border-color);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--status-color) 20%, transparent);
		flex-shrink: 0;
	}

	.status-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tone-neutral {
		--status-color: var(--neutral);
	}

	.tone-info {
		--status-color: var(--info);
	}

	.tone-success {
		--status-color: var(--success);
	}

	.tone-warning {
		--status-color: var(--warning);
	}

	.tone-error {
		--status-color: var(--error);
	}

	.tone-accent {
		--status-color: var(--accent-primary);
	}

	.is-pulsing .status-dot {
		animation: monsan-status-pulse 1.4s ease-in-out infinite;
	}

	@keyframes monsan-status-pulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-color) 40%, transparent);
		}
		50% {
			transform: scale(1.18);
			box-shadow: 0 0 0 5px transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.is-pulsing .status-dot {
			animation: none;
		}
	}
</style>
