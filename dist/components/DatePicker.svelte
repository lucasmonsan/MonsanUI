<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import Calendar from './Calendar.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
		value?: Date | null;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		value = $bindable(null),
		placeholder,
		disabled = false,
		class: className = '',
		...rest
	}: Props = $props();

	let activePlaceholder = $derived(placeholder ?? i18n.t('datePicker.placeholder'));

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();
	let selectedDateString = $state<string | null>(null);

	let formattedDate = $derived(formatDate(value));

	function formatDate(d: Date | null): string {
		if (!d) return activePlaceholder;
		// Garante data local
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// Sincroniza de Date para String (Calendar)
	$effect(() => {
		if (value) {
			const year = value.getFullYear();
			const month = String(value.getMonth() + 1).padStart(2, '0');
			const day = String(value.getDate()).padStart(2, '0');
			selectedDateString = `${year}-${month}-${day}`;
		} else {
			selectedDateString = null;
		}
	});

	// Sincroniza de String (Calendar) para Date
	$effect(() => {
		if (selectedDateString) {
			const [year, month, day] = selectedDateString.split('-').map(Number);
			const nextDate = new Date(year, month - 1, day);
			if (!value || value.getTime() !== nextDate.getTime()) {
				value = nextDate;
			}
		} else {
			value = null;
		}
	});

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick, { capture: true });
			return () => {
				document.removeEventListener('click', handleOutsideClick, { capture: true });
			};
		}
	});

	// Fecha o popover automaticamente quando o usuário seleciona um dia no calendário
	$effect(() => {
		if (value) {
			// Pequeno delay para a transição visual de seleção ser vista antes de fechar
			const timer = setTimeout(() => {
				isOpen = false;
			}, 150);
			return () => clearTimeout(timer);
		}
	});
</script>

<div bind:this={containerEl} class="monsan-datepicker-container {className}">
	<button
		type="button"
		class="datepicker-trigger"
		class:has-value={value !== null}
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
			class="calendar-icon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
			/>
		</svg>
		<span class="datepicker-text">{formattedDate}</span>
	</button>

	{#if isOpen}
		<div
			class="datepicker-dropdown"
			transition:scale={{ duration: 200, easing: backOut, start: 0.95 }}
		>
			<Calendar bind:selectedDate={selectedDateString} />
		</div>
	{/if}
</div>

<style>
	.monsan-datepicker-container {
		position: relative;
		display: inline-block;
		font-family: var(--font-body);
	}

	.datepicker-trigger {
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
		color: var(--text-secondary);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			color 0.2s ease;
	}

	.datepicker-trigger.has-value {
		color: var(--text-primary);
		font-weight: bold;
	}

	.datepicker-trigger:hover:not(:disabled) {
		border-color: var(--accent-primary);
		color: var(--text-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.datepicker-trigger:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.calendar-icon {
		width: 20px;
		height: 20px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.datepicker-trigger:hover:not(:disabled) .calendar-icon {
		color: var(--text-primary);
	}

	.datepicker-text {
		font-size: var(--text-md);
		letter-spacing: 0;
	}

	/* Dropdown Popover */
	.datepicker-dropdown {
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		z-index: 1000;
	}
</style>
