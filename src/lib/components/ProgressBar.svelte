<script lang="ts">
	interface Props {
		value?: number; // 0 to 100
		height?: string;
		showLabel?: boolean;
		variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
		striped?: boolean;
		animated?: boolean;
		ariaLabel?: string;
	}

	let {
		value = 0,
		height = '16px',
		showLabel = false,
		variant = 'primary',
		striped = false,
		animated = false,
		ariaLabel
	}: Props = $props();

	// Clamp the value between 0 and 100
	let clampedValue = $derived(Math.min(Math.max(value, 0), 100));

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
	style="--progress-height: {height};"
	role="progressbar"
	aria-valuenow={clampedValue}
	aria-valuemin="0"
	aria-valuemax="100"
	aria-label={ariaLabel}
>
	<div
		class="progress-bar {variant}"
		class:striped
		class:animated
		style="width: {clampedValue}%; --progress-color: {colors[variant]}"
	>
		{#if showLabel && clampedValue > 10}
			<span class="progress-label">{clampedValue}%</span>
		{/if}
	</div>
</div>

<style>
	.monsan-progress-container {
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
	}

	:global([data-theme='dark']) .progress-bar {
		color: var(--text-primary);
	}

	.progress-label {
		font-family: var(--font-display);
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		pointer-events: none;
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

	@keyframes progressStripes {
		from {
			background-position: 0 0;
		}
		to {
			background-position: 24px 0;
		}
	}
</style>
