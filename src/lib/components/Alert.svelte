<script lang="ts">
	import type { Snippet } from 'svelte';
	import Check from './icons/Check.svelte';
	import CircleAlert from './icons/CircleAlert.svelte';
	import TriangleAlert from './icons/TriangleAlert.svelte';
	import X from './icons/X.svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		type?: 'success' | 'error' | 'warning' | 'info';
		title?: string;
		dismissible?: boolean;
		ondismiss?: () => void;
		closeLabel?: string;
		focusOnMount?: boolean;
		showIcon?: boolean;
		role?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		type = 'info',
		title,
		dismissible = false,
		ondismiss,
		closeLabel,
		focusOnMount = false,
		showIcon = true,
		role,
		children,
		...restProps
	}: Props = $props();

	let alertElement = $state<HTMLDivElement>();
	let activeCloseLabel = $derived(closeLabel ?? i18n.t('alert.close'));

	let defaultRole = $derived(type === 'error' || type === 'warning' ? 'alert' : 'status');

	$effect(() => {
		if (focusOnMount) {
			alertElement?.focus();
		}
	});
</script>

<div
	bind:this={alertElement}
	class="monsan-alert {type} "
	role={role ?? defaultRole}
	tabindex="-1"
	{...restProps}
>
	{#if showIcon}
		<div class="alert-icon">
			{#if type === 'success'}
				<Check size={20} />
			{:else if type === 'error'}
				<CircleAlert size={20} />
			{:else if type === 'warning'}
				<TriangleAlert size={20} />
			{:else}
				<!-- Info SVG icon -->
				<svg
					aria-hidden="true"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="16" x2="12" y2="12"></line>
					<line x1="12" y1="8" x2="12.01" y2="8"></line>
				</svg>
			{/if}
		</div>
	{/if}

	<div class="alert-body">
		{#if title}
			<h4 class="alert-title">{title}</h4>
		{/if}
		{#if children}
			<div class="alert-description">
				{@render children()}
			</div>
		{/if}
	</div>

	{#if dismissible}
		<button type="button" class="alert-close-btn" onclick={ondismiss} aria-label={activeCloseLabel}>
			<X size={16} />
		</button>
	{/if}
</div>

<style>
	.monsan-alert {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-md);
		background-color: var(--alert-bg);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		color: var(--text-primary);
		position: relative;
		box-sizing: border-box;
		font-family: var(--font-body);
		width: 100%;
		border-left-width: 6px;
		border-left-color: var(--alert-color);
	}

	.monsan-alert.success {
		--alert-color: var(--success);
		--alert-bg: color-mix(in srgb, var(--success) 10%, var(--bg-primary));
	}

	.monsan-alert.error {
		--alert-color: var(--error);
		--alert-bg: color-mix(in srgb, var(--error) 10%, var(--bg-primary));
	}

	.monsan-alert.warning {
		--alert-color: #eab308;
		--alert-bg: color-mix(in srgb, #eab308 12%, var(--bg-primary));
	}

	.monsan-alert.info {
		--alert-color: var(--info);
		--alert-bg: color-mix(in srgb, var(--info) 10%, var(--bg-primary));
	}

	.alert-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--alert-color);
		flex-shrink: 0;
		height: 1.2em;
	}

	.alert-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.alert-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 800;
		text-transform: uppercase;
		margin: 0;
		letter-spacing: 0;
	}

	.alert-description {
		font-size: var(--text-sm);
		color: var(--text-primary);
		line-height: 1.4;
	}

	.alert-close-btn {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		transition: color 0.15s ease;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		margin-top: -4px;
		margin-right: -4px;
	}

	.alert-close-btn:hover {
		color: var(--text-primary);
		background-color: rgba(0, 0, 0, 0.05);
	}

	/* Dark mode overrides */
	:global([data-theme='dark']) .alert-close-btn:hover {
		background-color: rgba(255, 255, 255, 0.08);
	}
</style>
