<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import AvatarMenu from './AvatarMenu.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import MenuItem from './MenuItem.svelte';
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

	function handleThemeChange(themeId: string): void {
		onThemeChange?.(themeId);
		open = false;
	}

	function handleLocaleChange(localeId: string): void {
		onLocaleChange?.(localeId);
		open = false;
	}
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
		<div class="suite-user-menu-preference" data-menu-persistent>
			<LanguageSelector
				value={localeValue}
				ariaLabel={localeAriaLabel}
				onChange={handleLocaleChange}
				mode="cycle"
			/>
		</div>
	</div>
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
		flex: 0 0 auto;
	}
</style>
