<script lang="ts">
	interface Props {
		termsHref?: string;
		privacyHref?: string;
		termsLabel?: string;
		privacyLabel?: string;
		legalHref?: string;
		legalLabel?: string;
		note?: string;
		variant?: 'inline' | 'auth-note';
		align?: 'start' | 'center' | 'end';
	}

	let {
		termsHref,
		privacyHref,
		termsLabel = '',
		privacyLabel = '',
		legalHref,
		legalLabel,
		note,
		variant = 'inline',
		align = 'center'
	}: Props = $props();

	let resolvedAriaLabel = $derived(
		note
			? undefined
			: legalHref
				? (legalLabel ?? 'Termos e Privacidade')
				: `${termsLabel} / ${privacyLabel}`
	);
</script>

<nav class="monsan-legal-links variant-{variant} align-{align}" aria-label={resolvedAriaLabel}>
	{#if variant === 'auth-note' && note}
		<p class="legal-note">
			{note}
		</p>
	{/if}
	<div class="legal-link-row">
		{#if legalHref}
			<a class="legal-link" href={legalHref}>{legalLabel ?? 'Termos e Privacidade'}</a>
		{:else}
			{#if termsHref}
				<a class="legal-link" href={termsHref}>{termsLabel}</a>
			{/if}
			{#if termsHref && privacyHref}
				<span class="legal-separator" aria-hidden="true">·</span>
			{/if}
			{#if privacyHref}
				<a class="legal-link" href={privacyHref}>{privacyLabel}</a>
			{/if}
		{/if}
	</div>
</nav>

<style>
	.monsan-legal-links {
		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		gap: var(--space-2xs, 0.25rem);
		color: var(--text-secondary);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		line-height: 1.4;
	}

	.align-start {
		align-items: flex-start;
		text-align: left;
	}

	.align-center {
		align-items: center;
		text-align: center;
	}

	.align-end {
		align-items: flex-end;
		text-align: right;
	}

	.legal-note {
		max-width: 38rem;
		margin: 0;
		color: var(--text-secondary);
		font-size: var(--text-xs);
	}

	.legal-link-row {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-width: 0;
		max-width: 100%;
		flex-wrap: wrap;
	}

	.legal-link {
		color: var(--text-secondary);
		font-weight: 700;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
		transition:
			color 0.15s var(--ease-out),
			text-decoration-color 0.15s var(--ease-out);
	}

	.legal-link:hover {
		color: var(--text-primary);
	}

	.legal-link:focus-visible {
		outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-accent));
		outline-offset: 3px;
		border-radius: var(--radius-xs);
	}

	.legal-separator {
		color: color-mix(in srgb, var(--text-secondary) 60%, transparent);
		font-weight: 700;
	}

	.variant-auth-note {
		gap: var(--space-xs);
	}

	.variant-auth-note .legal-link-row {
		font-size: calc(var(--text-xs) * 0.86);
	}

	.variant-auth-note .legal-note {
		font-size: calc(var(--text-xs) * 0.82);
		line-height: 1.3;
	}

	@media (prefers-reduced-motion: reduce) {
		.legal-link {
			transition: none;
		}
	}
</style>
