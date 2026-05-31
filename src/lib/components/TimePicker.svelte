<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { i18n } from '../utils/i18n.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
		value?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable('12:00'),
		disabled = false,
		...rest
	}: Props = $props();

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();

	// Divide o valor em horas e minutos
	let hours = $derived(value.split(':')[0] || '12');
	let minutes = $derived(value.split(':')[1] || '00');

	// Gera arrays para a seleção
	const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
	const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

	function selectHour(h: string) {
		if (disabled) return;
		value = `${h}:${minutes}`;
	}

	function selectMinute(m: string) {
		if (disabled) return;
		value = `${hours}:${m}`;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick, { capture: true });
			return () => {
				document.removeEventListener('click', handleOutsideClick, { capture: true });
			};
		}
	});

	// Função de scroll suave automático para o item selecionado
	function scrollToSelected(node: HTMLElement, isSelected: boolean) {
		if (isSelected && node.parentElement) {
			// Executa após a renderização inicial para alinhar
			setTimeout(() => {
				node.scrollIntoView({ block: 'nearest', behavior: 'auto' });
			}, 50);
		}
	}
</script>

<div bind:this={containerEl} class="monsan-time-picker-container ">
	<button
		type="button"
		class="time-picker-trigger"
		{disabled}
		onclick={() => !disabled && (isOpen = !isOpen)}
		{...rest}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2.5"
			stroke="currentColor"
			class="clock-icon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>
		<span class="time-display">{value}</span>
	</button>

	{#if isOpen}
		<div
			class="time-picker-dropdown panel"
			transition:scale={{ duration: 200, easing: backOut, start: 0.9 }}
		>
			<div class="dropdown-header">
				<span>{i18n.t('timePicker.selectTime')}</span>
			</div>

			<div class="picker-columns">
				<!-- Coluna de Horas -->
				<div class="picker-column scrollbar-custom">
					<div class="column-title">{i18n.t('timePicker.hours')}</div>
					<div class="column-list">
						{#each hourOptions as h (h)}
							<button
								type="button"
								class="number-btn"
								class:active={hours === h}
								use:scrollToSelected={hours === h}
								onclick={() => selectHour(h)}
							>
								{h}
							</button>
						{/each}
					</div>
				</div>

				<!-- Coluna de Minutos -->
				<div class="picker-column scrollbar-custom">
					<div class="column-title">{i18n.t('timePicker.minutes')}</div>
					<div class="column-list">
						{#each minuteOptions as m (m)}
							<button
								type="button"
								class="number-btn"
								class:active={minutes === m}
								use:scrollToSelected={minutes === m}
								onclick={() => selectMinute(m)}
							>
								{m}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<button type="button" class="confirm-time-btn" onclick={() => (isOpen = false)}>
				{i18n.t('timePicker.confirm')}
			</button>
		</div>
	{/if}
</div>

<style>
	.monsan-time-picker-container {
		position: relative;
		display: inline-block;
		font-family: var(--font-body);
	}

	.time-picker-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		height: var(--control-height);
		padding: 0 var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		color: var(--text-primary);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.time-picker-trigger:hover:not(:disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.time-picker-trigger:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.clock-icon {
		width: 20px;
		height: 20px;
		color: var(--text-secondary);
	}

	.time-display {
		font-size: var(--text-md);
		font-weight: bold;
		letter-spacing: 0;
	}

	/* Dropdown Popover */
	.time-picker-dropdown {
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		z-index: 1000;
		width: 220px;
		padding: var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.dropdown-header {
		font-size: var(--text-xs);
		font-weight: bold;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0;
		text-align: center;
		border-bottom: 2px solid var(--border-color);
		padding-bottom: var(--space-xs);
	}

	/* Picker Columns */
	.picker-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-md);
		height: 180px;
	}

	.picker-column {
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 2px solid var(--border-color);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.column-title {
		font-size: 11px;
		font-weight: bold;
		text-align: center;
		background-color: var(--bg-secondary);
		border-bottom: 2px solid var(--border-color);
		padding: 4px 0;
		color: var(--text-primary);
	}

	.column-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	/* Number Button */
	.number-btn {
		width: 100%;
		padding: 6px 0;
		background: transparent;
		border: none;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--text-primary);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.number-btn:hover {
		background-color: var(--bg-secondary);
	}

	.number-btn.active {
		background-color: var(--accent-primary);
		color: var(--bg-primary);
		font-weight: bold;
	}

	/* Confirm Button */
	.confirm-time-btn {
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-weight: bold;
		padding: var(--space-xs);
		font-size: var(--text-xs);
		cursor: pointer;
		text-align: center;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	.confirm-time-btn:hover {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--border-color);
	}

	/* Custom Scrollbar */
	.scrollbar-custom .column-list {
		scrollbar-width: thin;
		scrollbar-color: var(--border-color) transparent;
	}

	.scrollbar-custom .column-list::-webkit-scrollbar {
		width: 6px;
	}

	.scrollbar-custom .column-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar-custom .column-list::-webkit-scrollbar-thumb {
		background-color: var(--border-color);
		border-radius: var(--radius-full);
	}
</style>
