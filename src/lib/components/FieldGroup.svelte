<script lang="ts">
	import type { Snippet } from 'svelte';
	import InfoTooltip from './InfoTooltip.svelte';
	import Text from './Text.svelte';

	interface Props {
		label: string;
		info?: string;
		tooltipPosition?: 'top' | 'bottom';
		children: Snippet;
	}

	let { label, info, tooltipPosition = 'top', children }: Props = $props();
</script>

<fieldset class="monsan-field-group">
	<legend>
		<Text tag="span" size="xs" weight="bold" variant="secondary">
			{label}
			{#if info}
				<InfoTooltip text={info} position={tooltipPosition} />
			{/if}
		</Text>
	</legend>
	{@render children()}
</fieldset>

<style>
	.monsan-field-group {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-width: 0;
	}

	legend {
		padding: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-xs);
	}
</style>
