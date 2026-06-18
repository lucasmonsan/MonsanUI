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
		variant = 'default'
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
	}>();

	let activeMadeWithText = $derived(madeWithText ?? i18n.t('credits.madeWithText'));
	let activeCreatedWithText = $derived(createdWithText ?? i18n.t('credits.createdWithText'));
</script>

<footer class="monsan-credits placement-{placement} variant-{variant}">
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
					{#if authorLink}
						<a href={authorLink} target="_blank" rel="noopener noreferrer" class="credits-author"
							>{authorName}</a
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
		margin: var(--space-md) auto var(--space-md) auto;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-sm) var(--space-lg);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		box-sizing: border-box;
		line-height: 1.3;
	}

	.placement-page-bottom {
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
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.credits-author {
		color: var(--accent-primary);
		text-decoration: none;
		font-weight: 700;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	a.credits-author:hover {
		border-bottom-color: var(--accent-primary);
	}

	.credits-tech {
		color: var(--text-primary);
		font-weight: 700;
	}

	.credits-tech-link {
		color: var(--text-primary);
		font-weight: 700;
		text-decoration: none;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	a.credits-tech-link:hover {
		border-bottom-color: var(--text-primary);
	}

	.variant-compact {
		max-width: calc(100% - var(--space-md));
		margin-top: var(--space-sm);
		margin-bottom: var(--space-sm);
		padding: calc(var(--space-xs) * 0.75) var(--space-md);
		font-size: calc(var(--base) * 0.72);
		font-weight: 600;
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
		opacity: 0.68;
		white-space: nowrap;
	}

	@media (max-width: 420px) {
		.variant-compact {
			padding-inline: var(--space-sm);
			font-size: calc(var(--text-xs) * 0.88);
		}

		.variant-compact .credits-inner {
			gap: var(--space-2xs);
		}
	}
</style>
