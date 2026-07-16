<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import Calendar from './Calendar.svelte';
	import CalendarBlank from './icons/CalendarBlank.svelte';
	import { i18n } from '../utils/i18n.svelte';
	import { floatingPortal } from '../utils/floatingPortal.js';

	type CalendarDateState = 'saved' | 'pending' | 'blocked';

	interface Props {
		value?: Date | null;
		placeholder?: string;
		disabled?: boolean;
		dateStates?: Record<string, CalendarDateState>;
		id?: string;
		title?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
	}

	let {
		value = $bindable(null),
		placeholder,
		disabled = false,
		dateStates = {},
		id,
		title,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid
	}: Props = $props();

	const fallbackId = `datepicker-${Math.random().toString(36).slice(2, 11)}`;

	let activePlaceholder = $derived(placeholder ?? i18n.t('datePicker.placeholder'));

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let dropdownEl = $state<HTMLDivElement>();
	let selectedDateString = $state<string | null>(null);
	let prefersReducedMotion = $state(false);

	let formattedDate = $derived(formatDate(value));
	let triggerId = $derived(id || fallbackId);
	let panelId = $derived(`${triggerId}-panel`);
	let invalid = $derived(ariaInvalid === true || ariaInvalid === 'true');

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
		}

		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});

	function formatDate(d: Date | null): string {
		if (!d) return activePlaceholder;
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (
			isOpen &&
			containerEl &&
			!containerEl.contains(event.target as Node) &&
			!dropdownEl?.contains(event.target as Node)
		) {
			closePopover();
		}
	}

	function closePopover(focusTrigger = false) {
		isOpen = false;
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function handleDocumentKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePopover(true);
		}
	}

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
			document.addEventListener('keydown', handleDocumentKeyDown);
			return () => {
				document.removeEventListener('click', handleOutsideClick, { capture: true });
				document.removeEventListener('keydown', handleDocumentKeyDown);
			};
		}
	});

	$effect(() => {
		if (value) {
			const timer = setTimeout(() => {
				closePopover(true);
			}, 150);
			return () => clearTimeout(timer);
		}
	});
</script>

<div bind:this={containerEl} class="monsan-datepicker-container">
	<button
		bind:this={triggerEl}
		type="button"
		class="datepicker-trigger"
		class:has-value={value !== null}
		class:invalid
		id={triggerId}
		{disabled}
		{title}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-haspopup="dialog"
		aria-expanded={isOpen}
		aria-controls={panelId}
		onclick={() => !disabled && (isOpen = !isOpen)}
	>
		<span class="calendar-icon">
			<CalendarBlank size={20} />
		</span>
		<span class="datepicker-text">{formattedDate}</span>
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownEl}
			use:floatingPortal={{
				anchor: triggerEl,
				align: 'auto',
				matchWidth: false,
				minWidth: 320
			}}
			id={panelId}
			class="datepicker-dropdown"
			transition:scale={{
				duration: prefersReducedMotion ? 0 : 200,
				easing: backOut,
				start: prefersReducedMotion ? 1 : 0.95
			}}
		>
			<Calendar bind:selectedDate={selectedDateString} showDetails={false} {dateStates} />
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

	.datepicker-trigger.invalid {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
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

	.datepicker-dropdown {
		z-index: 1000;
		width: var(--datepicker-dropdown-width, 320px);
	}

	.datepicker-dropdown :global(.calendar-card) {
		max-width: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.datepicker-trigger {
			transition: none;
		}
	}
</style>
