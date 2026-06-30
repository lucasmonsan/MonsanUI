<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		eyebrow?: string;
		actions?: Snippet;
		meta?: Snippet;
		leading?: Snippet;
		size?: 'sm' | 'md' | 'lg';
		align?: 'start' | 'center' | 'end';
		border?: boolean;
		sticky?: boolean;
		mobileInline?: boolean;
	}

	let {
		title,
		subtitle,
		eyebrow,
		actions,
		meta,
		leading,
		size = 'md',
		align = 'start',
		border = true,
		sticky = false,
		mobileInline = false
	}: Props = $props();

	let titleSize = $derived<'xl' | '2xl' | '3xl'>(
		size === 'lg' ? '3xl' : size === 'sm' ? 'xl' : '2xl'
	);

	onMount(() => {
		console.warn(
			'[MonsanUI] <PageHeader> route layout usage is frozen. For page/route headers, use <AppHeader> inside AppShell.header instead. <PageHeader> should only be used as a section/content header.'
		);
	});
</script>

<header
	class="monsan-page-header size-{size} align-{align}"
	class:with-border={border}
	class:is-sticky={sticky}
	class:mobile-inline={mobileInline}
>
	<div class="header-main">
		{#if leading}
			<div class="header-leading">
				{@render leading()}
			</div>
		{/if}

		<div class="header-copy">
			{#if eyebrow}
				<Text
					tag="span"
					family="display"
					size="sm"
					weight="bold"
					variant="accent"
					transform="uppercase"
				>
					{eyebrow}
				</Text>
			{/if}

			<Text tag="h1" family="display" size={titleSize} weight="bold">
				{title}
			</Text>

			{#if subtitle}
				<Text tag="p" size={size === 'sm' ? 'sm' : 'md'} variant="secondary">
					{subtitle}
				</Text>
			{/if}
		</div>

		{#if actions}
			<div class="header-actions">
				{@render actions()}
			</div>
		{/if}
	</div>

	{#if meta}
		<div class="header-meta">
			{@render meta()}
		</div>
	{/if}
</header>

<style>
	.monsan-page-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.with-border {
		padding-bottom: var(--space-sm);
		border-bottom: var(--border-width) solid var(--text-primary);
	}

	.is-sticky {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg-primary);
		padding-top: var(--space-sm);
	}

	.header-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		min-width: 0;
	}

	.align-start .header-main {
		align-items: flex-start;
	}

	.align-center .header-copy {
		text-align: center;
		align-items: center;
	}

	.align-end .header-copy {
		text-align: right;
		align-items: flex-end;
	}

	.header-leading,
	.header-actions,
	.header-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
	}

	.header-leading,
	.header-actions {
		flex-shrink: 0;
	}

	.header-copy {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.header-actions {
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	.header-meta {
		flex-wrap: wrap;
	}

	.size-sm {
		gap: var(--space-xs);
	}

	.size-lg {
		gap: var(--space-md);
	}

	@media (max-width: 640px) {
		.header-main {
			align-items: stretch;
			flex-direction: column;
		}

		.mobile-inline .header-main {
			align-items: center;
			flex-direction: row;
		}

		.header-actions {
			justify-content: flex-start;
		}
	}
</style>
