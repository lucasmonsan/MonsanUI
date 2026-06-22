<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		value?: string;
		disabled?: boolean;
		id?: string;
		title?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
	}

	let {
		value = $bindable('12:00'),
		disabled = false,
		id,
		title,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid
	}: Props = $props();

	const fallbackId = `timepicker-${Math.random().toString(36).slice(2, 11)}`;

	let isOpen = $state(false);
	let containerEl = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let prefersReducedMotion = $state(false);

	let hours = $derived(value.split(':')[0] || '12');
	let minutes = $derived(value.split(':')[1] || '00');
	let triggerId = $derived(id || fallbackId);
	let panelId = $derived(`${triggerId}-panel`);
	let hoursListId = $derived(`${triggerId}-hours`);
	let minutesListId = $derived(`${triggerId}-minutes`);
	let invalid = $derived(ariaInvalid === true || ariaInvalid === 'true');

	const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
	const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

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

	function selectHour(h: string) {
		if (disabled) return;
		value = `${h}:${minutes}`;
	}

	function selectMinute(m: string) {
		if (disabled) return;
		value = `${hours}:${m}`;
	}

	function moveHour(delta: number) {
		const index = hourOptions.indexOf(hours);
		const nextIndex = (index + delta + hourOptions.length) % hourOptions.length;
		selectHour(hourOptions[nextIndex]);
	}

	function moveMinute(delta: number) {
		const index = minuteOptions.indexOf(minutes);
		const nextIndex = (index + delta + minuteOptions.length) % minuteOptions.length;
		selectMinute(minuteOptions[nextIndex]);
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
			closePopover();
		}
	}

	function closePopover(focusTrigger = false) {
		isOpen = false;
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function handleRootKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePopover(true);
		}
	}

	function handleHourKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveHour(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveHour(-1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			selectHour(hourOptions[0]);
		} else if (event.key === 'End') {
			event.preventDefault();
			selectHour(hourOptions[hourOptions.length - 1]);
		}
	}

	function handleMinuteKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveMinute(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveMinute(-1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			selectMinute(minuteOptions[0]);
		} else if (event.key === 'End') {
			event.preventDefault();
			selectMinute(minuteOptions[minuteOptions.length - 1]);
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

	function scrollToSelected(node: HTMLElement, isSelected: boolean) {
		if (isSelected && node.parentElement) {
			setTimeout(() => {
				node.scrollIntoView({ block: 'nearest', behavior: 'auto' });
			}, 50);
		}
	}
</script>

<div bind:this={containerEl} class="monsan-time-picker-container" onkeydown={handleRootKeyDown}>
	<button
		bind:this={triggerEl}
		type="button"
		class="time-picker-trigger"
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
			id={panelId}
			class="time-picker-dropdown panel"
			transition:scale={{
				duration: prefersReducedMotion ? 0 : 200,
				easing: backOut,
				start: prefersReducedMotion ? 1 : 0.9
			}}
		>
			<div class="dropdown-header">
				<span>{i18n.t('timePicker.selectTime')}</span>
			</div>

			<div class="picker-columns">
				<div class="picker-column scrollbar-custom">
					<div id={`${hoursListId}-label`} class="column-title">{i18n.t('timePicker.hours')}</div>
					<div
						id={hoursListId}
						class="column-list"
						role="listbox"
						aria-labelledby={`${hoursListId}-label`}
					>
						{#each hourOptions as h (h)}
							<button
								type="button"
								class="number-btn"
								class:active={hours === h}
								use:scrollToSelected={hours === h}
								role="option"
								aria-selected={hours === h}
								onkeydown={handleHourKeyDown}
								onclick={() => selectHour(h)}
							>
								{h}
							</button>
						{/each}
					</div>
				</div>

				<div class="picker-column scrollbar-custom">
					<div id={`${minutesListId}-label`} class="column-title">
						{i18n.t('timePicker.minutes')}
					</div>
					<div
						id={minutesListId}
						class="column-list"
						role="listbox"
						aria-labelledby={`${minutesListId}-label`}
					>
						{#each minuteOptions as m (m)}
							<button
								type="button"
								class="number-btn"
								class:active={minutes === m}
								use:scrollToSelected={minutes === m}
								role="option"
								aria-selected={minutes === m}
								onkeydown={handleMinuteKeyDown}
								onclick={() => selectMinute(m)}
							>
								{m}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<button type="button" class="confirm-time-btn" onclick={() => closePopover(true)}>
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

	.time-picker-trigger.invalid {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
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

	@media (prefers-reduced-motion: reduce) {
		.time-picker-trigger,
		.number-btn,
		.confirm-time-btn {
			transition: none;
		}
	}
</style>
