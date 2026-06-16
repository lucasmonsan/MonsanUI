<script lang="ts">
	import type { ActionPanelWidthPreset } from '$lib/utils/layout.js';
	import AvatarMenu from './AvatarMenu.svelte';
	import IconButton from './IconButton.svelte';
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
		onLogout?: (event: MouseEvent) => void;
	}

	let {
		user,
		src,
		name,
		alt,
		ariaLabel,
		profileLabel,
		logoutLabel,
		size = 'control',
		shape = 'square',
		align = 'right',
		width = 'max-content',
		layout = 'vertical',
		placement = 'below',
		variant = 'floating',
		profileDisabled = false,
		logoutDisabled = false,
		onProfile,
		onLogout
	}: Props = $props();

	const resolvedSrc = $derived(src ?? user?.image ?? undefined);
	const resolvedName = $derived(name ?? user?.name ?? user?.email ?? '');
	const resolvedAlt = $derived(alt ?? resolvedName);
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
	<IconButton label={profileLabel} disabled={profileDisabled} onclick={onProfile}>
		<UserIcon size={16} />
	</IconButton>
	<IconButton label={logoutLabel} variant="error" disabled={logoutDisabled} onclick={onLogout}>
		<LogOutIcon size={16} />
	</IconButton>
</AvatarMenu>
