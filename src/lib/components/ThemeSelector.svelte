<script lang="ts">
	import { onMount } from 'svelte';
	import Sun from '$lib/components/icons/Sun.svelte';
	import Button from './Button.svelte';
	import QuickActions from './QuickActions.svelte';

	interface ThemeOption {
		id: string;
		label: string;
	}

	let {
		storageKey = 'theme',
		themes = [
			{ id: 'light', label: 'Light' },
			{ id: 'dark', label: 'Dark' }
		],
		ariaLabel = 'Alternar tema'
	} = $props<{
		storageKey?: string;
		themes?: ThemeOption[];
		ariaLabel?: string;
	}>();

	let currentTheme = $state('light');
	let isOpen = $state(false);

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

		currentTheme = initialTheme;
		document.documentElement.setAttribute('data-theme', currentTheme);
	});

	function selectTheme(themeId: string) {
		currentTheme = themeId;
		document.documentElement.setAttribute('data-theme', themeId);
		localStorage.setItem(storageKey, themeId);
		isOpen = false;
	}

	function handleTriggerClick() {
		if (themes.length <= 2) {
			const currentIndex = themes.findIndex((t: ThemeOption) => t.id === currentTheme);
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

{#snippet generalIcon(themeId: string, size: number)}
	{#if themeId === 'light' || themeId === 'dark'}
		{@render themeIcon(themeId, size)}
	{:else}
		<!-- Palette Icon for custom themes -->
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
			class="theme-trigger"
			onclick={handleTriggerClick}
			aria-label={ariaLabel}
		>
			<span class="trigger-icon">
				{@render generalIcon(currentTheme, 18)}
			</span>
		</Button>
	{:else}
		<QuickActions bind:open={isOpen} variant="dropdown" align="right">
			{#snippet trigger()}
				<Button
					variant="secondary"
					class="theme-trigger"
					aria-label={ariaLabel}
					aria-expanded={isOpen}
				>
					<span class="trigger-icon">
						{@render generalIcon(currentTheme, 18)}
					</span>
				</Button>
			{/snippet}

			{#each themes as theme (theme.id)}
				<button
					type="button"
					class="dropdown-item"
					class:active={currentTheme === theme.id}
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

	:global(.theme-trigger) {
		padding: 0 !important;
		width: var(--control-height) !important;
		height: var(--control-height) !important;
		background-color: var(--bg-secondary) !important;
		color: var(--text-primary) !important;
		-webkit-tap-highlight-color: transparent;
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
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .dropdown-item.active {
		color: var(--text-primary);
	}

	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
