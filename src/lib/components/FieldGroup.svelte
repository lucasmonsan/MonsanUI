<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<fieldset class="monsan-field-group">
	<legend>
		<Text tag="span" size="sm" weight="bold" variant="secondary">{label}</Text>
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
		letter-spacing: 0;
	}
</style>
