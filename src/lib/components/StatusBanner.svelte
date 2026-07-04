<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		pulse?: boolean;
		role?: 'status' | 'alert';
		variant?: 'default' | 'subtle';
	}

	let { children, pulse = false, role = 'status', variant = 'default' }: Props = $props();
</script>

<div class="monsan-status-banner variant-{variant}" {role}>
	{#if pulse}
		<span class="status-dot" aria-hidden="true"></span>
	{/if}
	<span class="status-content">{@render children()}</span>
</div>

<style>
	.monsan-status-banner {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: var(--space-xs) var(--space-md);
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 700;
	}

	.variant-subtle {
		background: var(--bg-primary);
		color: var(--text-secondary);
		padding-inline: var(--space-sm);
	}

	:global(.monsan-status-banner a),
	:global(.monsan-status-banner a:visited) {
		color: var(--accent-primary);
		text-decoration: none;
		font-weight: 800;
	}

	:global(.monsan-status-banner a:hover) {
		color: var(--accent-primary);
		text-decoration: underline;
	}

	:global(.monsan-status-banner a:focus-visible) {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
		border-radius: var(--radius-xs);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		background-color: var(--accent-primary);
		animation: monsan-status-pulse 1.5s infinite;
	}

	@keyframes monsan-status-pulse {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 70%, transparent);
		}
		70% {
			transform: scale(1);
			box-shadow: 0 0 0 6px transparent;
		}
		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot {
			animation: none;
		}
	}
</style>
