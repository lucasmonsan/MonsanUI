<script lang="ts">
	import { onMount } from 'svelte';
	import MoonIcon from 'phosphor-svelte/lib/MoonIcon';
	import PaletteIcon from 'phosphor-svelte/lib/PaletteIcon';
	import Sun from '$lib/components/icons/Sun.svelte';
	import Button from './Button.svelte';
	import QuickActions from './QuickActions.svelte';

	interface ThemeOption {
		id: string;
		label: string;
	}

	interface Props {
		value?: string;
		storageKey?: string;
		themes?: ThemeOption[];
		onChange?: (themeId: string) => void;
		ariaLabel?: string;
		display?: 'icon' | 'label';
	}

	let {
		value = $bindable('light'),
		storageKey = 'theme',
		themes = [
			{ id: 'light', label: 'Light' },
			{ id: 'dark', label: 'Dark' }
		],
		onChange,
		ariaLabel = 'Alternar tema',
		display = 'icon'
	}: Props = $props();

	let isOpen = $state(false);
	let activeTheme = $derived(themes.find((theme) => theme.id === value));

	onMount(() => {
		const saved = localStorage.getItem(storageKey);
		let initialTheme: string = saved || '';

		if (!initialTheme || !themes.some((t: ThemeOption) => t.id === initialTheme)) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (prefersDark && themes.some((t: ThemeOption) => t.id === 'dark')) {
				initialTheme = 'dark';
			} else if (themes.length > 0) {
				initialTheme = themes[0].id;
			} else {
				initialTheme = 'light';
			}
		}

		value = initialTheme;
		document.documentElement.setAttribute('data-theme', value);
	});

	function selectTheme(themeId: string) {
		value = themeId;
		document.documentElement.setAttribute('data-theme', themeId);
		localStorage.setItem(storageKey, themeId);
		onChange?.(themeId);
		isOpen = false;
	}

	function handleTriggerClick() {
		if (themes.length <= 2) {
			const currentIndex = themes.findIndex((t: ThemeOption) => t.id === value);
			const activeIdx = currentIndex === -1 ? 0 : currentIndex;
			const nextIndex = (activeIdx + 1) % themes.length;
			selectTheme(themes[nextIndex].id);
		}
	}
</script>

{#snippet themeIcon(themeId: string, size: number)}
	{#if themeId === 'dark'}
		<MoonIcon {size} color="currentColor" weight="fill" />
	{:else}
		<Sun {size} />
	{/if}
{/snippet}

{#snippet generalIcon(themeId: string, size: number)}
	{#if themeId === 'light' || themeId === 'dark'}
		{@render themeIcon(themeId, size)}
	{:else}
		<PaletteIcon {size} color="currentColor" weight="fill" />
	{/if}
{/snippet}

<div class="theme-dropdown-wrapper">
	{#if themes.length <= 2}
		<Button
			variant="secondary"
			square={display === 'icon'}
			onclick={handleTriggerClick}
			{ariaLabel}
		>
			<span class="trigger-icon">
				{@render generalIcon(value, 18)}
			</span>
			{#if display === 'label'}
				<span>{activeTheme?.label ?? value}</span>
			{/if}
		</Button>
	{:else}
		<QuickActions bind:open={isOpen} variant="dropdown" align="right" triggerBehavior="child">
			{#snippet trigger(toggleMenu)}
				<Button
					variant="secondary"
					square={display === 'icon'}
					onclick={toggleMenu}
					{ariaLabel}
					ariaExpanded={isOpen}
				>
					<span class="trigger-icon">
						{@render generalIcon(value, 18)}
					</span>
					{#if display === 'label'}
						<span>{activeTheme?.label ?? value}</span>
					{/if}
				</Button>
			{/snippet}

			{#each themes as theme (theme.id)}
				<button
					type="button"
					class="dropdown-item"
					class:active={value === theme.id}
					onclick={() => selectTheme(theme.id)}
					role="menuitem"
				>
					<span class="item-icon">
						{@render generalIcon(theme.id, 16)}
					</span>
					{theme.label}
				</button>
			{/each}
		</QuickActions>
	{/if}
</div>

<style>
	.theme-dropdown-wrapper {
		position: relative;
		display: inline-flex;
	}

	.trigger-icon {
		display: flex;
		align-items: center;
		justify-content: center;
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
		gap: var(--space-sm);
		font-family: inherit;
		font-weight: 700;
		font-size: var(--text-sm);
		white-space: nowrap;
		transition: background 0.1s ease;
		box-sizing: border-box;
		text-align: left;
	}

	.dropdown-item:hover {
		background: var(--bg-secondary);
	}

	.dropdown-item.active {
		background: var(--accent-primary);
		color: var(--text-primary);
	}

	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
