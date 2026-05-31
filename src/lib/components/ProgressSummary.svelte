<script lang="ts">
	import Panel from './Panel.svelte';
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
	<Panel padding="0 var(--space-md)" maxWidth="100%">
		<div class="progress-summary">
			<ProgressBar {value} height="12px" variant="primary" ariaLabel={label} />
			<Text tag="span" size="sm" weight="bold">{current}/{total}</Text>
		</div>
	</Panel>
</div>

<style>
	.monsan-progress-summary {
		flex: 1;
		min-width: 0;
	}

	.progress-summary {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		height: 36px;
		box-sizing: border-box;
		width: 100%;
	}
</style>
