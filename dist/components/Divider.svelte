<script lang="ts">
	import Text from './Text.svelte';

	interface Props {
		label?: string;
	}

	let { label }: Props = $props();
</script>

<div class="monsan-divider" aria-hidden={label ? undefined : true}>
	<span class="divider-line"></span>
	{#if label}
		<Text tag="span" size="sm" weight="bold" variant="secondary">{label}</Text>
		<span class="divider-line"></span>
	{/if}
</div>

<style>
	.monsan-divider {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
	}

	.divider-line {
		flex: 1;
		height: var(--border-width);
		background: var(--border-color);
		opacity: 0.3;
	}

	.monsan-divider :global(.monsan-text) {
		text-transform: uppercase;
		letter-spacing: 0;
		white-space: nowrap;
	}
</style>
