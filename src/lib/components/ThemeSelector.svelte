<script lang="ts">
	import { onMount } from 'svelte';
	import Sun from '$lib/components/icons/Sun.svelte';
	import Button from './Button.svelte';
	import MenuItem from './MenuItem.svelte';
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
		const documentTheme = document.documentElement.getAttribute('data-theme');
		const saved = localStorage.getItem(storageKey);
		let initialTheme: string = saved || '';

		if (!initialTheme && documentTheme && themes.some((t: ThemeOption) => t.id === documentTheme)) {
			initialTheme = documentTheme;
		}

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
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	{:else}
		<Sun {size} />
	{/if}
{/snippet}

{#snippet triggerIcon(size: number)}
	<span class="theme-icon-current" aria-hidden="true">
		{@render generalIcon(value, size)}
	</span>
{/snippet}

{#snippet generalIcon(themeId: string, size: number)}
	{#if themeId === 'light' || themeId === 'dark'}
		{@render themeIcon(themeId, size)}
	{:else}
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
			<circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
			<circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
			<circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
			<path
				d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.63-.77 1.63-1.7 0-.42-.15-.81-.4-1.12-.13-.15-.22-.35-.22-.57 0-.46.38-.84.84-.84H15c4.97 0 9-4.03 9-9 0-4.97-4.03-9-9-9Z"
			/>
		</svg>
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
				{@render triggerIcon(18)}
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
						{@render triggerIcon(18)}
					</span>
					{#if display === 'label'}
						<span>{activeTheme?.label ?? value}</span>
					{/if}
				</Button>
			{/snippet}

			{#each themes as theme (theme.id)}
				<MenuItem align="left" checked={value === theme.id} onclick={() => selectTheme(theme.id)}>
					<span class="item-icon">
						{@render generalIcon(theme.id, 16)}
					</span>
					{theme.label}
				</MenuItem>
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

	.theme-icon-current {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1em;
		height: 1em;
	}

	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
