<script lang="ts">
	import Button from './Button.svelte';
	import QuickActions from './QuickActions.svelte';

	interface LocaleOption {
		id: string;
		label: string;
		name?: string;
	}

	interface Props {
		value: string;
		locales?: LocaleOption[];
		onChange?: (localeId: string) => void;
		ariaLabel?: string;
		title?: string;
	}

	let {
		value = $bindable(),
		locales = [
			{ id: 'en', label: 'EN', name: 'English' },
			{ id: 'pt', label: 'PT', name: 'Português' }
		],
		onChange,
		ariaLabel = 'Alternar idioma / Toggle language / Cambiar idioma',
		title = 'Alternar idioma / Toggle language / Cambiar idioma'
	}: Props = $props();

	let isOpen = $state(false);

	function selectLocale(localeId: string) {
		value = localeId;
		onChange?.(localeId);
		isOpen = false;
	}

	function handleTriggerClick() {
		if (locales.length <= 2) {
			const currentIndex = locales.findIndex((l) => l.id === value);
			const activeIdx = currentIndex === -1 ? 0 : currentIndex;
			const nextIndex = (activeIdx + 1) % locales.length;
			selectLocale(locales[nextIndex].id);
		}
	}
</script>

<div class="locale-dropdown-wrapper">
	{#if locales.length <= 2}
		<Button
			variant="secondary"
			class="locale-trigger"
			onclick={handleTriggerClick}
			aria-label={ariaLabel}
			{title}
		>
			<span class="trigger-label">
				{value.toUpperCase()}
			</span>
		</Button>
	{:else}
		<QuickActions bind:open={isOpen} variant="dropdown" align="right">
			{#snippet trigger()}
				<Button
					variant="secondary"
					class="locale-trigger"
					aria-label={ariaLabel}
					aria-expanded={isOpen}
					{title}
				>
					<span class="trigger-label">
						{value.toUpperCase()}
					</span>
				</Button>
			{/snippet}

			{#each locales as locale (locale.id)}
				<button
					type="button"
					class="dropdown-item"
					class:active-locale={value === locale.id}
					onclick={() => selectLocale(locale.id)}
					role="menuitem"
				>
					<span class="item-label">{locale.label}</span>
					{#if locale.name}
						<span class="item-name">{locale.name}</span>
					{/if}
				</button>
			{/each}
		</QuickActions>
	{/if}
</div>

<style>
	.locale-dropdown-wrapper {
		position: relative;
		display: inline-flex;
	}

	:global(.locale-trigger) {
		padding: 0 !important;
		width: var(--control-height) !important;
		height: var(--control-height) !important;
		background-color: var(--bg-secondary) !important;
		color: var(--text-primary) !important;
		-webkit-tap-highlight-color: transparent;
	}

	.trigger-label {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-md);
		font-weight: 800;
		font-family: inherit;
		height: 1.2em;
	}

	.dropdown-item {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		font-family: inherit;
		font-weight: 700;
		font-size: var(--text-sm);
		white-space: nowrap;
		transition: background 0.1s ease;
		box-sizing: border-box;
	}

	.dropdown-item:hover {
		background: var(--bg-secondary);
	}

	.dropdown-item.active-locale {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .dropdown-item.active-locale {
		color: var(--text-primary);
	}

	.item-label {
		font-weight: 800;
	}

	.item-name {
		font-size: var(--text-xs);
		opacity: 0.8;
	}

	.dropdown-item.active-locale .item-name {
		color: var(--bg-primary);
		opacity: 0.9;
	}

	:global([data-theme='dark']) .dropdown-item.active-locale .item-name {
		color: var(--text-primary);
	}
</style>
