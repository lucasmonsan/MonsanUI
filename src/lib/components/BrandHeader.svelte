<script lang="ts">
	import Text from './Text.svelte';

	interface Props {
		brand: string;
		subtitle?: string;
		logoSrc?: string;
		logoAlt?: string;
		layout?: 'stacked' | 'inline';
		compact?: boolean;
		titleWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
		adaptiveLogo?: boolean;
		logoButtonLabel?: string;
		onLogoClick?: () => void;
	}

	let {
		brand,
		subtitle,
		logoSrc,
		logoAlt = '',
		layout = 'stacked',
		compact = false,
		titleWeight = 'semibold',
		adaptiveLogo = true,
		logoButtonLabel,
		onLogoClick
	}: Props = $props();
</script>

<header class="monsan-brand-header {layout}" class:compact>
	{#if logoSrc}
		{#if onLogoClick && logoButtonLabel}
			<button type="button" class="logo-button" aria-label={logoButtonLabel} onclick={onLogoClick}>
				<span
					class="brand-logo"
					class:adaptive={adaptiveLogo}
					style:--brand-logo-mask={`url("${logoSrc}") no-repeat center / contain`}
					aria-hidden="true"
				></span>
			</button>
		{:else}
			<span
				class="brand-logo"
				class:adaptive={adaptiveLogo}
				style:--brand-logo-mask={`url("${logoSrc}") no-repeat center / contain`}
				aria-label={logoAlt}
			></span>
		{/if}
	{/if}
	<div class="brand-copy">
		<Text
			tag="h1"
			size={compact ? '2xl' : '3xl'}
			weight={titleWeight}
			family="display"
			variant="accent"
		>
			{brand}
		</Text>
		{#if subtitle}
			<Text tag="p" size={compact ? 'sm' : 'md'} weight="semibold" variant="secondary">
				{subtitle}
			</Text>
		{/if}
	</div>
</header>

<style>
	.monsan-brand-header {
		display: flex;
		align-items: center;
	}

	.stacked {
		flex-direction: column;
		text-align: center;
	}

	.stacked .brand-copy {
		align-items: center;
		text-align: center;
	}

	.stacked .brand-logo {
		margin-bottom: 0;
	}

	.inline {
		flex-direction: row;
		text-align: start;
	}

	.inline .brand-copy {
		align-items: flex-start;
	}

	.brand-copy {
		display: flex;
		flex-direction: column;
		align-items: inherit;
		text-align: inherit;
	}

	.brand-logo {
		width: calc(var(--base) * 5);
		height: calc(var(--base) * 5);
		display: inline-block;
		background-color: var(--text-primary);
		mask: var(--brand-logo-mask);
		-webkit-mask: var(--brand-logo-mask);
		opacity: 1;
		transition: opacity 0.3s var(--ease-out);
	}

	.brand-logo.adaptive {
		opacity: 1;
	}

	.logo-button {
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
		display: flex;
		border-radius: var(--radius-md);
	}

	.logo-button:focus-visible {
		outline: var(--border-width) solid var(--accent-primary);
		outline-offset: var(--space-xs);
	}

	.inline .brand-logo,
	.compact .brand-logo {
		width: calc(var(--base) * 2.25);
		height: calc(var(--base) * 2.25);
	}

	@media (prefers-reduced-motion: reduce) {
		.brand-logo {
			transition: none;
		}
	}
</style>
