<script lang="ts">
	interface Props {
		active?: boolean;
		tone?: 'success' | 'error';
	}

	let { active = false, tone = 'success' }: Props = $props();
</script>

{#if active}
	<div class="monsan-flash-overlay tone-{tone}" aria-hidden="true"></div>
{/if}

<style>
	.monsan-flash-overlay {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
		animation: monsan-flash-fade 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
	}

	.tone-error {
		background-color: var(--error);
	}

	.tone-success {
		background-color: var(--success);
	}

	@keyframes monsan-flash-fade {
		0% {
			opacity: 0;
		}
		20% {
			opacity: 0.6;
		}
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-flash-overlay {
			animation: none;
			opacity: 0.35;
		}
	}
</style>
