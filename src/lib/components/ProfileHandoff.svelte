<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	interface Props {
		/** Increment this value to open the central profile in a separate tab. */
		request?: number;
		portalUrl: string;
		portalOrigin: string;
		sourceId: string;
		updatedTitle: string;
		updatedMessage: string;
		reloadLabel: string;
		continueLabel: string;
		onReload?: () => void;
	}

	let {
		request = 0,
		portalUrl,
		portalOrigin,
		sourceId,
		updatedTitle,
		updatedMessage,
		reloadLabel,
		continueLabel,
		onReload
	}: Props = $props();

	let previousRequest = $state(0);
	let initialized = $state(false);
	let popup = $state<Window | null>(null);
	let nonce = $state('');
	let updated = $state(false);

	function createNonce() {
		const values = new Uint32Array(4);
		if (globalThis.crypto?.getRandomValues) {
			globalThis.crypto.getRandomValues(values);
			return Array.from(values, (value) => value.toString(36)).join('');
		}
		return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
	}

	function openProfile() {
		nonce = createNonce();
		const url = new URL(portalUrl);
		url.searchParams.set('dialog', 'profile');
		url.searchParams.set('source', sourceId);
		url.searchParams.set('nonce', nonce);
		popup = window.open(url.toString(), 'monsan-profile');
	}

	function handleMessage(event: MessageEvent) {
		if (event.origin !== portalOrigin || event.source !== popup || !event.data) return;
		const data = event.data as { type?: string; nonce?: string; status?: string };
		if (data.type !== 'monsan-profile-result' || data.nonce !== nonce) return;
		if (data.status === 'saved') updated = true;
		popup = null;
		nonce = '';
	}

	onMount(() => {
		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	});

	$effect(() => {
		if (!initialized) {
			previousRequest = request;
			initialized = true;
			return;
		}
		if (request === previousRequest) return;
		previousRequest = request;
		openProfile();
	});
</script>

<ConfirmDialog
	bind:open={updated}
	title={updatedTitle}
	message={updatedMessage}
	confirmText={reloadLabel}
	cancelText={continueLabel}
	onConfirm={() => onReload?.()}
	onCancel={() => {}}
/>
