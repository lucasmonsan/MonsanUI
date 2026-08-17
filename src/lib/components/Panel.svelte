<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MaxWidthPreset, PaddingPreset } from '$lib/utils/layout.js';
	import { resolveMaxWidth, resolvePadding } from '$lib/utils/layout.js';

	interface Props {
		children: Snippet;
		/** Optional visual context centered over the panel's top border. */
		plaque?: Snippet;
		/** Semantic HTML tag to render. Defaults to 'div' */
		tag?: 'div' | 'section' | 'article' | 'aside' | 'main';
		/** Enables hover and click neubrutalist micro-interactions */
		interactive?: boolean;
		/** Customizable inner padding. Defaults to 'var(--space-lg)' */
		padding?: PaddingPreset;
		/** Max width of the panel. Defaults to '512px' */
		maxWidth?: MaxWidthPreset;
		/** Expand to fill parent height */
		fullHeight?: boolean;
		/** Neubrutalist color theme variant. Defaults to 'primary' */
		variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'neutral';
		/** Optional overflow handling for content that can exceed the panel width. */
		overflow?: 'visible' | 'x' | 'hidden';
		/** Click event handler */
		onclick?: (event: MouseEvent) => void;
		/** Accessible name for an interactive panel. */
		ariaLabel?: string;
		/** Keydown event handler */
		onkeydown?: (event: KeyboardEvent) => void;
		/** Disable hover/active physical translation animations while keeping clickability. Defaults to false */
		flatInteractive?: boolean;
		/** Render shadow. Defaults to true */
		shadow?: boolean;
		/** Optional non-text accent used for domain-specific card identity. */
		accentColor?: string;
		/** Optional custom surface color with an automatically contrasting foreground. */
		surfaceColor?: string;
		/** A semantic, non-domain selection state for interactive panels. */
		selected?: boolean;
		/** Reduces emphasis while a sibling item is selected. */
		muted?: boolean;
		/** Disable native text selection when the whole panel is a gesture target. */
		textSelectable?: boolean;
	}

	let {
		children,
		plaque,
		tag = 'div',
		interactive = false,
		padding = 'var(--space-lg)',
		maxWidth = '512px',
		fullHeight = false,
		variant = 'primary',
		overflow = 'visible',
		onclick,
		ariaLabel,
		onkeydown,
		flatInteractive = false,
		shadow = true,
		accentColor,
		surfaceColor,
		selected = false,
		muted = false,
		textSelectable = true
	}: Props = $props();

	let resolvedPadding = $derived(resolvePadding(padding));
	let resolvedMaxWidth = $derived(resolveMaxWidth(maxWidth));

	function contrastForeground(color: string | undefined) {
		if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return undefined;
		const channels = [1, 3, 5].map(
			(index) => Number.parseInt(color.slice(index, index + 2), 16) / 255
		);
		const luminance = channels
			.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
			.reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
		return luminance > 0.179 ? '#171717' : '#ffffff';
	}

	let resolvedSurfaceForeground = $derived(contrastForeground(surfaceColor));

	function handleKeyDown(event: KeyboardEvent) {
		if (onkeydown) {
			onkeydown(event);
		} else if (onclick && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			onclick(event as unknown as MouseEvent);
		}
	}
</script>

<div
	class="monsan-panel-frame"
	class:has-plaque={Boolean(plaque)}
	style:max-width={resolvedMaxWidth}
>
	{#if plaque}
		<div class="monsan-panel-plaque-region">
			{@render plaque()}
		</div>
	{/if}
	<svelte:element
		this={tag}
		class="monsan-panel {variant} overflow-{overflow}"
		class:is-interactive={interactive}
		class:flat-interactive={flatInteractive}
		class:full-height={fullHeight}
		class:no-shadow={!shadow}
		class:has-accent={Boolean(accentColor)}
		class:has-custom-surface={Boolean(resolvedSurfaceForeground)}
		class:has-plaque={Boolean(plaque)}
		class:selected
		class:muted
		class:text-unselectable={!textSelectable}
		style:--panel-padding={resolvedPadding}
		style:height={fullHeight ? '100%' : undefined}
		style:--panel-accent={accentColor}
		style:--panel-surface={surfaceColor}
		style:--monsan-surface-foreground={resolvedSurfaceForeground}
		{onclick}
		aria-label={ariaLabel}
		aria-pressed={onclick ? selected : undefined}
		onkeydown={onclick || onkeydown ? handleKeyDown : undefined}
		role={onclick ? 'button' : undefined}
		tabindex={onclick ? 0 : undefined}
	>
		{@render children()}
	</svelte:element>
</div>

<style>
	.monsan-panel-frame {
		position: relative;
		width: 100%;
		box-sizing: border-box;
	}

	.monsan-panel-plaque-region {
		position: absolute;
		top: 0;
		left: 50%;
		z-index: 1;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.monsan-panel {
		width: 100%;
		max-width: 100%;
		padding: var(--panel-padding);
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-md);
		box-sizing: border-box;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			background-color 0.2s var(--ease-out);
	}

	.monsan-panel.has-plaque {
		padding-top: calc(var(--panel-padding) + var(--space-xl));
	}

	.monsan-panel.full-height {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.monsan-panel.has-accent {
		box-shadow:
			inset 5px 0 0 var(--panel-accent),
			var(--shadow-sm);
	}

	.monsan-panel.has-accent.no-shadow {
		box-shadow: inset 5px 0 0 var(--panel-accent);
	}

	.monsan-panel.has-custom-surface {
		background-color: var(--panel-surface);
		color: var(--monsan-surface-foreground);
	}

	.monsan-panel.has-custom-surface :global(.monsan-text) {
		color: var(--monsan-surface-foreground) !important;
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

	.accent :global(.monsan-text),
	.success :global(.monsan-text),
	.error :global(.monsan-text),
	.neutral :global(.monsan-text) {
		color: inherit;
	}

	/* Adjustments for Dark Theme */
	:global([data-theme='dark']) .accent {
		background-color: var(--accent-primary);
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
	.is-interactive:not(.flat-interactive):hover {
		transform: translate(-3px, -3px);
		box-shadow: var(--shadow-md);
	}
	.is-interactive:not(.flat-interactive):active {
		transform: translate(1px, 1px);
		box-shadow: var(--shadow-xs);
	}
	.monsan-panel.no-shadow {
		box-shadow: none !important;
	}
	.monsan-panel.selected {
		outline: 3px solid var(--text-primary);
		outline-offset: 2px;
		box-shadow:
			inset 0 0 0 3px var(--bg-primary),
			var(--shadow-md);
	}
	.monsan-panel.muted {
		opacity: 0.56;
	}
	.monsan-panel.text-unselectable,
	.monsan-panel.text-unselectable :global(*) {
		user-select: none;
		-webkit-user-select: none;
	}
</style>
