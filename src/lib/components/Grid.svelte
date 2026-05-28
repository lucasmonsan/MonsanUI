<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		columns?: 'one' | 'two' | 'three';
		gap?: 'sm' | 'md' | 'lg';
		responsive?: boolean;
	}

	let { children, columns = 'two', gap = 'md', responsive = true }: Props = $props();
</script>

<div class="monsan-grid columns-{columns} gap-{gap}" class:responsive>
	{@render children()}
</div>

<style>
	.monsan-grid {
		display: grid;
		box-sizing: border-box;
	}

	.columns-one {
		grid-template-columns: minmax(0, 1fr);
	}
	.columns-two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.columns-three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.gap-sm {
		gap: var(--space-sm);
	}
	.gap-md {
		gap: var(--space-md);
	}
	.gap-lg {
		gap: var(--space-lg);
	}

	@media (max-width: 560px) {
		.responsive {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
