<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		align?: 'left' | 'right';
	}

	let { children, align = 'left' }: Props = $props();
</script>

<div class="monsan-menu-control align-{align}" data-menu-persistent>
	{@render children()}
</div>

<style>
	.monsan-menu-control {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.align-left {
		justify-content: flex-start;
	}

	.align-right {
		justify-content: flex-end;
	}
</style>
