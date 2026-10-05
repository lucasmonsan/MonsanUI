<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import { slideFade } from '$lib/utils/transitions.js';
	import AvatarMenu from './AvatarMenu.svelte';
	import Button from './Button.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import MenuItem from './MenuItem.svelte';
	import Separator from './Separator.svelte';
	import ThemeSelector from './ThemeSelector.svelte';
	import FileTextIcon from './icons/FileText.svelte';
	import LockIcon from './icons/Lock.svelte';
	import LogOutIcon from './icons/LogOut.svelte';
	import UserIcon from './icons/User.svelte';

	interface User {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	}

	interface Props {
		user?: User | null;
		src?: string | null;
		name?: string;
		alt?: string;
		ariaLabel: string;
		profileLabel: string;
		loginLabel?: string;
		loginHref?: string;
		termsLabel: string;
		termsHref: string;
		privacyLabel: string;
		privacyHref: string;
		logoutLabel: string;
		localeValue?: string;
		localeAriaLabel?: string;
		localeMode?: 'auto' | 'cycle' | 'dropdown' | 'segmented';
		themeValue?: string;
		themeStorageKey?: string;
		themeAriaLabel?: string;
		size?: 'sm' | 'md' | 'lg' | 'control';
		shape?: 'circle' | 'square';
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		layout?: 'vertical' | 'horizontal';
		placement?: 'below' | 'before' | 'after';
		variant?: 'floating' | 'dropdown';
		panelShadow?: 'default' | 'none';
		panelPadding?: 'xs' | 'sm' | 'md';
		panelGap?: 'xs' | 'sm' | 'md';
		profileDisabled?: boolean;
		showProfileAction?: boolean;
		logoutDisabled?: boolean;
		onThemeChange?: (themeId: string) => void;
		onLocaleChange?: (localeId: string) => void;
		onProfile?: (event: MouseEvent) => void;
		onLogin?: (event: MouseEvent) => void;
		onTerms?: (event: MouseEvent) => void;
		onPrivacy?: (event: MouseEvent) => void;
		onLogout?: (event: MouseEvent) => void;
		/** Official extension point for custom user menu links, such as About. */
		children?: Snippet;
		/** Official extension point for custom user menu links, such as About. */
		userMenuExtras?: Snippet;
		/** App-specific compact actions shown alongside theme and locale controls. */
		userMenuShortcuts?: Snippet;
		/** Destructive app actions shown at the end of the menu. */
		userMenuDangerActions?: Snippet;
	}

	let {
		user,
		src,
		name,
		alt,
		ariaLabel,
		profileLabel,
		loginLabel,
		loginHref,
		termsLabel,
		termsHref,
		privacyLabel,
		privacyHref,
		logoutLabel,
		localeValue = 'en',
		localeAriaLabel,
		localeMode = 'dropdown',
		themeValue,
		themeStorageKey,
		themeAriaLabel,
		size = 'control',
		shape = 'square',
		align = 'right',
		width = 'dropdown',
		layout = 'vertical',
		placement = 'below',
		variant = 'dropdown',
		panelShadow = 'default',
		panelPadding = 'sm',
		panelGap = 'sm',
		profileDisabled = false,
		showProfileAction = true,
		logoutDisabled = false,
		onThemeChange,
		onLocaleChange,
		onProfile,
		onLogin,
		onTerms,
		onPrivacy,
		onLogout,
		children,
		userMenuExtras,
		userMenuShortcuts,
		userMenuDangerActions
	}: Props = $props();

	const resolvedSrc = $derived(src ?? user?.image ?? undefined);
	const resolvedName = $derived(name ?? user?.name ?? user?.email ?? '');
	const resolvedAlt = $derived(alt ?? resolvedName);
	const isAuthenticated = $derived(Boolean(user || resolvedSrc || resolvedName));
	const primaryLabel = $derived(isAuthenticated ? profileLabel : (loginLabel ?? profileLabel));
	const primaryHref = $derived(isAuthenticated ? undefined : loginHref);
	const primaryAction = $derived(isAuthenticated ? onProfile : (onLogin ?? onProfile));
	let open = $state(false);
	let isLanguageOpen = $state(false);

	const defaultLocales = [
		{ id: 'en', label: 'EN', name: 'English' },
		{ id: 'pt', label: 'PT', name: 'Português' },
		{ id: 'es', label: 'ES', name: 'Español' }
	];

	function getSuiteCookieDomain() {
		if (typeof window === 'undefined') return '';
		const hostname = window.location.hostname;
		if (hostname === 'monsan.dev.br' || hostname.endsWith('.monsan.dev.br')) {
			return '; Domain=.monsan.dev.br';
		}
		return '';
	}

	function persistLocale(localeId: string) {
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem('monsan-suite-locale', localeId);
			localStorage.setItem('PARAGLIDE_LOCALE', localeId);
		} catch {
			// ignore storage access error
		}
		const maxAge = 60 * 60 * 24 * 365;
		const domain = getSuiteCookieDomain();
		const secure = window.location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `PARAGLIDE_LOCALE=${encodeURIComponent(localeId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${domain}${secure}`;
		document.cookie = `monsan_locale=${encodeURIComponent(localeId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${domain}${secure}`;
	}

	function handleThemeChange(themeId: string): void {
		onThemeChange?.(themeId);
		open = false;
	}

	function handleLocaleChange(localeId: string): void {
		persistLocale(localeId);
		onLocaleChange?.(localeId);
		window.dispatchEvent(new CustomEvent('monsan-locale-change', { detail: { locale: localeId } }));
		isLanguageOpen = false;
		open = false;
	}

	function toggleLanguage(event?: MouseEvent) {
		event?.stopPropagation();
		isLanguageOpen = !isLanguageOpen;
	}

	$effect(() => {
		if (!open) {
			isLanguageOpen = false;
		}
	});
</script>

<AvatarMenu
	bind:open
	src={resolvedSrc ?? undefined}
	name={resolvedName}
	alt={resolvedAlt}
	{size}
	{shape}
	{align}
	{width}
	{layout}
	{placement}
	{variant}
	{panelShadow}
	{panelPadding}
	{panelGap}
	{ariaLabel}
>
	{#if showProfileAction}
		<MenuItem href={primaryHref} disabled={profileDisabled} onclick={primaryAction} align="right">
			<UserIcon size={16} />
			{primaryLabel}
		</MenuItem>
	{/if}
	<div class="suite-user-menu-shortcuts">
		{@render userMenuShortcuts?.()}
		<div class="suite-user-menu-preference" data-menu-persistent>
			<ThemeSelector
				value={themeValue}
				storageKey={themeStorageKey}
				ariaLabel={themeAriaLabel}
				onChange={handleThemeChange}
			/>
		</div>
		<Separator orientation="vertical" />
		<div class="suite-user-menu-preference" data-menu-persistent>
			{#if localeMode === 'cycle'}
				<LanguageSelector
					value={localeValue}
					ariaLabel={localeAriaLabel}
					onChange={handleLocaleChange}
					mode="cycle"
				/>
			{:else if localeMode === 'segmented'}
				<LanguageSelector
					value={localeValue}
					ariaLabel={localeAriaLabel}
					onChange={handleLocaleChange}
					mode="segmented"
				/>
			{:else}
				<Button
					variant={isLanguageOpen ? 'primary' : 'secondary'}
					square
					onclick={toggleLanguage}
					ariaLabel={localeAriaLabel ?? 'Alternar idioma / Toggle language / Cambiar idioma'}
					ariaExpanded={isLanguageOpen}
					title={localeAriaLabel ?? 'Alternar idioma / Toggle language / Cambiar idioma'}
				>
					<span class="trigger-label">
						{localeValue.toUpperCase()}
					</span>
				</Button>
			{/if}
		</div>
	</div>
	{#if isLanguageOpen && localeMode !== 'cycle' && localeMode !== 'segmented'}
		<div
			class="suite-user-menu-language-options"
			role="menu"
			aria-label={localeAriaLabel ?? 'Alternar idioma / Toggle language / Cambiar idioma'}
			data-menu-persistent
			transition:slideFade={{ duration: 180 }}
		>
			{#each defaultLocales as locale (locale.id)}
				<MenuItem
					align="left"
					checked={localeValue === locale.id}
					onclick={() => handleLocaleChange(locale.id)}
				>
					<span class="locale-option">
						<span class="item-label">{locale.label}</span>
						{#if locale.name}
							<span class="item-name">{locale.name}</span>
						{/if}
					</span>
				</MenuItem>
			{/each}
		</div>
	{/if}
	{@render children?.()}
	{@render userMenuExtras?.()}
	<MenuItem href={termsHref} onclick={onTerms} align="right">
		<FileTextIcon size={16} />
		{termsLabel}
	</MenuItem>
	<MenuItem href={privacyHref} onclick={onPrivacy} align="right">
		<LockIcon size={16} />
		{privacyLabel}
	</MenuItem>
	{@render userMenuDangerActions?.()}
	{#if isAuthenticated}
		<MenuItem variant="error" disabled={logoutDisabled} onclick={onLogout} align="right">
			<LogOutIcon size={16} />
			{logoutLabel}
		</MenuItem>
	{/if}
</AvatarMenu>

<style>
	.suite-user-menu-shortcuts {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-xxs) 0;
	}

	.suite-user-menu-preference {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
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

	.suite-user-menu-language-options {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: var(--space-xxs);
		padding: var(--space-xs) 0;
		border-top: var(--border-width) solid var(--border-color);
		border-bottom: var(--border-width) solid var(--border-color);
		box-sizing: border-box;
		overflow: hidden;
	}

	.locale-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: var(--space-xs);
		font-size: var(--text-sm);
	}

	.item-label {
		font-weight: 800;
		min-width: 1.8em;
	}

	.item-name {
		color: var(--text-secondary);
	}

	:global(.monsan-menu-item.selected) .item-name {
		color: inherit;
		opacity: 0.85;
	}
</style>
