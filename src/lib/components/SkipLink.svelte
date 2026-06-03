<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href?: string;
	}

	let { children, href = '#main-content' }: Props = $props();
</script>

<a {href} class="skip-link">
	{@render children()}
</a>
