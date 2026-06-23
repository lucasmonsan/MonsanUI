<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		warning?: boolean;
		role?: string;
		ariaLive?: 'off' | 'polite' | 'assertive';
		ariaLabel?: string;
	}

	let { children, warning = false, role, ariaLive, ariaLabel }: Props = $props();
</script>

<span
	class="monsan-countdown-badge"
	class:warning
	{role}
	aria-live={ariaLive}
	aria-label={ariaLabel}
>
	{@render children()}
</span>

<style>
	.monsan-countdown-badge {
		background: var(--text-primary);
		color: var(--bg-primary);
		padding: 2px 10px;
		border-radius: var(--radius-full);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
	}

	.warning {
		background: var(--error);
		animation: pulse 0.5s infinite alternate;
	}

	@media (prefers-reduced-motion: reduce) {
		.warning {
			animation: none;
		}
	}

	@keyframes pulse {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(1.1);
		}
	}
</style>
