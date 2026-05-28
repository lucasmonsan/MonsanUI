<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Semantic HTML tag to render. Defaults to 'div' */
		tag?: 'div' | 'section' | 'article' | 'aside' | 'main';
		/** Enables hover and click neubrutalist micro-interactions */
		interactive?: boolean;
		/** Customizable inner padding. Defaults to 'var(--space-lg)' */
		padding?: string;
		/** Max width of the panel. Defaults to '512px' */
		maxWidth?: string;
		/** Neubrutalist color theme variant. Defaults to 'primary' */
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		/** Optional overflow handling for content that can exceed the panel width. */
		overflow?: 'visible' | 'x' | 'hidden';
		/** Optional extra CSS classes */
		class?: string;
		/** Optional extra inline styles */
		style?: string;
		/** Click event handler */
		onclick?: (event: MouseEvent) => void;
		/** Keydown event handler */
		onkeydown?: (event: KeyboardEvent) => void;
	}

	let {
		children,
		tag = 'div',
		interactive = false,
		padding = 'var(--space-lg)',
		maxWidth = '512px',
		variant = 'primary',
		overflow = 'visible',
		class: customClass = '',
		style = '',
		onclick,
		onkeydown
	}: Props = $props();

	function handleKeyDown(event: KeyboardEvent) {
		if (onkeydown) {
			onkeydown(event);
		} else if (onclick && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			onclick(event as unknown as MouseEvent);
		}
	}
</script>

<svelte:element
	this={tag}
	class="monsan-panel {variant} overflow-{overflow} {interactive
		? 'is-interactive'
		: ''} {customClass}"
	style="padding: {padding}; max-width: {maxWidth}; width: 100%; {style}"
	{onclick}
	onkeydown={onclick || onkeydown ? handleKeyDown : undefined}
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
>
	{@render children()}
</svelte:element>

<style>
	.monsan-panel {
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-md);
		box-sizing: border-box;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			background-color 0.2s var(--ease-out);
	}

	.overflow-x {
		overflow-x: auto;
	}

	.overflow-hidden {
		overflow: hidden;
	}

	/* Color Variants */
	.primary {
		background-color: var(--bg-primary);
		color: var(--text-primary);
	}
	.secondary {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}
	.accent {
		background-color: var(--accent-primary);
		color: var(--bg-primary);
	}
	.success {
		background-color: var(--success);
		color: var(--bg-primary);
	}
	.error {
		background-color: var(--error);
		color: var(--bg-primary);
	}
	.neutral {
		background-color: var(--neutral);
		color: var(--bg-primary);
	}

	/* Adjustments for Dark Theme */
	:global([data-theme='dark']) .accent {
		background-color: color-mix(in srgb, var(--accent-primary) 75%, black);
		color: var(--text-primary);
	}
	:global([data-theme='dark']) .success {
		background-color: color-mix(in srgb, var(--success) 75%, black);
		color: var(--text-primary);
	}
	:global([data-theme='dark']) .error {
		background-color: color-mix(in srgb, var(--error) 75%, black);
		color: var(--text-primary);
	}
	:global([data-theme='dark']) .neutral {
		background-color: color-mix(in srgb, var(--neutral) 75%, black);
		color: var(--text-primary);
	}

	/* Interactive state animations */
	.is-interactive {
		cursor: pointer;
	}
	.is-interactive:hover {
		transform: translate(-3px, -3px);
		box-shadow: var(--shadow-md);
	}
	.is-interactive:active {
		transform: translate(1px, 1px);
		box-shadow: var(--shadow-xs);
	}
</style>
