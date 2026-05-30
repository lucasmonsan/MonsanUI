<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import Credits from './Credits.svelte';

	interface Props {
		/** Name of the application */
		appName: string;
		/** Path to the logo image file */
		logoSrc?: string;
		/** Alt text for the logo image */
		logoAlt?: string;
		/** If true, holds the splash screen visible regardless of timeout (e.g. while loading data) */
		loading?: boolean;
		/** Author name for the Credits component */
		authorName?: string;
		/** Author profile/website link for the Credits component */
		authorLink?: string;
		/** Copyright text for the Credits component */
		copyright?: string;
		/** Svelte 5 snippet for custom logo rendering */
		logoSnippet?: Snippet;
		/** Custom children snippet, takes precedence for logo/title content */
		children?: Snippet;
		/** Variant of the Credits component to render. Defaults to 'default' */
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
		logoSnippet,
		children,
		creditsVariant = 'default'
	}: Props = $props();

	let visible = $state(true); // Starts true so SSR renders it visible immediately
	let timePassed = $state(false);

	$effect(() => {
		// Minimum visibility duration of 2 seconds
		timePassed = false;
		const timer = setTimeout(() => {
			timePassed = true;
		}, 2000);

		return () => clearTimeout(timer);
	});

	// Remains visible if visibility is active AND (loading is true OR 2 seconds haven't passed yet)
	let active = $derived(visible && (loading || !timePassed));
</script>

{#if active}
	<div class="monsan-splash-screen" transition:fade={{ duration: 400 }}>
		<div class="splash-content">
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
			{/if}

			<div class="splash-loader">
				<div class="spinner-cube"></div>
			</div>
		</div>

		<div class="splash-footer">
			<Credits {authorName} {authorLink} {copyright} placement="inline" variant={creditsVariant} />
		</div>
	</div>
{/if}

<style>
	.monsan-splash-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100dvh;
		background-color: var(--bg-primary);
		color: var(--text-primary);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: var(--space-xl);
	}

	.splash-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xl);
		margin-bottom: var(--space-2xl);
	}

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

	.splash-loader {
		margin-top: var(--space-md);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Neubrutalist Spinning Cube Loader */
	.spinner-cube {
		width: 24px;
		height: 24px;
		background-color: var(--accent-primary);
		border: 3px solid var(--border-color);
		box-shadow: 3px 3px 0px var(--border-color);
		animation: spinCube 1.2s infinite ease-in-out;
	}

	@keyframes spinCube {
		0% {
			transform: rotate(0deg);
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

	.splash-footer {
		position: absolute;
		bottom: var(--space-xl);
		width: 100%;
		display: flex;
		justify-content: center;
		box-sizing: border-box;
		padding: 0 var(--space-xl);
	}
</style>
