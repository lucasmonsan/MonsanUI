<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from './Badge.svelte';
	import Inline from './Inline.svelte';

	interface Props {
		labels: string[];
		maxVisible?: number;
		onSurface?: boolean;
		children?: Snippet<[string]>;
	}

	let { labels, maxVisible = 3, onSurface = false, children }: Props = $props();
	let visible = $derived(labels.slice(0, Math.max(1, maxVisible)));
	let hiddenCount = $derived(Math.max(0, labels.length - visible.length));
</script>

<Inline gap="xs" wrap={false} fullWidth>
	{#each visible as label (label)}
		{#if children}
			{@render children(label)}
		{:else}
			<Badge nowrap {onSurface}>{label}</Badge>
		{/if}
	{/each}
	{#if hiddenCount > 0}
		<Badge nowrap {onSurface} ariaLabel={`${hiddenCount} more`}>…</Badge>
	{/if}
</Inline>
