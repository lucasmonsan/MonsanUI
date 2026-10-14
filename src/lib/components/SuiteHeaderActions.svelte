<script lang="ts">
	import type { Snippet } from 'svelte';
	import Inline from './Inline.svelte';
	import SuiteUserMenu from './SuiteUserMenu.svelte';

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
		userMenuAriaLabel: string;
		profileLabel: string;
		loginLabel?: string;
		loginHref?: string;
		termsLabel?: string;
		termsHref?: string;
		privacyLabel?: string;
		privacyHref?: string;
		legalLabel?: string;
		legalHref?: string;
		logoutLabel?: string;
		localeValue: string;
		localeAriaLabel?: string;
		themeValue?: string;
		themeStorageKey?: string;
		themeAriaLabel?: string;
		profileDisabled?: boolean;
		showProfileAction?: boolean;
		logoutDisabled?: boolean;
		userMenuPanelShadow?: 'default' | 'none';
		userMenuPanelPadding?: 'xs' | 'sm' | 'md';
		userMenuPanelGap?: 'xs' | 'sm' | 'md';
		onThemeChange?: (themeId: string) => void;
		onLocaleChange?: (localeId: string) => void;
		onProfile?: (event: MouseEvent) => void;
		onLogin?: (event: MouseEvent) => void;
		onTerms?: (event: MouseEvent) => void;
		onPrivacy?: (event: MouseEvent) => void;
		onLegal?: (event: MouseEvent) => void;
		onLogout?: (event: MouseEvent) => void;
		children?: Snippet;
		/** Official extension point forwarded to SuiteUserMenu for custom links, such as About. */
		userMenuExtras?: Snippet;
		/** App-specific compact actions shown alongside the standard theme and locale controls. */
		userMenuShortcuts?: Snippet;
		/** Destructive app actions shown at the end of the avatar menu. */
		userMenuDangerActions?: Snippet;
	}

	let {
		user,
		src,
		name,
		alt,
		userMenuAriaLabel,
		profileLabel,
		loginLabel,
		loginHref,
		termsLabel = '',
		termsHref,
		privacyLabel = '',
		privacyHref,
		legalLabel,
		legalHref,
		logoutLabel = 'Log out',
		localeValue,
		localeAriaLabel,
		themeValue,
		themeStorageKey,
		themeAriaLabel,
		profileDisabled = false,
		showProfileAction = true,
		logoutDisabled = false,
		userMenuPanelShadow = 'default',
		userMenuPanelPadding = 'sm',
		userMenuPanelGap = 'sm',
		onThemeChange,
		onLocaleChange,
		onProfile,
		onLogin,
		onTerms,
		onPrivacy,
		onLegal,
		onLogout,
		children,
		userMenuExtras,
		userMenuShortcuts,
		userMenuDangerActions
	}: Props = $props();
</script>

<Inline gap="sm" align="center">
	{@render children?.()}
	<SuiteUserMenu
		{user}
		src={src ?? undefined}
		{name}
		{alt}
		ariaLabel={userMenuAriaLabel}
		{profileLabel}
		{loginLabel}
		{loginHref}
		{termsLabel}
		{termsHref}
		{privacyLabel}
		{privacyHref}
		{legalLabel}
		{legalHref}
		{logoutLabel}
		{localeValue}
		{localeAriaLabel}
		{themeValue}
		{themeStorageKey}
		{themeAriaLabel}
		{profileDisabled}
		{showProfileAction}
		{logoutDisabled}
		panelShadow={userMenuPanelShadow}
		panelPadding={userMenuPanelPadding}
		panelGap={userMenuPanelGap}
		{onThemeChange}
		{onLocaleChange}
		{onProfile}
		{onLogin}
		{onTerms}
		{onPrivacy}
		{onLegal}
		{onLogout}
		{userMenuExtras}
		{userMenuShortcuts}
		{userMenuDangerActions}
	/>
</Inline>
