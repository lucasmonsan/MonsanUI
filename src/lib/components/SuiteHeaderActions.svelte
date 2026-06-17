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
		onThemeChange?: (themeId: string) => void;
		onLocaleChange?: (localeId: string) => void;
		onProfile?: (event: MouseEvent) => void;
		onTerms?: (event: MouseEvent) => void;
		onPrivacy?: (event: MouseEvent) => void;
		onLogout?: (event: MouseEvent) => void;
		children?: Snippet;
		userMenuExtras?: Snippet;
	}

	let {
		user,
		src,
		name,
		alt,
		userMenuAriaLabel,
		profileLabel,
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
		onThemeChange,
		onLocaleChange,
		onProfile,
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
	<SuiteUserMenu
		{user}
		src={src ?? undefined}
		{name}
		{alt}
		ariaLabel={userMenuAriaLabel}
		{profileLabel}
		{termsLabel}
		{termsHref}
		{privacyLabel}
		{privacyHref}
		{logoutLabel}
		{profileDisabled}
		{logoutDisabled}
		{onProfile}
		{onTerms}
		{onPrivacy}
		{onLogout}
	>
		{@render userMenuExtras?.()}
	</SuiteUserMenu>
</Inline>
