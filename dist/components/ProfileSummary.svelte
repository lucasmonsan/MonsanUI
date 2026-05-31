<script lang="ts">
	import Avatar from './Avatar.svelte';
	import Text from './Text.svelte';

	interface Props {
		name: string;
		email?: string;
		image?: string | null;
		imageAlt?: string;
		framed?: boolean;
	}

	let { name, email, image, imageAlt = name, framed = true }: Props = $props();
</script>

<div class="monsan-profile-summary" class:framed>
	<Avatar src={image ?? undefined} {name} alt={imageAlt} size="md" />
	<div class="profile-details">
		<Text tag="h2" family="display" size="md" weight="bold">{name}</Text>
		{#if email}
			<Text tag="p" size="sm" variant="secondary">{email}</Text>
		{/if}
	</div>
</div>

<style>
	.monsan-profile-summary {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.framed {
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		background-color: var(--bg-secondary);
		box-shadow: var(--shadow-sm);
	}

	.profile-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.profile-details :global(.monsan-text) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
