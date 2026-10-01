<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import Button from './Button.svelte';
	import MenuItem from './MenuItem.svelte';
	import QuickActions from './QuickActions.svelte';
	import IconButton from './IconButton.svelte';
	import Inline from './Inline.svelte';
	import DotsThreeVerticalIcon from './icons/DotsThreeVertical.svelte';
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
		label: string;
		loadingLabel?: string;
		logoSrc?: string;
		user?: User | null;
		userMenuLabel?: string;
		profileLabel?: string;
		profileHref?: string;
		termsLabel?: string;
		termsHref?: string;
		privacyLabel?: string;
		privacyHref?: string;
		logoutLabel?: string;
		loading?: boolean;
		disabled?: boolean;
		block?: boolean;
		ariaLabel?: string;
		variant?: 'dropdown' | 'reveal';
		onclick?: (event: MouseEvent) => void;
		onProfile?: (event: MouseEvent) => void;
		onTerms?: (event: MouseEvent) => void;
		onPrivacy?: (event: MouseEvent) => void;
		onLogout?: (event: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		label,
		loadingLabel,
		logoSrc,
		user,
		userMenuLabel,
		profileLabel,
		profileHref,
		termsLabel,
		termsHref,
		privacyLabel,
		privacyHref,
		logoutLabel,
		loading = false,
		disabled = false,
		block = false,
		ariaLabel,
		variant = 'dropdown',
		onclick,
		onProfile,
		onTerms,
		onPrivacy,
		onLogout,
		children
	}: Props = $props();

	let resolvedLabel = $derived(loading && loadingLabel ? loadingLabel : label);
	let menuOpen = $state(false);
	let accountName = $derived(user?.name || user?.email || label);
	let accountEmail = $derived(user?.email || '');
	let accountMenuLabel = $derived(userMenuLabel ?? accountName);
</script>

{#snippet accountContent()}
	<Avatar src={user?.image ?? undefined} name={accountName} size="control" />
	<span class="account-copy">
		<span class="account-name">{accountName}</span>
		{#if accountEmail}
			<span class="account-email">{accountEmail}</span>
		{/if}
	</span>
{/snippet}

{#if user}
	<div class="monsan-sso-account" class:block>
		<QuickActions
			bind:open={menuOpen}
			{variant}
			align="right"
			width={variant === 'reveal' ? 'max-content' : 'dropdown'}
			triggerBehavior="child"
			panelShadow={variant === 'reveal' ? 'none' : 'default'}
			panelPadding="sm"
			panelGap="sm"
			placement="below"
			panelLayout={variant === 'reveal' ? 'horizontal' : 'vertical'}
			surface={variant === 'reveal' ? 'plain' : 'panel'}
			containedReveal={variant === 'reveal'}
			triggerLabel={accountMenuLabel}
		>
			{#snippet trigger(toggle)}
				<button
					type="button"
					class="account-main"
					{disabled}
					aria-label={ariaLabel ?? accountMenuLabel}
					aria-haspopup="menu"
					aria-expanded={menuOpen}
					onclick={toggle}
				>
					{@render accountContent()}
					<DotsThreeVerticalIcon size={18} />
				</button>
			{/snippet}

			{#if variant === 'reveal'}
				<Inline gap="xs" align="center">
					{#if profileLabel}
						<IconButton size="sm" label={profileLabel} onclick={onProfile}>
							<UserIcon size={16} />
						</IconButton>
					{/if}
					{@render children?.()}
					{#if logoutLabel}
						<IconButton size="sm" label={logoutLabel} variant="error" onclick={onLogout}>
							<LogOutIcon size={16} />
						</IconButton>
					{/if}
				</Inline>
			{:else}
				{#if profileLabel}
					<MenuItem href={profileHref} onclick={onProfile} align="right">
						<UserIcon size={16} />
						{profileLabel}
					</MenuItem>
				{/if}
				{@render children?.()}
				{#if termsLabel}
					<MenuItem href={termsHref} onclick={onTerms} align="right">
						<FileTextIcon size={16} />
						{termsLabel}
					</MenuItem>
				{/if}
				{#if privacyLabel}
					<MenuItem href={privacyHref} onclick={onPrivacy} align="right">
						<LockIcon size={16} />
						{privacyLabel}
					</MenuItem>
				{/if}
				{#if logoutLabel}
					<MenuItem variant="error" onclick={onLogout} align="right">
						<LogOutIcon size={16} />
						{logoutLabel}
					</MenuItem>
				{/if}
			{/if}
		</QuickActions>
	</div>
{:else}
	<Button
		variant="primary"
		{block}
		disabled={disabled || loading}
		ariaBusy={loading}
		ariaLabel={ariaLabel ?? resolvedLabel}
		{onclick}
	>
		{#if logoSrc}
			<img src={logoSrc} alt="" width="18" height="18" loading="lazy" />
		{/if}
		{resolvedLabel}
	</Button>
{/if}

<style>
	.monsan-sso-account {
		display: inline-block;
		min-width: 0;
	}

	.monsan-sso-account.block {
		width: 100%;
	}

	.monsan-sso-account.block :global(.monsan-quick-actions-wrapper),
	.monsan-sso-account.block :global(.quick-actions-trigger) {
		display: block;
		width: 100%;
	}

	.account-main {
		width: 100%;
		min-width: 0;
		min-height: var(--control-height);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
		color: var(--text-primary);
		box-sizing: border-box;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			filter 0.1s var(--ease-out);
	}

	button.account-main:hover:not(:disabled) {
		filter: brightness(1.06);
	}

	button.account-main:active:not(:disabled) {
		transform: scale(0.98);
	}

	.account-copy {
		flex: 1 1 auto;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		line-height: 1.1;
	}

	.account-name,
	.account-email {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.account-name {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
		color: var(--text-primary);
	}

	.account-email {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: none;
	}

	.account-main :global(svg) {
		flex: 0 0 auto;
		color: var(--text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		button.account-main {
			transition: none;
		}
	}
</style>
