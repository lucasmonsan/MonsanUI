<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';
	import Button from './Button.svelte';
	import MenuItem from './MenuItem.svelte';
	import QuickActions from './QuickActions.svelte';
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
		{#if onProfile}
			<button
				type="button"
				class="account-main"
				{disabled}
				aria-label={ariaLabel ?? accountName}
				onclick={onProfile}
			>
				{@render accountContent()}
			</button>
		{:else}
			<div class="account-main" aria-label={ariaLabel ?? accountName}>
				{@render accountContent()}
			</div>
		{/if}

		<QuickActions
			bind:open={menuOpen}
			variant="dropdown"
			align="right"
			width="dropdown"
			triggerBehavior="child"
			panelShadow="none"
			panelPadding="sm"
			panelGap="sm"
			triggerLabel={accountMenuLabel}
		>
			{#snippet trigger(toggle)}
				<Button
					variant="secondary"
					size="sm"
					square
					{disabled}
					ariaLabel={accountMenuLabel}
					ariaExpanded={menuOpen}
					onclick={toggle}
				>
					<DotsThreeVerticalIcon size={18} />
				</Button>
			{/snippet}

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
		display: flex;
		align-items: stretch;
		gap: var(--space-sm);
		min-width: 0;
	}

	.monsan-sso-account.block {
		width: 100%;
	}

	.account-main {
		flex: 1 1 auto;
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
	}

	button.account-main {
		cursor: pointer;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out);
	}

	button.account-main:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0 var(--text-primary);
	}

	button.account-main:active:not(:disabled) {
		transform: translate(2px, 2px);
		box-shadow: none;
	}

	.account-copy {
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

	@media (prefers-reduced-motion: reduce) {
		button.account-main {
			transition: none;
		}
	}
</style>
