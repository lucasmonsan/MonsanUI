<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import AvatarMenu from './AvatarMenu.svelte';
	import MenuItem from './MenuItem.svelte';
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
		size?: 'sm' | 'md' | 'lg' | 'control';
		shape?: 'circle' | 'square';
		align?: 'left' | 'right';
		width?: ActionPanelWidthPreset;
		layout?: 'vertical' | 'horizontal';
		placement?: 'below' | 'before' | 'after';
		variant?: 'floating' | 'dropdown';
		profileDisabled?: boolean;
		logoutDisabled?: boolean;
		onProfile?: (event: MouseEvent) => void;
		onLogin?: (event: MouseEvent) => void;
		onTerms?: (event: MouseEvent) => void;
		onPrivacy?: (event: MouseEvent) => void;
		onLogout?: (event: MouseEvent) => void;
		children?: Snippet;
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
		size = 'control',
		shape = 'square',
		align = 'right',
		width = 'dropdown',
		layout = 'vertical',
		placement = 'below',
		variant = 'dropdown',
		profileDisabled = false,
		logoutDisabled = false,
		onProfile,
		onLogin,
		onTerms,
		onPrivacy,
		onLogout,
		children
	}: Props = $props();

	const resolvedSrc = $derived(src ?? user?.image ?? undefined);
	const resolvedName = $derived(name ?? user?.name ?? user?.email ?? '');
	const resolvedAlt = $derived(alt ?? resolvedName);
	const isAuthenticated = $derived(Boolean(user || resolvedSrc || resolvedName));
	const primaryLabel = $derived(isAuthenticated ? profileLabel : (loginLabel ?? profileLabel));
	const primaryHref = $derived(isAuthenticated ? undefined : loginHref);
	const primaryAction = $derived(isAuthenticated ? onProfile : (onLogin ?? onProfile));
</script>

<AvatarMenu
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
	{ariaLabel}
>
	<MenuItem href={primaryHref} disabled={profileDisabled} onclick={primaryAction} align="right">
		<UserIcon size={16} />
		{primaryLabel}
	</MenuItem>
	{@render children?.()}
	<MenuItem href={termsHref} onclick={onTerms} align="right">
		<FileTextIcon size={16} />
		{termsLabel}
	</MenuItem>
	<MenuItem href={privacyHref} onclick={onPrivacy} align="right">
		<LockIcon size={16} />
		{privacyLabel}
	</MenuItem>
	{#if isAuthenticated}
		<MenuItem variant="error" disabled={logoutDisabled} onclick={onLogout} align="right">
			<LogOutIcon size={16} />
			{logoutLabel}
		</MenuItem>
	{/if}
</AvatarMenu>
