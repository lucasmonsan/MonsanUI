<script lang="ts">
	import type { Snippet } from 'svelte';
	import Inline from './Inline.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import SuiteUserMenu from './SuiteUserMenu.svelte';
	import ThemeSelector from './ThemeSelector.svelte';

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
		termsLabel: string;
		termsHref: string;
		privacyLabel: string;
		privacyHref: string;
		logoutLabel: string;
		localeValue: string;
		localeAriaLabel?: string;
		themeValue?: string;
		themeStorageKey?: string;
		themeAriaLabel?: string;
		profileDisabled?: boolean;
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
		onLogout?: (event: MouseEvent) => void;
		children?: Snippet;
		/** Official extension point forwarded to SuiteUserMenu for custom links, such as About. */
		userMenuExtras?: Snippet;
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
		termsLabel,
		termsHref,
		privacyLabel,
		privacyHref,
		logoutLabel,
		localeValue,
		localeAriaLabel,
		themeValue,
		themeStorageKey,
		themeAriaLabel,
		profileDisabled = false,
		logoutDisabled = false,
		userMenuPanelShadow = 'default',
		userMenuPanelPadding = 'xs',
		userMenuPanelGap = 'sm',
		onThemeChange,
		onLocaleChange,
		onProfile,
		onLogin,
		onTerms,
		onPrivacy,
		onLogout,
		children,
		userMenuExtras
	}: Props = $props();
</script>

<Inline gap="sm" align="center">
	{@render children?.()}
	<ThemeSelector
		value={themeValue}
		storageKey={themeStorageKey}
		ariaLabel={themeAriaLabel}
		onChange={onThemeChange}
	/>
	<LanguageSelector value={localeValue} ariaLabel={localeAriaLabel} onChange={onLocaleChange} />
	{#if userMenuExtras}
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
			{logoutLabel}
			{profileDisabled}
			{logoutDisabled}
			panelShadow={userMenuPanelShadow}
			panelPadding={userMenuPanelPadding}
			panelGap={userMenuPanelGap}
			{onProfile}
			{onLogin}
			{onTerms}
			{onPrivacy}
			{onLogout}
		>
			{@render userMenuExtras()}
		</SuiteUserMenu>
	{:else}
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
			{logoutLabel}
			{profileDisabled}
			{logoutDisabled}
			panelShadow={userMenuPanelShadow}
			panelPadding={userMenuPanelPadding}
			panelGap={userMenuPanelGap}
			{onProfile}
			{onLogin}
			{onTerms}
			{onPrivacy}
			{onLogout}
		/>
	{/if}
</Inline>
