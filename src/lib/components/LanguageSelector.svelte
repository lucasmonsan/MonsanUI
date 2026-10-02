<script lang="ts">
	import Button from './Button.svelte';
	import MenuItem from './MenuItem.svelte';
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
		display?: 'compact' | 'label';
		mode?: 'auto' | 'cycle' | 'dropdown';
	}

	let {
		value = $bindable(),
		locales = [
			{ id: 'en', label: 'EN', name: 'English' },
			{ id: 'pt', label: 'PT', name: 'Português' },
			{ id: 'es', label: 'ES', name: 'Español' }
		],
		onChange,
		ariaLabel = 'Alternar idioma / Toggle language / Cambiar idioma',
		title = 'Alternar idioma / Toggle language / Cambiar idioma',
		display = 'compact',
		mode = 'auto'
	}: Props = $props();

	let isOpen = $state(false);
	let activeLocale = $derived(locales.find((locale) => locale.id === value));
	let shouldCycle = $derived(mode === 'cycle' || (mode === 'auto' && locales.length <= 2));

	function selectLocale(localeId: string) {
		value = localeId;
		onChange?.(localeId);
		window.dispatchEvent(new CustomEvent('monsan-locale-change', { detail: { locale: localeId } }));
		isOpen = false;
	}

	function handleTriggerClick() {
		const currentIndex = locales.findIndex((l) => l.id === value);
		const activeIdx = currentIndex === -1 ? 0 : currentIndex;
		const nextIndex = (activeIdx + 1) % locales.length;
		selectLocale(locales[nextIndex].id);
	}
</script>

<div class="locale-dropdown-wrapper">
	{#if shouldCycle}
		<Button
			variant="secondary"
			square={display === 'compact'}
			onclick={handleTriggerClick}
			{ariaLabel}
			{title}
		>
			<span class="trigger-label">
				{display === 'label'
					? (activeLocale?.name ?? activeLocale?.label ?? value)
					: value.toUpperCase()}
			</span>
		</Button>
	{:else}
		<QuickActions
			bind:open={isOpen}
			variant="dropdown"
			align="right"
			triggerBehavior="child"
			panelShadow="default"
			panelPadding="sm"
			panelGap="sm"
		>
			{#snippet trigger(toggleMenu)}
				<Button
					variant="secondary"
					square={display === 'compact'}
					onclick={toggleMenu}
					{ariaLabel}
					ariaExpanded={isOpen}
					{title}
				>
					<span class="trigger-label">
						{display === 'label'
							? (activeLocale?.name ?? activeLocale?.label ?? value)
							: value.toUpperCase()}
					</span>
				</Button>
			{/snippet}

			{#each locales as locale (locale.id)}
				<MenuItem
					align="left"
					checked={value === locale.id}
					onclick={() => selectLocale(locale.id)}
				>
					<span class="locale-option">
						<span class="item-label">{locale.label}</span>
						{#if locale.name}
							<span class="item-name">{locale.name}</span>
						{/if}
					</span>
				</MenuItem>
			{/each}
		</QuickActions>
	{/if}
</div>

<style>
	.locale-dropdown-wrapper {
		position: relative;
		display: inline-flex;
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

	.locale-option {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		width: 100%;
		min-width: 0;
	}

	.item-label {
		font-weight: 800;
	}

	.item-name {
		font-size: var(--text-xs);
		opacity: 0.8;
	}
</style>
