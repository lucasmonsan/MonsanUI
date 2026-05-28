<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		label: string;
		forId: string;
		children: Snippet;
	}

	let { label, forId, children }: Props = $props();
</script>

<div class="monsan-form-field">
	<label for={forId}>
		<Text tag="span" size="sm" weight="bold" variant="secondary">{label}</Text>
	</label>
	{@render children()}
</div>

<style>
	.monsan-form-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		width: 100%;
	}

	label {
		text-transform: uppercase;
		letter-spacing: 0;
	}
</style>
