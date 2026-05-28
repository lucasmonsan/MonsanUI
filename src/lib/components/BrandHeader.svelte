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
				<img class="brand-logo" class:is-logo-adaptive={adaptiveLogo} src={logoSrc} alt="" />
			</button>
		{:else}
			<img class="brand-logo" class:is-logo-adaptive={adaptiveLogo} src={logoSrc} alt={logoAlt} />
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
		gap: var(--space-xs);
	}

	.stacked {
		flex-direction: column;
		text-align: center;
	}

	.inline {
		flex-direction: row;
		text-align: start;
	}

	.brand-copy {
		display: flex;
		flex-direction: column;
		align-items: inherit;
		gap: var(--space-xs);
	}

	.brand-logo {
		width: calc(var(--base) * 5);
		height: calc(var(--base) * 5);
		object-fit: contain;
	}

	.is-logo-adaptive {
		transition: filter 0.2s var(--ease-out);
	}

	:global([data-theme='dark']) .is-logo-adaptive {
		filter: invert(1);
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
		width: calc(var(--base) * 3.5);
		height: calc(var(--base) * 3.5);
	}
</style>
