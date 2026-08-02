<script lang="ts">
	import Dialog from './Dialog.svelte';
	import { i18n } from '../utils/i18n.svelte';

	let {
		isOpen = $bindable(false),
		mediaType = 'none',
		mediaUrl = '',
		onClose,
		closeAriaLabel,
		imageAlt,
		videoTitle,
		title,
		notSupportedMessage
	} = $props<{
		isOpen: boolean;
		mediaType: 'image' | 'video' | 'audio' | 'youtube' | 'none' | string;
		mediaUrl: string;
		onClose: () => void;
		closeAriaLabel?: string;
		imageAlt?: string;
		videoTitle?: string;
		title?: string;
		notSupportedMessage?: string;
	}>();

	let activeCloseAriaLabel = $derived(closeAriaLabel ?? i18n.t('mediaDialog.closeAriaLabel'));
	let activeImageAlt = $derived(imageAlt ?? i18n.t('mediaDialog.imageAlt'));
	let activeVideoTitle = $derived(videoTitle ?? i18n.t('mediaDialog.videoTitle'));
	let activeTitle = $derived(title ?? i18n.t('mediaDialog.title'));
	let activeNotSupportedMessage = $derived(
		notSupportedMessage ?? i18n.t('mediaDialog.notSupportedMessage')
	);

	function getYouTubeEmbedUrl(url: string) {
		let videoId = '';
		if (url.includes('youtube.com/watch')) {
			videoId = new URLSearchParams(url.split('?')[1]).get('v') || '';
		} else if (url.includes('youtu.be/')) {
			videoId = url.split('youtu.be/')[1].split('?')[0];
		}
		return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
	}

	// Helper to determine if url is direct video/audio or YouTube
	let isYoutube = $derived(
		mediaType === 'youtube' ||
			(mediaType === 'video' && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')))
	);

	let isNativeVideo = $derived(
		mediaType === 'video_native' || (mediaType === 'video' && !isYoutube)
	);
	let isUnsupported = $derived(
		mediaType !== 'image' && !isYoutube && !isNativeVideo && mediaType !== 'audio'
	);
	const mediaDescriptionId = `media-dialog-${Math.random().toString(36).slice(2, 9)}-description`;
</script>

<Dialog
	bind:open={isOpen}
	title={activeTitle}
	{onClose}
	closeLabel={activeCloseAriaLabel}
	size="lg"
	ariaDescribedby={isUnsupported ? mediaDescriptionId : undefined}
>
	<div class="media-container">
		{#if mediaType === 'image'}
			<img src={mediaUrl} class="media-img" alt={activeImageAlt} />
		{:else if isYoutube}
			<iframe
				src={getYouTubeEmbedUrl(mediaUrl)}
				class="media-video"
				title={activeVideoTitle}
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		{:else if isNativeVideo}
			<video src={mediaUrl} controls class="media-video">
				<track kind="captions" />
				{activeNotSupportedMessage}
			</video>
		{:else if mediaType === 'audio'}
			<audio src={mediaUrl} controls class="media-audio">
				{activeNotSupportedMessage}
			</audio>
		{:else}
			<p id={mediaDescriptionId} class="error-msg">{activeNotSupportedMessage}</p>
		{/if}
	</div>
</Dialog>

<style>
	.media-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 200px;
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
		border: var(--border-width) dashed var(--border-color);
		padding: var(--space-md);
		box-sizing: border-box;
	}

	.media-img {
		max-width: 100%;
		max-height: 60dvh;
		object-fit: contain;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-sm);
	}

	.media-video {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-sm);
		border: var(--border-width) solid var(--border-color);
		box-shadow: var(--shadow-md);
		background: #000;
	}

	.media-audio {
		width: 100%;
		max-width: 500px;
	}

	.error-msg {
		color: var(--error);
		font-family: var(--font-body);
		font-weight: 700;
	}
</style>
