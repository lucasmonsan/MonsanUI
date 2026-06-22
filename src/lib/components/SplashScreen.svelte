<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { LayerPreset } from '$lib/utils/layout.js';
	import { resolveLayer } from '$lib/utils/layout.js';
	import Credits from './Credits.svelte';

	interface Props {
		/** Name of the application */
		appName: string;
		/** Path to the logo image file */
		logoSrc?: string;
		/** Alt text for the logo image */
		logoAlt?: string;
		/** If true, holds the splash screen visible beyond the 2s minimum */
		loading?: boolean;
		/** Author name for the Credits component */
		authorName?: string;
		/** Author profile/website link for the Credits component */
		authorLink?: string;
		/** Copyright text for the Credits component */
		copyright?: string;
		/** Layer preset of the splash container. Defaults to 'splash'. */
		layer?: LayerPreset;
		/** Svelte 5 snippet for custom logo rendering */
		logoSnippet?: Snippet;
		/** Custom children snippet, takes precedence over default content */
		children?: Snippet;
		/** Variant of the Credits component. Defaults to 'default' */
		creditsVariant?: 'default' | 'compact';
	}

	let {
		appName,
		logoSrc,
		logoAlt = 'App Logo',
		loading = false,
		authorName = 'Monsan',
		authorLink = 'https://github.com/lucasmonsan',
		copyright = '',
		layer = 'splash',
		logoSnippet,
		children,
		creditsVariant = 'default'
	}: Props = $props();

	let zIndex = $derived(resolveLayer(layer));

	// Container is always rendered from SSR (opacity 1, covers everything).
	// After mount, content fades in. After 2s, container fades out then is removed.
	let contentVisible = $state(false);
	let hiding = $state(false);
	let hidden = $state(false);
	let canHide = $state(false);

	const FADE_DURATION = 400;
	const MIN_VISIBLE = 2000;

	function hideSplash() {
		if (!canHide || loading || hiding || hidden) return;

		hiding = true;
		setTimeout(() => {
			hidden = true;
		}, FADE_DURATION);
	}

	onMount(() => {
		// Fade content in after first paint
		requestAnimationFrame(() => {
			contentVisible = true;
		});

		const hideTimer = setTimeout(() => {
			canHide = true;
			hideSplash();
		}, MIN_VISIBLE);

		return () => clearTimeout(hideTimer);
	});

	$effect(() => {
		hideSplash();
	});
</script>

{#if !hidden}
	<div class="monsan-splash-screen" class:hiding style:z-index={zIndex}>
		<div class="splash-content" class:visible={contentVisible}>
			{#if children}
				{@render children()}
			{:else}
				<div class="splash-brand">
					{#if logoSnippet}
						<div class="splash-logo-custom">
							{@render logoSnippet()}
						</div>
					{:else if logoSrc}
						<img src={logoSrc} alt={logoAlt} class="splash-logo" />
					{/if}
					<h1 class="splash-title">{appName}</h1>
				</div>

				<div class="splash-loader">
					<div class="spinner-cube"></div>
				</div>
			{/if}
		</div>

		<div class="splash-footer" class:visible={contentVisible}>
			<Credits {authorName} {authorLink} {copyright} placement="inline" variant={creditsVariant} />
		</div>
	</div>
{/if}

<style>
	/* ── Container ── always opaque from SSR, fades out on exit */
	.monsan-splash-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100dvh;
		background-color: var(--bg-primary, #fff);
		color: var(--text-primary);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: var(--space-xl);
	}

	.monsan-splash-screen.hiding {
		animation: splashOut 0.4s ease forwards;
	}

	@keyframes splashOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	/* ── Content ── fades in after mount */
	.splash-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
		margin-bottom: var(--space-2xl);
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.splash-content.visible {
		opacity: 1;
	}

	.splash-footer {
		position: absolute;
		bottom: var(--space-xl);
		width: 100%;
		display: flex;
		justify-content: center;
		box-sizing: border-box;
		padding: 0 var(--space-xl);
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.splash-footer.visible {
		opacity: 1;
	}

	/* ── Brand ── */
	.splash-brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		text-align: center;
	}

	.splash-logo {
		width: 80px;
		height: 80px;
		object-fit: contain;
	}

	.splash-logo-custom {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.splash-title {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: 900;
		text-transform: uppercase;
		margin: 0;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	/* ── Loader ── */
	.splash-loader {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Neubrutalist cube — symmetric border, no shadow (looks correct when spinning) */
	.spinner-cube {
		width: 24px;
		height: 24px;
		background-color: var(--accent-primary);
		border: 3px solid var(--border-color);
		animation: spinCube 1.2s infinite ease-in-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-splash-screen.hiding {
			animation: none;
			opacity: 0;
		}

		.splash-content,
		.splash-footer {
			transition: none;
		}

		.spinner-cube {
			animation: none;
		}
	}

	@keyframes spinCube {
		0% {
			transform: rotate(0deg);
			background-color: var(--accent-primary);
		}
		50% {
			transform: rotate(180deg);
			background-color: var(--success);
		}
		100% {
			transform: rotate(360deg);
			background-color: var(--accent-primary);
		}
	}
</style>
