<script lang="ts">
	import type { HeightPreset } from '$lib/utils/layout.js';
	import { resolveHeight } from '$lib/utils/layout.js';

	interface Props {
		value?: number; // 0 to 100
		height?: HeightPreset;
		showLabel?: boolean;
		text?: string;
		variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
		striped?: boolean;
		animated?: boolean;
		ariaLabel?: string;
	}

	let {
		value = 0,
		height = '16px',
		showLabel = false,
		text,
		variant = 'primary',
		striped = false,
		animated = false,
		ariaLabel
	}: Props = $props();

	let clampedValue = $derived(Math.min(Math.max(value, 0), 100));
	let resolvedHeight = $derived(resolveHeight(height));

	const colors = {
		primary: 'var(--accent-primary)',
		success: 'var(--success)',
		warning: '#eab308',
		error: 'var(--error)',
		info: 'var(--info)'
	};
</script>

<div
	class="monsan-progress-container"
	class:has-text={text}
	style:--progress-height={resolvedHeight}
	style:--progress-value={`${clampedValue}%`}
	role="progressbar"
	aria-valuenow={clampedValue}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-label={ariaLabel}
	aria-valuetext={text}
>
	<div
		class="progress-bar {variant}"
		class:striped
		class:animated
		style:width={`${clampedValue}%`}
		style:--progress-color={colors[variant]}
	>
		{#if showLabel && clampedValue > 10}
			<span class="progress-label">{clampedValue}%</span>
		{/if}
	</div>
	{#if text}
		<span class="progress-text progress-text-track" aria-hidden="true">{text}</span>
		<span class="progress-text progress-text-fill" aria-hidden="true">{text}</span>
	{/if}
</div>

<style>
	.monsan-progress-container {
		--progress-text-filled: var(--bg-primary);
		width: 100%;
		height: var(--progress-height);
		background-color: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background-color: var(--progress-color);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--bg-primary);
		box-sizing: border-box;
		position: relative;
		z-index: 1;
	}

	:global([data-theme='dark']) .progress-bar {
		color: var(--text-primary);
	}

	:global([data-theme='dark']) .monsan-progress-container {
		--progress-text-filled: var(--text-primary);
	}

	.progress-label {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		pointer-events: none;
	}

	.progress-text {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding: 0 var(--space-sm);
		box-sizing: border-box;
		font-family: var(--font-body);
		font-size: calc(var(--base) * 0.7);
		font-weight: 800;
		line-height: 1;
		letter-spacing: 0;
		text-align: center;
		text-transform: uppercase;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		pointer-events: none;
	}

	.progress-text-track {
		color: var(--text-primary);
	}

	.progress-text-fill {
		z-index: 3;
		color: var(--progress-text-filled);
		clip-path: inset(0 calc(100% - var(--progress-value)) 0 0);
	}

	/* Brutalist Diagonal Striped Pattern */
	.striped {
		background-image: linear-gradient(
			45deg,
			rgba(255, 255, 255, 0.2) 25%,
			transparent 25%,
			transparent 50%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.2) 75%,
			transparent 75%,
			transparent
		);
		background-size: 24px 24px;
	}

	/* Stripe animation */
	.animated {
		animation: progressStripes 1.2s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-bar {
			transition: none;
		}

		.animated {
			animation: none;
		}
	}

	@keyframes progressStripes {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 24px 0;
		}
	}
</style>
