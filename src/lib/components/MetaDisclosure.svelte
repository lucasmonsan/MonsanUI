<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronDown from './icons/ChevronDown.svelte';

	interface Props {
		children: Snippet;
		title: string;
		summary?: string;
		expanded?: boolean;
		disabled?: boolean;
		contentId?: string;
	}

	let {
		children,
		title,
		summary,
		expanded = $bindable(false),
		disabled = false,
		contentId
	}: Props = $props();

	const fallbackContentId = $derived(
		`monsan-meta-disclosure-${title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')}`
	);
	const resolvedContentId = $derived(contentId ?? fallbackContentId);
</script>

<section class="monsan-meta-disclosure" class:is-open={expanded}>
	<button
		type="button"
		class="meta-disclosure-trigger"
		aria-expanded={expanded}
		aria-controls={resolvedContentId}
		{disabled}
		onclick={() => {
			if (disabled) return;
			expanded = !expanded;
		}}
	>
		<span class="meta-disclosure-title">{title}</span>
		<span class="meta-disclosure-end">
			{#if summary}
				<span class="meta-disclosure-summary">{summary}</span>
			{/if}
			<span class="meta-disclosure-chevron">
				<ChevronDown size={16} />
			</span>
		</span>
	</button>

	<div
		id={resolvedContentId}
		class="meta-disclosure-content"
		aria-hidden={!expanded}
		inert={!expanded}
	>
		<div class="meta-disclosure-inner">
			{@render children()}
		</div>
	</div>
</section>

<style>
	.monsan-meta-disclosure {
		width: 100%;
		min-width: 0;
		border-top: var(--border-width) solid var(--border-color);
		border-top-color: color-mix(in srgb, var(--border-color) 30%, transparent);
	}

	.meta-disclosure-trigger {
		width: 100%;
		min-height: var(--control-height);
		padding: var(--space-sm) 0;
		border: 0;
		background: transparent;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		font-family: inherit;
		cursor: pointer;
		text-align: left;
	}

	.meta-disclosure-trigger:disabled {
		cursor: default;
		opacity: 0.65;
	}

	.meta-disclosure-title {
		min-width: 0;
		font-size: var(--text-sm);
		font-weight: 800;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.meta-disclosure-end {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-xs);
		min-width: 0;
		color: var(--text-secondary);
	}

	.meta-disclosure-summary {
		font-size: var(--text-sm);
		font-weight: 700;
		white-space: nowrap;
	}

	.meta-disclosure-chevron {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.18s var(--ease-out);
	}

	.is-open .meta-disclosure-chevron {
		transform: rotate(180deg);
	}

	.meta-disclosure-content {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.2s var(--ease-out);
	}

	.is-open .meta-disclosure-content {
		grid-template-rows: 1fr;
	}

	.meta-disclosure-inner {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		min-width: 0;
	}

	.is-open .meta-disclosure-inner {
		padding-bottom: var(--space-sm);
	}

	@media (prefers-reduced-motion: reduce) {
		.meta-disclosure-chevron,
		.meta-disclosure-content {
			transition: none;
		}
	}
</style>
