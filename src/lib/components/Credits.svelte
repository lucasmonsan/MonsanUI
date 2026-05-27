<script lang="ts">
	import { i18n } from '../utils/i18n.svelte';

	let {
		authorName = 'Monsan',
		svelteVersion = '5',
		customText = '',
		authorLink = '',
		class: className = '',
		madeWithText,
		createdWithText,
		copyright = ''
	} = $props<{
		authorName?: string;
		svelteVersion?: string;
		customText?: string;
		authorLink?: string;
		class?: string;
		madeWithText?: string;
		createdWithText?: string;
		copyright?: string;
	}>();

	let activeMadeWithText = $derived(madeWithText ?? i18n.t('credits.madeWithText'));
	let activeCreatedWithText = $derived(createdWithText ?? i18n.t('credits.createdWithText'));
</script>

<footer class="monsan-credits {className}">
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
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={authorLink} target="_blank" rel="noopener noreferrer" class="credits-author"
							>{authorName}</a
						>
					{:else}
						<span class="credits-author">{authorName}</span>
					{/if}!
				</span>
				<span
					>{activeCreatedWithText}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve --><a
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
		width: auto;
		margin: var(--space-md) auto var(--space-md) auto;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--space-sm) var(--space-lg);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--text-sm);
		color: var(--text-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		background-color: var(--bg-primary);
		box-shadow: var(--shadow-sm);
		box-sizing: border-box;
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
		flex-wrap: wrap;
		justify-content: center;
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
		font-weight: 800;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	a.credits-author:hover {
		border-bottom-color: var(--accent-primary);
	}

	.credits-tech {
		color: var(--text-primary);
		font-weight: 800;
	}

	.credits-tech-link {
		color: var(--text-primary);
		font-weight: 800;
		text-decoration: none;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}

	a.credits-tech-link:hover {
		border-bottom-color: var(--text-primary);
	}
</style>
