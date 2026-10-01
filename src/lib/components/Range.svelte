<script lang="ts">
	interface Props {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		id?: string;
		name?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
	}

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		id,
		name,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		oninput,
		onchange
	}: Props = $props();

	let percentage = $derived(
		max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
	);
</script>

<div class="monsan-range-container" class:disabled style:--range-percentage={`${percentage}%`}>
	<input
		type="range"
		bind:value
		{id}
		{name}
		{min}
		{max}
		{step}
		{disabled}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		{oninput}
		{onchange}
		class="monsan-range"
	/>
</div>

<style>
	.monsan-range-container {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		padding: var(--space-xs) 0;
	}

	.monsan-range-container.disabled {
		opacity: 0.6;
	}

	.monsan-range {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 14px;
		border-radius: var(--radius-md);
		border: var(--border-width) solid var(--border-color);
		background: linear-gradient(
			to right,
			var(--accent-primary) 0%,
			var(--accent-primary) var(--range-percentage),
			var(--bg-secondary) var(--range-percentage),
			var(--bg-secondary) 100%
		);
		outline: none;
		cursor: pointer;
	}

	.monsan-range-container.disabled .monsan-range {
		cursor: not-allowed;
		background: var(--bg-secondary) !important;
	}

	.monsan-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		background-color: var(--accent-primary);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out),
			background-color 0.2s ease;
	}

	.monsan-range-container.disabled .monsan-range::-webkit-slider-thumb {
		background-color: var(--text-secondary);
		cursor: not-allowed;
		box-shadow: none;
	}

	.monsan-range::-webkit-slider-thumb:hover:not(:disabled) {
		background-color: var(--accent-primary);
		filter: brightness(1.1);
		transform: scale(1.05);
	}

	.monsan-range::-webkit-slider-thumb:active:not(:disabled) {
		transform: scale(0.95);
	}

	.monsan-range::-moz-range-thumb {
		width: 18px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		background-color: var(--accent-primary);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out),
			background-color 0.2s ease;
	}

	.monsan-range-container.disabled .monsan-range::-moz-range-thumb {
		background-color: var(--text-secondary);
		cursor: not-allowed;
		box-shadow: none;
	}

	.monsan-range::-moz-range-thumb:hover:not(:disabled) {
		background-color: var(--accent-primary);
		filter: brightness(1.1);
		transform: scale(1.05);
	}

	.monsan-range::-moz-range-thumb:active:not(:disabled) {
		transform: scale(0.95);
	}

	.monsan-range:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 4px;
	}

	.monsan-range[aria-invalid='true'] {
		border-color: var(--error);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-range::-webkit-slider-thumb,
		.monsan-range::-moz-range-thumb {
			transition: none;
		}
	}
</style>
