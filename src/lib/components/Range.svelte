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
		oninput,
		onchange
	}: Props = $props();

	// Calcula a porcentagem para preencher o trilho dinamicamente
	let percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div
	class="monsan-range-container {disabled ? 'disabled' : ''}"
	style="--range-percentage: {percentage}%"
>
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
		box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	.monsan-range-container.disabled .monsan-range {
		cursor: not-allowed;
		background: var(--bg-secondary) !important;
	}

	/* Webkit browsers (Chrome, Safari, Edge, Opera) - Slider Thumb */
	.monsan-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		background-color: var(--accent-primary);
		box-shadow: 2px 2px 0px var(--border-color);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.2s ease;
	}

	.monsan-range-container.disabled .monsan-range::-webkit-slider-thumb {
		background-color: var(--text-secondary);
		cursor: not-allowed;
		box-shadow: none;
	}

	.monsan-range::-webkit-slider-thumb:hover:not(:disabled) {
		background-color: var(--accent-primary);
		transform: scale(1.05) translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	.monsan-range::-webkit-slider-thumb:active:not(:disabled) {
		transform: scale(0.95);
		box-shadow: 1px 1px 0px var(--border-color);
	}

	/* Firefox - Slider Thumb */
	.monsan-range::-moz-range-thumb {
		width: 18px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		background-color: var(--accent-primary);
		box-shadow: 2px 2px 0px var(--border-color);
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.2s ease;
	}

	.monsan-range-container.disabled .monsan-range::-moz-range-thumb {
		background-color: var(--text-secondary);
		cursor: not-allowed;
		box-shadow: none;
	}

	.monsan-range::-moz-range-thumb:hover:not(:disabled) {
		background-color: var(--accent-primary);
		transform: scale(1.05) translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--border-color);
	}

	.monsan-range::-moz-range-thumb:active:not(:disabled) {
		transform: scale(0.95);
		box-shadow: 1px 1px 0px var(--border-color);
	}

	/* Focus state */
	.monsan-range:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 4px;
	}
</style>
