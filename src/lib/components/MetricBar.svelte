<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns: 'one' | 'two' | 'three' | 'four';
		/** Opt-in compact column count for narrow viewports. */
		mobileColumns?: 'one' | 'two' | 'three';
		divided?: boolean;
	}

	let { children, columns, mobileColumns, divided = true }: Props = $props();
</script>

<div
	class="monsan-metric-bar columns-{columns} mobile-columns-{mobileColumns ?? 'none'}"
	class:divided
>
	{@render children()}
</div>

<style>
	.monsan-metric-bar {
		display: grid;
		width: 100%;
		min-width: 0;
		align-items: center;
	}
	.columns-two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.columns-one {
		grid-template-columns: minmax(0, 1fr);
	}
	.columns-three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.columns-four {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.divided > :global(:not(:first-child)) {
		border-left: var(--border-width) solid var(--border-color);
		padding-left: var(--space-xs);
	}

	@media (max-width: 560px) {
		.mobile-columns-one {
			grid-template-columns: minmax(0, 1fr);
		}
		.mobile-columns-two {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.mobile-columns-three {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.mobile-columns-two.divided > :global(:nth-child(odd)) {
			border-left: 0;
			padding-left: 0;
		}
	}
</style>
