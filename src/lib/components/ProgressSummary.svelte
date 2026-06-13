<script lang="ts">
	import ProgressBar from './ProgressBar.svelte';
	import Text from './Text.svelte';

	interface Props {
		value: number;
		current: number;
		total: number;
		label: string;
	}

	let { value, current, total, label }: Props = $props();
</script>

<div class="monsan-progress-summary">
	<ProgressBar {value} height="12px" variant="primary" ariaLabel={label} />
	<Text tag="span" size="sm" weight="bold">{current}/{total}</Text>
</div>

<style>
	.monsan-progress-summary {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.monsan-progress-summary :global(.monsan-progress-container) {
		flex: 1 1 auto;
		min-width: 0;
	}

	.monsan-progress-summary :global(.monsan-text) {
		flex: 0 0 auto;
		white-space: nowrap;
		overflow-wrap: normal;
	}
</style>
