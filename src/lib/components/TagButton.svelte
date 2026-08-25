<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		title?: string;
	}

	let { children, onclick, disabled = false, type = 'button', ariaLabel, title }: Props = $props();
</script>

<button {type} {disabled} {onclick} aria-label={ariaLabel} {title} class="monsan-tag-button">
	{@render children()}
</button>

<style>
	.monsan-tag-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		padding: 2px var(--space-xs);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		background-color: var(--bg-secondary);
		box-shadow: 1px 1px 0 var(--border-color);
		color: var(--text-primary);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		font-weight: 700;
		line-height: 1.1;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.1s var(--ease-out),
			border-color 0.1s var(--ease-out);
	}

	.monsan-tag-button:hover:not(:disabled) {
		border-color: var(--accent-primary);
		background-color: var(--bg-primary);
		transform: translate(-0.5px, -0.5px);
		box-shadow: 1.5px 1.5px 0 var(--accent-primary);
	}

	.monsan-tag-button:focus-visible {
		outline: var(--border-width) solid var(--accent-primary);
		outline-offset: 2px;
	}

	.monsan-tag-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-tag-button {
			transition: none;
		}
	}
</style>
