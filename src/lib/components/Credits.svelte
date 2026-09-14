<script lang="ts">
	import { i18n } from '../utils/i18n.svelte';

	let {
		authorName = 'Monsan',
		svelteVersion = '5',
		customText = '',
		authorLink = '',
		madeWithText,
		createdWithText,
		copyright = '',
		placement = 'inline',
		variant = 'default',
		spacing = 'none'
	} = $props<{
		authorName?: string;
		svelteVersion?: string;
		customText?: string;
		authorLink?: string;
		madeWithText?: string;
		createdWithText?: string;
		copyright?: string;
		placement?: 'inline' | 'page-bottom';
		variant?: 'default' | 'compact';
		spacing?: 'none' | 'default';
	}>();

	let activeMadeWithText = $derived(madeWithText ?? i18n.t('credits.madeWithText'));
	let activeCreatedWithText = $derived(createdWithText ?? i18n.t('credits.createdWithText'));
	let resolvedAuthorLink = $derived(
		authorLink || (authorName === 'Monsan' ? 'https://github.com/lucasmonsan' : '')
	);
</script>

<footer class="monsan-credits placement-{placement} variant-{variant} spacing-{spacing}">
	<div class="credits-inner">
		{#if copyright}
			<div class="credits-copyright">{copyright}</div>
		{/if}
		<div class="credits-main">
			{#if customText}
				{customText}
			{:else}
				<span>
					{activeMadeWithText}
					{#if resolvedAuthorLink}
						<a
							href={resolvedAuthorLink}
							target="_blank"
							rel="noopener noreferrer"
							class="credits-author">{authorName}</a
						>
					{:else}
						<span class="credits-author">{authorName}</span>
					{/if}!
				</span>
				<span
					>{activeCreatedWithText}
					<a
						href="https://svelte.dev"
						target="_blank"
						rel="noopener noreferrer"
						class="credits-tech-link">Svelte {svelteVersion}</a
					></span
				>
			{/if}
		</div>
	</div>
</footer>

<style>
	.monsan-credits {
		width: fit-content;
		max-width: calc(100% - var(--space-lg));
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-sm) var(--space-lg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		box-sizing: border-box;
		line-height: 1.3;
	}

	.spacing-default {
		margin: var(--space-md) auto;
	}

	.spacing-default.placement-page-bottom {
		margin-top: auto;
		margin-bottom: var(--space-md);
	}

	.credits-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		justify-content: center;
		text-align: center;
		width: 100%;
	}

	.credits-main {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-wrap: nowrap;
		justify-content: center;
		white-space: nowrap;
	}

	.credits-copyright {
		font-size: calc(var(--base) * 0.7);
		font-weight: 400;
		color: var(--text-primary);
	}

	.credits-author {
		color: var(--accent-primary);
		font-weight: 700;
		text-decoration: none;
	}

	.credits-tech {
		color: var(--text-primary);
		font-weight: 700;
	}

	.credits-tech-link {
		color: var(--accent-primary);
		font-weight: 700;
		text-decoration: none;
	}

	a.credits-author,
	a.credits-tech-link {
		color: var(--text-primary);
		text-decoration: underline;
		text-underline-offset: 0.15em;
	}

	a.credits-author:focus-visible,
	a.credits-tech-link:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
		border-radius: var(--radius-xs);
	}

	.variant-compact {
		max-width: calc(100% - var(--space-md));
		padding: calc(var(--space-xs) * 0.75) var(--space-md);
		font-size: calc(var(--base) * 0.72);
		font-weight: 600;
	}

	.spacing-default.variant-compact {
		margin-top: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.variant-compact .credits-inner,
	.variant-compact .credits-main {
		flex-direction: row;
		gap: var(--space-xs);
		flex-wrap: nowrap;
		white-space: nowrap;
		row-gap: var(--space-2xs);
	}

	.variant-compact .credits-copyright {
		font-size: inherit;
		white-space: nowrap;
	}

	@media (max-width: 420px) {
		.monsan-credits:not(.variant-compact) {
			max-width: calc(100% - var(--space-md));
			padding-inline: var(--space-sm);
		}

		.monsan-credits:not(.variant-compact) .credits-main {
			flex-wrap: wrap;
			white-space: normal;
		}

		.monsan-credits:not(.variant-compact) .credits-copyright {
			max-width: 100%;
		}

		.variant-compact {
			padding-inline: var(--space-sm);
			font-size: calc(var(--text-xs) * 0.88);
		}

		.variant-compact .credits-inner {
			gap: var(--space-2xs);
		}
	}
</style>
