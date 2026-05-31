<script lang="ts">
	interface Props {
		src?: string;
		name?: string;
		alt?: string;
		size?: 'sm' | 'md' | 'lg' | number; // pre-sets or pixel value
		shape?: 'circle' | 'square';
		onclick?: (e: MouseEvent) => void;
		title?: string;
		ariaLabel?: string;
	}

	let {
		src,
		name = '',
		alt = '',
		size = 'md',
		shape = 'square',
		onclick,
		title,
		ariaLabel
	}: Props = $props();

	let imageFailed = $state(false);

	// Generate fallback initials
	let initials = $derived.by(() => {
		if (!name) return '';
		const parts = name.trim().split(/\s+/);
		if (parts.length === 0 || !parts[0]) return '';
		if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	});

	// Get dimensions based on size input
	const sizeMap = {
		sm: '32px',
		md: '48px',
		lg: '64px'
	};

	let finalSize = $derived(typeof size === 'number' ? `${size}px` : (sizeMap[size] ?? '48px'));

	function handleImageError() {
		imageFailed = true;
	}

	// Reset error state if the src prop changes dynamically
	$effect(() => {
		if (src) {
			imageFailed = false;
		}
	});
</script>

{#snippet avatarContent()}
	{#if src && !imageFailed}
		<img {src} alt={alt || name} class="avatar-img" onerror={handleImageError} />
	{:else}
		<div class="avatar-fallback" role="img" aria-label={name || alt || 'Avatar'}>
			{initials || '?'}
		</div>
	{/if}
{/snippet}

{#if onclick}
	<button
		type="button"
		class="monsan-avatar {shape} interactive"
		style="width: {finalSize}; height: {finalSize}; font-size: calc({finalSize} * 0.38);"
		{onclick}
		{title}
		aria-label={ariaLabel || title || name || alt || 'Avatar'}
	>
		{@render avatarContent()}
	</button>
{:else}
	<div
		class="monsan-avatar {shape}"
		style="width: {finalSize}; height: {finalSize}; font-size: calc({finalSize} * 0.38);"
	>
		{@render avatarContent()}
	</div>
{/if}

<style>
	.monsan-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-sm);
		box-sizing: border-box;
		overflow: hidden;
		flex-shrink: 0;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-weight: 800;
		text-transform: uppercase;
		user-select: none;
	}

	button.monsan-avatar {
		padding: 0;
		cursor: pointer;
		font: inherit;
	}

	.monsan-avatar.circle {
		border-radius: var(--radius-full);
	}

	.monsan-avatar.square {
		border-radius: var(--radius-md);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-fallback {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-display);
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}

	/* Randomish colors based on initial letter for fallback avatars */
	:global([data-theme='dark']) .avatar-fallback {
		background-color: var(--bg-secondary);
		color: var(--text-primary);
	}
</style>
