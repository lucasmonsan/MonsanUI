<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { SvelteDate } from 'svelte/reactivity';
	import Badge from './Badge.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface CalendarEvent {
		title: string;
		time?: string;
		description?: string;
		color?: 'default' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'red';
	}

	interface Props {
		studyLogs?: Record<string, number>;
		events?: Record<string, CalendarEvent[]>;
		mode?: 'heatmap' | 'calendar' | 'week' | 'list';
		title?: string;
		weekDayLabels?: string[];
		selectedDate?: string | null;
		onSelectDate?: (dateStr: string) => void;
	}

	let {
		studyLogs = {},
		events = {},
		mode = 'calendar',
		title,
		weekDayLabels,
		selectedDate = $bindable(null),
		onSelectDate
	}: Props = $props();

	const today = new Date();
	const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

	let currentYear = $state(today.getFullYear());
	let currentMonth = $state(today.getMonth()); // 0-11

	// Tradução reativa e automática de meses usando Intl
	const monthNames = $derived.by(() => {
		const locale = i18n.locale || 'pt';
		const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
		return Array.from({ length: 12 }, (_, i) => {
			const name = formatter.format(new Date(2000, i, 1));
			return name.charAt(0).toUpperCase() + name.slice(1);
		});
	});

	// Tradução reativa e automática dos cabeçalhos dos dias da semana usando Intl
	const defaultWeekDayLabels = $derived.by(() => {
		const locale = i18n.locale || 'pt';
		const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
		// 3 de Janeiro de 2000 é uma Segunda-feira
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(2000, 0, 3 + i);
			return formatter.format(d).toUpperCase();
		});
	});

	let activeWeekDayLabels = $derived(weekDayLabels ?? defaultWeekDayLabels);
	let displayTitle = $derived(title ?? i18n.t('calendar.title'));

	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear += 1;
		} else {
			currentMonth += 1;
		}
	}

	// Sincronizar o idioma reativamente com os nomes dos dias e meses
	function prevMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear -= 1;
		} else {
			currentMonth -= 1;
		}
	}

	// Gerar dados do calendário para o mês selecionado
	let calendarData = $derived.by(() => {
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);

		let firstDayOfWeek = firstDay.getDay();
		if (firstDayOfWeek === 0) firstDayOfWeek = 7;

		const data = [];

		for (let i = 1; i < firstDayOfWeek; i++) {
			data.push({ dateStr: '', count: 0, day: '', hasEvents: false });
		}

		for (let i = 1; i <= lastDay.getDate(); i++) {
			const mo = currentMonth + 1;
			const dateStr = `${currentYear}-${String(mo).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
			const count = studyLogs[dateStr] || 0;
			const hasEvents = !!events[dateStr] && events[dateStr].length > 0;
			data.push({ dateStr, count, day: i.toString(), hasEvents });
		}

		while (data.length % 7 !== 0) {
			data.push({ dateStr: '', count: 0, day: '', hasEvents: false });
		}

		return data;
	});

	// Gerar dados da semana corrente
	let weekData = $derived.by(() => {
		const baseDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : today;
		const dayOfWeek = baseDate.getDay();
		const distance = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		const monday = new SvelteDate(baseDate);
		monday.setDate(baseDate.getDate() + distance);

		const data = [];
		for (let i = 0; i < 7; i++) {
			const current = new SvelteDate(monday);
			current.setDate(monday.getDate() + i);
			const y = current.getFullYear();
			const m = current.getMonth() + 1;
			const d = current.getDate();
			const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			const count = studyLogs[dateStr] || 0;
			const hasEvents = !!events[dateStr] && events[dateStr].length > 0;
			data.push({ dateStr, count, day: d.toString(), hasEvents });
		}
		return data;
	});

	// Gerar dados consolidados do mês em formato de lista (agenda)
	let listEvents = $derived.by(() => {
		const list = [];
		const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
		for (const [dateStr, evList] of Object.entries(events)) {
			if (dateStr.startsWith(monthStr)) {
				list.push({
					dateStr,
					events: evList,
					activity: studyLogs[dateStr] || 0
				});
			}
		}
		list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
		return list;
	});

	function handleDayClick(dateStr: string) {
		if (!dateStr) return;
		selectedDate = dateStr;
		onSelectDate?.(dateStr);
	}

	let showMonthYearPicker = $state(false);
	let selectedDayEvents = $derived(selectedDate ? events[selectedDate] || [] : []);
	let selectedDayActivity = $derived(selectedDate ? studyLogs[selectedDate] || 0 : 0);

	function formatDisplayDate(dateStr: string) {
		const parts = dateStr.split('-');
		return `${parts[2]}/${parts[1]}/${parts[0]}`;
	}

	function getAriaLabelForDay(dateStr: string, count: number, hasEvents: boolean) {
		if (!dateStr) return '';
		const [y, m, d] = dateStr.split('-').map(Number);
		const dateObj = new Date(y, m - 1, d);
		const locale = i18n.locale || 'pt';
		const formatter = new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		const formattedDate = formatter.format(dateObj);

		let suffix = '';
		if (count > 0) {
			if (locale === 'pt') {
				suffix = `, ${count} ${count === 1 ? 'revisão pendente' : 'revisões pendentes'}`;
			} else if (locale === 'es') {
				suffix = `, ${count} ${count === 1 ? 'revisión pendiente' : 'revisiones pendientes'}`;
			} else {
				suffix = `, ${count} ${count === 1 ? 'pending review' : 'pending reviews'}`;
			}
		}

		if (hasEvents) {
			if (locale === 'pt') {
				suffix += ', possui eventos';
			} else if (locale === 'es') {
				suffix += ', tiene eventos';
			} else {
				suffix += ', has events';
			}
		}

		return `${formattedDate}${suffix}`;
	}
</script>

<svelte:window onclick={() => (showMonthYearPicker = false)} />

<div class="calendar-card panel">
	<div class="calendar-top-bar">
		<div
			class="calendar-title-picker"
			onclick={(e) => {
				e.stopPropagation();
				showMonthYearPicker = !showMonthYearPicker;
			}}
			role="button"
			tabindex="0"
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.stopPropagation();
					showMonthYearPicker = !showMonthYearPicker;
				}
			}}
		>
			{#if mode === 'calendar' || mode === 'heatmap'}
				<h3 class="calendar-title">
					{monthNames[currentMonth]}
					{currentYear}
					<svg
						class="picker-icon"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
						<line x1="16" x2="16" y1="2" y2="6" />
						<line x1="8" x2="8" y1="2" y2="6" />
						<line x1="3" x2="21" y1="10" y2="10" />
					</svg>
				</h3>
			{:else if mode === 'week'}
				<h3 class="calendar-title">
					{i18n.locale === 'pt'
						? 'Semana Atual'
						: i18n.locale === 'en'
							? 'Current Week'
							: 'Semana Actual'}
				</h3>
			{:else if mode === 'list'}
				<h3 class="calendar-title">
					{i18n.t('calendar.agenda')} — {monthNames[currentMonth]}
					{currentYear}
					<svg
						class="picker-icon"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
						<line x1="16" x2="16" y1="2" y2="6" />
						<line x1="8" x2="8" y1="2" y2="6" />
						<line x1="3" x2="21" y1="10" y2="10" />
					</svg>
				</h3>
			{:else}
				<h3 class="calendar-title">{displayTitle}</h3>
			{/if}

			{#if showMonthYearPicker && (mode === 'calendar' || mode === 'list' || mode === 'heatmap')}
				<div
					class="month-year-popover panel"
					transition:scale={{ duration: 180, start: 0.94, easing: backOut }}
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					role="dialog"
					aria-label="Selecionar mês e ano"
					tabindex="-1"
				>
					<div class="popover-header">
						<button
							type="button"
							class="year-nav-btn"
							onclick={() => currentYear--}
							aria-label="Ano Anterior"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m15 18-6-6 6-6" />
							</svg>
						</button>
						<input
							type="number"
							class="year-input"
							bind:value={currentYear}
							min={1000}
							max={9999}
						/>
						<button
							type="button"
							class="year-nav-btn"
							onclick={() => currentYear++}
							aria-label="Próximo Ano"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m9 18 6-6-6-6" />
							</svg>
						</button>
					</div>
					<div class="months-grid">
						{#each monthNames as month, idx (month)}
							<button
								type="button"
								class="month-btn"
								class:active={currentMonth === idx}
								onclick={() => {
									currentMonth = idx;
									showMonthYearPicker = false;
								}}
							>
								{month.substring(0, 3)}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="nav-buttons">
			{#if mode !== 'week'}
				<button class="nav-btn" onclick={prevMonth} aria-label="Mês anterior">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<button class="nav-btn" onclick={nextMonth} aria-label="Próximo mês">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="flip-x"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	{#if mode !== 'list'}
		<div class="calendar-header">
			{#each activeWeekDayLabels as day, i (i)}
				<div class="header-day">{day}</div>
			{/each}
		</div>
	{/if}

	{#if mode === 'heatmap'}
		<div class="heatmap-grid">
			{#each calendarData as day, i (i)}
				<button
					type="button"
					class="heatmap-cell"
					class:empty={day.day === ''}
					class:selected={selectedDate === day.dateStr}
					disabled={day.day === ''}
					onclick={() => handleDayClick(day.dateStr)}
					title={day.dateStr ? `${day.dateStr}: ${day.count} revisões` : ''}
					aria-label={day.dateStr
						? getAriaLabelForDay(day.dateStr, day.count, day.hasEvents)
						: undefined}
					style:background={day.day === ''
						? 'transparent'
						: day.count === 0
							? 'var(--heatmap-0)'
							: day.count <= 2
								? 'var(--heatmap-1)'
								: day.count <= 5
									? 'var(--heatmap-2)'
									: day.count <= 10
										? 'var(--heatmap-3)'
										: 'var(--heatmap-4)'}
					style:color={day.count >= 5 ? 'var(--bg-primary)' : 'var(--text-primary)'}
				>
					{#if day.day}
						<span class="day-number">{day.day}</span>
					{/if}
				</button>
			{/each}
		</div>
	{:else if mode === 'calendar'}
		<div class="calendar-grid">
			{#each calendarData as day, i (i)}
				<button
					type="button"
					class="calendar-cell"
					class:empty={day.day === ''}
					class:is-today={day.dateStr === todayDateStr}
					class:selected={selectedDate === day.dateStr}
					class:has-events={day.hasEvents || day.count > 0}
					disabled={day.day === ''}
					onclick={() => handleDayClick(day.dateStr)}
					aria-label={day.dateStr
						? getAriaLabelForDay(day.dateStr, day.count, day.hasEvents)
						: undefined}
				>
					{#if day.day}
						<span class="day-number">{day.day}</span>
						{#if day.hasEvents || day.count > 0}
							<span class="event-indicator" class:activity={day.count > 0 && !day.hasEvents}></span>
						{/if}
					{/if}
				</button>
			{/each}
		</div>
	{:else if mode === 'week'}
		<div class="calendar-grid">
			{#each weekData as day, i (i)}
				<button
					type="button"
					class="calendar-cell"
					class:is-today={day.dateStr === todayDateStr}
					class:selected={selectedDate === day.dateStr}
					class:has-events={day.hasEvents || day.count > 0}
					onclick={() => handleDayClick(day.dateStr)}
					aria-label={day.dateStr
						? getAriaLabelForDay(day.dateStr, day.count, day.hasEvents)
						: undefined}
				>
					<span class="day-number">{day.day}</span>
					{#if day.hasEvents || day.count > 0}
						<span class="event-indicator" class:activity={day.count > 0 && !day.hasEvents}></span>
					{/if}
				</button>
			{/each}
		</div>
	{:else if mode === 'list'}
		<div class="calendar-list-view">
			{#if listEvents.length === 0}
				<div class="no-events-msg">{i18n.t('calendar.noEventsMonth')}</div>
			{:else}
				{#each listEvents as day (day.dateStr)}
					<button
						type="button"
						class="list-day-item glass-panel"
						class:selected={selectedDate === day.dateStr}
						onclick={() => handleDayClick(day.dateStr)}
					>
						<div class="list-day-header">
							<span class="list-day-date">{formatDisplayDate(day.dateStr)}</span>
							{#if day.activity > 0}
								<Badge variant="due">{day.activity} {i18n.locale === 'pt' ? 'revs' : 'revs'}</Badge>
							{/if}
						</div>
						{#if day.events.length > 0}
							<div class="list-day-events">
								{#each day.events as event, idx (idx)}
									<div class="list-event-row" data-deck-theme={event.color || 'default'}>
										<span class="list-event-time">{event.time || '--:--'}</span>
										<span class="list-event-title">{event.title}</span>
									</div>
								{/each}
							</div>
						{/if}
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	{#if mode !== 'heatmap' && selectedDate}
		<div class="calendar-details-panel">
			<div class="details-header">
				<h4>{i18n.t('calendar.dayDetails')} — {formatDisplayDate(selectedDate)}</h4>
				<button
					class="close-details-btn"
					onclick={() => (selectedDate = null)}
					aria-label="Fechar detalhes"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M18 6 6 18M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="details-content">
				{#if selectedDayActivity > 0}
					<div class="activity-log">
						<span class="activity-badge"></span>
						<strong>{i18n.t('calendar.activity')}</strong>
						{selectedDayActivity}
						{i18n.t('calendar.revisionsDone')}
					</div>
				{/if}

				{#if selectedDayEvents.length > 0}
					<div class="events-list">
						{#each selectedDayEvents as event, idx (idx)}
							<div class="event-item" data-deck-theme={event.color || 'default'}>
								<div class="event-item-meta">
									{#if event.time}
										<span class="event-time">{event.time}</span>
									{/if}
									<span class="event-title">{event.title}</span>
								</div>
								{#if event.description}
									<p class="event-description">{event.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else if selectedDayActivity === 0}
					<div class="no-events-msg">{i18n.t('calendar.noActivityDate')}</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.calendar-card {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	.calendar-top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
		border-bottom: 2px solid var(--border-color);
		padding-bottom: var(--space-sm);
	}

	.calendar-title-picker {
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
	}

	.calendar-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 900;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 4px var(--space-sm);
		border-radius: var(--radius-sm);
		border: var(--border-width) solid transparent;
		transition: all 0.15s var(--ease-out);
		white-space: nowrap;
	}

	.calendar-title-picker:hover .calendar-title {
		background: var(--bg-secondary);
		border-color: var(--border-color);
		box-shadow: 2px 2px 0px var(--text-primary);
		transform: translate(-1px, -1px);
	}

	.picker-icon {
		opacity: 0.6;
		transition: opacity 0.15s var(--ease-out);
	}

	.calendar-title-picker:hover .picker-icon {
		opacity: 1;
		color: var(--accent-primary);
	}

	/* Custom Month/Year Popover */
	.month-year-popover {
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		z-index: 100;
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		padding: var(--space-sm);
		width: 240px;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		cursor: default;
		transform-origin: top left;
	}

	.popover-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: var(--space-xs);
	}

	:global(.year-input) {
		font-family: var(--font-display) !important;
		font-weight: 900 !important;
		font-size: var(--text-md) !important;
		color: var(--text-primary) !important;
		background: transparent !important;
		border: none !important;
		text-align: center !important;
		width: 55px !important;
		outline: none !important;
		border-radius: var(--radius-sm) !important;
		padding: 2px !important;
	}

	:global(.year-input:focus) {
		background: var(--bg-secondary) !important;
		box-shadow: inset 0px 0px 0px 1px var(--border-color) !important;
	}

	:global(.year-input::-webkit-outer-spin-button),
	:global(.year-input::-webkit-inner-spin-button) {
		-webkit-appearance: none;
		appearance: none;
		margin: 0;
	}
	:global(.year-input[type='number']) {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.year-nav-btn {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
		transition: all 0.1s var(--ease-out);
	}

	.year-nav-btn:hover {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--text-primary);
	}

	.year-nav-btn:active {
		transform: translate(1px, 1px);
		box-shadow: none;
	}

	.months-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-xs);
	}

	.month-btn {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		padding: var(--space-xs) 0;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-xs);
		cursor: pointer;
		color: var(--text-primary);
		box-shadow: var(--shadow-sm);
		transition: all 0.1s var(--ease-out);
		text-align: center;
	}

	.month-btn:hover {
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--text-primary);
	}

	.month-btn.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
		box-shadow: none;
		transform: translate(1px, 1px);
	}

	:global([data-theme='dark']) .month-btn.active {
		color: var(--text-primary);
	}

	.nav-buttons {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}

	.nav-btn {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		transition: all 0.1s var(--ease-out);
		color: var(--text-primary);
	}

	.nav-btn:hover {
		background: var(--bg-secondary);
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--text-primary);
	}

	.nav-btn:active {
		transform: translate(1px, 1px);
		box-shadow: none;
	}

	.flip-x {
		transform: scaleX(-1);
	}

	.calendar-header {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-xs);
		text-align: center;
		margin-bottom: var(--space-xs);
	}

	.header-day {
		font-weight: 800;
		font-size: var(--text-xs);
		color: var(--text-secondary);
		padding-bottom: var(--space-xs);
		text-transform: uppercase;
	}

	.heatmap-grid,
	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-xs);
	}

	.heatmap-cell,
	.calendar-cell {
		aspect-ratio: 1;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: var(--text-xs);
		font-weight: bold;
		cursor: pointer;
		transition:
			transform 0.15s var(--ease-out),
			box-shadow 0.15s var(--ease-out);
		position: relative;
		background: var(--bg-primary);
		color: var(--text-primary);
		padding: 0;
		font-family: inherit;
	}

	.heatmap-cell:hover:not(.empty),
	.calendar-cell:hover:not(.empty) {
		transform: scale(1.1);
		z-index: 10;
		box-shadow: var(--shadow-sm);
	}

	.heatmap-cell.empty,
	.calendar-cell.empty {
		border-color: transparent;
		background: transparent !important;
		cursor: default;
		pointer-events: none;
	}

	.heatmap-cell.selected,
	.calendar-cell.selected {
		background: var(--accent-primary) !important;
		color: var(--bg-primary) !important;
		box-shadow: var(--shadow-sm) !important;
		transform: translate(-2px, -2px) !important;
		border-color: var(--border-color);
		z-index: 5;
	}

	.calendar-cell.is-today {
		border-width: 3px;
		border-color: var(--accent-primary);
	}

	.calendar-cell.is-today.selected {
		border-color: var(--border-color);
	}

	.day-number {
		font-family: var(--font-body);
	}

	.event-indicator {
		width: 5px;
		height: 5px;
		background: var(--accent-primary);
		border-radius: var(--radius-full);
		position: absolute;
		bottom: 4px;
	}

	.event-indicator.activity {
		background: var(--success);
	}

	.calendar-cell.selected .event-indicator {
		background: var(--bg-primary);
	}

	/* Details Panel */
	.calendar-details-panel {
		margin-top: var(--space-md);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background: var(--bg-secondary);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.details-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		border-bottom: var(--border-width) solid var(--border-color);
		background: rgba(0, 0, 0, 0.03);
	}

	.details-header h4 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
	}

	.close-details-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		padding: 2px;
		border-radius: var(--radius-sm);
	}

	.close-details-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		color: var(--text-primary);
	}

	.details-content {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-height: 180px;
		overflow-y: auto;
	}

	.activity-log {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--text-sm);
		color: var(--text-primary);
		padding: var(--space-xs) 0;
	}

	.activity-badge {
		width: 8px;
		height: 8px;
		background: var(--success);
		border-radius: var(--radius-full);
		display: inline-block;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.event-item {
		padding: var(--space-xs) var(--space-sm);
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		box-shadow: 1px 1px 0px var(--text-primary);
	}

	.event-item-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.event-time {
		font-size: var(--text-xs);
		font-weight: 800;
		color: var(--accent-primary);
		background: rgba(230, 57, 70, 0.08);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}

	.event-title {
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text-primary);
	}

	.event-description {
		margin: var(--space-xs) 0 0 0;
		font-size: var(--text-xs);
		color: var(--text-secondary);
	}

	.no-events-msg {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		font-style: italic;
		text-align: center;
		padding: var(--space-sm) 0;
	}

	/* List view styles */
	.calendar-list-view {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-height: 380px;
		overflow-y: auto;
		padding: 2px;
	}

	.list-day-item {
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width) solid var(--border-color);
		background: var(--bg-primary);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.1s var(--ease-out);
		text-align: left;
		text-transform: none;
		font-family: inherit;
		width: 100%;
	}

	.list-day-item:hover {
		transform: translate(-2px, -2px);
		box-shadow: var(--shadow-sm);
	}

	.list-day-item.selected {
		border-color: var(--accent-primary);
		box-shadow: var(--shadow-sm);
		transform: translate(-2px, -2px);
	}

	.list-day-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xs);
	}

	.list-day-date {
		font-weight: 800;
		font-size: var(--text-sm);
		color: var(--text-primary);
	}

	.list-day-events {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
		border-top: 1px dashed var(--border-color);
		padding-top: var(--space-xs);
	}

	.list-event-row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-xs);
	}

	.list-event-time {
		font-weight: 800;
		color: var(--accent-primary);
		background: rgba(230, 57, 70, 0.08);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}

	.list-event-title {
		font-weight: 600;
		color: var(--text-primary);
	}

	/* Ajustes para mobile */
	@media (max-width: 600px) {
		.heatmap-cell,
		.calendar-cell {
			font-size: var(--text-sm);
		}
	}
</style>
