<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronLeftIcon from './icons/ChevronLeft.svelte';
	import ChevronRightIcon from './icons/ChevronRight.svelte';
	import IconButton from './IconButton.svelte';

	interface Props {
		/** Primary panel or summary controlled by the navigator. */
		children: Snippet;
		/** Whether a preceding item is available. */
		hasPrevious: boolean;
		/** Whether a following item is available. */
		hasNext: boolean;
		/** Localized accessible name for the preceding control. */
		previousLabel: string;
		/** Localized accessible name for the following control. */
		nextLabel: string;
		/** Selects the preceding item. */
		onPrevious: () => void;
		/** Selects the following item. */
		onNext: () => void;
	}

	let { children, hasPrevious, hasNext, previousLabel, nextLabel, onPrevious, onNext }: Props =
		$props();
</script>

<div class="monsan-panel-navigator" class:has-previous={hasPrevious} class:has-next={hasNext}>
	{#if hasPrevious}
		<div class="panel-navigator-control previous">
			<IconButton label={previousLabel} onclick={onPrevious}>
				<ChevronLeftIcon size={20} />
			</IconButton>
		</div>
	{/if}

	<div class="panel-navigator-content">
		{@render children()}
	</div>

	{#if hasNext}
		<div class="panel-navigator-control next">
			<IconButton label={nextLabel} onclick={onNext}>
				<ChevronRightIcon size={20} />
			</IconButton>
		</div>
	{/if}
</div>

<style>
	.monsan-panel-navigator {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		min-width: 0;
	}

	.monsan-panel-navigator.has-previous {
		grid-template-columns: auto minmax(0, 1fr);
	}

	.monsan-panel-navigator.has-next {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.monsan-panel-navigator.has-previous.has-next {
		grid-template-columns: auto minmax(0, 1fr) auto;
	}

	.panel-navigator-content {
		min-width: 0;
	}

	.panel-navigator-control {
		display: flex;
		align-items: center;
	}

	@media (max-width: 40rem) {
		.monsan-panel-navigator {
			display: block;
		}

		.panel-navigator-control {
			display: none;
		}
	}
</style>
